import type { RefObject } from 'react';
import { useMemo } from 'react';

import { Modal, Pressable, Text, View } from '@/components/ui';
import { useTheme } from '@/lib/hooks/use-theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

export type AmountKeypadProps = {
  value: string;
  onChange: (value: string) => void;
  onDone: () => void;
  modalRef: RefObject<any>;
  currency: string;
};

export default function AmountKeypad({ value, onChange, onDone, modalRef, currency }: AmountKeypadProps) {
  const { colors } = useTheme();

  const displayValue = useMemo(() => (value.length ? value : '0'), [value]);

  const handlePress = (key: string) => {
    if (key === 'del') {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === '.' && value.includes('.')) {
      return;
    }
    onChange(`${value}${key}`);
  };

  return (
    <Modal ref={modalRef} snapPoints={['90%']} title="Amount">
      <View className="flex-1 px-6 pb-6">
        <View className="items-center py-6">
          <Text className="text-sm" style={{ color: colors.secondaryText }}>
            {currency}
          </Text>
          <Text className="text-4xl font-bold" style={{ color: colors.text }}>
            {displayValue}
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {KEYS.map(key => (
            <Pressable
              key={key}
              onPress={() => handlePress(key)}
              className="mb-3 h-14 w-[30%] items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.card }}
            >
              <Text className="text-xl font-semibold" style={{ color: colors.text }}>
                {key === 'del' ? '⌫' : key}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={onDone}
          className="mt-4 items-center justify-center rounded-2xl py-4"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-base font-semibold" style={{ color: colors.headerText }}>
            Done
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}
