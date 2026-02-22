import type { FlashListRef } from '@shopify/flash-list';

import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Haptic } from '@/lib/haptics';
import { useTheme } from '@/lib/hooks/use-theme';
import { setItem } from '@/lib/storage';

const { width } = Dimensions.get('window');
const windowWidth = Dimensions.get('window').width;

const ONBOARDING_COMPLETED_KEY = 'ONBOARDING_COMPLETED';

const SLIDE_IDS = ['1', '2', '3'] as const;
const SLIDE_IMAGES = [
  require('/assets/lottie/welcome-3.json'),
  require('/assets/lottie/welcome-2.json'),
  require('/assets/lottie/welcome-1.json'),
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [currentIndex, setCurrentIndex] = useState(0);

  type SlideItem = { id: string; title: string; description: string; image: any };
  const listRef = useRef<FlashListRef<SlideItem> | null>(null);

  const slides = SLIDE_IDS.map((id, i) => ({
    id,
    title: t(`onboarding.slides.${id}.title`),
    description: t(`onboarding.slides.${id}.description`),
    image: SLIDE_IMAGES[i],
  }));

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    Haptic.Soft();
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const completeOnboarding = async () => {
    await setItem(ONBOARDING_COMPLETED_KEY, true);
    router.replace('/home');
  };

  const handleNext = () => {
    if (currentIndex === slides.length - 1) {
      void completeOnboarding();
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  };

  const handleSkip = () => {
    void completeOnboarding();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        className="flex-1 bg-background"
        style={{
          paddingBottom: insets.bottom + 24,
          paddingTop: insets.top + 16,
        }}
      >
        {/* Top bar */}
        <View className="mb-4 flex-row items-center justify-between px-6">
          <View className="flex-row items-center gap-3">
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 9999,
                backgroundColor: colors.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="repeat" size={18} color={colors.accent} />
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
              }}
            >
              {t('onboarding.brand')}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              Haptic.Light();
              handleSkip();
            }}
            hitSlop={8}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: colors.secondaryText,
              }}
            >
              {t('onboarding.skip')}
            </Text>
          </Pressable>
        </View>

        {/* Slides */}
        <FlashList
          ref={listRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToAlignment="start"
          decelerationRate="fast"
          snapToInterval={windowWidth}
          keyExtractor={item => item.id}
          ListFooterComponent={() => <View className="h-10 w-full" />}
          renderItem={({ item }) => (
            <View style={{ width: windowWidth }} className="items-center justify-center px-8">
              <LottieView
                autoPlay
                loop
                source={item.image}
                style={{
                  width: windowWidth * 0.8,
                  height: windowWidth * 0.8,
                  marginBottom: 24,
                }}
              />
              <Text
                className="text-center"
                style={{
                  marginTop: 4,
                  fontSize: 28,
                  fontWeight: '800',
                  letterSpacing: 0.3,
                  color: colors.text,
                }}
              >
                {item.title}
              </Text>
              <Text
                className="mt-3 text-center"
                style={{
                  maxWidth: windowWidth * 0.75,
                  fontSize: 15,
                  lineHeight: 22,
                  color: colors.secondaryText,
                }}
              >
                {item.description}
              </Text>
            </View>
          )}
        />

        {/* Pagination dots */}
        <View className="mt-2 flex-row items-center justify-center">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={slide.id}
                style={{
                  width: isActive ? 24 : 8,
                  height: 3,
                  borderRadius: 9999,
                  marginHorizontal: 3,
                  backgroundColor: isActive ? colors.accent : colors.surfaceBorder,
                }}
              />
            );
          })}
        </View>

        {/* Bottom actions */}
        <View className="mt-8 px-6">
          <Pressable
            onPress={() => {
              Haptic.Light();
              handleNext();
            }}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 9999,
              paddingVertical: 20,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              marginBottom: insets.bottom,
              gap: 8,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: colors.iconOnColor,
              }}
            >
              {currentIndex === slides.length - 1 ? t('onboarding.get_started') : t('onboarding.next')}
            </Text>
            <Feather name="arrow-right" size={18} color={colors.iconOnColor} />
          </Pressable>
        </View>
      </View>
    </>
  );
}
