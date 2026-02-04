import { useRouter } from 'expo-router';
import { Button, Card, Switch } from 'heroui-native';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useCategoriesStore, useCurrencyRatesStore, useListsStore, usePaymentMethodsStore, useSettingsStore } from '@/lib/stores';

export default function SettingsScreen() {
  useBootstrap();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();

  const { settings, update } = useSettingsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { methods } = usePaymentMethodsStore();
  const { rates } = useCurrencyRatesStore();

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottom + 40, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>Settings</Text>
          <Button variant="secondary" onPress={() => router.back()}>
            Close
          </Button>
        </View>

        <Card>
          <Card.Header>
            <Card.Title>General</Card.Title>
            <Card.Description>Global app behavior and preferences.</Card.Description>
          </Card.Header>
          <Card.Body style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Main currency</Text>
              <Button size="sm" variant="secondary" onPress={() => router.push('/(modals)/currency')}>
                {settings.mainCurrency}
              </Button>
            </View>

            <SettingRow
              label="iCloud & Data"
              isSelected={settings.iCloudEnabled}
              onSelectedChange={isSelected => update({ iCloudEnabled: isSelected })}
            />

            <SettingRow
              label="Round to whole numbers"
              isSelected={settings.roundWholeNumbers}
              onSelectedChange={isSelected => update({ roundWholeNumbers: isSelected })}
            />

            <SettingRow
              label="True dark colors"
              isSelected={settings.trueDarkColors}
              onSelectedChange={isSelected => update({ trueDarkColors: isSelected })}
            />

            <SettingRow
              label="Haptic feedback"
              isSelected={settings.hapticsEnabled}
              onSelectedChange={isSelected => update({ hapticsEnabled: isSelected })}
            />
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Data</Card.Title>
            <Card.Description>Manage the entities used in your subscriptions.</Card.Description>
          </Card.Header>
          <Card.Body style={{ gap: 10 }}>
            <Button variant="secondary" onPress={() => router.push('/(modals)/categories')}>
              Categories (
              {categories.length}
              )
            </Button>
            <Button variant="secondary" onPress={() => router.push('/(modals)/lists')}>
              Lists (
              {lists.length}
              )
            </Button>
            <Button variant="secondary" onPress={() => router.push('/(modals)/payment-methods')}>
              Payment Methods (
              {methods.length}
              )
            </Button>
            <Button variant="secondary" onPress={() => router.push('/(modals)/notification-settings')}>
              Notification defaults
            </Button>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Currency Rates</Card.Title>
          </Card.Header>
          <Card.Body style={{ gap: 8 }}>
            <Text style={{ fontSize: 12, opacity: 0.7 }}>
              Last update:
              {' '}
              {new Date(rates.updatedAt).toLocaleString()}
            </Text>
            <Button variant="primary" onPress={() => router.push('/(modals)/currency')}>
              Open currency settings
            </Button>
          </Card.Body>
        </Card>
      </ScrollView>
    </View>
  );
}

type SettingRowProps = {
  label: string;
  isSelected: boolean;
  onSelectedChange: (value: boolean) => void;
};

function SettingRow({ label, isSelected, onSelectedChange }: SettingRowProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text>{label}</Text>
      <Switch isSelected={isSelected} onSelectedChange={onSelectedChange} />
    </View>
  );
}
