import type { Locale } from 'date-fns';
import { differenceInDays, format } from 'date-fns';
import { getCurrencySymbol } from '@/lib/data/currencies';
import i18n from '@/lib/i18n';
import { getDateFnsLocaleForLanguage } from '@/lib/i18n/date-locale';

export { getCurrencySymbol } from '@/lib/data/currencies';

/** Cached date-fns locale per language to avoid repeated lookups in format calls. */
let cachedLang: string | null = null;
let cachedLocale: Locale | null = null;

function getCachedDateFnsLocale(): Locale {
  const lang = i18n.language?.split('-')[0] ?? 'en';
  if (cachedLang === lang && cachedLocale) {
    return cachedLocale;
  }
  cachedLang = lang;
  cachedLocale = getDateFnsLocaleForLanguage(lang);
  return cachedLocale;
}

/** Formats amount with currency symbol (e.g. "₺24.00" or "$50"). */
export function formatAmount(value: number, currency: string, roundWholeNumbers: boolean) {
  const symbol = getCurrencySymbol(currency);
  const amount = value.toFixed(roundWholeNumbers ? 0 : 2);
  return `${symbol}${amount}`;
}

export function formatMonthYear(date: Date) {
  return format(date, 'LLLL, yyyy', { locale: getCachedDateFnsLocale() });
}

export function formatDayMonth(date: Date) {
  return format(date, 'd MMM', { locale: getCachedDateFnsLocale() });
}

/** Long date e.g. "22 February 2026" for sheet headers. */
export function formatDateLong(date: Date) {
  return format(date, 'd MMMM yyyy', { locale: getCachedDateFnsLocale() });
}

/** e.g. "6 Mar (in 26 days)" for next payment. Uses current i18n language. */
export function formatNextPayment(nextPaymentDate: Date) {
  const locale = getCachedDateFnsLocale();
  const dayMonth = format(nextPaymentDate, 'd MMM', { locale });
  const days = differenceInDays(nextPaymentDate, new Date());
  const inDays
    = days === 0
      ? i18n.t('subscription.next_payment_today')
      : days === 1
        ? i18n.t('subscription.next_payment_in_one_day')
        : i18n.t('subscription.next_payment_in_days', { count: days });
  return `${dayMonth} (${inDays})`;
}

/**
 * Formats a timestamp (ISO string) as "day month year, HH:mm" or returns neverLabel if invalid.
 * Use for "Last updated" and similar labels. Pass Intl locale (e.g. from getIntlLocale()).
 */
export function formatLastUpdated(value: string, neverLabel: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return neverLabel;
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
