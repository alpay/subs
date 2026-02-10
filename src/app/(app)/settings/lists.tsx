import { useToast } from 'heroui-native';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { NativeSheet } from '@/components/native-sheet';
import { SheetInput } from '@/components/sheet-input';
import { useTheme } from '@/lib/hooks/use-theme';
import { useListsStore } from '@/lib/stores';

export default function ListsScreen() {
  const { toast } = useToast();
  const { colors } = useTheme();
  const { lists, add, remove } = useListsStore();
  const [name, setName] = useState('');

  const handleAdd = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    add(trimmed);
    setName('');
    toast.show(`${trimmed} added`);
  }, [add, name, toast]);

  return (
    <NativeSheet
      title="Lists"
      showCloseIcon={false}
      showBackIcon
    >
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
            placeholder="New List"
            value={name}
            onChangeText={setName}
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
          {lists.length === 0 && (
            <View style={{ paddingVertical: 16, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 15, color: colors.textMuted }} selectable>
                No lists yet.
              </Text>
            </View>
          )}
          {lists.map((list, index) => (
            <View
              key={list.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: index === lists.length - 1 ? 0 : 1,
                borderBottomColor: colors.surfaceBorder,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, flex: 1 }} selectable numberOfLines={1}>
                {list.name}
              </Text>
              <Pressable
                onPress={() => remove(list.id)}
                style={({ pressed }) => [pressed && { opacity: 0.85 }]}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.danger }} selectable>
                  Remove
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </NativeSheet>
  );
}
