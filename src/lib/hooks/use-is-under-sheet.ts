import { useIsFocused, useNavigationState } from '@react-navigation/native';

/** Route names that are presented as formSheet (from (app)/_layout). */
const SHEET_ROUTE_NAMES = new Set([
  'analytics',
  'settings',
  'paywall',
  'amount-picker',
]);

/** Matches dynamic sheet routes (e.g. subscription/day-view/[date]). */
function isSheetRouteName(name: string | undefined): boolean {
  if (!name)
    return false;
  if (SHEET_ROUTE_NAMES.has(name))
    return true;
  if (name.includes('day-view'))
    return true;
  return false;
}

/**
 * True when this screen is not focused and the focused screen is a sheet.
 * Use to apply perspective/scale to content that appears "behind" the sheet.
 */
export function useIsUnderSheet(): boolean {
  const isFocused = useIsFocused();
  const currentRouteName = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route?.name as string | undefined;
  });
  const isSheetOpen = isSheetRouteName(currentRouteName);
  return !isFocused && isSheetOpen;
}
