import type {
  Category,
  CurrencyRates,
  List,
  PaymentMethod,
  ServiceTemplate,
  Settings,
} from '@/lib/db/schema';
import currencyRates from '../../../assets/data/currency-rates.json';

const now = () => new Date().toISOString();

/** Display name for the default/fallback category; this category cannot be deleted. */
export const OTHER_CATEGORY_NAME = 'Other';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-utilities', name: 'Utilities', color: '#4F46E5', createdAt: now(), updatedAt: now() },
  { id: 'cat-entertainment', name: 'Entertainment', color: '#F97316', createdAt: now(), updatedAt: now() },
  { id: 'cat-productivity', name: 'Productivity', color: '#22C55E', createdAt: now(), updatedAt: now() },
  { id: 'cat-finance', name: 'Finance', color: '#0EA5E9', createdAt: now(), updatedAt: now() },
  { id: 'cat-health', name: 'Health', color: '#E11D48', createdAt: now(), updatedAt: now() },
  { id: 'cat-other', name: OTHER_CATEGORY_NAME, color: '#8E8E93', createdAt: now(), updatedAt: now() },
];

export const DEFAULT_LISTS: List[] = [
  { id: 'list-personal', name: 'Personal', createdAt: now(), updatedAt: now() },
  { id: 'list-work', name: 'Work', createdAt: now(), updatedAt: now() },
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm-credit-card', name: 'Credit Card', createdAt: now(), updatedAt: now() },
  { id: 'pm-debit-card', name: 'Debit Card', createdAt: now(), updatedAt: now() },
  { id: 'pm-paypal', name: 'PayPal', createdAt: now(), updatedAt: now() },
];

export const DEFAULT_SERVICE_TEMPLATES: ServiceTemplate[] = [
  { id: 'svc-youtube', name: 'YouTube', iconKey: 'youtube', defaultCategoryId: 'cat-entertainment', defaultScheduleType: 'monthly' },
  { id: 'svc-spotify', name: 'Spotify', iconKey: 'spotify', defaultCategoryId: 'cat-entertainment', defaultScheduleType: 'monthly' },
  { id: 'svc-netflix', name: 'Netflix', iconKey: 'netflix', defaultCategoryId: 'cat-entertainment', defaultScheduleType: 'monthly' },
  { id: 'svc-linkedin', name: 'LinkedIn', iconKey: 'linkedin', defaultCategoryId: 'cat-productivity', defaultScheduleType: 'monthly' },
  { id: 'svc-cursor', name: 'Cursor', iconKey: 'cursor', defaultCategoryId: 'cat-productivity', defaultScheduleType: 'monthly' },
  { id: 'svc-claude', name: 'Claude', iconKey: 'claude', defaultCategoryId: 'cat-productivity', defaultScheduleType: 'monthly' },
  { id: 'svc-chatgpt', name: 'ChatGPT', iconKey: 'chatgpt', defaultCategoryId: 'cat-productivity', defaultScheduleType: 'monthly' },
  { id: 'svc-icloud', name: 'Apple iCloud', iconKey: 'icloud', defaultCategoryId: 'cat-utilities', defaultScheduleType: 'monthly' },
];

export const DEFAULT_SETTINGS: Settings = {
  mainCurrency: 'EUR',
  roundWholeNumbers: false,
  trueDarkColors: false,
  hapticsEnabled: true,
  iCloudEnabled: false,
  notificationDefaults: {
    first: { daysBefore: 1, time: '09:00' },
    second: null,
  },
};

export const DEFAULT_CURRENCY_RATES: CurrencyRates = currencyRates as CurrencyRates;
