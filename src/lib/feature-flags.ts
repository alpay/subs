/**
 * Feature flags – toggle features without code deploy.
 * Add new flags here and use via useFeatureFlags() or FEATURE_FLAGS.
 */

export const FEATURE_FLAGS = {
  /** Hide the import section (Notion, Sheets, file, Apple) on the Services screen */
  hideImport: true,
  /** Enable theme selector in Settings > Interface */
  themeSelector: false,
} as const;

export type FeatureFlags = typeof FEATURE_FLAGS;
