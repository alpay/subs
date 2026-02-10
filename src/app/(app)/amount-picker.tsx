import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';

import { AmountPickerContent, AmountPickerCurrencyPill } from '@/components/amount-picker-content';
import { NativeSheet } from '@/components/native-sheet';

/** Route screen – used when opening from subscription add/edit etc. Add-subscription uses inline gorhom modal instead. */
export default function AmountPickerScreen() {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <NativeSheet
      // title="Amount"
      topLeft={(
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AmountPickerCurrencyPill />
        </View>
      )}
      onClose={handleClose}
    >
      <AmountPickerContent onDone={handleClose} />
    </NativeSheet>
  );
}
