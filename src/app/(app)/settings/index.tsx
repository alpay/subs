import { SwiftUI } from '@mgcrea/react-native-swiftui';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { useToast } from 'heroui-native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Share, Text, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NativeSheet } from '@/components/native-sheet';
import {
  SettingsRow,
  SettingsSection,
  SettingsToggleRow,
} from '@/components/settings';
import { SettingsNotificationSection } from '@/components/settings-notification-section';
import { CURRENCIES } from '@/lib/data/currencies';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import { Haptic } from '@/lib/haptics';
import { useTheme } from '@/lib/hooks/use-theme';
import { getIntlLocale } from '@/lib/i18n/date-locale';
import { LANGUAGE_NAMES } from '@/lib/i18n/resources';
import { useSelectedLanguage } from '@/lib/i18n/utils';
import { cancelAll } from '@/lib/notifications/notifications-manager';
import { storage } from '@/lib/storage';
import {
  useCategoriesStore,
  useCurrencyRatesStore,
  useListsStore,
  usePaymentMethodsStore,
  useServiceTemplatesStore,
  useSettingsStore,
  useSubscriptionsStore,
} from '@/lib/stores';
import { formatLastUpdated } from '@/lib/utils/format';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();

  const { settings, update } = useSettingsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { methods } = usePaymentMethodsStore();
  const { toast } = useToast();
  const { rates, isUpdating, fetchAndUpdateRates } = useCurrencyRatesStore();
  const { language: currentLanguage } = useSelectedLanguage();
  const currentLanguageLabel = currentLanguage ? LANGUAGE_NAMES[currentLanguage] : '';

  const handleUpdateRates = useCallback(async () => {
    try {
      await fetchAndUpdateRates();
      toast.show(t('settings.currency_updated'));
    }
    catch {
      toast.show(t('settings.currency_update_failed'));
    }
  }, [fetchAndUpdateRates, toast, t]);

  const currencyFlag = useMemo(() => {
    const entry = CURRENCIES.find(
      c => c.code === settings.mainCurrency?.toUpperCase(),
    );
    return entry?.flag ?? '';
  }, [settings.mainCurrency]);

  const lastUpdatedLabel = useMemo(
    () => formatLastUpdated(rates.updatedAt, t('common.never'), getIntlLocale()),
    [rates.updatedAt, t],
  );

  const handleResetApp = () => {
    Alert.alert(
      t('settings.reset_alert_title'),
      t('settings.reset_alert_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.reset_confirm'),
          style: 'destructive',
          onPress: async () => {
            Haptic.Light();
            storage.clearAll();
            await cancelAll();
            useSettingsStore.getState().load();
            useCategoriesStore.getState().load();
            useSubscriptionsStore.getState().load();
            usePaymentMethodsStore.getState().load();
            useListsStore.getState().load();
            useCurrencyRatesStore.getState().load();
            useServiceTemplatesStore.getState().load();
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  return (
    <NativeSheet title={t('settings.title')}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Developer */}
        <SettingsSection header={t('settings.developer')} minHeight={150}>
          <SettingsRow
            icon="system:trash"
            label={t('settings.reset_app')}
            buttonColor="red"
            trailingIcon={false}
            onPress={() => {
              Haptic.Light();
              handleResetApp();
            }}
          />
          <SettingsToggleRow
            icon="system:crown"
            label={t('settings.premium')}
            isOn={settings.premium}
            onChange={value => update({ premium: value })}
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection
          header={t('settings.account')}
          footer={t('settings.unlock_lifetime')}
          minHeight={150}
        >
          <SettingsRow
            icon="system:sparkles"
            label={(
              <SwiftUI.VStack alignment="leading" spacing={2}>
                <SwiftUI.Text
                  text={t('settings.subscription_day')}
                  style={{ fontSize: 17, fontWeight: '600' }}
                />
                <SwiftUI.Text
                  text={t('settings.account_type')}
                  style={{ color: colors.textMuted, fontSize: 12 }}
                />
              </SwiftUI.VStack>
            )}
            value={(
              <SwiftUI.Text
                text={settings.premium ? t('settings.pro') : t('settings.free')}
                style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}
              />
            )}
            buttonColor={colors.text}
            onPress={() => router.push('/(app)/paywall' as const)}
          />
        </SettingsSection>

        {/* General */}
        <SettingsSection header={t('settings.general')} minHeight={280}>
          <SettingsRow
            icon="system:externaldrive"
            label={t('settings.icloud_data')}
            value={settings.iCloudEnabled ? t('common.on') : t('common.off')}
            valueColor={colors.textMuted}
            buttonColor={colors.text}
            onPress={() => router.push('/(app)/settings/icloud-data')}
          />
          <SettingsRow
            icon="system:globe"
            label={t('settings.language')}
            value={currentLanguageLabel}
            valueColor={colors.textMuted}
            buttonColor={colors.text}
            onPress={() => router.push('/(app)/settings/language')}
          />
          <SettingsRow
            icon="system:dollarsign"
            label={t('settings.main_currency')}
            value={(
              <SwiftUI.HStack spacing={6}>
                {currencyFlag ? <SwiftUI.Text text={currencyFlag} /> : null}
                <SwiftUI.Text text={settings.mainCurrency} />
              </SwiftUI.HStack>
            )}
            buttonColor={colors.text}
            onPress={() => router.push('/(app)/settings/currency')}
          />
          <SettingsToggleRow
            icon="system:number"
            label={t('settings.round_whole_numbers')}
            isOn={settings.roundWholeNumbers}
            onChange={value => update({ roundWholeNumbers: value })}
          />
        </SettingsSection>

        {/* Data */}
        <SettingsSection header={t('settings.data')} minHeight={200}>
          <SettingsRow
            icon="system:list.bullet"
            label={t('settings.lists')}
            value={String(lists.length)}
            valueColor={colors.textMuted}
            buttonColor={colors.text}
            onPress={() => router.push('/(app)/settings/lists')}
          />
          <SettingsRow
            icon="system:square.grid.2x2"
            label={t('settings.categories')}
            value={String(categories.length)}
            valueColor={colors.textMuted}
            buttonColor={colors.text}
            onPress={() => router.push('/(app)/settings/categories')}
          />
          <SettingsRow
            icon="system:creditcard"
            label={t('settings.payment_methods')}
            value={String(methods.length)}
            valueColor={colors.textMuted}
            buttonColor={colors.text}
            onPress={() => router.push('/(app)/settings/payment-methods')}
          />
        </SettingsSection>

        {/* Section 4: Notifications (rounded panel) */}
        <SettingsNotificationSection />

        {/* Interface */}
        <SettingsSection header={t('settings.interface')} minHeight={FEATURE_FLAGS.themeSelector ? 200 : 150}>
          <SettingsToggleRow
            icon="system:paintbrush.fill"
            label={t('settings.true_dark_colors')}
            isOn={settings.trueDarkColors}
            onChange={value => update({ trueDarkColors: value })}
          />
          {FEATURE_FLAGS.themeSelector && (
            <SettingsRow
              icon="system:circle.lefthalf.filled"
              label={t('settings.theme')}
              value={t('settings.preview_choose')}
              valueColor={colors.textMuted}
              buttonColor={colors.text}
              onPress={() => router.push('/(app)/settings/theme')}
            />
          )}
          <SettingsToggleRow
            icon="system:hand.tap.fill"
            label={t('settings.haptic_feedback')}
            isOn={settings.hapticsEnabled}
            onChange={value => update({ hapticsEnabled: value })}
          />
        </SettingsSection>

        {/* Currency rates */}
        <SettingsSection
          header={t('settings.currency_rates')}
          footer={t('settings.currency_rates_footer')}
          minHeight={180}
        >
          <SwiftUI.HStack spacing={8}>
            <SwiftUI.VStack alignment="leading" spacing={4}>
              <SwiftUI.Text text={t('settings.last_updated')} />
              <SwiftUI.Text
                text={lastUpdatedLabel}
                style={{ color: colors.textMuted, fontSize: 12 }}
              />
            </SwiftUI.VStack>
            <SwiftUI.Spacer />
            <SwiftUI.Button
              title={isUpdating ? t('settings.updating') : t('settings.update_now')}
              buttonStyle="default"
              style={{ color: colors.text }}
              disabled={isUpdating}
              onPress={() => {
                Haptic.Light();
                handleUpdateRates();
              }}
            />
          </SwiftUI.HStack>
        </SettingsSection>

        {/* More */}
        <SettingsSection header={t('settings.more')} minHeight={300}>
          <SettingsRow
            icon="system:star"
            label={t('settings.rate_review')}
            trailingIcon="arrow"
            buttonColor={colors.text}
            onPress={async () => {
              Haptic.Light();
              const canReview = await StoreReview.hasAction();
              if (canReview) {
                await StoreReview.requestReview();
              }
            }}
          />
          <SettingsRow
            icon="system:hand.raised"
            label={t('settings.privacy_agreement')}
            trailingIcon="arrow"
            buttonColor={colors.text}
            onPress={() => {
              Haptic.Light();
              Linking.openURL('https://subs.alpay.dev/privacy');
            }}
          />
          <SettingsRow
            icon="system:doc.text"
            label={t('settings.terms_of_service')}
            trailingIcon="arrow"
            buttonColor={colors.text}
            onPress={() => {
              Haptic.Light();
              Linking.openURL('https://subs.alpay.dev/terms');
            }}
          />
          <SettingsRow
            icon="system:envelope"
            label={t('settings.contact_me')}
            buttonColor={colors.text}
            onPress={() => {
              Haptic.Light();
              Linking.openURL('mailto:hi@alpay.dev');
            }}
          />
          <SettingsRow
            icon="system:square.and.arrow.up"
            label={t('settings.share_friend')}
            buttonColor={colors.text}
            onPress={async () => {
              Haptic.Light();
              try {
                await Share.share({
                  message: t('settings.share_message'),
                  url: 'https://subs.alpay.dev',
                });
              }
              catch {}
            }}
          />
        </SettingsSection>

        <View style={{ alignItems: 'center', gap: 6, paddingTop: 8 }}>
          <Image
            source="sf:heart.fill"
            style={{ width: 18, height: 18 }}
            tintColor="#FF4D4F"
          />
          <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }} selectable>
            {t('settings.made_with_love')}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }} selectable>
            {t('settings.version', { version: '1.0' })}
          </Text>
        </View>
      </ScrollView>
    </NativeSheet>
  );
}
