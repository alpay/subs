import type { Locale } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import i18n from '@/lib/i18n';

const LOCALE_MAP: Record<string, Locale> = {
  en: enUS,
  tr,
};

/** Returns date-fns locale for the current i18n language (for month/weekday names, etc.). */
export function getDateFnsLocale(): Locale {
  const lang = i18n.language?.split('-')[0] ?? 'en';
  return LOCALE_MAP[lang] ?? enUS;
}

/** Returns Intl locale string for the current i18n language (e.g. 'tr-TR', 'en-US'). */
export function getIntlLocale(): string {
  const lang = i18n.language?.split('-')[0] ?? 'en';
  return lang === 'tr' ? 'tr-TR' : 'en-US';
}
