import type { Category } from '@/lib/db/schema';

import { ColorPicker, Host } from '@expo/ui/swift-ui';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';

import { Alert, Pressable, Text, View } from 'react-native';
import { NativeSheet } from '@/components/native-sheet';
import { SheetInput } from '@/components/sheet-input';
import { OTHER_CATEGORY_NAME } from '@/lib/data/seed-defaults';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCategoriesStore } from '@/lib/stores';

const DEFAULT_NEW_COLOR = '#EF4444';
const ICON_SIZE = 20;
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

function CategoryRow({
  category,
  isLast,
  onRename,
  onColorChange,
  onDelete,
  canDelete,
  canRename,
}: {
  category: Category;
  isLast: boolean;
  onRename: () => void;
  onColorChange: (color: string) => void;
  onDelete: () => void;
  canDelete: boolean;
  canRename: boolean;
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
        {category.name}
      </Text>
      <Host matchContents style={{ marginLeft: 12 }}>
        <ColorPicker
          selection={category.color}
          supportsOpacity={false}
          onValueChanged={onColorChange}
        />
      </Host>
      {canRename && (
        <Pressable
          onPress={onRename}
          hitSlop={HIT_SLOP}
          style={({ pressed }) => [{ marginLeft: 16, opacity: pressed ? 0.6 : 1 }]}
        >
          <Image
            source="sf:pencil"
            style={{ width: ICON_SIZE, height: ICON_SIZE }}
            tintColor={colors.textMuted}
          />
        </Pressable>
      )}
      {canDelete && (
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
      )}
    </View>
  );
}

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const { categories, add, remove, update } = useCategoriesStore();

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_NEW_COLOR);

  const handleAdd = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed)
      return;
    add(trimmed, newColor);
    setNewName('');
    setNewColor(DEFAULT_NEW_COLOR);
  }, [add, newName, newColor]);

  const openRename = useCallback(
    (category: Category) => {
      Alert.prompt(
        'Rename Category',
        undefined,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: (value: string | undefined) => {
              const trimmed = value?.trim();
              if (trimmed)
                update({ ...category, name: trimmed });
            },
          },
        ],
        'plain-text',
        category.name,
        'default',
      );
    },
    [update],
  );

  const handleDelete = useCallback(
    (category: Category) => {
      Alert.alert(
        'Delete Category',
        `Are you sure you want to delete "${category.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => remove(category.id) },
        ],
      );
    },
    [remove],
  );

  return (
    <>
      <NativeSheet title="Categories" showCloseIcon={false} showBackIcon>
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
            <Host matchContents>
              <ColorPicker
                selection={newColor}
                supportsOpacity={false}
                onValueChanged={setNewColor}
              />
            </Host>
            <SheetInput
              placeholder="New Category"
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
            {categories.map((category, index) => (
              <CategoryRow
                key={category.id}
                category={category}
                isLast={index === categories.length - 1}
                onRename={() => openRename(category)}
                onColorChange={(color: string) => {
                  update({ ...category, color });
                }}
                onDelete={() => handleDelete(category)}
                canDelete={category.name !== OTHER_CATEGORY_NAME}
                canRename={category.name !== OTHER_CATEGORY_NAME}
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
            The &apos;Other&apos; category cannot be deleted as it automatically serves as a default for subscriptions
            without a specific category.
          </Text>
        </View>
      </NativeSheet>
    </>
  );
}
