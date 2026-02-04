import { useRouter } from 'expo-router';
import { Button, Card, Input, Label, TextField, useToast } from 'heroui-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { usePaymentMethodsStore } from '@/lib/stores';

export default function PaymentMethodsScreen() {
  useBootstrap();
  const router = useRouter();
  const { toast } = useToast();
  const { top, bottom } = useSafeAreaInsets();
  const { methods, add, remove } = usePaymentMethodsStore();
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
          <Text style={{ fontSize: 20, fontWeight: '700' }}>Payment Methods</Text>
          <Button variant="secondary" onPress={() => router.back()}>
            Close
          </Button>
        </View>

        <Card>
          <Card.Body style={{ gap: 8 }}>
            <TextField>
              <Label>Name</Label>
              <Input placeholder="Payment method" value={name} onChangeText={setName} />
            </TextField>
            <Button variant="primary" onPress={handleAdd}>
              Add method
            </Button>
            <Text style={{ fontSize: 12, opacity: 0.7 }}>
              For safety, avoid saving complete card numbers in method names.
            </Text>
          </Card.Body>
        </Card>

        {methods.map(method => (
          <Card key={method.id}>
            <Card.Body>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '600' }}>{method.name}</Text>
                <Button size="sm" variant="danger" onPress={() => remove(method.id)}>
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
