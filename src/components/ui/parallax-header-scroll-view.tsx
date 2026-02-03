/**
 * ParallaxHeaderScrollView
 *
 * Reusable parallax header with sticky blurred title and floating actions.
 * Designed to mirror the header behavior in article detail and routine detail.
 */

import type { ImageProps } from 'expo-image';
import type { ReactNode } from 'react';

import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/hooks/use-theme';
import { Image } from './image';
import { Text } from './text';

type HeaderAction = {
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

type ParallaxHeaderScrollViewProps = ScrollViewProps & {
  imageSource: ImageProps['source'];
  headerHeight?: number;
  headerContent?: ReactNode;
  headerContentContainerStyle?: StyleProp<ViewStyle>;
  stickyTitle?: string;
  leftAction?: HeaderAction;
  rightAction?: HeaderAction;
  scrimColors?: string[];
  bottomFadeColors?: string[];
  bottomFadeHeight?: number;
};

export function ParallaxHeaderScrollView({
  imageSource,
  headerHeight = 300,
  headerContent,
  headerContentContainerStyle,
  stickyTitle,
  leftAction,
  rightAction,
  scrimColors,
  bottomFadeColors,
  bottomFadeHeight = 120,
  contentContainerStyle,
  scrollEventThrottle,
  showsVerticalScrollIndicator,
  style,
  onScroll,
  children,
  ...scrollViewProps
}: ParallaxHeaderScrollViewProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleScroll = useMemo(
    () => Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: true, listener: onScroll },
    ),
    [scrollY, onScroll],
  );

  const fadeColors = bottomFadeColors ?? ['transparent', colors.background];
  const stickyHeaderHeight = insets.top + 50;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.ScrollView
        {...scrollViewProps}
        style={[{ flex: 1 }, style]}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle ?? 16}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator ?? false}
        contentContainerStyle={contentContainerStyle}
      >
        <View style={{ height: headerHeight, width: '100%' }}>
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: headerHeight,
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [-headerHeight, 0, headerHeight],
                    outputRange: [-headerHeight / 2, 0, headerHeight * 0.25],
                  }),
                },
                {
                  scale: scrollY.interpolate({
                    inputRange: [-headerHeight, 0, headerHeight],
                    outputRange: [2, 1, 1],
                  }),
                },
              ],
            }}
          >
            <Image
              source={imageSource}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
            {scrimColors && (
              <LinearGradient
                colors={scrimColors}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: bottomFadeHeight }}>
              <LinearGradient colors={fadeColors} style={{ flex: 1 }} />
            </View>
          </Animated.View>

          {headerContent && (
            <View
              style={[
                {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 50,
                  alignItems: 'center',
                  paddingTop: insets.top + 16,
                  paddingBottom: 24,
                },
                headerContentContainerStyle,
              ]}
            >
              {headerContent}
            </View>
          )}
        </View>

        {children}
      </Animated.ScrollView>

      {stickyTitle && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: stickyHeaderHeight,
            backgroundColor: colors.background,
            opacity: scrollY.interpolate({
              inputRange: [headerHeight - 100, headerHeight],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            zIndex: 10,
          }}
        >
          <BlurView intensity={80} style={{ flex: 1 }}>
            <View style={{ marginTop: insets.top, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                {stickyTitle}
              </Text>
            </View>
          </BlurView>
          <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 1, backgroundColor: colors.border }} />
        </Animated.View>
      )}

      {leftAction && (
        <TouchableOpacity
          onPress={leftAction.onPress}
          style={{
            position: 'absolute',
            top: insets.top + 10,
            left: 20,
            zIndex: 20,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel={leftAction.accessibilityLabel}
          accessibilityHint={leftAction.accessibilityHint}
          accessibilityRole="button"
        >
          {leftAction.icon}
        </TouchableOpacity>
      )}

      {rightAction && (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={{
            position: 'absolute',
            top: insets.top + 10,
            right: 20,
            zIndex: 20,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel={rightAction.accessibilityLabel}
          accessibilityHint={rightAction.accessibilityHint}
          accessibilityRole="button"
        >
          {rightAction.icon}
        </TouchableOpacity>
      )}
    </View>
  );
}
