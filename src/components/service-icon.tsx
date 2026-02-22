/* eslint-disable react-refresh/only-export-components -- getServiceColor re-exported for use-subscription-glow-color, month-calendar */
import type { StyleProp, ViewStyle } from 'react-native';

import { Image } from 'expo-image';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { getServiceColor, SIMPLE_ICON_DATA } from '@/lib/data/simple-icons-paths';
import { useTheme } from '@/lib/hooks/use-theme';

export { getServiceColor };

type ServiceIconProps = {
  iconKey?: string;
  /** When set, shows this image URL (e.g. Brandfetch logo) instead of built-in icon. */
  iconUri?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function ServiceIcon({ iconKey = 'custom', iconUri, size = 48, style }: ServiceIconProps) {
  const { colors, isDark } = useTheme();
  const iconSize = Math.round(size * 0.52);
  const useImage = Boolean(iconUri?.trim());
  const config = SIMPLE_ICON_DATA[iconKey] ?? SIMPLE_ICON_DATA.custom;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderCurve: 'continuous',
          backgroundColor: useImage ? (isDark ? 'rgba(58, 58, 60, 0.8)' : 'rgba(255,255,255,0.9)') : config.color,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 10px 20px rgba(0, 0, 0, 0.35)'
            : '0 10px 16px rgba(15, 23, 42, 0.18)',
        },
        style,
      ]}
    >
      {useImage
        ? (
            <Image
              source={{ uri: iconUri! }}
              style={{ width: size, height: size }}
              contentFit="cover"
            />
          )
        : (
            <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
              <Path d={config.path} fill={colors.iconOnColor} />
            </Svg>
          )}
    </View>
  );
}
