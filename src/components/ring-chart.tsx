import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/lib/hooks/use-theme';

export type RingSegment = {
  value: number;
  color: string;
  id?: string;
};

type RingChartProps = {
  /** Segment values in the same unit (e.g. yearly amount per category). Shares are value/total. */
  segments: RingSegment[];
  /** If provided, normalize segment shares by this total so ring matches the same total used for labels. */
  total?: number;
  size?: number;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  /** Index of the segment to show as selected (e.g. for center label) */
  selectedIndex?: number;
  /** Called when user taps on a segment. Receives segment index. */
  onSegmentPress?: (index: number) => void;
};

/**
 * Get segment index from touch position. Ring starts at top (-90°) and goes clockwise.
 * Angle 0 = top, π/2 = right, π = bottom, 3π/2 = left.
 */
function getSegmentIndexFromTouch(
  locationX: number,
  locationY: number,
  size: number,
  normalizedSegments: { value: number }[],
): number {
  const cx = size / 2;
  const cy = size / 2;
  const dx = locationX - cx;
  const dy = locationY - cy;
  // atan2(dx, -dy): 0 at top, π/2 at right, π at bottom, -π/2 at left
  let angle = Math.atan2(dx, -dy);
  if (angle < 0)
    angle += 2 * Math.PI;
  const fraction = angle / (2 * Math.PI);
  let cumulative = 0;
  for (let i = 0; i < normalizedSegments.length; i++) {
    cumulative += normalizedSegments[i].value;
    if (fraction < cumulative)
      return i;
  }
  return normalizedSegments.length > 0 ? normalizedSegments.length - 1 : 0;
}

export function RingChart({
  segments,
  total: explicitTotal,
  size = 200,
  strokeWidth = 18,
  style,
  selectedIndex,
  onSegmentPress,
}: RingChartProps) {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const { normalizedSegments } = useMemo(() => {
    const sum = segments.reduce((s, seg) => s + seg.value, 0);
    const total = explicitTotal != null && explicitTotal > 0 ? explicitTotal : sum;
    if (total <= 0 || segments.length === 0)
      return { normalizedSegments: [] };
    const normalizedSegments = segments.map(segment => ({
      ...segment,
      value: segment.value / total,
    }));
    return { normalizedSegments };
  }, [segments, explicitTotal]);

  const handleTouchEnd = (e: GestureResponderEvent) => {
    if (!onSegmentPress || normalizedSegments.length === 0)
      return;
    const { locationX, locationY } = e.nativeEvent;
    const index = getSegmentIndexFromTouch(locationX, locationY, size, normalizedSegments);
    onSegmentPress(index);
  };

  let offset = 0;

  return (
    <View
      style={[{ width: size, height: size }, style]}
      onTouchEnd={handleTouchEnd}
      onStartShouldSetResponder={() => !!onSegmentPress}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceMuted}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {normalizedSegments.map((segment, index) => {
          const length = segment.value * circumference;
          const dashArray = [length, circumference];
          const dashOffset = -offset;
          offset += length;
          const isSelected = selectedIndex === index;

          return (
            <Circle
              key={`${segment.color}-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeOpacity={isSelected ? 1 : 0.5}
              strokeLinecap="butt"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              fill="transparent"
              rotation={-90}
              originX={size / 2}
              originY={size / 2}
            />
          );
        })}
      </Svg>
    </View>
  );
}
