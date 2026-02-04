import { useRouter } from 'expo-router';
import { Button, Card, Input, Label, TextField, useToast } from 'heroui-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useCategoriesStore } from '@/lib/stores';

export default function CategoriesScreen() {
  useBootstrap();
  const router = useRouter();
  const { toast } = useToast();
  const { top, bottom } = useSafeAreaInsets();
  const { categories, add, remove } = useCategoriesStore();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#4F46E5');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    add(trimmed, color || '#4F46E5');
    setName('');
    toast.show(`${trimmed} added`);
  };

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottom + 40, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>Categories</Text>
          <Button variant="secondary" onPress={() => router.back()}>
            Close
          </Button>
        </View>

        <Card>
          <Card.Body style={{ gap: 8 }}>
            <TextField>
              <Label>Name</Label>
              <Input placeholder="Category name" value={name} onChangeText={setName} />
            </TextField>
            <TextField>
              <Label>Color</Label>
              <Input placeholder="#4F46E5" value={color} onChangeText={setColor} />
            </TextField>
            <Button variant="primary" onPress={handleAdd}>
              Add category
            </Button>
          </Card.Body>
        </Card>

        {categories.map(category => (
          <Card key={category.id}>
            <Card.Body>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 99, backgroundColor: category.color }} />
                  <Text style={{ fontWeight: '600' }}>{category.name}</Text>
                </View>
                <Button variant="danger" size="sm" onPress={() => remove(category.id)}>
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
