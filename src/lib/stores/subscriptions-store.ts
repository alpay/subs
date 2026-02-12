import type { Subscription } from '@/lib/db/schema';

import { create } from 'zustand';
import { addSubscription, deleteSubscription, getSettings, getSubscriptions, updateSubscription } from '@/lib/db/storage';
import { cancelSubscriptionNotifications, scheduleSubscriptionNotifications } from '@/lib/notifications';
import { createId } from '@/lib/utils/ids';
import { computeNextPaymentDate } from '@/lib/utils/subscription-dates';

const FREE_SUB_LIMIT = 5;

export type SubscriptionInput = Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'nextPaymentDate'>;

type SubscriptionsState = {
  subscriptions: Subscription[];
  isLoaded: boolean;
  load: () => void;
  add: (input: SubscriptionInput) => Subscription;
  update: (subscription: Subscription) => void;
  remove: (subscriptionId: string) => void;
  setStatus: (subscriptionId: string, status: Subscription['status']) => void;
};

const nowIso = () => new Date().toISOString();

function normalizeSubscription(input: SubscriptionInput): Subscription {
  const createdAt = nowIso();
  const billingAnchor = input.billingAnchor || input.startDate;
  const base: Subscription = {
    ...input,
    id: createId('sub'),
    createdAt,
    updatedAt: createdAt,
    billingAnchor,
    intervalCount: input.intervalCount || 1,
    nextPaymentDate: '',
  };
  const next = computeNextPaymentDate(base);
  return {
    ...base,
    nextPaymentDate: next.toISOString(),
  };
}

function recalcNextPayment(subscription: Subscription): Subscription {
  const next = computeNextPaymentDate(subscription);
  return {
    ...subscription,
    nextPaymentDate: next.toISOString(),
    updatedAt: nowIso(),
  };
}

export const useSubscriptionsStore = create<SubscriptionsState>((set, get) => ({
  subscriptions: [],
  isLoaded: false,
  load: () => {
    const subscriptions = getSubscriptions();
    set({ subscriptions, isLoaded: true });
  },
  add: (input) => {
    const current = get().subscriptions;
    const settings = getSettings();
    if (!settings.premium && current.length >= FREE_SUB_LIMIT) {
      return null as unknown as Subscription;
    }
    const subscription = normalizeSubscription(input);
    addSubscription(subscription);
    set({ subscriptions: [...current, subscription] });
    void scheduleSubscriptionNotifications(subscription, getSettings());
    return subscription;
  },
  update: (subscription) => {
    const updated = recalcNextPayment(subscription);
    updateSubscription(updated);
    set({
      subscriptions: get().subscriptions.map(sub => sub.id === updated.id ? updated : sub),
    });
    void (async () => {
      await cancelSubscriptionNotifications(updated.id);
      await scheduleSubscriptionNotifications(updated, getSettings());
    })();
  },
  remove: (subscriptionId) => {
    deleteSubscription(subscriptionId);
    set({ subscriptions: get().subscriptions.filter(sub => sub.id !== subscriptionId) });
    void cancelSubscriptionNotifications(subscriptionId);
  },
  setStatus: (subscriptionId, status) => {
    const subscription = get().subscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription) {
      return;
    }
    const updated: Subscription = {
      ...subscription,
      status,
      statusChangedAt: nowIso(),
      updatedAt: nowIso(),
    };
    updateSubscription(updated);
    set({
      subscriptions: get().subscriptions.map(sub => sub.id === updated.id ? updated : sub),
    });
    if (status === 'active') {
      void scheduleSubscriptionNotifications(updated, getSettings());
    }
    else {
      void cancelSubscriptionNotifications(updated.id);
    }
  },
}));
