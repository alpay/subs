/**
 * Subs - MMKV Storage Layer
 * All data stored as JSON with prefixed keys for organization
 */

import type {
  Category,
  CurrencyRates,
  List,
  PaymentMethod,
  ServiceTemplate,
  Settings,
  Subscription,
} from './schema';
import { storage } from '@/lib/storage';
import { DEFAULT_SETTINGS, DEFAULT_CURRENCY_RATES } from '@/lib/data/seed-defaults';

// ============================================
// Storage Keys
// ============================================
const KEYS = {
  SUBSCRIPTIONS: 'subs:subscriptions',
  CATEGORIES: 'subs:categories',
  LISTS: 'subs:lists',
  PAYMENT_METHODS: 'subs:payment_methods',
  SETTINGS: 'subs:settings',
  CURRENCY_RATES: 'subs:currency_rates',
  SERVICE_TEMPLATES: 'subs:service_templates',
} as const;

// ============================================
// Generic MMKV Helpers
// ============================================
export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? (JSON.parse(value) as T) : null;
}

export function setItem<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function removeItem(key: string): void {
  storage.remove(key);
}

// ============================================
// Subscriptions
// ============================================
export function getSubscriptions(): Subscription[] {
  return getItem<Subscription[]>(KEYS.SUBSCRIPTIONS) ?? [];
}

export function saveSubscriptions(subscriptions: Subscription[]): void {
  setItem(KEYS.SUBSCRIPTIONS, subscriptions);
}

export function addSubscription(subscription: Subscription): void {
  const subscriptions = getSubscriptions();
  subscriptions.push(subscription);
  saveSubscriptions(subscriptions);
}

export function updateSubscription(updated: Subscription): void {
  const subscriptions = getSubscriptions();
  const index = subscriptions.findIndex(sub => sub.id === updated.id);
  if (index !== -1) {
    subscriptions[index] = updated;
    saveSubscriptions(subscriptions);
  }
}

export function deleteSubscription(subscriptionId: string): void {
  const subscriptions = getSubscriptions();
  saveSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId));
}

export function getSubscriptionById(subscriptionId: string): Subscription | undefined {
  return getSubscriptions().find(sub => sub.id === subscriptionId);
}

// ============================================
// Categories
// ============================================
export function getCategories(): Category[] {
  return getItem<Category[]>(KEYS.CATEGORIES) ?? [];
}

export function saveCategories(categories: Category[]): void {
  setItem(KEYS.CATEGORIES, categories);
}

export function getLists(): List[] {
  return getItem<List[]>(KEYS.LISTS) ?? [];
}

export function saveLists(lists: List[]): void {
  setItem(KEYS.LISTS, lists);
}

export function getPaymentMethods(): PaymentMethod[] {
  return getItem<PaymentMethod[]>(KEYS.PAYMENT_METHODS) ?? [];
}

export function savePaymentMethods(methods: PaymentMethod[]): void {
  setItem(KEYS.PAYMENT_METHODS, methods);
}

export function getSettings(): Settings {
  return getItem<Settings>(KEYS.SETTINGS) ?? DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings): void {
  setItem(KEYS.SETTINGS, settings);
}

export function getCurrencyRates(): CurrencyRates {
  return getItem<CurrencyRates>(KEYS.CURRENCY_RATES) ?? DEFAULT_CURRENCY_RATES;
}

export function saveCurrencyRates(rates: CurrencyRates): void {
  setItem(KEYS.CURRENCY_RATES, rates);
}

export function getServiceTemplates(): ServiceTemplate[] {
  return getItem<ServiceTemplate[]>(KEYS.SERVICE_TEMPLATES) ?? [];
}

export function saveServiceTemplates(templates: ServiceTemplate[]): void {
  setItem(KEYS.SERVICE_TEMPLATES, templates);
}

export const STORAGE_KEYS = KEYS;
