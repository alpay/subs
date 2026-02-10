import type { ReminderConfig, Settings, Subscription } from '@/lib/db/schema';
import { parseISO, setHours, setMinutes, subDays } from 'date-fns';

/** iOS rejects notification triggers in the past; skip those to avoid NSInternalInconsistencyException. */
const MIN_FUTURE_MS = 1000;

import * as Notifications from 'expo-notifications';
import { storage } from '@/lib/storage';
import { computeNextPaymentDate } from '@/lib/utils/subscription-dates';

const NOTIFICATION_IDS_KEY = 'subs:notification_ids';

type NotificationMap = Record<string, string[]>;

function getNotificationMap(): NotificationMap {
  const raw = storage.getString(NOTIFICATION_IDS_KEY);
  return raw ? (JSON.parse(raw) as NotificationMap) : {};
}

function setNotificationMap(map: NotificationMap) {
  storage.set(NOTIFICATION_IDS_KEY, JSON.stringify(map));
}

function isReminderConfig(reminder: ReminderConfig | null | undefined): reminder is ReminderConfig {
  return Boolean(reminder);
}

function isValidReminder(reminder: ReminderConfig | null | undefined): reminder is ReminderConfig {
  return Boolean(reminder && reminder.daysBefore >= 0);
}

function getReminders(subscription: Subscription, settings: Settings) {
  if (subscription.notificationMode === 'none') {
    return [];
  }
  if (subscription.notificationMode === 'custom') {
    return [subscription.customReminder1, subscription.customReminder2].filter(isValidReminder);
  }
  const { first, second } = settings.notificationDefaults;
  return [first, second].filter(isValidReminder);
}

export async function scheduleSubscriptionNotifications(subscription: Subscription, settings: Settings) {
  const reminders = getReminders(subscription, settings);
  if (reminders.length === 0) {
    return [];
  }

  const nextPayment = subscription.nextPaymentDate
    ? parseISO(subscription.nextPaymentDate)
    : computeNextPaymentDate(subscription);

  const ids: string[] = [];

  const now = Date.now();
  for (const reminder of reminders) {
    const [hour, minute] = reminder.time.split(':').map(Number);
    const triggerDate = setMinutes(setHours(subDays(nextPayment, reminder.daysBefore), hour), minute);
    if (triggerDate.getTime() - now < MIN_FUTURE_MS) {
      continue;
    }
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: subscription.name,
          body: 'Payment due soon',
          data: { subscriptionId: subscription.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
      ids.push(id);
    } catch {
      // iOS can throw (e.g. UNNotificationTrigger) for invalid or past triggers; skip this reminder
    }
  }

  const map = getNotificationMap();
  map[subscription.id] = ids;
  setNotificationMap(map);

  return ids;
}

export async function cancelSubscriptionNotifications(subscriptionId: string) {
  const map = getNotificationMap();
  const ids = map[subscriptionId] ?? [];
  await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id)));
  delete map[subscriptionId];
  setNotificationMap(map);
}

export async function rescheduleAllNotifications(subscriptions: Subscription[], settings: Settings) {
  const map = getNotificationMap();
  const allIds = Object.values(map).flat();
  await Promise.all(allIds.map(id => Notifications.cancelScheduledNotificationAsync(id)));
  setNotificationMap({});

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  for (const subscription of activeSubscriptions) {
    await scheduleSubscriptionNotifications(subscription, settings);
  }
}
