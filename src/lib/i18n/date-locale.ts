import type { Locale } from 'date-fns';
import { de, enUS, es, it, nl, pt, ru, tr, zhCN } from 'date-fns/locale';
import i18n from '@/lib/i18n';

const LOCALE_MAP: Record<string, Locale> = {
  de,
  en: enUS,
  es,
  it,
  nl,
  pt,
  ru,
  tr,
  zh: zhCN,
};

/** Returns date-fns locale for the current i18n language (for month/weekday names, etc.). */
export function getDateFnsLocale(): Locale {
  const lang = i18n.language?.split('-')[0] ?? 'en';
  return LOCALE_MAP[lang] ?? enUS;
}

const INTL_LOCALE_MAP: Record<string, string> = {
  de: 'de-DE',
  en: 'en-US',
  es: 'es-ES',
  it: 'it-IT',
  nl: 'nl-NL',
  pt: 'pt-PT',
  ru: 'ru-RU',
  tr: 'tr-TR',
  zh: 'zh-CN',
};

/** Returns Intl locale string for the current i18n language (e.g. 'tr-TR', 'en-US'). */
export function getIntlLocale(): string {
  const lang = i18n.language?.split('-')[0] ?? 'en';
  return INTL_LOCALE_MAP[lang] ?? 'en-US';
}
