/* eslint-disable react-refresh/only-export-components */

/**
 * Modal
 * Dependencies:
 * - @gorhom/bottom-sheet.
 *
 * Props:
 * - All `BottomSheetModalProps` props.
 * - `title` (string | undefined): Optional title for the modal header.
 * - `collapsibleTitle` (boolean): When true, title hides initially and appears when scrolled.
 *
 * Usage Example:
 * import { Modal, useModal, ModalScrollView, ModalLargeHeader } from '@/components/ui';
 *
 * // Standard Modal with static title
 * function DisplayModal() {
 *   const { ref, present, dismiss } = useModal();
 *   return (
 *     <Modal snapPoints={['60%']} title="Modal Title" ref={ref}>
 *       <ModalScrollView>Modal Content</ModalScrollView>
 *     </Modal>
 *   );
 * }
 *
 * // Modal with collapsible title (title appears when scrolled)
 * function CollapsibleModal() {
 *   const { ref, present, dismiss } = useModal();
 *   return (
 *     <Modal snapPoints={['60%']} title="Title" collapsibleTitle ref={ref}>
 *       <ModalScrollView>
 *         <ModalLargeHeader title="Title" subtitle="Optional subtitle" />
 *         Content...
 *       </ModalScrollView>
 *     </Modal>
 *   );
 * }
 */

import type {
  BottomSheetBackdropProps,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import type { ForwardedRef, ReactNode, RefObject } from 'react';
import type { ScrollViewProps } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { ChevronDown } from 'lucide-react-native';
import { createContext, memo, use, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { useTheme } from '@/lib/hooks/use-theme';
import { Text } from './text';

const HEADER_SCROLL_THRESHOLD = 60;

type ModalProps = Omit<BottomSheetModalProps, 'children'> & {
  title?: string;
  collapsibleTitle?: boolean;
  headerBackgroundClassName?: string;
  children?: ReactNode;
};

type ModalRef = ForwardedRef<BottomSheetModal>;

type ModalHeaderProps = {
  title?: string;
  dismiss: () => void;
  scrollY?: SharedValue<number>;
  collapsible?: boolean;
  headerBackgroundClassName?: string;
};

type ModalScrollContextValue = {
  scrollY: SharedValue<number>;
  scrollRef: RefObject<any>;
  isCollapsible: boolean;
};

export const ModalScrollContext = createContext<ModalScrollContextValue | null>(null);

export function useModalScroll() {
  const context = use(ModalScrollContext);
  if (!context) {
    throw new Error('useModalScroll must be used within a Modal with collapsibleTitle');
  }
  return context;
}

export function useModal() {
  const ref = useRef<BottomSheetModal>(null);
  const present = useCallback((data?: any) => {
    ref.current?.present(data);
  }, []);
  const dismiss = useCallback(() => {
    ref.current?.dismiss();
  }, []);
  return { ref, present, dismiss };
}

export function Modal({
  ref,
  snapPoints: _snapPoints = ['60%'] as (string | number)[],
  title,
  collapsibleTitle = false,
  headerBackgroundClassName = 'bg-white dark:bg-gray-900',
  detached = false,
  children,
  ...props
}: ModalProps & { ref?: ModalRef }) {
  const { colors: themeColors } = useTheme();

  const detachedProps = useMemo(
    () => getDetachedProps(detached),
    [detached],
  );
  const modal = useModal();
  const snapPoints = useMemo(() => _snapPoints, [_snapPoints]);
  const scrollRef = useAnimatedRef<any>();
  const scrollY = useScrollViewOffset(scrollRef);

  useImperativeHandle(
    ref,
    () => (modal.ref.current as BottomSheetModal) || null,
  );

  const renderHandleComponent = useCallback(
    () => (
      <ModalHeader
        title={title}
        dismiss={modal.dismiss}
        scrollY={scrollY}
        collapsible={collapsibleTitle}
        headerBackgroundClassName={headerBackgroundClassName}
      />
    ),
    [title, modal.dismiss, collapsibleTitle, headerBackgroundClassName, scrollY],
  );

  const contextValue = useMemo(() => ({
    scrollY,
    scrollRef,
    isCollapsible: collapsibleTitle,
  }), [scrollY, scrollRef, collapsibleTitle]);

  const wrappedChildren = (
    <ModalScrollContext value={contextValue}>
      {children}
    </ModalScrollContext>
  );

  return (
    <BottomSheetModal
      {...props}
      {...detachedProps}
      ref={modal.ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={props.backdropComponent || renderBackdrop}
      enableDynamicSizing={false}
      handleComponent={renderHandleComponent}
      backgroundStyle={{
        backgroundColor: themeColors.card,
      }}
    >
      {wrappedChildren}
    </BottomSheetModal>
  );
}

/**
 * Custom Backdrop - animates with modal position
 */

export function renderBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
      pressBehavior="close"
    />
  );
}

/**
 *
 * @param detached
 * @returns
 *
 * @description
 * In case the modal is detached, we need to add some extra props to the modal to make it look like a detached modal.
 */

function getDetachedProps(detached: boolean) {
  if (detached) {
    return {
      detached: true,
      bottomInset: 46,
      style: { marginHorizontal: 16, overflow: 'hidden' },
    } as Partial<BottomSheetModalProps>;
  }
  return {} as Partial<BottomSheetModalProps>;
}

/**
 * ModalHeader
 */

const ModalHeader = memo(({
  title,
  dismiss,
  scrollY,
  collapsible,
  headerBackgroundClassName = 'bg-white dark:bg-gray-900',
}: ModalHeaderProps) => {
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();

  const titleStyle = useAnimatedStyle(() => {
    if (!collapsible || !scrollY) {
      return { opacity: 1 };
    }
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_THRESHOLD / 2, HEADER_SCROLL_THRESHOLD],
      [0, 0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  }, [collapsible, scrollY]);

  return (
    <View
      className={`flex-row items-center rounded-t-2xl px-4 py-2 ${headerBackgroundClassName}`}
    >
      <Pressable
        onPress={dismiss}
        className="z-10 p-1"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel={t('common.accessibility.close_modal_label')}
        accessibilityRole="button"
        accessibilityHint={t('common.accessibility.close_modal_hint')}
      >
        <ChevronDown
          size={28}
          strokeWidth={1.5}
          color={themeColors.icon}
        />
      </Pressable>
      {title && (
        <Animated.View style={titleStyle} className="absolute inset-x-0 items-center justify-center">
          <Text
            className="text-center text-xl font-bold"
            style={{ color: themeColors.text }}
          >
            {title}
          </Text>
        </Animated.View>
      )}
    </View>
  );
});

/**
 * ModalScrollView - ScrollView that integrates with collapsibleTitle
 * Use inside Modal when collapsibleTitle={true}
 */
type ModalScrollViewProps = ScrollViewProps & {
  children?: ReactNode;
};

export function ModalScrollView({ children, ...props }: ModalScrollViewProps) {
  const context = use(ModalScrollContext);

  return (
    <BottomSheetScrollView
      ref={context?.scrollRef}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </BottomSheetScrollView>
  );
}

/**
 * ModalLargeHeader - Large scrollable header for collapsible title pattern
 * Use as first child in ModalScrollView when Modal has collapsibleTitle={true}
 */
type ModalLargeHeaderProps = {
  title: string;
  subtitle?: string;
  containerClassName?: string;
};

export function ModalLargeHeader({ title, subtitle, containerClassName = 'pb-8' }: ModalLargeHeaderProps) {
  return (
    <View className={containerClassName}>
      <Text className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </Text>
      {subtitle && (
        <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
