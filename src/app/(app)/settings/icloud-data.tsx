import type { Subscription } from '@/lib/db/schema';
import type { ICloudBackupInfo } from '@/lib/icloud-sync';
import { SwiftUI } from '@mgcrea/react-native-swiftui';
import * as FileSystem from 'expo-file-system/legacy';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useToast } from 'heroui-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useIsCloudAvailable } from 'react-native-cloud-storage';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeSheet } from '@/components/native-sheet';
import { SettingsRow, SettingsSection } from '@/components/settings';
import { Haptic } from '@/lib/haptics';
import { useICloudAutoSync, useICloudBackupInfo } from '@/lib/hooks/use-icloud-sync';
import { usePremiumGuard } from '@/lib/hooks/use-premium-guard';
import { useTheme } from '@/lib/hooks/use-theme';
import {
  buildBackupSummary,
  deleteICloudBackup,
  downloadFromICloud,
  formatBackupDate,
  getICloudBackupInfo,
  uploadToICloud,
} from '@/lib/icloud-sync';
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

function formatPeriod(scheduleType: string): string {
  return scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1);
}

function buildCsvRows(
  subscriptions: Subscription[],
  getCategoryName: (id: string) => string,
  t: (key: string) => string,
): string {
  const header = [t('csv_export.name'), t('csv_export.period'), t('csv_export.price'), t('csv_export.start_date'), t('csv_export.category')].join(',');
  const rows = subscriptions.map((sub) => {
    const period = formatPeriod(sub.scheduleType);
    const price = `${sub.amount.toFixed(2)} ${sub.currency}`;
    const startDate = sub.startDate.split('T')[0];
    const category = getCategoryName(sub.categoryId);
    return `${sub.name},${period},${price},${startDate},${category}`;
  });
  return [header, ...rows].join('\n');
}

