import { useRouter } from 'expo-router';
import { Button, Card, useToast } from 'heroui-native';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { ModalSheet } from '@/components/modal-sheet';
import { SelectPill } from '@/components/select-pill';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCurrencyRatesStore, useSettingsStore } from '@/lib/stores';

export default function CurrencyScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const { colors } = useTheme();

  const { settings, update } = useSettingsStore();
  const { rates, refreshFromBundle } = useCurrencyRatesStore();

  const options = useMemo(
    () => Object.keys(rates.rates).sort().map(code => ({ label: code, value: code })),
    [rates.rates],
  );

  const [selectedCurrency, setSelectedCurrency] = useState(settings.mainCurrency);

  const selectedOption = options.find(option => option.value === selectedCurrency);

  const handleSave = () => {
    update({ mainCurrency: selectedCurrency });
    toast.show(`Main currency updated to ${selectedCurrency}`);
    router.back();
  };

  return (
    <ModalSheet title="Main Currency">
      <Card>
        <Card.Body style={{ gap: 10 }}>
          <Text style={{ color: colors.textMuted }} selectable>
            Pick your reporting currency.
          </Text>
          <SelectPill
            value={selectedOption}
            options={options}
            placeholder="Choose currency"
            onValueChange={option => setSelectedCurrency(option?.value ?? settings.mainCurrency)}
            style={{ width: '100%', justifyContent: 'space-between' }}
          />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="primary" onPress={handleSave}>
              Save
            </Button>
            <Button
              variant="secondary"
              onPress={() => {
                refreshFromBundle();
                toast.show('Currency rates refreshed from bundled data');
              }}
            >
              Refresh rates
            </Button>
          </View>
        </Card.Body>
      </Card>
    </ModalSheet>
  );
}
