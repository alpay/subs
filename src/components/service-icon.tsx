import type { StyleProp, ViewStyle } from 'react-native';

import { Image } from 'expo-image';
import { View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

const ICON_MAP: Record<string, { symbol: string; color: string }> = {
  youtube: { symbol: 'play.rectangle', color: '#FF3B30' },
  spotify: { symbol: 'music.note', color: '#1DB954' },
  netflix: { symbol: 'film', color: '#E50914' },
  linkedin: { symbol: 'person.crop.square', color: '#0A66C2' },
  cursor: { symbol: 'terminal', color: '#8E8E93' },
  claude: { symbol: 'sparkles', color: '#FF8A3D' },
  chatgpt: { symbol: 'circle.grid.2x2', color: '#10A37F' },
  icloud: { symbol: 'icloud', color: '#5AC8FA' },
  custom: { symbol: 'sparkles', color: '#FF8A3D' },
};

export function getServiceColor(iconKey?: string) {
  return (ICON_MAP[iconKey ?? 'custom'] ?? ICON_MAP.custom).color;
}

type ServiceIconProps = {
  iconKey?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function ServiceIcon({ iconKey = 'custom', size = 48, style }: ServiceIconProps) {
  const { colors, isDark } = useTheme();
  const config = ICON_MAP[iconKey] ?? ICON_MAP.custom;
  const iconSize = Math.round(size * 0.52);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderCurve: 'continuous',
          backgroundColor: config.color,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
          boxShadow: isDark
            ? '0 10px 20px rgba(0, 0, 0, 0.35)'
            : '0 10px 16px rgba(15, 23, 42, 0.18)',
        },
        style,
      ]}
    >
      <Image
        source={`sf:${config.symbol}`}
        style={{ width: iconSize, height: iconSize }}
        tintColor={colors.iconOnColor}
      />
    </View>
  );
}
