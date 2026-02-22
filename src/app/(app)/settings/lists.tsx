import type { List } from '@/lib/db/schema';

import { Image } from 'expo-image';
import { Input, useToast } from 'heroui-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, Text, View } from 'react-native';

import { NativeSheet } from '@/components/native-sheet';
import { Haptic } from '@/lib/haptics';
import { useTheme } from '@/lib/hooks/use-theme';
import { useListsStore } from '@/lib/stores';

const ICON_SIZE = 20;
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

export default function ListsScreen() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { colors } = useTheme();
  const { lists, add, update } = useListsStore();
  const [name, setName] = useState('');

  const handleAdd = useCallback(() => {
    Haptic.Light();
    const trimmed = name.trim();
    if (!trimmed)
      return;
    add(trimmed);
    setName('');
    toast.show(t('lists.added', { name: trimmed }));
  }, [add, name, toast, t]);

  const openRename = useCallback(
    (list: List) => {
      Alert.prompt(
        t('lists.rename_title'),
        undefined,
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.save'),
            onPress: (value: string | undefined) => {
              const trimmed = value?.trim();
              if (trimmed)
                update({ ...list, name: trimmed });
            },
          },
        ],
        'plain-text',
        list.name,
        'default',
      );
    },
    [update, t],
  );

  return (
    <NativeSheet title={t('lists.title')} showCloseIcon={false} showBackIcon>
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
          <Input
            placeholder={t('lists.new_placeholder')}
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
          <Pressable onPress={handleAdd} style={({ pressed }) => [pressed && { opacity: 0.8 }]}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.accent }} selectable>
              {t('common.add')}
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
                {t('lists.no_lists')}
              </Text>
            </View>
          )}
          {lists.map((list, index) => (
            <View
              key={list.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: index === lists.length - 1 ? 0 : 1,
                borderBottomColor: colors.surfaceBorder,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: '500', color: colors.text, flex: 1 }}
                selectable
                numberOfLines={1}
              >
                {list.name}
              </Text>
              <Pressable
                onPress={() => {
                  Haptic.Light();
                  openRename(list);
                }}
                hitSlop={HIT_SLOP}
                style={({ pressed }) => [{ marginLeft: 12, opacity: pressed ? 0.6 : 1 }]}
              >
                <Image
                  source="sf:pencil"
                  style={{ width: ICON_SIZE, height: ICON_SIZE }}
                  tintColor={colors.textMuted}
                />
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </NativeSheet>
  );
}
