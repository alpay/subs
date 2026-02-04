import { useRouter } from 'expo-router';
import { Button, Card, Select, useToast } from 'heroui-native';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useCurrencyRatesStore, useSettingsStore } from '@/lib/stores';

type SelectOption = { label: string; value: string } | undefined;

export default function CurrencyScreen() {
  useBootstrap();
  const router = useRouter();
  const { toast } = useToast();
  const { top, bottom } = useSafeAreaInsets();

  const { settings, update } = useSettingsStore();
  const { rates, refreshFromBundle } = useCurrencyRatesStore();

  const options = useMemo(
    () => Object.keys(rates.rates).sort().map(code => ({ label: code, value: code })),
    [rates.rates],
  );

  const [selectedCurrency, setSelectedCurrency] = useState(settings.mainCurrency);

  const selectedOption = options.find(option => option.value === selectedCurrency) as SelectOption;

  const handleSave = () => {
    update({ mainCurrency: selectedCurrency });
    toast.show(`Main currency updated to ${selectedCurrency}`);
    router.back();
  };

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottom + 40, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>Main Currency</Text>
          <Button variant="secondary" onPress={() => router.back()}>
            Close
          </Button>
        </View>

        <Card>
          <Card.Body style={{ gap: 10 }}>
            <Text style={{ opacity: 0.7 }}>Pick your reporting currency.</Text>
            <Select
              value={selectedOption}
              onValueChange={option => setSelectedCurrency(option?.value ?? settings.mainCurrency)}
              presentation="bottom-sheet"
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose currency" />
              </Select.Trigger>
              <Select.Portal>
                <Select.Overlay />
                <Select.Content presentation="bottom-sheet">
                  {options.map(option => (
                    <Select.Item key={option.value} value={option.value} label={option.label} />
                  ))}
                </Select.Content>
              </Select.Portal>
            </Select>
            <View style={{ flexDirection: 'row', gap: 8 }}>
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
      </ScrollView>
    </View>
  );
}
