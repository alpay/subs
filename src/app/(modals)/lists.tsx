import { useRouter } from 'expo-router';
import { Button, Card, Input, Label, TextField, useToast } from 'heroui-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useListsStore } from '@/lib/stores';

export default function ListsScreen() {
  useBootstrap();
  const router = useRouter();
  const { toast } = useToast();
  const { top, bottom } = useSafeAreaInsets();
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
    <View style={{ flex: 1, paddingTop: top }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottom + 40, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>Lists</Text>
          <Button variant="secondary" onPress={() => router.back()}>
            Close
          </Button>
        </View>

        <Card>
          <Card.Body style={{ gap: 8 }}>
            <TextField>
              <Label>Name</Label>
              <Input placeholder="List name" value={name} onChangeText={setName} />
            </TextField>
            <Button variant="primary" onPress={handleAdd}>
              Add list
            </Button>
          </Card.Body>
        </Card>

        {lists.map(list => (
          <Card key={list.id}>
            <Card.Body>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '600' }}>{list.name}</Text>
                <Button size="sm" variant="danger" onPress={() => remove(list.id)}>
                  Remove
                </Button>
              </View>
            </Card.Body>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
