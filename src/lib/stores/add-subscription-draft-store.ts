import { create } from 'zustand';

type AmountUpdater = string | ((previous: string) => string);
type AddSubscriptionDraftResetPayload = {
  amount: string;
  currency: string;
  startDate?: Date;
};

type AddSubscriptionDraftState = {
  amount: string;
  currency: string;
  startDate: Date;
  setAmount: (next: AmountUpdater) => void;
  setCurrency: (currency: string) => void;
  setStartDate: (startDate: Date) => void;
  reset: (next: AddSubscriptionDraftResetPayload) => void;
};

export const useAddSubscriptionDraftStore = create<AddSubscriptionDraftState>(set => ({
  amount: '0',
  currency: 'USD',
  startDate: new Date(),
  setAmount: next => set(state => ({
    amount: typeof next === 'function' ? next(state.amount) : next,
  })),
  setCurrency: currency => set({ currency }),
  setStartDate: startDate => set({ startDate }),
  reset: next => set({
    amount: next.amount,
    currency: next.currency,
    startDate: next.startDate ?? new Date(),
  }),
}));
