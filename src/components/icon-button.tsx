import type { StyleProp, ViewStyle } from 'react-native';

import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

type IconButtonProps = {
  symbol: string;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  variant?: 'muted' | 'clear';
};

export function IconButton({ symbol, onPress, size = 36, style, variant = 'muted' }: IconButtonProps) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable onPress={onPress} style={style}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderCurve: 'continuous',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: variant === 'muted' ? colors.surfaceMuted : 'transparent',
          borderWidth: variant === 'muted' ? 1 : 0,
          borderColor: colors.surfaceBorder,
          boxShadow: variant === 'muted'
            ? (isDark
                ? '0 10px 18px rgba(0, 0, 0, 0.3)'
                : '0 10px 18px rgba(15, 23, 42, 0.12)')
            : 'none',
        }}
      >
        <Image
          source={`sf:${symbol}`}
          style={{ width: Math.round(size * 0.45), height: Math.round(size * 0.45) }}
          tintColor={colors.text}
        />
      </View>
    </Pressable>
  );
}
