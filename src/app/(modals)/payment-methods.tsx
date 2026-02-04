import { Button, Input, Label, TextField, useToast } from 'heroui-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { GlassCard, GlassCardBody } from '@/components/glass-card';
import { ModalHeader } from '@/components/modal-header';
import { ScreenShell } from '@/components/screen-shell';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { usePaymentMethodsStore } from '@/lib/stores';

export default function PaymentMethodsScreen() {
  useBootstrap();
  const { toast } = useToast();
  const { colors } = useTheme();
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
    <>
      <ModalHeader title="Payment Methods" />
      <ScreenShell>
        <GlassCard>
          <GlassCardBody style={{ gap: 10 }}>
            {methods.length === 0 && (
              <Text style={{ color: colors.textMuted }} selectable>
                No payment methods yet.
              </Text>
            )}
            {methods.map(method => (
              <View
                key={method.id}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '600', color: colors.text }} selectable>
                  {method.name}
                </Text>
                <Button size="sm" variant="secondary" onPress={() => remove(method.id)}>
                  Remove
                </Button>
              </View>
            ))}
          </GlassCardBody>
        </GlassCard>

        <GlassCard>
          <GlassCardBody style={{ gap: 10 }}>
            <TextField>
              <Label>New payment method</Label>
              <Input placeholder="Credit card" value={name} onChangeText={setName} />
            </TextField>
            <Button variant="primary" onPress={handleAdd}>
              Add method
            </Button>
            <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
              We care about your security, so please do not store full card numbers or account details.
            </Text>
          </GlassCardBody>
        </GlassCard>
      </ScreenShell>
    </>
  );
}