export default function ICloudDataScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { toast } = useToast();

  const { isPremium, showPaywall } = usePremiumGuard();
  const { settings, update } = useSettingsStore();
  const { subscriptions, load: loadSubscriptions } = useSubscriptionsStore();
  const { categories } = useCategoriesStore();
  const { lists } = useListsStore();
  const { methods: paymentMethods } = usePaymentMethodsStore();

  const iCloudAvailable = useIsCloudAvailable();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [icloudToggleVersion, setIcloudToggleVersion] = useState(0);

  const getCategoryName = useCallback(
    (id: string) => categories.find(c => c.id === id)?.name ?? t('common.other'),
    [categories, t],
  );

  const counts = useMemo(() => {
    const active = subscriptions.filter(
      s => s.status === 'active' || s.status === 'paused',
    ).length;
    const canceled = subscriptions.filter(s => s.status === 'canceled').length;
    const archived = 0; // No archived status in schema yet
    return { active, canceled, archived };
  }, [subscriptions]);

  const { backupInfo, setBackupInfo } = useICloudBackupInfo({
    enabled: settings.iCloudEnabled,
    available: iCloudAvailable,
  });

  useICloudAutoSync({
    enabled: settings.iCloudEnabled,
    available: iCloudAvailable,
    deps: [subscriptions, categories, lists, paymentMethods],
    onSyncStart: () => setIsSyncing(true),
    onSyncEnd: () => setIsSyncing(false),
    onSyncError: (message) => {
      toastRef.current.show(message);
    },
  });

  const handleToggleICloud = useCallback(
    async (value: boolean) => {
      if (!iCloudAvailable) {
        toast.show(t('icloud.not_available'));
        return;
      }

      if (value && !isPremium) {
        showPaywall();
        // SwiftUI.Toggle keeps its own internal state; force a remount so UI snaps back to OFF.
        setIcloudToggleVersion(v => v + 1);
        return;
      }

      if (value) {
        const hasLocalData = subscriptions.length > 0;
        let info: ICloudBackupInfo = { exists: false };

        try {
          info = await getICloudBackupInfo();
        }
        catch (error) {
          const message
            = error instanceof Error ? error.message : t('icloud.check_backup_failed');
          toast.show(message);
          return;
        }

        // 1) Backup yoksa: local -> iCloud
        if (!info.exists) {
          setIsSyncing(true);
          try {
            await uploadToICloud();
            update({ iCloudEnabled: true });
            const refreshed = await getICloudBackupInfo();
            setBackupInfo(refreshed);
          }
          catch (error) {
            const message
              = error instanceof Error ? error.message : t('icloud.sync_failed');
            toast.show(message);
            update({ iCloudEnabled: false });
          }
          finally {
            setIsSyncing(false);
          }
          return;
        }

        // 2) Backup var ama local boşsa: sessizce iCloud -> local
        if (!hasLocalData) {
          setIsSyncing(true);
          try {
            await downloadFromICloud();
            loadSubscriptions();
            useCategoriesStore.getState().load();
            useListsStore.getState().load();
            usePaymentMethodsStore.getState().load();
            useSettingsStore.getState().load();
            toast.show(t('icloud.restored'));
            update({ iCloudEnabled: true });
            const refreshed = await getICloudBackupInfo();
            setBackupInfo(refreshed);
          }
          catch (error) {
            const message
              = error instanceof Error ? error.message : t('icloud.restore_failed');
            toast.show(message);
            update({ iCloudEnabled: false });
          }
          finally {
            setIsSyncing(false);
          }
          return;
        }

        // 3) Backup var ve local doluysa: kullanıcıya sor
        const backupSummary = buildBackupSummary(info);

        Alert.alert(
          t('icloud.backup_found_title'),
          backupSummary.length > 0
            ? t('icloud.backup_found_with_summary', { summary: backupSummary })
            : t('icloud.backup_found_message'),
          [
            {
              text: t('common.cancel'),
              style: 'cancel',
              onPress: () => {
                // iCloudEnabled state değişmeden kalır (false)
              },
            },
            {
              text: t('icloud.use_backup'),
              style: 'destructive',
              onPress: () => {
                setIsSyncing(true);
                void (async () => {
                  try {
                    await downloadFromICloud();
                    loadSubscriptions();
                    useCategoriesStore.getState().load();
                    useListsStore.getState().load();
                    usePaymentMethodsStore.getState().load();
                    useSettingsStore.getState().load();
                    toast.show(t('icloud.restored'));
                    update({ iCloudEnabled: true });
                    const refreshed = await getICloudBackupInfo();
                    setBackupInfo(refreshed);
                  }
                  catch (error) {
                    const message
                      = error instanceof Error
                        ? error.message
                        : t('icloud.restore_failed');
                    toast.show(message);
                    update({ iCloudEnabled: false });
                  }
                  finally {
                    setIsSyncing(false);
                  }
                })();
              },
            },
            {
              text: t('icloud.keep_device'),
              onPress: () => {
                setIsSyncing(true);
                void (async () => {
                  try {
                    await uploadToICloud();
                    update({ iCloudEnabled: true });
                    const refreshed = await getICloudBackupInfo();
                    setBackupInfo(refreshed);
                  }
                  catch (error) {
                    const message
                      = error instanceof Error
                        ? error.message
                        : t('icloud.sync_failed');
                    toast.show(message);
                    update({ iCloudEnabled: false });
                  }
                  finally {
                    setIsSyncing(false);
                  }
                })();
              },
            },
          ],
        );
      }
      else {
        update({ iCloudEnabled: false });
      }
    },
    [
      iCloudAvailable,
      isPremium,
      showPaywall,
      update,
      toast,
      t,
      loadSubscriptions,
      subscriptions.length,
      setBackupInfo,
    ],
  );

  const handleExportCsv = useCallback(async () => {
    Haptic.Light();
    if (subscriptions.length === 0) {
      toast.show(t('icloud.no_subs_to_export'));
      return;
    }

    setIsExporting(true);
    try {
      const csv = buildCsvRows(subscriptions, getCategoryName, t);
      const date = new Date().toISOString().split('T')[0];
      const filename = `SubscriptionDay_Export_${date}.csv`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          UTI: 'public.comma-separated-values-text',
          dialogTitle: t('icloud.export_dialog_title'),
        });
      }
      else {
        toast.show(t('icloud.sharing_unavailable'));
      }
    }
    catch {
      toast.show(t('icloud.export_failed'));
    }
    finally {
      setIsExporting(false);
    }
  }, [subscriptions, getCategoryName, toast, t]);

  const handleDeleteAll = useCallback(() => {
    Haptic.Light();
    Alert.alert(
      t('icloud.delete_all_confirm_title'),
      t('icloud.delete_all_confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('icloud.delete_all'),
          style: 'destructive',
          onPress: async () => {
            Haptic.Light();
            if (settings.iCloudEnabled) {
              try {
                await deleteICloudBackup();
              }
              catch {
                // iCloud backup silinemezse local data yine de silinir.
              }
            }
            storage.clearAll();
            await Notifications.cancelAllScheduledNotificationsAsync();
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
  }, [router, settings.iCloudEnabled, t]);

  const handleBackupToICloud = useCallback(async () => {
    if (!iCloudAvailable) {
      toast.show(t('icloud.not_available_short'));
      return;
    }

    setIsBackingUp(true);
    try {
      await uploadToICloud();
      toast.show(t('icloud.backup_success'));
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('common.unknown_error');
      toast.show(t('icloud.backup_failed', { message: errorMessage }));
    }
    finally {
      setIsBackingUp(false);
    }
  }, [iCloudAvailable, toast, t]);

  const handleRestoreFromICloud = useCallback(async () => {
    if (!iCloudAvailable) {
      toast.show(t('icloud.not_available_short'));
      return;
    }

    Alert.alert(
      t('icloud.restore_confirm_title'),
      t('icloud.restore_confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('icloud.restore_button'),
          onPress: async () => {
            Haptic.Light();
            setIsRestoring(true);
            try {
              await downloadFromICloud();
              loadSubscriptions();
              useCategoriesStore.getState().load();
              useListsStore.getState().load();
              usePaymentMethodsStore.getState().load();
              useSettingsStore.getState().load();
              toast.show(t('icloud.restored'));
            }
            catch (error) {
              const errorMessage = error instanceof Error ? error.message : t('common.unknown_error');
              toast.show(t('icloud.restore_failed'));
            }
            finally {
              setIsRestoring(false);
            }
          },
        },
      ],
    );
  }, [iCloudAvailable, loadSubscriptions, toast, t]);

  return (
    <NativeSheet title={t('icloud.title')} showCloseIcon={false} showBackIcon>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* iCloud Synchronization */}
        <SettingsSection
          header=""
          footer={
            isSyncing
              ? t('icloud.syncing')
              : backupInfo?.createdAt
                ? t('icloud.last_backup', { date: formatBackupDate(backupInfo.createdAt) })
                : t('icloud.backup_footer')
          }
          minHeight={settings.iCloudEnabled ? 250 : 150}
          marginBottom={0}
        >
          <SwiftUI.HStack spacing={8}>
            <SwiftUI.Image
              name="system:lock.fill"
              style={{ width: 18, height: 18 }}
            />
            <SwiftUI.Text
              text={t('icloud.icloud_sync')}
              style={{ fontSize: 17, fontWeight: '500' }}
            />
            <SwiftUI.Spacer />
            <SwiftUI.Toggle
              key={`icloud-toggle-${icloudToggleVersion}`}
              label=""
              isOn={settings.iCloudEnabled}
              onChange={handleToggleICloud}
              disabled={!iCloudAvailable}
            />
          </SwiftUI.HStack>

          {settings.iCloudEnabled && (
            <>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
              <SettingsRow
                icon="system:icloud.and.arrow.up"
                label={isBackingUp ? t('icloud.backing_up') : t('icloud.backup')}
                trailingIcon={false}
                buttonColor={colors.text}
                onPress={handleBackupToICloud}
              />
              <SettingsRow
                icon="system:icloud.and.arrow.down"
                label={isRestoring ? t('icloud.restoring') : t('icloud.restore')}
                trailingIcon={false}
                buttonColor={colors.text}
                onPress={handleRestoreFromICloud}
              />
            </>
          )}
        </SettingsSection>

        {/* Current Base */}
        <SettingsSection header={t('icloud.current_subs')} minHeight={200} marginBottom={0}>
          <SettingsRow
            icon="system:checkmark.circle"
            label={t('icloud.active_one_time')}
            value={String(counts.active)}
            valueColor={colors.textMuted}
            trailingIcon={false}
            buttonColor={colors.text}
            onPress={() => {}}
          />
          <SettingsRow
            icon="system:xmark.circle"
            label={t('icloud.canceled')}
            value={String(counts.canceled)}
            valueColor={colors.textMuted}
            trailingIcon={false}
            buttonColor={colors.text}
            onPress={() => {}}
          />
          <SettingsRow
            icon="system:archivebox"
            label={t('icloud.archived')}
            value={String(counts.archived)}
            valueColor={colors.textMuted}
            trailingIcon={false}
            buttonColor={colors.text}
            onPress={() => {}}
          />
        </SettingsSection>

        {/* Export Data */}
        <SettingsSection header="" minHeight={100}>
          <SwiftUI.Button
            buttonStyle="default"
            style={{ color: colors.text }}
            onPress={() => {
              Haptic.Light();
              handleExportCsv();
            }}
            disabled={isExporting}
          >
            <SwiftUI.HStack spacing={8}>
              <SwiftUI.Image
                name="system:square.and.arrow.up"
                style={{ width: 22, height: 22 }}
              />
              <SwiftUI.Text
                text={isExporting ? t('icloud.exporting') : t('icloud.export_csv')}
              />
              <SwiftUI.Spacer />
            </SwiftUI.HStack>
          </SwiftUI.Button>
        </SettingsSection>

        {/* Delete All Data */}
        <View style={{ marginBottom: 20 }}>
          <Pressable
            onPress={() => {
              Haptic.Light();
              handleDeleteAll();
            }}
            style={({ pressed }) => [
              {
                backgroundColor: colors.danger,
                borderRadius: 12,
                borderCurve: 'continuous',
                paddingVertical: 14,
                paddingHorizontal: 16,
                alignItems: 'center',
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '600',
                color: 'white',
              }}
              selectable
            >
              {t('icloud.delete_all')}
            </Text>
          </Pressable>
          <Text
            style={{
              fontSize: 13,
              color: colors.textMuted,
              lineHeight: 18,
              marginTop: 8,
              paddingHorizontal: 4,
            }}
            selectable
          >
            {t('icloud.delete_all_footer')}
          </Text>
        </View>
      </ScrollView>
    </NativeSheet>
  );
}
