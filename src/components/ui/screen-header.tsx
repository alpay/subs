import { Text, View } from 'react-native';
import { useTheme } from '@/lib/hooks/use-theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
  titleColor?: string;
  subtitleColor?: string;
};

export function ScreenHeader({
  title,
  subtitle,
  className = '',
  titleColor,
  subtitleColor,
}: ScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View className={`px-5 pt-4 pb-2 ${className}`}>
      <Text
        className="text-3xl font-bold"
        style={{ color: titleColor || colors.text }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className="mt-1 max-w-60 text-sm"
          style={{ color: subtitleColor || colors.secondaryText }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}
