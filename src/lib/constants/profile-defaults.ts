import type { UserPreferences } from '@/lib/db/schema';

export const DEFAULT_ROUTINE_TIMES = {
  morning: '09:00',
  diary: '10:00',
  evening: '20:00',
} as const;

export const DEFAULT_PROFILE_PREFERENCES: UserPreferences = {
  morningRoutineTime: DEFAULT_ROUTINE_TIMES.morning,
  skinDiaryTime: DEFAULT_ROUTINE_TIMES.diary,
  eveningRoutineTime: DEFAULT_ROUTINE_TIMES.evening,
  hasCompletedOnboarding: false,
  hasSeenPaywall: false,
  isPremium: false,
};
