import type { Category } from '@/lib/db/schema';

import type { ReactNode } from 'react';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated as RNAnimated,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';

import { ModalSheet } from '@/components/modal-sheet';
import { SelectColorSheet } from '@/components/select-color-sheet';
import { SheetInput } from '@/components/sheet-input';
import { useTheme } from '@/lib/hooks/use-theme';
import { OTHER_CATEGORY_NAME } from '@/lib/data/seed-defaults';
import { useCategoriesStore } from '@/lib/stores';

const DEFAULT_NEW_COLOR = '#EF4444';
const DELETE_BUTTON_WIDTH = 80;

function RenameCategoryModal({
  category,
  value,
  onChangeText,
  onSave,
  onCancel,
}: {
  category: Category | null;
  value: string;
  onChangeText: (text: string) => void;
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const { colors, isDark } = useTheme();

  if (!category) {
    return null;
  }

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onSave(trimmed);
    }
  };

  return (
    <Modal visible transparent animationType="fade">
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
        onPress={onCancel}
      >
        <Pressable
          style={{
            width: '100%',
            maxWidth: 320,
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: colors.surfaceBorder,
            padding: 20,
            gap: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.5 : 0.15,
            shadowRadius: 24,
            elevation: 8,
          }}
          onPress={e => e.stopPropagation()}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 4,
            }}
            selectable
          >
            Rename Category
          </Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Category name"
            placeholderTextColor={colors.textMuted}
            style={{
              backgroundColor: colors.surfaceMuted,
              borderWidth: 1,
              borderColor: colors.surfaceBorder,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 16,
              color: colors.text,
            }}
            autoFocus
            autoCapitalize="words"
          />
          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end' }}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                {
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 10,
                  backgroundColor: colors.surfaceMuted,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }} selectable>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                {
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 10,
                  backgroundColor: colors.accent,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.iconOnColor }} selectable>
                Save
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CategoryRow({
  category,
  onRename,
  onColorPress,
  onDelete,
  canDelete,
}: {
  category: Category;
  onRename: () => void;
  onColorPress: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const { colors } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (progress: any, _dragX: any, swipeable: Swipeable): ReactNode => {
      const trans = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [DELETE_BUTTON_WIDTH, 0],
      });
      const handleDelete = () => {
        swipeable.close();
        onDelete();
      };
      return (
        <RNAnimated.View
          style={[
            {
              width: DELETE_BUTTON_WIDTH,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.danger,
            },
            { transform: [{ translateX: trans }] },
          ]}
        >
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

  if (!canDelete) {
    return (
      <View style={{ marginBottom: 8 }}>
        <Pressable
          onPress={onRename}
          style={({ pressed }) => [pressed && { opacity: 0.85 }]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 14,
              backgroundColor: colors.card,
              borderRadius: 12,
              borderCurve: 'continuous',
              borderWidth: 1,
              borderColor: colors.surfaceBorder,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, flex: 1 }} selectable numberOfLines={1}>
              {category.name}
            </Text>
            <Pressable onPress={onColorPress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: category.color,
                }}
              />
            </Pressable>
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 8 }}>
      <Swipeable
        ref={swipeableRef}
        friction={2}
        rightThreshold={60}
        renderRightActions={renderRightActions}
      >
        <Pressable onPress={onRename} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 14,
              backgroundColor: colors.card,
              borderRadius: 12,
              borderCurve: 'continuous',
              borderWidth: 1,
              borderColor: colors.surfaceBorder,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, flex: 1 }} selectable numberOfLines={1}>
              {category.name}
            </Text>
            <Pressable onPress={onColorPress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: category.color,
                }}
              />
            </Pressable>
          </View>
        </Pressable>
      </Swipeable>
    </View>
  );
}

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const { categories, add, remove, update } = useCategoriesStore();

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_NEW_COLOR);
  const [renameCategory, setRenameCategory] = useState<Category | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [colorSheetTarget, setColorSheetTarget] = useState<'new' | string | null>(null);
  const colorSheetRef = useRef<BottomSheetModal>(null);

  const selectedColorForSheet =
    colorSheetTarget === 'new'
      ? newColor
      : colorSheetTarget
        ? categories.find(c => c.id === colorSheetTarget)?.color ?? DEFAULT_NEW_COLOR
      : DEFAULT_NEW_COLOR;

  const handleAdd = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    add(trimmed, newColor);
    setNewName('');
    setNewColor(DEFAULT_NEW_COLOR);
  }, [add, newName, newColor]);

  const handleRenameSave = useCallback(
    (name: string) => {
      if (renameCategory) {
        update({ ...renameCategory, name });
        setRenameCategory(null);
        setRenameValue('');
      }
    },
    [renameCategory, update],
  );

  const handleRenameCancel = useCallback(() => {
    setRenameCategory(null);
    setRenameValue('');
  }, []);

  const openRename = useCallback((category: Category) => {
    setRenameCategory(category);
    setRenameValue(category.name);
  }, []);

  const handleColorSelect = useCallback(
    (color: string) => {
      if (colorSheetTarget === 'new') {
        setNewColor(color);
      } else if (colorSheetTarget) {
        const cat = categories.find(c => c.id === colorSheetTarget);
        if (cat) update({ ...cat, color });
      }
      setColorSheetTarget(null);
    },
    [colorSheetTarget, categories, update],
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
      <ModalSheet title="Categories" closeVariant="muted">
        <View style={{ gap: 16 }}>
          <View style={{ gap: 8 }}>
            {categories.map(category => (
              <CategoryRow
                key={category.id}
                category={category}
                onRename={() => openRename(category)}
                onColorPress={() => setColorSheetTarget(category.id)}
                onDelete={() => handleDelete(category)}
                canDelete={category.name !== OTHER_CATEGORY_NAME}
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
            <Pressable
              onPress={() => setColorSheetTarget('new')}
              style={({ pressed }) => [
                {
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: newColor,
                },
                pressed && { opacity: 0.85 },
              ]}
            />
            <SheetInput
              placeholder="New Category"
              value={newName}
              onChangeText={setNewName}
              style={{ flex: 1, fontSize: 16 }}
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
        </View>
      </ModalSheet>

      {renameCategory && (
        <RenameCategoryModal
          category={renameCategory}
          value={renameValue}
          onChangeText={setRenameValue}
          onSave={handleRenameSave}
          onCancel={handleRenameCancel}
        />
      )}

      <SelectColorSheet
        sheetRef={colorSheetRef}
        selectedColor={selectedColorForSheet}
        onSelect={handleColorSelect}
        onClose={() => setColorSheetTarget(null)}
        isVisible={colorSheetTarget !== null}
      />
    </>
  );
}
