import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useSettingsStore, useSubscriptionsStore } from '@/lib/stores';

const FREE_SUB_LIMIT = 5;

export function usePremiumGuard() {
  const router = useRouter();
  const { subscriptions } = useSubscriptionsStore();
  const { settings } = useSettingsStore();

  const count = subscriptions.length;
  const isPremium = settings.premium ?? false;
  const limit = isPremium ? Infinity : FREE_SUB_LIMIT;
  const canAdd = count < limit;

  const showPaywall = useCallback(() => {
    router.push('/(app)/paywall');
  }, [router]);

  const navigateToServicesOrPaywall = useCallback(() => {
    if (canAdd) {
      router.push('/(app)/services');
    }
    else {
      showPaywall();
    }
  }, [canAdd, router, showPaywall]);

  return {
    count,
    limit,
    canAdd,
    isPremium,
    showPaywall,
    navigateToServicesOrPaywall,
    countLabel: `${count}/${FREE_SUB_LIMIT}`,
  };
}
