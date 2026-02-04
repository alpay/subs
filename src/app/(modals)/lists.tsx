import { Button, Input, Label, TextField, useToast } from 'heroui-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { GlassCard, GlassCardBody } from '@/components/glass-card';
import { ModalHeader } from '@/components/modal-header';
import { ScreenShell } from '@/components/screen-shell';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useListsStore } from '@/lib/stores';

export default function ListsScreen() {
  useBootstrap();
  const { toast } = useToast();
  const { colors } = useTheme();
  const { lists, add, remove } = useListsStore();
  const [name, setName] = useState('');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    add(trimmed);
    setName('');
    toast.show(`${trimmed} added`);
  };

  return (
    <>
      <ModalHeader title="Lists" />
      <ScreenShell>
        <GlassCard>
          <GlassCardBody style={{ gap: 12 }}>
            <TextField>
              <Label>Name</Label>
              <Input placeholder="List name" value={name} onChangeText={setName} />
            </TextField>
            <Button variant="primary" onPress={handleAdd}>
              Add list
            </Button>
          </GlassCardBody>
        </GlassCard>

        <GlassCard>
          <GlassCardBody style={{ gap: 10 }}>
            {lists.map(list => (
              <View
                key={list.id}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '600', color: colors.text }} selectable>
                  {list.name}
                </Text>
                <Button size="sm" variant="secondary" onPress={() => remove(list.id)}>
                  Remove
                </Button>
              </View>
            ))}
          </GlassCardBody>
        </GlassCard>
      </ScreenShell>
    </>
  );
}
