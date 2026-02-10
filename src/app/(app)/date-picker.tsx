import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { DatePickerContent } from '@/components/date-picker-content';
import { NativeSheet } from '@/components/native-sheet';

/** Route screen – used when opening from subscription add/edit etc. Add-subscription uses inline gorhom modal instead. */
export default function DatePickerScreen() {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <NativeSheet title="Start Date">
      <DatePickerContent onDone={handleClose} />
    </NativeSheet>
  );
}
