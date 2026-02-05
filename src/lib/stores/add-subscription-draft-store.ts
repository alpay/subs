import { create } from 'zustand';

type AmountUpdater = string | ((previous: string) => string);

type AddSubscriptionDraftState = {
  amount: string;
  currency: string;
  setAmount: (next: AmountUpdater) => void;
  setCurrency: (currency: string) => void;
  reset: (next: { amount: string; currency: string }) => void;
};

export const useAddSubscriptionDraftStore = create<AddSubscriptionDraftState>(set => ({
  amount: '0',
  currency: 'USD',
  setAmount: next => set(state => ({
    amount: typeof next === 'function' ? next(state.amount) : next,
  })),
  setCurrency: currency => set({ currency }),
  reset: next => set({ amount: next.amount, currency: next.currency }),
}));
