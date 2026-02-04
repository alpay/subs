import * as Notifications from 'expo-notifications';
import { setHours, setMinutes, subDays, parseISO } from 'date-fns';

import type { Settings, Subscription } from '@/lib/db/schema';
import { computeNextPaymentDate } from '@/lib/utils/subscription-dates';
import { storage } from '@/lib/storage';

const NOTIFICATION_IDS_KEY = 'subs:notification_ids';

type NotificationMap = Record<string, string[]>;

function getNotificationMap(): NotificationMap {
  const raw = storage.getString(NOTIFICATION_IDS_KEY);
  return raw ? (JSON.parse(raw) as NotificationMap) : {};
}

function setNotificationMap(map: NotificationMap) {
  storage.set(NOTIFICATION_IDS_KEY, JSON.stringify(map));
}

function getReminders(subscription: Subscription, settings: Settings) {
  if (subscription.notificationMode === 'none') {
    return [];
  }
  if (subscription.notificationMode === 'custom') {
    return [subscription.customReminder1, subscription.customReminder2]
      .filter(Boolean) as Settings['notificationDefaults'][keyof Settings['notificationDefaults']][];
  }
  return [settings.notificationDefaults.first, settings.notificationDefaults.second]
    .filter(Boolean) as Settings['notificationDefaults'][keyof Settings['notificationDefaults']][];
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

  for (const reminder of reminders) {
    const [hour, minute] = reminder.time.split(':').map(Number);
    const triggerDate = setMinutes(setHours(subDays(nextPayment, reminder.daysBefore), hour), minute);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: subscription.name,
        body: 'Payment due soon',
        data: { subscriptionId: subscription.id },
      },
      trigger: triggerDate,
    });
    ids.push(id);
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
