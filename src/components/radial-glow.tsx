import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

type RadialGlowProps = {
  color: string;
  centerX?: string;
  centerY?: string;
  radiusX?: string;
  radiusY?: string;
  maxOpacity?: number;
  /** Unique id for SVG gradient when multiple glows are used. Defaults to "glow". */
  gradientId?: string;
};

/**
 * Smooth radial glow effect using SVG gradient with many stops.
 * Use behind content to create a sun-ray glow emanating from a center point.
 */
export function RadialGlow({
  color,
  centerX = '50%',
  centerY = '20%',
  radiusX = '100%',
  radiusY = '100%',
  maxOpacity = 0.4,
  gradientId = 'glow',
}: RadialGlowProps) {
  // Generate many stops for ultra-smooth gradient (no pixelation)
  const stops = Array.from({ length: 30 }, (_, i) => {
    const offset = i / 29; // 0 to 1
    // Exponential falloff for natural glow
    const opacity = maxOpacity * (1 - offset) ** 2.2;
    return { offset: `${(offset * 100).toFixed(1)}%`, opacity: opacity.toFixed(3) };
  });

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      pointerEvents="none"
    >
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={gradientId} cx={centerX} cy={centerY} rx={radiusX} ry={radiusY}>
            {/* eslint-disable react/no-array-index-key -- gradient stops have no unique id */}
            {stops.map((stop, idx) => (
              <Stop
                key={`stop-${String(stop.offset)}-${stop.opacity}-${idx}`}
                offset={stop.offset}
                stopColor={color}
                stopOpacity={stop.opacity}
              />
            ))}
            {/* eslint-enable react/no-array-index-key */}
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}
