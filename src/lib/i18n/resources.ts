import de from '@/translations/de.json';
import en from '@/translations/en.json';
import es from '@/translations/es.json';
import it from '@/translations/it.json';
import nl from '@/translations/nl.json';
import pt from '@/translations/pt.json';
import ru from '@/translations/ru.json';
import tr from '@/translations/tr.json';
import zh from '@/translations/zh.json';

export const resources = {
  de: { translation: de },
  en: { translation: en },
  es: { translation: es },
  it: { translation: it },
  nl: { translation: nl },
  pt: { translation: pt },
  ru: { translation: ru },
  tr: { translation: tr },
  zh: { translation: zh },
};

export type Language = keyof typeof resources;

export const LANGUAGE_NAMES: Record<Language, string> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  it: 'Italiano',
  nl: 'Nederlands',
  pt: 'Português',
  ru: 'Русский',
  tr: 'Türkçe',
  zh: '中文',
};

/** Flag emoji for each language (for language picker UI). */
export const LANGUAGE_FLAGS: Record<Language, string> = {
  de: '🇩🇪',
  en: '🇺🇸',
  es: '🇪🇸',
  it: '🇮🇹',
  nl: '🇳🇱',
  pt: '🇵🇹',
  ru: '🇷🇺',
  tr: '🇹🇷',
  zh: '🇨🇳',
};
