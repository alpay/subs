import type { AppStateStatus } from 'react-native';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { configure } from '@/lib/notifications';
import {
  configureRevenueCat,
  refreshCustomerInfoAndSyncPremium,
} from '@/lib/revenuecat';
import {
  useCategoriesStore,
  useCurrencyRatesStore,
  useListsStore,
  usePaymentMethodsStore,
  useServiceTemplatesStore,
  useSettingsStore,
  useSubscriptionsStore,
} from '@/lib/stores';

function pullCurrencyRates() {
  useCurrencyRatesStore.getState().fetchAndUpdateRates().catch(() => {});
}

export function useBootstrap() {
  useEffect(() => {
    void configure();

    configureRevenueCat();
    void refreshCustomerInfoAndSyncPremium();

    const subscriptions = useSubscriptionsStore.getState();
    const categories = useCategoriesStore.getState();
    const lists = useListsStore.getState();
    const methods = usePaymentMethodsStore.getState();
    const settings = useSettingsStore.getState();
    const rates = useCurrencyRatesStore.getState();
    const templates = useServiceTemplatesStore.getState();

    if (!subscriptions.isLoaded) {
      subscriptions.load();
    }
    if (!categories.isLoaded) {
      categories.load();
    }
    if (!lists.isLoaded) {
      lists.load();
    }
    if (!methods.isLoaded) {
      methods.load();
    }
    if (!settings.isLoaded) {
      settings.load();
    }
    if (!rates.isLoaded) {
      rates.load();
    }
    if (!templates.isLoaded) {
      templates.load();
    }

    // Pull latest rates once on cold start.
    pullCurrencyRates();
  }, []);

  // Pull latest rates and RevenueCat premium status when app becomes active.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        pullCurrencyRates();
        void refreshCustomerInfoAndSyncPremium();
      }
    });
    return () => subscription.remove();
  }, []);
}
