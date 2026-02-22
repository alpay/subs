/**
 * Shared layout and size constants for subscription rows and lists.
 * Use these instead of magic numbers for consistency and easier tweaks.
 */

/** Horizontal padding for subscription list rows (e.g. search results). */
export const SUBSCRIPTION_ROW_PADDING_H = 20;

/** Vertical padding for subscription list rows (e.g. search results). */
export const SUBSCRIPTION_ROW_PADDING_V = 16;

/** Icon size in the main search/list subscription row. */
export const SUBSCRIPTION_ROW_ICON_SIZE = 48;

/** Icon size in compact contexts (e.g. day view, add form). */
export const SUBSCRIPTION_ROW_ICON_SIZE_COMPACT = 42;

/** Gap between icon and text block in a subscription row. */
export const SUBSCRIPTION_ROW_GAP = 14;

/** Gap in compact subscription row (e.g. day view). */
export const SUBSCRIPTION_ROW_GAP_COMPACT = 12;

/** Chevron icon size in list rows. */
export const SUBSCRIPTION_ROW_CHEVRON_SIZE = 14;

/** Divider left inset = icon + gap + text align. Used for list row dividers. */
export const SUBSCRIPTION_ROW_DIVIDER_INSET_LEFT
  = SUBSCRIPTION_ROW_ICON_SIZE + SUBSCRIPTION_ROW_GAP + 12;
