import { useRouter } from 'expo-router';
import { Button, Checkbox, Label, TextField, useToast } from 'heroui-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { GlassCard, GlassCardBody } from '@/components/glass-card';
import { ModalSheet } from '@/components/modal-sheet';
import { SheetInput } from '@/components/sheet-input';
import { useTheme } from '@/lib/hooks/use-theme';
import { useSettingsStore } from '@/lib/stores';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const { colors } = useTheme();
  const { settings, update } = useSettingsStore();

  const [firstDays, setFirstDays] = useState(String(settings.notificationDefaults.first.daysBefore));
  const [firstTime, setFirstTime] = useState(settings.notificationDefaults.first.time);
  const [hasSecondReminder, setHasSecondReminder] = useState(Boolean(settings.notificationDefaults.second));
  const [secondDays, setSecondDays] = useState(String(settings.notificationDefaults.second?.daysBefore ?? 0));
  const [secondTime, setSecondTime] = useState(settings.notificationDefaults.second?.time ?? '09:00');

  const handleSave = () => {
    update({
      notificationDefaults: {
        first: {
          daysBefore: Number(firstDays) || 0,
          time: firstTime || '09:00',
        },
        second: hasSecondReminder
          ? {
              daysBefore: Number(secondDays) || 0,
              time: secondTime || '09:00',
            }
          : null,
      },
    });

    toast.show('Notification defaults updated');
    router.back();
  };

  return (
    <ModalSheet title="Notifications">
      <GlassCard>
        <GlassCardBody style={{ gap: 12 }}>
          <Text style={{ fontSize: 13, color: colors.textMuted }} selectable>
            First Reminder
          </Text>
          <TextField>
            <Label>Days before</Label>
            <SheetInput keyboardType="number-pad" value={firstDays} onChangeText={setFirstDays} />
          </TextField>
          <TextField>
            <Label>Time</Label>
            <SheetInput placeholder="09:00" value={firstTime} onChangeText={setFirstTime} />
          </TextField>
        </GlassCardBody>
      </GlassCard>

      <GlassCard>
        <GlassCardBody style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Checkbox
              isSelected={hasSecondReminder}
              onSelectedChange={setHasSecondReminder}
            />
            <Text style={{ color: colors.text }} selectable>
              Enable second reminder
            </Text>
          </View>

          {hasSecondReminder && (
            <>
              <TextField>
                <Label>Days before</Label>
                <SheetInput keyboardType="number-pad" value={secondDays} onChangeText={setSecondDays} />
              </TextField>
              <TextField>
                <Label>Time</Label>
                <SheetInput placeholder="09:00" value={secondTime} onChangeText={setSecondTime} />
              </TextField>
            </>
          )}
        </GlassCardBody>
      </GlassCard>

      <Button variant="primary" onPress={handleSave}>
        Save defaults
      </Button>
    </ModalSheet>
  );
}
