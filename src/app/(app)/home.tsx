import { Text, View } from '@/components/ui';
import { useTheme } from '@/lib/hooks/use-theme';

export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
      <Text className="text-2xl font-semibold" style={{ color: colors.text }}>
        Subs
      </Text>
      <Text className="mt-2 text-sm" style={{ color: colors.secondaryText }}>
        Home screen placeholder
      </Text>
    </View>
  );
}
