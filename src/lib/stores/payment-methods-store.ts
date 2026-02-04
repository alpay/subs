import type { PaymentMethod } from '@/lib/db/schema';

import { create } from 'zustand';
import { DEFAULT_PAYMENT_METHODS } from '@/lib/data/seed-defaults';
import { getPaymentMethods, savePaymentMethods } from '@/lib/db/storage';
import { createId } from '@/lib/utils/ids';

const nowIso = () => new Date().toISOString();

type PaymentMethodsState = {
  methods: PaymentMethod[];
  isLoaded: boolean;
  load: () => void;
  add: (name: string) => PaymentMethod;
  update: (method: PaymentMethod) => void;
  remove: (methodId: string) => void;
};

export const usePaymentMethodsStore = create<PaymentMethodsState>((set, get) => ({
  methods: [],
  isLoaded: false,
  load: () => {
    const stored = getPaymentMethods();
    const methods = stored.length > 0 ? stored : DEFAULT_PAYMENT_METHODS;
    if (stored.length === 0) {
      savePaymentMethods(methods);
    }
    set({ methods, isLoaded: true });
  },
  add: (name) => {
    const method: PaymentMethod = {
      id: createId('pm'),
      name,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    const next = [...get().methods, method];
    savePaymentMethods(next);
    set({ methods: next });
    return method;
  },
  update: (method) => {
    const updated = { ...method, updatedAt: nowIso() };
    const next = get().methods.map(item => item.id === updated.id ? updated : item);
    savePaymentMethods(next);
    set({ methods: next });
  },
  remove: (methodId) => {
    const next = get().methods.filter(item => item.id !== methodId);
    savePaymentMethods(next);
    set({ methods: next });
  },
}));
