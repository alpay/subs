import en from '@/translations/en.json';
import tr from '@/translations/tr.json';

export const resources = {
  en: {
    translation: en,
  },
  tr: {
    translation: tr,
  },
};

export type Language = keyof typeof resources;

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  tr: 'Türkçe',
};
