import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

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

/**
 * Triggers haptic feedback with the specified intensity
 * @param type - The intensity of the haptic feedback
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  if (Platform.OS === 'web')
    return;

  Haptics.impactAsync(hapticMap[type]);
}

/**
 * Triggers haptic notification feedback
 * @param type - The type of notification feedback
 */
export function triggerHapticNotification(type: HapticNotificationType): void {
  if (Platform.OS === 'web')
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
