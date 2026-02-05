import { useRouter } from 'expo-router';
import { Button, Select, useToast } from 'heroui-native';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { GlassCard, GlassCardBody } from '@/components/glass-card';
import { ModalSheet } from '@/components/modal-sheet';
import { useSelectPopoverStyles } from '@/components/select-popover';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCurrencyRatesStore, useSettingsStore } from '@/lib/stores';

export default function CurrencyScreen() {
  useBootstrap();
  const router = useRouter();
  const { toast } = useToast();
  const { colors } = useTheme();
  const popoverStyles = useSelectPopoverStyles();

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
      <GlassCard>
        <GlassCardBody style={{ gap: 10 }}>
          <Text style={{ color: colors.textMuted }} selectable>
            Pick your reporting currency.
          </Text>
          <Select
            value={selectedOption}
            onValueChange={option => setSelectedCurrency(option?.value ?? settings.mainCurrency)}
            presentation="popover"
          >
            <Select.Trigger>
              <Select.Value placeholder="Choose currency" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Overlay />
              <Select.Content
                presentation="popover"
                align="start"
                width="trigger"
                style={popoverStyles.content}
              >
                {options.map(option => (
                  <Select.Item key={option.value} value={option.value} label={option.label} />
                ))}
              </Select.Content>
            </Select.Portal>
          </Select>
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
        </GlassCardBody>
      </GlassCard>
    </ModalSheet>
  );
}
