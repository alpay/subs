import { useLocalSearchParams, useRouter } from 'expo-router';

import { useCallback } from 'react';

import { DatePickerContent } from '@/components/date-picker-content';
import { ModalSheet } from '@/components/modal-sheet';

const DISMISS_TO_PARAM = 'dismissTo';

/** Route screen – used when opening from subscription add/edit etc. Add-subscription uses inline gorhom modal instead. */
export default function DatePickerScreen() {
  const router = useRouter();
  const { [DISMISS_TO_PARAM]: dismissTo } = useLocalSearchParams<{ [DISMISS_TO_PARAM]?: string }>();

  const handleClose = useCallback(() => {
    if (dismissTo) {
      router.dismissTo(dismissTo as Parameters<typeof router.dismissTo>[0]);
    }
    else {
      router.back();
    }
  }, [router, dismissTo]);

  return (
    <ModalSheet
      title=""
      closeButtonTitle="Close"
      onClose={handleClose}
      snapPoints={['88%']}
      lockSnapPoint
      bottomScrollSpacer={88}
      scrollViewProps={{ bounces: false }}
    >
      <DatePickerContent onDone={handleClose} />
    </ModalSheet>
  );
}
