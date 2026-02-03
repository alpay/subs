import { Text, View } from '@/components/ui';
import { useTheme } from '@/lib/hooks/use-theme';

export default function CsvImportScreen() {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
      <Text className="text-xl font-semibold" style={{ color: colors.text }}>
        CsvImport
      </Text>
      <Text className="mt-2 text-sm" style={{ color: colors.secondaryText }}>
        Modal placeholder
      </Text>
    </View>
  );
}
