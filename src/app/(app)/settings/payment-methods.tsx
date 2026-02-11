import type { PaymentMethod } from '@/lib/db/schema';

import { Image } from 'expo-image';
import { useToast } from 'heroui-native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { NativeSheet } from '@/components/native-sheet';
import { SheetInput } from '@/components/sheet-input';
import { useTheme } from '@/lib/hooks/use-theme';
import { usePaymentMethodsStore } from '@/lib/stores';

const ICON_SIZE = 20;
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

function PaymentMethodRow({
  method,
  isLast,
  onRename,
  onDelete,
}: {
  method: PaymentMethod;
  isLast: boolean;
  onRename: () => void;
  onDelete: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.surfaceBorder,
      }}
    >
      <Text
        style={{ fontSize: 16, fontWeight: '500', color: colors.text, flex: 1 }}
        selectable
        numberOfLines={1}
      >
        {method.name}
      </Text>
      <Pressable
        onPress={onRename}
        hitSlop={HIT_SLOP}
        style={({ pressed }) => [{ marginLeft: 12, opacity: pressed ? 0.6 : 1 }]}
      >
        <Image
          source="sf:pencil"
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
          tintColor={colors.textMuted}
        />
      </Pressable>
      <Pressable
        onPress={onDelete}
        hitSlop={HIT_SLOP}
        style={({ pressed }) => [{ marginLeft: 16, opacity: pressed ? 0.6 : 1 }]}
      >
        <Image
          source="sf:trash"
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
          tintColor={colors.danger}
        />
      </Pressable>
    </View>
  );
}

export default function PaymentMethodsScreen() {
  const { toast } = useToast();
  const { colors } = useTheme();
  const { methods, add, remove, update } = usePaymentMethodsStore();

  const [newName, setNewName] = useState('');

  const openRename = useCallback(
    (method: PaymentMethod) => {
      Alert.prompt(
        'Rename Payment Method',
        undefined,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: (value: string | undefined) => {
              const trimmed = value?.trim();
              if (trimmed)
                update({ ...method, name: trimmed });
            },
          },
        ],
        'plain-text',
        method.name,
        'default',
      );
    },
    [update],
  );

  const handleAdd = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed)
      return;
    add(trimmed);
    setNewName('');
    toast.show(`Payment method "${trimmed}" added`);
  }, [add, newName, toast]);

  const handleDelete = useCallback(
    (method: PaymentMethod) => {
      Alert.alert(
        'Delete Payment Method',
        `Are you sure you want to delete "${method.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => remove(method.id) },
        ],
      );
    },
    [remove],
  );

  return (
    <NativeSheet title="Payment Methods" showCloseIcon={false} showBackIcon>
      <View style={{ gap: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: colors.card,
            borderRadius: 12,
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: colors.surfaceBorder,
          }}
        >
          <SheetInput
            placeholder="New Payment Method"
            value={newName}
            onChangeText={setNewName}
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              borderWidth: 0,
              paddingHorizontal: 0,
              paddingVertical: 0,
              minHeight: 0,
              fontSize: 16,
              fontWeight: '500',
              color: colors.text,
            }}
          />
          <Pressable onPress={handleAdd} style={({ pressed }) => [pressed && { opacity: 0.8 }]}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.accent }} selectable>
              Add
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            backgroundColor: colors.surfaceMuted,
            borderRadius: 12,
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: colors.surfaceBorder,
            overflow: 'hidden',
          }}
        >
          {methods.length === 0 && (
            <View style={{ paddingVertical: 16, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 15, color: colors.textMuted }} selectable>
                No payment methods yet.
              </Text>
            </View>
          )}
          {methods.map((method, index) => (
            <PaymentMethodRow
              key={method.id}
              method={method}
              isLast={index === methods.length - 1}
              onRename={() => openRename(method)}
              onDelete={() => handleDelete(method)}
            />
          ))}
        </View>

        <Text
          style={{
            fontSize: 13,
            color: colors.textMuted,
            lineHeight: 18,
            paddingHorizontal: 4,
          }}
          selectable
        >
          We care about your security, so please do not store full card numbers or account details.
        </Text>
      </View>
    </NativeSheet>
  );
}
