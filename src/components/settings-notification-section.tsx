import type { ReminderConfig } from '@/lib/db/schema';
import { SwiftUI } from '@mgcrea/react-native-swiftui';
import { useToast } from 'heroui-native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';

import { requestPermissions, scheduleTestNotification } from '@/lib/notifications';
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
  const { toast } = useToast();
  const { settings, update } = useSettingsStore();

  const firstReminderValue = useMemo(
    () =>
      String(
        REMINDER_DAYS_OPTIONS.find(
          o => Number(o.value) === settings.notificationDefaults.first.daysBefore,
        )?.value ?? REMINDER_DAYS_OPTIONS[0].value,
      ),
    [settings.notificationDefaults.first.daysBefore],
  );
  const secondReminderValue = useMemo(
    () =>
      settings.notificationDefaults.second === null
        ? REMINDER_DAYS_OPTIONS[0].value
        : String(
            REMINDER_DAYS_OPTIONS.find(
              o =>
                Number(o.value) === settings.notificationDefaults.second!.daysBefore,
            )?.value ?? REMINDER_DAYS_OPTIONS[0].value,
          ),
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
    try {
      const granted = await requestPermissions();
      if (!granted) {
        toast.show('Enable notifications in Settings to test alerts.');
        return;
      }
      await scheduleTestNotification();
      toast.show('Test notification scheduled');
    }
    catch {
      toast.show('Unable to schedule a test notification');
    }
  }, [toast]);

  const firstTime = settings.notificationDefaults.first.time;
  const secondTime = settings.notificationDefaults.second?.time ?? '09:00';

  return (
    <View style={{ marginBottom: 20 }}>
      <SwiftUI style={{ flex: 1, minHeight: 250 }}>
        <SwiftUI.Form scrollDisabled contentMargins={{ leading: 1, trailing: 1 }}>
          <SwiftUI.Section
            header="Notifications"
            footer="If Focus Modes are enabled, notifications might not appear."
          >
            <SwiftUI.HStack spacing={8}>
              <SwiftUI.Picker
                label="First Reminder"
                value={firstReminderValue}
                options={REMINDER_DAYS_OPTIONS}
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
                label="Second Reminder"
                value={secondReminderValue}
                options={REMINDER_DAYS_OPTIONS}
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
              title="Test Notification"
              onPress={handleTestNotification}
            />
          </SwiftUI.Section>
        </SwiftUI.Form>
      </SwiftUI>
    </View>
  );
}
