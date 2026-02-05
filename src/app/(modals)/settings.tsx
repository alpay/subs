import { useRouter } from 'expo-router';
import { Button, Switch } from 'heroui-native';
import { Text } from 'react-native';

import { GlassCard, GlassCardBody } from '@/components/glass-card';
import { ModalSheet } from '@/components/modal-sheet';
import { SettingRow } from '@/components/setting-row';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCategoriesStore, useCurrencyRatesStore, useListsStore, usePaymentMethodsStore, useSettingsStore } from '@/lib/stores';

export default function SettingsScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();

  const { settings, update } = useSettingsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { methods } = usePaymentMethodsStore();
  const { rates } = useCurrencyRatesStore();

  return (
    <ModalSheet title="Settings">
      <GlassCard>
        <GlassCardBody style={{ gap: 14 }}>
          <SettingRow
            label="Main Currency"
            value={settings.mainCurrency}
            description="Reporting currency for totals"
            onPress={() => router.push('/(modals)/currency')}
          />

          <SettingRow
            label="iCloud & Data"
            description="Sync and backup"
          >
            <Switch
              isSelected={settings.iCloudEnabled}
              onSelectedChange={isSelected => update({ iCloudEnabled: isSelected })}
            />
          </SettingRow>

          <SettingRow
            label="Round to Whole Numbers"
          >
            <Switch
              isSelected={settings.roundWholeNumbers}
              onSelectedChange={isSelected => update({ roundWholeNumbers: isSelected })}
            />
          </SettingRow>

          <SettingRow
            label="True Dark Colors"
          >
            <Switch
              isSelected={settings.trueDarkColors}
              onSelectedChange={isSelected => update({ trueDarkColors: isSelected })}
            />
          </SettingRow>

          <SettingRow label="Haptic Feedback">
            <Switch
              isSelected={settings.hapticsEnabled}
              onSelectedChange={isSelected => update({ hapticsEnabled: isSelected })}
            />
          </SettingRow>
        </GlassCardBody>
      </GlassCard>

      <GlassCard>
        <GlassCardBody style={{ gap: 12 }}>
          <Text style={{ fontSize: 12, color: colors.textMuted, letterSpacing: 1 }} selectable>
            MANAGE DATA
          </Text>
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
        </GlassCardBody>
      </GlassCard>

      <GlassCard>
        <GlassCardBody style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
            Currency Rates
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
            Last update:
            {' '}
            {new Date(rates.updatedAt).toLocaleString()}
          </Text>
          <Button variant="primary" onPress={() => router.push('/(modals)/currency')}>
            Update Now
          </Button>
        </GlassCardBody>
      </GlassCard>
    </ModalSheet>
  );
}
