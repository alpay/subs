/**
 * Public notification API for the app.
 * Implemented by NotificationsManager; this file keeps backward compatibility
 * for stores and settings (scheduleSubscriptionNotifications, cancelSubscriptionNotifications,
 * rescheduleAllNotifications).
 */

import type { Settings, Subscription } from '@/lib/db/schema';

import {
  cancelForSubscription,
  rescheduleAll,
  scheduleForSubscription,
} from '@/lib/notifications/notifications-manager';

export {
  cancelAll,
  configure,
  requestPermissions,
  scheduleTestNotification,
} from '@/lib/notifications/notifications-manager';

export async function scheduleSubscriptionNotifications(
  subscription: Subscription,
  settings: Settings,
): Promise<string[]> {
  return scheduleForSubscription(subscription, settings);
}

export async function cancelSubscriptionNotifications(subscriptionId: string): Promise<void> {
  return cancelForSubscription(subscriptionId);
}

export async function rescheduleAllNotifications(
  subscriptions: Subscription[],
  settings: Settings,
): Promise<void> {
  return rescheduleAll(subscriptions, settings);
}
