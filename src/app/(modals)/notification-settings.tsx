import { useRouter } from 'expo-router';
import { Button, Card, Checkbox, Input, Label, TextField, useToast } from 'heroui-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useSettingsStore } from '@/lib/stores';

export default function NotificationSettingsScreen() {
  useBootstrap();
  const router = useRouter();
  const { toast } = useToast();
  const { top, bottom } = useSafeAreaInsets();
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
    <View style={{ flex: 1, paddingTop: top }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottom + 40, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>Notifications</Text>
          <Button variant="secondary" onPress={() => router.back()}>
            Close
          </Button>
        </View>

        <Card>
          <Card.Header>
            <Card.Title>First Reminder</Card.Title>
            <Card.Description>This one is always enabled.</Card.Description>
          </Card.Header>
          <Card.Body style={{ gap: 8 }}>
            <TextField>
              <Label>Days before</Label>
              <Input keyboardType="number-pad" value={firstDays} onChangeText={setFirstDays} />
            </TextField>
            <TextField>
              <Label>Time</Label>
              <Input placeholder="09:00" value={firstTime} onChangeText={setFirstTime} />
            </TextField>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Second Reminder</Card.Title>
            <Card.Description>Optional backup reminder.</Card.Description>
          </Card.Header>
          <Card.Body style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Checkbox
                isSelected={hasSecondReminder}
                onSelectedChange={setHasSecondReminder}
              />
              <Text>Enable second reminder</Text>
            </View>

            {hasSecondReminder && (
              <>
                <TextField>
                  <Label>Days before</Label>
                  <Input keyboardType="number-pad" value={secondDays} onChangeText={setSecondDays} />
                </TextField>
                <TextField>
                  <Label>Time</Label>
                  <Input placeholder="09:00" value={secondTime} onChangeText={setSecondTime} />
                </TextField>
              </>
            )}
          </Card.Body>
        </Card>

        <Button variant="primary" onPress={handleSave}>
          Save defaults
        </Button>
      </ScrollView>
    </View>
  );
}
