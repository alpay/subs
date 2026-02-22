/**
 * RevenueCat in-app purchases integration.
 * Handles configure, premium sync from entitlements, purchase, and restore.
 */

import { Platform } from 'react-native';

import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';

import Env from 'env';

import { useSettingsStore } from './stores';

/** Entitlement identifier configured in RevenueCat dashboard (e.g. "premium" or "lifetime"). */
export const REVENUECAT_ENTITLEMENT_ID = 'premium';

let isConfigured = false;

/**
 * Get the RevenueCat API key for the current platform.
 * Bundle ID must be com.subs (RevenueCat app config).
 */
function getApiKey(): string | undefined {
  if (Platform.OS === 'ios') {
    return Env.EXPO_PUBLIC_REVENUECAT_IOS;
  }
  if (Platform.OS === 'android') {
    return Env.EXPO_PUBLIC_REVENUECAT_ANDROID;
  }
  return undefined;
}

/**
 * Configure RevenueCat SDK. Call once at app startup (e.g. in bootstrap).
 * No-op if no API key or on unsupported platform (e.g. web).
 */
export function configureRevenueCat(): void {
  const apiKey = getApiKey();
  if (!apiKey || isConfigured) {
    return;
  }
  try {
    Purchases.configure({ apiKey });
    Purchases.addCustomerInfoUpdateListener(syncPremiumFromCustomerInfo);
    isConfigured = true;
  } catch (e) {
    __DEV__ && console.warn('[RevenueCat] configure failed:', e);
  }
}

/**
 * Returns whether the RevenueCat SDK is configured (e.g. we have an API key and called configure).
 */
export function isRevenueCatConfigured(): boolean {
  return isConfigured;
}

/**
 * Derive premium status from CustomerInfo and persist to settings store.
 */
export function syncPremiumFromCustomerInfo(customerInfo: CustomerInfo): void {
  const entitlement = customerInfo.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID];
  const hasPremium = Boolean(entitlement?.isActive);
  useSettingsStore.getState().update({ premium: hasPremium });
}

/**
 * Fetch current customer info from RevenueCat and sync premium to local settings.
 * Safe to call frequently; SDK caches and only hits network when needed.
 */
export async function refreshCustomerInfoAndSyncPremium(): Promise<CustomerInfo | null> {
  if (!isConfigured) {
    return null;
  }
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    syncPremiumFromCustomerInfo(customerInfo);
    return customerInfo;
  } catch (e) {
    __DEV__ && console.warn('[RevenueCat] getCustomerInfo failed:', e);
    return null;
  }
}

/**
 * Get the lifetime package from the current offering (if any).
 */
export async function getLifetimePackage(): Promise<PurchasesPackage | null> {
  if (!isConfigured) {
    return null;
  }
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) {
      return null;
    }
    return current.lifetime ?? null;
  } catch (e) {
    __DEV__ && console.warn('[RevenueCat] getOfferings failed:', e);
    return null;
  }
}

export type PurchaseResult =
  | { success: true; customerInfo: CustomerInfo }
  | { success: false; userCancelled: boolean; error?: unknown };

/**
 * Purchase the lifetime package. On success, premium is synced to settings.
 */
export async function purchaseLifetime(): Promise<PurchaseResult> {
  if (!isConfigured) {
    return { success: false, userCancelled: false, error: new Error('RevenueCat not configured') };
  }
  const pkg = await getLifetimePackage();
  if (!pkg) {
    return {
      success: false,
      userCancelled: false,
      error: new Error('Lifetime package not available'),
    };
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    syncPremiumFromCustomerInfo(customerInfo);
    return { success: true, customerInfo };
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean };
    const userCancelled = err?.userCancelled === true;
    return { success: false, userCancelled, error: e };
  }
}

export type RestoreResult =
  | { success: true; customerInfo: CustomerInfo; hadPremium: boolean }
  | { success: false; error?: unknown };

/**
 * Restore purchases (e.g. from "Restore Purchases" button). Syncs premium to settings.
 */
export async function restorePurchases(): Promise<RestoreResult> {
  if (!isConfigured) {
    return { success: false, error: new Error('RevenueCat not configured') };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    const entitlement = customerInfo.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID];
    const hadPremium = Boolean(entitlement?.isActive);
    syncPremiumFromCustomerInfo(customerInfo);
    return { success: true, customerInfo, hadPremium };
  } catch (e) {
    __DEV__ && console.warn('[RevenueCat] restorePurchases failed:', e);
    return { success: false, error: e };
  }
}
