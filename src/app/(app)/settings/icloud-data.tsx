import type { Subscription } from '@/lib/db/schema';

import { SwiftUI } from '@mgcrea/react-native-swiftui';
import * as FileSystem from 'expo-file-system/legacy';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useToast } from 'heroui-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NativeSheet } from '@/components/native-sheet';
import { SettingsRow, SettingsSection } from '@/components/settings';
import { Haptic } from '@/lib/haptics';
import { useTheme } from '@/lib/hooks/use-theme';
import {
  downloadFromICloud,
  isICloudReady,
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
): string {
  const header = 'Name,Period,Price,Start Date,Category';
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
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { toast } = useToast();

  const { settings, update } = useSettingsStore();
  const { subscriptions, load: loadSubscriptions } = useSubscriptionsStore();
  const { categories } = useCategoriesStore();

  const [iCloudAvailable, setICloudAvailable] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const getCategoryName = useCallback(
    (id: string) => categories.find(c => c.id === id)?.name ?? 'Other',
    [categories],
  );

  const counts = useMemo(() => {
    const active = subscriptions.filter(
      s => s.status === 'active' || s.status === 'paused',
    ).length;
    const canceled = subscriptions.filter(s => s.status === 'canceled').length;
    const archived = 0; // No archived status in schema yet
    return { active, canceled, archived };
  }, [subscriptions]);

  useEffect(() => {
    void isICloudReady().then(setICloudAvailable);
  }, []);

  // When iCloud is unavailable (e.g. simulator), ensure toggle shows off
  useEffect(() => {
    if (!iCloudAvailable && settings.iCloudEnabled) {
      update({ iCloudEnabled: false });
    }
  }, [iCloudAvailable, settings.iCloudEnabled, update]);

  useEffect(() => {
    if (!settings.iCloudEnabled || !iCloudAvailable)
      return;
    let cancelled = false;
    setIsSyncing(true);
    void uploadToICloud()
      .then(() => {
        if (!cancelled)
          setIsSyncing(false);
      })
      .catch(() => {
        if (!cancelled) {
          setIsSyncing(false);
          toast.show('Failed to sync to iCloud');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [settings.iCloudEnabled, iCloudAvailable, subscriptions, toast]);

  const handleToggleICloud = useCallback(
    async (value: boolean) => {
      if (!iCloudAvailable) {
        toast.show('iCloud is not available. Sign in to iCloud in Settings.');
        return;
      }

      update({ iCloudEnabled: value });

      if (value) {
        setIsSyncing(true);
        try {
          await uploadToICloud();
        }
        catch {
          toast.show('Failed to upload to iCloud');
        }
        finally {
          setIsSyncing(false);
        }
      }
    },
    [iCloudAvailable, update, toast],
  );

  const handleExportCsv = useCallback(async () => {
    Haptic.Light();
    if (subscriptions.length === 0) {
      toast.show('No subscriptions to export');
      return;
    }

    setIsExporting(true);
    try {
      const csv = buildCsvRows(subscriptions, getCategoryName);
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
          dialogTitle: 'Export Subscriptions',
        });
      }
      else {
        toast.show('Sharing is not available on this device');
      }
    }
    catch {
      toast.show('Failed to export');
    }
    finally {
      setIsExporting(false);
    }
  }, [subscriptions, getCategoryName, toast]);

  const handleDeleteAll = useCallback(() => {
    Haptic.Light();
    Alert.alert(
      'Delete All Data',
      'This action permanently deletes all data from your device. If iCloud sync is enabled, data will also be removed from iCloud.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All Data',
          style: 'destructive',
          onPress: async () => {
            Haptic.Light();
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
  }, [router]);

  const handleBackupToICloud = useCallback(async () => {
    if (!iCloudAvailable) {
      toast.show('iCloud is not available');
      return;
    }

    setIsBackingUp(true);
    try {
      await uploadToICloud();
      toast.show('Backup completed successfully');
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.show(`Failed to backup: ${errorMessage}`);
    }
    finally {
      setIsBackingUp(false);
    }
  }, [iCloudAvailable, toast]);

  const handleRestoreFromICloud = useCallback(async () => {
    if (!iCloudAvailable) {
      toast.show('iCloud is not available');
      return;
    }

    Alert.alert(
      'Restore from iCloud',
      'This will replace your local data with the backup from iCloud. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
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
              toast.show('Data restored from iCloud');
            }
            catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              toast.show(`Failed to restore: ${errorMessage}`);
            }
            finally {
              setIsRestoring(false);
            }
          },
        },
      ],
    );
  }, [iCloudAvailable, loadSubscriptions, toast]);

  return (
    <NativeSheet title="iCloud & Data" showCloseIcon={false} showBackIcon>
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
              ? 'Syncing...'
              : 'Your subscription data will be securely synced across all your devices via iCloud Drive.'
          }
          minHeight={settings.iCloudEnabled && iCloudAvailable ? 250 : 150}
        >
          <SwiftUI.HStack spacing={8}>
            <SwiftUI.Image
              name="system:lock.fill"
              style={{ width: 18, height: 18 }}
            />
            <SwiftUI.Text
              text="iCloud synchronization"
              style={{ fontSize: 17, fontWeight: '500' }}
            />
            <SwiftUI.Spacer />
            <SwiftUI.Toggle
              label=""
              isOn={settings.iCloudEnabled}
              onChange={handleToggleICloud}
              disabled={!iCloudAvailable}
            />
          </SwiftUI.HStack>

          {settings.iCloudEnabled && iCloudAvailable && (
            <>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
              <SettingsRow
                icon="system:icloud.and.arrow.up"
                label={isBackingUp ? 'Backing up...' : 'Backup'}
                trailingIcon={false}
                buttonColor={colors.text}
                onPress={handleBackupToICloud}
              />
              <SettingsRow
                icon="system:icloud.and.arrow.down"
                label={isRestoring ? 'Restoring...' : 'Restore from iCloud'}
                trailingIcon={false}
                buttonColor={colors.text}
                onPress={handleRestoreFromICloud}
              />
            </>
          )}
        </SettingsSection>

        {/* Current Base */}
        <SettingsSection header="Current Subs" minHeight={200}>
          <SettingsRow
            icon="system:checkmark.circle"
            label="Active & One time"
            value={String(counts.active)}
            valueColor={colors.textMuted}
            trailingIcon={false}
            buttonColor={colors.text}
            onPress={() => {}}
          />
          <SettingsRow
            icon="system:xmark.circle"
            label="Canceled"
            value={String(counts.canceled)}
            valueColor={colors.textMuted}
            trailingIcon={false}
            buttonColor={colors.text}
            onPress={() => {}}
          />
          <SettingsRow
            icon="system:archivebox"
            label="Archived"
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
                text={isExporting ? 'Exporting...' : 'Export data to CSV'}
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
              Delete All Data
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
            This action permanently deletes all data from your device. If iCloud
            sync is enabled, data will also be removed from iCloud.
          </Text>
        </View>
      </ScrollView>
    </NativeSheet>
  );
}
