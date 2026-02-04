import { memo, useMemo } from 'react';
import { Circle } from 'react-native-svg';

import { StyledSvg, Text, View } from '@/components/ui';
import { useTheme } from '@/lib/hooks/use-theme';

export type DonutSegment = {
  value: number;
  color: string;
  label: string;
};

type DonutChartProps = {
  size?: number;
  strokeWidth?: number;
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: string;
};

const DonutChart = memo(({
  size = 220,
  strokeWidth = 20,
  segments,
  centerLabel,
  centerValue,
}: DonutChartProps) => {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;

  const computedSegments = useMemo(
    () => segments.map((segment, index) => {
      const length = (segment.value / total) * circumference;
      const previous = segments
        .slice(0, index)
        .reduce((sum, item) => sum + (item.value / total) * circumference, 0);
      const dasharray = `${length} ${circumference - length}`;
      const dashoffset = -previous;
      return {
        ...segment,
        dasharray,
        dashoffset,
      };
    }),
    [segments, total, circumference],
  );

  return (
    <View className="items-center justify-center">
      <StyledSvg width={size} height={size} className="items-center justify-center">
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {computedSegments.map(segment => (
          <Circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={segment.dasharray}
            strokeDashoffset={segment.dashoffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        ))}
      </StyledSvg>

      <View className="absolute items-center">
        {centerLabel && (
          <Text className="text-xs" style={{ color: colors.secondaryText }}>
            {centerLabel}
          </Text>
        )}
        {centerValue && (
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            {centerValue}
          </Text>
        )}
      </View>
    </View>
  );
});

export default DonutChart;
