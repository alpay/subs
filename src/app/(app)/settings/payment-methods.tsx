import type { PaymentMethod } from '@/lib/db/schema';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { Button, Input, useToast } from 'heroui-native';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  Animated as RNAnimated,
  Text,
  View,
} from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';

import { AppDialog } from '@/components/app-dialog';
import { ModalSheet } from '@/components/modal-sheet';
import { SheetInput } from '@/components/sheet-input';
import { useTheme } from '@/lib/hooks/use-theme';
import { usePaymentMethodsStore } from '@/lib/stores';

const DELETE_BUTTON_WIDTH = 80;

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
  const swipeableRef = useRef<Swipeable>(null);

  const rowContentStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent' as const,
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: colors.surfaceBorder,
  };

  const renderRightActions = useCallback(
    (
      progress: { interpolate: (config: { inputRange: number[]; outputRange: number[] }) => unknown },
      _dragX: unknown,
      swipeable: Swipeable,
    ): ReactNode => {
      const trans = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [DELETE_BUTTON_WIDTH, 0],
      });
      const handleDelete = () => {
        swipeable.close();
        onDelete();
      };
      const animatedStyle: StyleProp<ViewStyle> = [
        {
          width: DELETE_BUTTON_WIDTH,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.danger,
        },
        { transform: [{ translateX: trans as number }] },
      ];
      return (
        <RNAnimated.View style={animatedStyle}>
          <RectButton
            onPress={handleDelete}
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.iconOnColor, fontWeight: '600', fontSize: 14 }} selectable>
              Delete
            </Text>
          </RectButton>
        </RNAnimated.View>
      );
    },
    [colors.danger, colors.iconOnColor, onDelete],
  );

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={60}
      renderRightActions={renderRightActions}
    >
      <Pressable onPress={onRename} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
        <View style={rowContentStyle}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, flex: 1 }} selectable numberOfLines={1}>
            {method.name}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

export default function PaymentMethodsScreen() {
  const { toast } = useToast();
  const { colors } = useTheme();
  const { methods, add, remove, update } = usePaymentMethodsStore();

  const [newName, setNewName] = useState('');
  const [renameMethod, setRenameMethod] = useState<PaymentMethod | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleAdd = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    add(trimmed);
    setNewName('');
    toast.show(`${trimmed} added`);
  }, [add, newName, toast]);

  const handleRenameSave = useCallback(
    (name: string) => {
      if (renameMethod) {
        update({ ...renameMethod, name });
        setRenameMethod(null);
        setRenameValue('');
      }
    },
    [renameMethod, update],
  );

  const handleRenameCancel = useCallback(() => {
    setRenameMethod(null);
    setRenameValue('');
  }, []);

  const openRename = useCallback((method: PaymentMethod) => {
    setRenameMethod(method);
    setRenameValue(method.name);
  }, []);

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
    <>
      <ModalSheet title="Payment Methods" closeVariant="muted">
        <View style={{ gap: 16 }}>
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
            <Pressable
              onPress={handleAdd}
              style={({ pressed }) => [pressed && { opacity: 0.8 }]}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.accent }} selectable>
                Add
              </Text>
            </Pressable>
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
      </ModalSheet>

      <AppDialog
        isOpen={!!renameMethod}
        onOpenChange={(open) => !open && handleRenameCancel()}
        title="Rename Payment Method"
      >
        <Input
          value={renameValue}
          onChangeText={setRenameValue}
          placeholder="Payment method name"
          autoFocus
          autoCapitalize="words"
        />
        <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onPress={handleRenameCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={() => {
              const trimmed = renameValue.trim();
              if (trimmed) handleRenameSave(trimmed);
            }}
          >
            Save
          </Button>
        </View>
      </AppDialog>
    </>
  );
}
