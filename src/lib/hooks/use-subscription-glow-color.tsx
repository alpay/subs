import type { Subscription } from '@/lib/db/schema';

import { useEffect, useState } from 'react';
import { getColors } from 'react-native-image-colors';

import { getServiceColor } from '@/components/service-icon';

const FALLBACK = '#8E8E93';

/** Score 0–1: best for glow = saturated, mid lightness (not black/white). */
function score(hex: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(hex))
    return -1;
  const n = Number.parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 0xFF) / 255;
  const g = ((n >> 8) & 0xFF) / 255;
  const b = (n & 0xFF) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (l < 0.05 || l > 0.95)
    return -1;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const lScore = 1 - Math.abs(l - 0.5) * 2;
  return s * 0.7 + lScore * 0.3;
}

function pickBest(hexes: string[]): string {
  let best = FALLBACK;
  let bestScore = -1;
  for (const c of hexes) {
    const s = score(c);
    if (s > bestScore) {
      bestScore = s;
      best = c;
    }
  }
  return best;
}

export async function getSubscriptionGlowColor(
  subscription: Subscription | null | undefined,
): Promise<string> {
  const fallback = getServiceColor(subscription?.iconKey ?? 'custom');
  if (!subscription?.iconUri?.trim() || subscription.iconType !== 'image')
    return fallback;

  const uri = subscription.iconUri;
  try {
    const result = await getColors(uri, {
      fallback: FALLBACK,
      cache: true,
      pixelSpacing: 1,
      ...(uri.length > 500 && { key: subscription.id }),
    });
    if (result.platform !== 'ios')
      return fallback;
    return pickBest([
      result.background,
      result.primary,
      result.secondary,
      result.detail,
    ]);
  }
  catch {
    return fallback;
  }
}

export function useSubscriptionGlowColor(
  subscription: Subscription | null | undefined,
): string {
  const fallback = getServiceColor(subscription?.iconKey ?? 'custom');
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    getSubscriptionGlowColor(subscription).then((c) => {
      if (!cancelled)
        setColor(c);
    });
    return () => {
      cancelled = true;
    };
  }, [subscription]);

  const useImage = subscription?.iconType === 'image' && subscription?.iconUri;
  return useImage ? color : fallback;
}
