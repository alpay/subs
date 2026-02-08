/**
 * Subs - Subscription Tracker Database Schema Types
 * Using MMKV only (no SQLite) - all data stored as JSON
 */

// ============================================
// Shared Types
// ============================================
export type CurrencyCode = string;

export type SubscriptionStatus = 'active' | 'paused' | 'canceled';
export type ScheduleType = 'monthly' | 'yearly' | 'weekly' | 'custom';
export type CustomIntervalUnit = 'week' | 'month';
export type NotificationMode = 'default' | 'custom' | 'none';

export type ReminderConfig = {
  daysBefore: number; // 0 = same day
  time: string; // "HH:mm"
};

// ============================================
// Core Entities
// ============================================
export type Subscription = {
  id: string;
  name: string;
  status: SubscriptionStatus;
  iconType: 'builtIn' | 'image';
  iconKey?: string;
  iconUri?: string;
  amount: number;
  currency: CurrencyCode;
  scheduleType: ScheduleType;
  intervalCount: number; // 1 for monthly/yearly/weekly, >1 for custom
  intervalUnit?: CustomIntervalUnit; // required for custom
  billingAnchor: string; // ISO date for billing anchor
  startDate: string; // ISO date
  nextPaymentDate: string; // ISO date
  categoryId: string;
  listId: string;
  paymentMethodId?: string;
  notificationMode: NotificationMode;
  customReminder1?: ReminderConfig;
  customReminder2?: ReminderConfig | null;
  notes?: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  statusChangedAt?: string; // ISO date
};

export type Category = {
  id: string;
  name: string;
  color: string; // hex
  createdAt: string;
  updatedAt: string;
};

export type List = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentMethod = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Settings = {
  mainCurrency: CurrencyCode;
  favoriteCurrencies: CurrencyCode[];
  roundWholeNumbers: boolean;
  trueDarkColors: boolean;
  hapticsEnabled: boolean;
  iCloudEnabled: boolean; // UI only for v1
  premium: boolean;
  notificationDefaults: {
    first: ReminderConfig;
    second: ReminderConfig | null;
  };
};

export type CurrencyRates = {
  base: CurrencyCode;
  updatedAt: string; // ISO date
  rates: Record<CurrencyCode, number>;
};

export type ServiceTemplate = {
  id: string;
  name: string;
  iconKey: string;
  defaultCategoryId?: string;
  defaultScheduleType?: ScheduleType;
};

// ============================================
// Utility Maps
// ============================================
export type SubscriptionsById = Record<string, Subscription>;
