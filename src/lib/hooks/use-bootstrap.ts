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
  const subscriptions = useSubscriptionsStore();
  const categories = useCategoriesStore();
  const lists = useListsStore();
  const methods = usePaymentMethodsStore();
  const settings = useSettingsStore();
  const rates = useCurrencyRatesStore();
  const templates = useServiceTemplatesStore();

  useEffect(() => {
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
  }, [
    subscriptions,
    categories,
    lists,
    methods,
    settings,
    rates,
    templates,
  ]);
}
