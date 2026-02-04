import type { StyleProp, ViewStyle } from 'react-native';

import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/lib/hooks/use-theme';

type RingSegment = {
  value: number;
  color: string;
};

type RingChartProps = {
  segments: RingSegment[];
  size?: number;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function RingChart({ segments, size = 200, strokeWidth = 18, style }: RingChartProps) {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const { normalizedSegments } = useMemo(() => {
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    const normalizedSegments = total === 0 ? [] : segments.map(segment => ({
      ...segment,
      value: segment.value / total,
    }));
    return { normalizedSegments };
  }, [segments]);

  let offset = 0;

  return (
    <View style={style}>
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
          const dashOffset = circumference - offset;
          offset += length;

          return (
            <Circle
              key={`${segment.color}-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
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
