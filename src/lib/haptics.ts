import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '@/lib/db/storage';
import { storage } from '@/lib/storage';

export type HapticType = 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';
export type HapticNotificationType = 'success' | 'warning' | 'error';

const hapticMap: Record<HapticType, Haptics.ImpactFeedbackStyle> = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
  soft: Haptics.ImpactFeedbackStyle.Soft,
  rigid: Haptics.ImpactFeedbackStyle.Rigid,
};

const notificationMap: Record<HapticNotificationType, Haptics.NotificationFeedbackType> = {
  success: Haptics.NotificationFeedbackType.Success,
  warning: Haptics.NotificationFeedbackType.Warning,
  error: Haptics.NotificationFeedbackType.Error,
};

/** Only run haptics on iOS (no Android per product requirement). */
function shouldRunHaptics(): boolean {
  if (Platform.OS !== 'ios')
    return false;
  return isHapticsEnabled();
}

/**
 * Triggers haptic feedback with the specified intensity
 * @param type - The intensity of the haptic feedback
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  if (!shouldRunHaptics())
    return;
  Haptics.impactAsync(hapticMap[type]);
}

/**
 * Triggers haptic notification feedback
 * @param type - The type of notification feedback
 */
export function triggerHapticNotification(type: HapticNotificationType): void {
  if (!shouldRunHaptics())
    return;
  Haptics.notificationAsync(notificationMap[type]);
}

// Convenience functions for common haptic patterns
export const Haptic = {
  Light: () => triggerHaptic('light'),
  Medium: () => triggerHaptic('medium'),
  Heavy: () => triggerHaptic('heavy'),
  Soft: () => triggerHaptic('soft'),
  Rigid: () => triggerHaptic('rigid'),
  Success: () => triggerHapticNotification('success'),
  Warning: () => triggerHapticNotification('warning'),
  Error: () => triggerHapticNotification('error'),
};

/**
 * Wraps a callback to trigger light haptic before invoking it. Use for any press/tap.
 * No-op on non-iOS or when haptics are disabled.
 */
export function withHaptic<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>) => {
    triggerHaptic('light');
    return fn(...args);
  }) as T;
}

function isHapticsEnabled() {
  const raw = storage.getString(STORAGE_KEYS.SETTINGS);
  if (!raw) {
    return true;
  }
  try {
    const parsed = JSON.parse(raw) as { hapticsEnabled?: boolean };
    return parsed.hapticsEnabled !== false;
  }
  catch {
    return true;
  }
}
