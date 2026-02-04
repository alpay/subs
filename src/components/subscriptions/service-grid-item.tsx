import type { ReactNode } from 'react';

import { Pressable, Text, View } from '@/components/ui';
import { useTheme } from '@/lib/hooks/use-theme';

export type ServiceGridItemProps = {
  title: string;
  icon: ReactNode;
  onPress?: () => void;
};

export default function ServiceGridItem({ title, icon, onPress }: ServiceGridItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center rounded-3xl px-4 py-6"
      style={{ backgroundColor: colors.card }}
    >
      <View className="mb-3 items-center justify-center rounded-2xl" style={{ backgroundColor: colors.background, padding: 12 }}>
        {icon}
      </View>
      <Text className="text-sm font-semibold" style={{ color: colors.text }}>
        {title}
      </Text>
    </Pressable>
  );
}
