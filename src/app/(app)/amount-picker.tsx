import { useLocalSearchParams, useRouter } from 'expo-router';

import { useCallback } from 'react';

import { AmountPickerContent, AmountPickerCurrencyPill } from '@/components/amount-picker-content';
import { ModalSheet } from '@/components/modal-sheet';

const DISMISS_TO_PARAM = 'dismissTo';

/** Route screen – used when opening from subscription-form etc. Add-subscription uses inline gorhom modal instead. */
export default function AmountPickerScreen() {
  const router = useRouter();
  const { [DISMISS_TO_PARAM]: dismissTo } = useLocalSearchParams<{ [DISMISS_TO_PARAM]?: string }>();

  const handleClose = useCallback(() => {
    if (dismissTo) {
      router.dismissTo(dismissTo as Parameters<typeof router.dismissTo>[0]);
    } else {
      router.back();
    }
  }, [router, dismissTo]);

  return (
    <ModalSheet
      title="Amount"
      closeButtonTitle="Close"
      onClose={handleClose}
      topRightActionBar={<AmountPickerCurrencyPill />}
      snapPoints={['88%']}
      lockSnapPoint
      bottomScrollSpacer={88}
    >
      <AmountPickerContent onDone={handleClose} />
    </ModalSheet>
  );
}
