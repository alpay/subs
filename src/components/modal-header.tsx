import type { ReactNode } from 'react';

import { X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

type ModalHeaderProps = {
  title: string;
  right?: ReactNode;
  onClose?: () => void;
};

export function ModalHeader({ title, right, onClose }: ModalHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 16 }}>
          {title}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {right}
        {onClose
          ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={10}
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X color={colors.text} size={20} />
              </Pressable>
            )
          : null}
      </View>
    </View>
  );
}
