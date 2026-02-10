import { differenceInDays, format } from 'date-fns';

import { getCurrencySymbol } from '@/lib/data/currencies';

export { getCurrencySymbol } from '@/lib/data/currencies';

/** Formats amount with currency symbol (e.g. "₺24.00" or "$50"). */
export function formatAmount(value: number, currency: string, roundWholeNumbers: boolean) {
  const symbol = getCurrencySymbol(currency);
  const amount = value.toFixed(roundWholeNumbers ? 0 : 2);
  return `${symbol}${amount}`;
}

export function formatMonthYear(date: Date) {
  return format(date, 'LLLL, yyyy');
}

export function formatDayMonth(date: Date) {
  return format(date, 'd MMM');
}

/** e.g. "6 Mar (in 26 days)" for next payment. */
export function formatNextPayment(nextPaymentDate: Date) {
  const dayMonth = format(nextPaymentDate, 'd MMM');
  const days = differenceInDays(nextPaymentDate, new Date());
  const inDays = days === 0 ? 'today' : days === 1 ? 'in 1 day' : `in ${days} days`;
  return `${dayMonth} (${inDays})`;
}
