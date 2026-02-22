import type { ReminderConfig } from '@/lib/db/schema';
import { SwiftUI } from '@mgcrea/react-native-swiftui';
import { useToast } from 'heroui-native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Haptic } from '@/lib/haptics';
import { requestPermissions, scheduleTestNotification } from '@/lib/notifications';
import { useSettingsStore } from '@/lib/stores';

const REMINDER_DAY_VALUES = ['-1', '0', '1', '2', '3', '4', '5', '10', '15', '30'] as const;

function timeStringToDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(hours ?? 9, minutes ?? 0, 0, 0);
  return d;
}

function dateToTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function SettingsNotificationSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { settings, update } = useSettingsStore();

  const reminderDaysOptions = useMemo(
    () =>
      REMINDER_DAY_VALUES.map(value => ({
        value,
        label:
          value === '-1'
            ? t('common.never')
            : value === '0'
              ? t('notifications.same_day')
              : t(`notifications.days.${value}`),
      })),
    [t],
  );

  const firstReminderValue = useMemo(
    () =>
      String(
        reminderDaysOptions.find(
          o => Number(o.value) === settings.notificationDefaults.first.daysBefore,
        )?.value ?? reminderDaysOptions[0]?.value ?? '-1',
      ),
    [settings.notificationDefaults.first.daysBefore, reminderDaysOptions],
  );
  const secondReminderValue = useMemo(
    () =>
      settings.notificationDefaults.second === null
        ? (reminderDaysOptions[0]?.value ?? '-1')
        : String(
            reminderDaysOptions.find(
              o =>
                Number(o.value) === settings.notificationDefaults.second!.daysBefore,
            )?.value ?? reminderDaysOptions[0]?.value ?? '-1',
          ),
    [settings.notificationDefaults.second, reminderDaysOptions],
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
    (value: string) => {
      const days = Number(value);
      updateFirstReminder(days);
    },
    [updateFirstReminder],
  );
  const handleSecondDaysChange = useCallback(
    (value: string) => {
      if (value === '-1') {
        updateSecondReminder(null);
        return;
      }
      const days = Number(value);
      const prevTime = settings.notificationDefaults.second?.time ?? '09:00';
      updateSecondReminder({ daysBefore: days, time: prevTime });
    },
    [settings.notificationDefaults.second, updateSecondReminder],
  );

  const handleFirstTimeChange = useCallback(
    (date: Date) => {
      updateFirstReminder(
        settings.notificationDefaults.first.daysBefore,
        dateToTimeString(date),
      );
    },
    [settings.notificationDefaults.first.daysBefore, updateFirstReminder],
  );
  const handleSecondTimeChange = useCallback(
    (date: Date) => {
      const prev = settings.notificationDefaults.second;
      if (!prev)
        return;
      updateSecondReminder({ ...prev, time: dateToTimeString(date) });
    },
    [settings.notificationDefaults.second, updateSecondReminder],
  );

  const handleTestNotification = useCallback(async () => {
    Haptic.Light();
    try {
      const granted = await requestPermissions();
      if (!granted) {
        toast.show(t('notifications.enable_in_settings'));
        return;
      }
      await scheduleTestNotification();
      toast.show(t('notifications.test_scheduled'));
    }
    catch {
      toast.show(t('notifications.unable_to_schedule'));
    }
  }, [toast, t]);

  const firstTime = settings.notificationDefaults.first.time;
  const secondTime = settings.notificationDefaults.second?.time ?? '09:00';

  return (
    <View style={{ marginBottom: 20 }}>
      <SwiftUI style={{ flex: 1, minHeight: 250 }}>
        <SwiftUI.Form scrollDisabled contentMargins={{ leading: 1, trailing: 1 }}>
          <SwiftUI.Section
            header={t('notifications.section_header')}
            footer={t('notifications.section_footer')}
          >
            <SwiftUI.HStack spacing={8}>
              <SwiftUI.Picker
                label={t('notifications.first_reminder')}
                value={firstReminderValue}
                options={reminderDaysOptions}
                pickerStyle="menu"
                onChange={handleFirstDaysChange}
              />
              {!firstIsNever && (
                <SwiftUI.DatePicker
                  selection={timeStringToDate(firstTime)}
                  displayedComponents="time"
                  datePickerStyle="compact"
                  onChange={handleFirstTimeChange}
                />
              )}
            </SwiftUI.HStack>
            <SwiftUI.HStack spacing={8}>
              <SwiftUI.Picker
                label={t('notifications.second_reminder')}
                value={secondReminderValue}
                options={reminderDaysOptions}
                pickerStyle="menu"
                onChange={handleSecondDaysChange}
              />
              {!secondIsNever && settings.notificationDefaults.second && (
                <SwiftUI.DatePicker
                  selection={timeStringToDate(secondTime)}
                  displayedComponents="time"
                  datePickerStyle="compact"
                  onChange={handleSecondTimeChange}
                />
              )}
            </SwiftUI.HStack>
            <SwiftUI.Button
              title={t('notifications.test_notification')}
              onPress={handleTestNotification}
            />
          </SwiftUI.Section>
        </SwiftUI.Form>
      </SwiftUI>
    </View>
  );
}
