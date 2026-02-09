import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { Select, useToast } from 'heroui-native';
import { useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  SettingsRow,
  SettingsRowDivider,
  SettingsSection,
} from '@/components/settings-section';
import { useSelectPopoverStyles } from '@/components/select-popover';
import { useTheme } from '@/lib/hooks/use-theme';
import type { ReminderConfig } from '@/lib/db/schema';
import { useSettingsStore } from '@/lib/stores';

export const REMINDER_DAYS_OPTIONS = [
  { value: '-1', label: 'Never' },
  { value: '0', label: 'Same day' },
  { value: '1', label: '1 Day' },
  { value: '2', label: '2 Days' },
  { value: '3', label: '3 Days' },
  { value: '4', label: '4 Days' },
  { value: '5', label: '5 Days' },
  { value: '10', label: '10 Days' },
  { value: '15', label: '15 Days' },
  { value: '30', label: '30 Days' },
] as const;

const MIN_TOUCH_TARGET = 44;

export function SettingsNotificationSection() {
  const { toast } = useToast();
  const { colors } = useTheme();
  const { settings, update } = useSettingsStore();
  const popoverStyles = useSelectPopoverStyles();

  const firstReminderOption = useMemo(
    () =>
      REMINDER_DAYS_OPTIONS.find(
        o => Number(o.value) === settings.notificationDefaults.first.daysBefore,
      ) ?? REMINDER_DAYS_OPTIONS[0],
    [settings.notificationDefaults.first.daysBefore],
  );
  const secondReminderOption = useMemo(
    () =>
      settings.notificationDefaults.second === null
        ? REMINDER_DAYS_OPTIONS[0]
        : REMINDER_DAYS_OPTIONS.find(
            o => Number(o.value) === settings.notificationDefaults.second!.daysBefore,
          ) ?? REMINDER_DAYS_OPTIONS[0],
    [settings.notificationDefaults.second],
  );
  const firstIsNever = settings.notificationDefaults.first.daysBefore < 0;
  const secondIsNever = settings.notificationDefaults.second === null;

  const updateFirstReminder = useCallback(
    (daysBefore: number, time?: string) => {
      const prev = settings.notificationDefaults.first;
      update({
        notificationDefaults: {
          ...settings.notificationDefaults,
          first: {
            daysBefore,
            time: time ?? prev.time,
          },
        },
      });
    },
    [settings.notificationDefaults, update],
  );
  const updateSecondReminder = useCallback(
    (config: ReminderConfig | null) => {
      update({
        notificationDefaults: {
          ...settings.notificationDefaults,
          second: config,
        },
      });
    },
    [settings.notificationDefaults, update],
  );

  const handleFirstDaysChange = useCallback(
    (option: { value: string; label: string } | undefined) => {
      const days = option ? Number(option.value) : 0;
      updateFirstReminder(days);
    },
    [updateFirstReminder],
  );
  const handleSecondDaysChange = useCallback(
    (option: { value: string; label: string } | undefined) => {
      if (!option || option.value === '-1') {
        updateSecondReminder(null);
        return;
      }
      const days = Number(option.value);
      const prevTime = settings.notificationDefaults.second?.time ?? '09:00';
      updateSecondReminder({ daysBefore: days, time: prevTime });
    },
    [settings.notificationDefaults.second, updateSecondReminder],
  );

  const handleTimePillPress = useCallback(() => {
    toast.show('Time picker coming soon');
  }, [toast]);

  const handleTestNotification = useCallback(async () => {
    try {
      const current = await Notifications.getPermissionsAsync();
      let status = current.status;
      if (status !== 'granted') {
        const request = await Notifications.requestPermissionsAsync();
        status = request.status;
      }
      if (status !== 'granted') {
        toast.show('Enable notifications in Settings to test alerts.');
        return;
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'Notifications are enabled.',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
        },
      });
      toast.show('Test notification scheduled');
    }
    catch {
      toast.show('Unable to schedule a test notification');
    }
  }, [toast]);

  const noteStyle = { fontSize: 12, color: colors.textMuted, lineHeight: 18 };

  const timePillStyle = {
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center' as const,
    borderRadius: 12,
    borderCurve: 'continuous' as const,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  };

  return (
    <>
      <SettingsSection>
        <SettingsRow
          label="First Reminder"
          right={(
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Select
                value={firstReminderOption}
                onValueChange={handleFirstDaysChange}
                presentation="popover"
              >
                <Select.Trigger
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingVertical: 4,
                      paddingHorizontal: 6,
                      borderRadius: 8,
                      borderCurve: 'continuous',
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={{ color: colors.textMuted, fontVariant: ['tabular-nums'], fontSize: 15 }} selectable>
                    {firstReminderOption.label}
                  </Text>
                  <Image
                    source="sf:chevron.up.chevron.down"
                    style={{ width: 10, height: 10 }}
                    tintColor={colors.textMuted}
                  />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Overlay />
                  <Select.Content
                    presentation="popover"
                    align="end"
                    width="content-fit"
                    style={popoverStyles.content}
                  >
                    {REMINDER_DAYS_OPTIONS.map(opt => (
                      <Select.Item key={opt.value} value={opt.value} label={opt.label} />
                    ))}
                  </Select.Content>
                </Select.Portal>
              </Select>
              {!firstIsNever && (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Set reminder time, ${settings.notificationDefaults.first.time}`}
                  activeOpacity={0.7}
                  onPress={handleTimePillPress}
                  style={timePillStyle}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text
                    style={{ color: colors.text, fontSize: 12, fontVariant: ['tabular-nums'] }}
                    selectable
                  >
                    {settings.notificationDefaults.first.time}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
        <SettingsRowDivider />
        <SettingsRow
          label="Second Reminder"
          right={(
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Select
                value={secondReminderOption}
                onValueChange={handleSecondDaysChange}
                presentation="popover"
              >
                <Select.Trigger
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingVertical: 4,
                      paddingHorizontal: 6,
                      borderRadius: 8,
                      borderCurve: 'continuous',
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={{ color: colors.textMuted, fontVariant: ['tabular-nums'], fontSize: 15 }} selectable>
                    {secondReminderOption.label}
                  </Text>
                  <Image
                    source="sf:chevron.up.chevron.down"
                    style={{ width: 10, height: 10 }}
                    tintColor={colors.textMuted}
                  />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Overlay />
                  <Select.Content
                    presentation="popover"
                    align="end"
                    width="content-fit"
                    style={popoverStyles.content}
                  >
                    {REMINDER_DAYS_OPTIONS.map(opt => (
                      <Select.Item key={opt.value} value={opt.value} label={opt.label} />
                    ))}
                  </Select.Content>
                </Select.Portal>
              </Select>
              {!secondIsNever && settings.notificationDefaults.second && (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Set reminder time, ${settings.notificationDefaults.second.time}`}
                  activeOpacity={0.7}
                  onPress={handleTimePillPress}
                  style={timePillStyle}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text
                    style={{ color: colors.text, fontSize: 12, fontVariant: ['tabular-nums'] }}
                    selectable
                  >
                    {settings.notificationDefaults.second.time}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
        <SettingsRowDivider />
        <SettingsRow
          label="Test Notification"
          labelTone="accent"
          labelStyle={{ fontWeight: '600' }}
          onPress={handleTestNotification}
        />
        <View style={{ paddingHorizontal: 14, paddingBottom: 10 }}>
          <Text style={noteStyle} selectable>
            If Focus Modes are enabled, notifications might not appear.
          </Text>
        </View>
      </SettingsSection>
    </>
  );
}
