/**
 * NotificationsManager – central API for subscription reminder notifications (iOS).
 *
 * Responsibilities:
 * - Configure: set foreground handler at app startup
 * - Schedule: per-subscription reminders (default or custom: days before + time)
 * - Unschedule: cancel all reminders for a subscription
 * - Reschedule all: used when settings or subscriptions change
 * - Permissions and test notification for Settings UI
 *
 * iOS: triggers in the past are rejected; we skip them (MIN_FUTURE_MS).
 * Store scheduled notification IDs in MMKV so we can cancel by ID.
 */

import type { ReminderConfig, Settings, Subscription } from '@/lib/db/schema';
import { parseISO, setHours, setMinutes, subDays } from 'date-fns';
import * as Notifications from 'expo-notifications';

import { storage } from '@/lib/storage';
import { computeNextPaymentDate } from '@/lib/utils/subscription-dates';

const MIN_FUTURE_MS = 1000;
const NOTIFICATION_IDS_KEY = 'subs:notification_ids';

type NotificationMap = Record<string, string[]>;

function getNotificationMap(): NotificationMap {
  const raw = storage.getString(NOTIFICATION_IDS_KEY);
  return raw ? (JSON.parse(raw) as NotificationMap) : {};
}

function setNotificationMap(map: NotificationMap) {
  storage.set(NOTIFICATION_IDS_KEY, JSON.stringify(map));
}

function isValidReminder(reminder: ReminderConfig | null | undefined): reminder is ReminderConfig {
  return Boolean(reminder && reminder.daysBefore >= 0);
}

function getReminders(subscription: Subscription, settings: Settings): ReminderConfig[] {
  if (subscription.notificationMode === 'disabled') {
    return [];
  }
  if (subscription.notificationMode === 'custom') {
    return [subscription.customReminder1, subscription.customReminder2].filter(isValidReminder);
  }
  const { first, second } = settings.notificationDefaults;
  return [first, second].filter(isValidReminder);
}

/**
 * Configure notification behavior. Call once at app startup (e.g. in bootstrap).
 * Sets foreground handler so notifications show while app is open.
 */
export async function configure(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowAlert: true,
      shouldSetBadge: false,
      shouldShowList: true,
      shouldShowBanner: true,
    }),
  });
}

/**
 * Request notification permissions. Returns true if granted.
 */
export async function requestPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const result = await Notifications.requestPermissionsAsync();
    status = result.status;
  }
  return status === 'granted';
}

/**
 * Schedule reminder notifications for one subscription using its next payment date.
 * Uses default reminders (from settings) when notificationMode is 'default',
 * custom reminders when 'custom', and nothing when 'disabled'.
 * Reminders use "days before" (0 = same day) and a time (HH:mm).
 */
export async function scheduleForSubscription(
  subscription: Subscription,
  settings: Settings,
): Promise<string[]> {
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
    const triggerDate = setMinutes(
      setHours(subDays(nextPayment, reminder.daysBefore), hour ?? 9),
      minute ?? 0,
    );
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
    }
    catch {
      // iOS can throw for invalid or past triggers; skip this reminder
    }
  }

  const map = getNotificationMap();
  map[subscription.id] = ids;
  setNotificationMap(map);

  return ids;
}

/**
 * Cancel all scheduled notifications for a subscription.
 */
export async function cancelForSubscription(subscriptionId: string): Promise<void> {
  const map = getNotificationMap();
  const ids = map[subscriptionId] ?? [];
  await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id)));
  delete map[subscriptionId];
  setNotificationMap(map);
}

/**
 * Cancel all subscription reminders and reschedule for every active subscription.
 * Use when notification defaults (or other settings) change.
 */
export async function rescheduleAll(
  subscriptions: Subscription[],
  settings: Settings,
): Promise<void> {
  const map = getNotificationMap();
  const allIds = Object.values(map).flat();
  await Promise.all(allIds.map(id => Notifications.cancelScheduledNotificationAsync(id)));
  setNotificationMap({});

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  for (const sub of activeSubscriptions) {
    await scheduleForSubscription(sub, settings);
  }
}

/**
 * Schedule a one-off test notification (e.g. 2 seconds from now).
 * Useful for the "Test Notification" button in Settings.
 */
export async function scheduleTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Notification',
      body: 'Notifications are enabled.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

/**
 * Cancel every scheduled notification (e.g. on app reset).
 */
export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  setNotificationMap({});
}
