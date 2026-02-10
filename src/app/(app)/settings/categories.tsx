import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { Category } from '@/lib/db/schema';

import { Button, Input } from 'heroui-native';
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
import { NativeSheet } from '@/components/native-sheet';
import { SelectColorContent } from '@/components/select-color-sheet';
import { SheetInput } from '@/components/sheet-input';
import { OTHER_CATEGORY_NAME } from '@/lib/data/seed-defaults';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCategoriesStore } from '@/lib/stores';

const DEFAULT_NEW_COLOR = '#EF4444';
const DELETE_BUTTON_WIDTH = 80;

function CategoryRow({
  category,
  isLast,
  onRename,
  onColorPress,
  onDelete,
  canDelete,
}: {
  category: Category;
  isLast: boolean;
  onRename: () => void;
  onColorPress: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const { colors } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);
  const ignoreNextRenameRef = useRef(false);

  const handleRowPress = useCallback(() => {
    if (ignoreNextRenameRef.current) {
      ignoreNextRenameRef.current = false;
      return;
    }
    onRename();
  }, [onRename]);

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
        ignoreNextRenameRef.current = true;
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

  if (!canDelete) {
    return (
      <Pressable onPress={onRename} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
        <View style={rowContentStyle}>
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
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={60}
      renderRightActions={renderRightActions}
    >
      <Pressable onPress={handleRowPress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
        <View style={rowContentStyle}>
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
      <NativeSheet
        title="Categories"
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
        </View>
      </NativeSheet>

      <AppDialog
        isOpen={!!renameCategory}
        onOpenChange={(open) => !open && handleRenameCancel()}
        title="Rename Category"
      >
        <Input
          value={renameValue}
          onChangeText={setRenameValue}
          placeholder="Category name"
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

      <ModalSheet
        title="Select Color"
        closeButtonTitle="Close"
        isVisible={colorSheetTarget !== null}
        onClose={() => setColorSheetTarget(null)}
        enableDynamicSizing
        bottomScrollSpacer={24}
      >
        <SelectColorContent
          selectedColor={selectedColorForSheet}
          onSelect={handleColorSelect}
        />
      </ModalSheet>
    </>
  );
}
