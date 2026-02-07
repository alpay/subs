import { Card, Button, Label, TextField, useToast } from 'heroui-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { ModalSheet } from '@/components/modal-sheet';
import { SheetInput } from '@/components/sheet-input';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCategoriesStore } from '@/lib/stores';

export default function CategoriesScreen() {
  const { toast } = useToast();
  const { colors } = useTheme();
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
    <ModalSheet title="Categories">
      <Card>
        <Card.Body style={{ gap: 12 }}>
          <TextField>
            <Label>Name</Label>
            <SheetInput placeholder="Category name" value={name} onChangeText={setName} />
          </TextField>
          <TextField>
            <Label>Color</Label>
            <SheetInput placeholder="#4F46E5" value={color} onChangeText={setColor} />
          </TextField>
          <Button variant="primary" onPress={handleAdd}>
            Add category
          </Button>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body style={{ gap: 10 }}>
          {categories.map(category => (
            <View
              key={category.id}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 12, height: 12, borderRadius: 99, backgroundColor: category.color }} />
                <Text style={{ fontWeight: '600', color: colors.text }} selectable>
                  {category.name}
                </Text>
              </View>
              <Button variant="secondary" size="sm" onPress={() => remove(category.id)}>
                Remove
              </Button>
            </View>
          ))}
        </Card.Body>
      </Card>
    </ModalSheet>
  );
}
