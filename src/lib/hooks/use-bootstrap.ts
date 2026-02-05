import { useEffect } from 'react';

import {
  useCategoriesStore,
  useCurrencyRatesStore,
  useListsStore,
  usePaymentMethodsStore,
  useServiceTemplatesStore,
  useSettingsStore,
  useSubscriptionsStore,
} from '@/lib/stores';

export function useBootstrap() {
  useEffect(() => {
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
  }, []);
}
