import type { Subscription } from '@/lib/db/schema';

import { useEffect, useState } from 'react';
import { getColors } from 'react-native-image-colors';

import { getServiceColor } from '@/components/service-icon';

const FALLBACK_HEX = '#8E8E93';

/** Relative luminance (0 = black, 1 = white). */
function luminance(hex: string): number {
  const n = Number.parseInt(hex.replace(/^#/, ''), 16);
  const r = (n >> 16) / 255;
  const g = ((n >> 8) & 0xFF) / 255;
  const b = (n & 0xFF) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const MIN_LUMINANCE = 0.08;  // skip near-black (invisible glow on dark UI)
const MAX_LUMINANCE = 0.92;  // skip near-white (logo background)

/**
 * Returns the color to use for the subscription glow (e.g. RadialGlow).
 * - Built-in icons: returns getServiceColor(iconKey).
 * - Image logos (iconUri): async, uses react-native-image-colors (iOS). Picks secondary/detail/primary
 *   and skips colors that are too dark (invisible) or too light (background).
 */
export async function getSubscriptionGlowColor(
  subscription: Subscription | null | undefined,
): Promise<string> {
  const fallback = getServiceColor(subscription?.iconKey ?? 'custom');

  if (
    !subscription
    || subscription.iconType !== 'image'
    || !subscription.iconUri?.trim()
  ) {
    return fallback;
  }

  const uri = subscription.iconUri;
  try {
    const result = await getColors(uri, {
      fallback: FALLBACK_HEX,
      cache: true,
      quality: 'high',
      ...(uri.length > 500 && { key: subscription.id }),
    });
    if (result.platform !== 'ios')
      return fallback;
    return pickBestHexIOS(result.secondary, result.detail, result.primary);
  }
  catch {
    return fallback;
  }
}

/** Pick first iOS color that’s visible as a glow (not too dark, not too light). */
function pickBestHexIOS(secondary: string, detail: string, primary: string): string {
  const candidates = [secondary, detail, primary];
  const valid = candidates.filter(
    hex => luminance(hex) >= MIN_LUMINANCE && luminance(hex) <= MAX_LUMINANCE,
  );
  if (valid.length > 0)
    return valid[0];
  // Prefer the brightest of the three so the glow is visible (e.g. green over black)
  return candidates.reduce((a, b) => (luminance(a) >= luminance(b) ? a : b));
}

/**
 * Hook that resolves getSubscriptionGlowColor and returns the color (updates when resolved).
 * Use when you need the glow color in render; otherwise call getSubscriptionGlowColor directly.
 */
export function useSubscriptionGlowColor(
  subscription: Subscription | null | undefined,
): string {
  const fallback = getServiceColor(subscription?.iconKey ?? 'custom');
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    getSubscriptionGlowColor(subscription).then(resolved => {
      if (!cancelled)
        setColor(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [subscription]);

  return subscription?.iconType === 'image' && subscription?.iconUri
    ? color
    : fallback;
}
