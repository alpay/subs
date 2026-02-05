import { Card, Button, Label, TextField, useToast } from 'heroui-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { ModalSheet } from '@/components/modal-sheet';
import { SheetInput } from '@/components/sheet-input';
import { useTheme } from '@/lib/hooks/use-theme';
import { useListsStore } from '@/lib/stores';

export default function ListsScreen() {
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
    <ModalSheet title="Lists">
      <Card>
        <Card.Body style={{ gap: 12 }}>
          <TextField>
            <Label>Name</Label>
            <SheetInput placeholder="List name" value={name} onChangeText={setName} />
          </TextField>
          <Button variant="primary" onPress={handleAdd}>
            Add list
          </Button>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body style={{ gap: 10 }}>
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
        </Card.Body>
      </Card>
    </ModalSheet>
  );
}
