import { differenceInDays, format } from 'date-fns';
import i18n from '@/lib/i18n';

import { getCurrencySymbol } from '@/lib/data/currencies';
import { getDateFnsLocale } from '@/lib/i18n/date-locale';

export { getCurrencySymbol } from '@/lib/data/currencies';

/** Formats amount with currency symbol (e.g. "₺24.00" or "$50"). */
export function formatAmount(value: number, currency: string, roundWholeNumbers: boolean) {
  const symbol = getCurrencySymbol(currency);
  const amount = value.toFixed(roundWholeNumbers ? 0 : 2);
  return `${symbol}${amount}`;
}

const locale = () => getDateFnsLocale();

export function formatMonthYear(date: Date) {
  return format(date, 'LLLL, yyyy', { locale: locale() });
}

export function formatDayMonth(date: Date) {
  return format(date, 'd MMM', { locale: locale() });
}

/** Long date e.g. "22 February 2026" for sheet headers. */
export function formatDateLong(date: Date) {
  return format(date, 'd MMMM yyyy', { locale: locale() });
}

/** e.g. "6 Mar (in 26 days)" for next payment. Uses current i18n language. */
export function formatNextPayment(nextPaymentDate: Date) {
  const dayMonth = format(nextPaymentDate, 'd MMM', { locale: locale() });
  const days = differenceInDays(nextPaymentDate, new Date());
  const inDays =
    days === 0
      ? i18n.t('subscription.next_payment_today')
      : days === 1
        ? i18n.t('subscription.next_payment_in_one_day')
        : i18n.t('subscription.next_payment_in_days', { count: days });
  return `${dayMonth} (${inDays})`;
}
