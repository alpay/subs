import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';

import { NativeSheet } from '@/components/native-sheet';
import { RadialGlow } from '@/components/radial-glow';
import { useSettingsStore } from '@/lib/stores';
import { formatAmount } from '@/lib/utils/format';

const AUTO_SCROLL_INTERVAL_MS = 5000;

// Paywall feature carousel items
const PAYWALL_FEATURES = [

  {
    id: 'unlimited',
    icon: 'infinity',
    title: 'Unlimited Subscriptions',
    description: 'Enjoy the freedom of managing subscriptions without limits.',
    color: '#22C55E',
  },
  {
    id: 'icloud',
    icon: 'icloud.and.arrow.down.fill',
    title: 'iCloud Sync',
    description: 'Securely store your data and keep it in sync across all your devices.',
    color: '#3B82F6',
  },
  {
    id: 'analytics',
    icon: 'chart.bar.fill',
    title: 'Insights & Analytics',
    description: 'Track your spending with detailed analytics and forecasts.',
    color: '#A855F7',
  },
  {
    id: 'categories',
    icon: 'square.grid.2x2.fill',
    title: 'Smart Categories',
    description: 'Organize and categorize your subscriptions your way.',
    color: '#F97316',
  },
  {
    id: 'support',
    icon: 'heart.fill',
    title: 'Support the Developer',
    description: 'Your purchase motivates a developer to keep improving the app.',
    color: '#E11D48',
  },
  {
    id: 'updates',
    icon: 'arrow.up.circle.fill',
    title: 'New Features & Updates',
    description: 'Access new functions for life along with regular updates.',
    color: '#0EA5E9',
  },
] as const;

const LIFETIME_PRICE = 299.99;

export default function PaywallScreen() {
  const router = useRouter();
  const { settings, update } = useSettingsStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const activeIndexRef = useRef(0);
  const userHasScrolledRef = useRef(false);
  const { width: screenWidth } = Dimensions.get('window');

  activeIndexRef.current = activeIndex;

  useEffect(() => {
    const interval = setInterval(() => {
      if (userHasScrolledRef.current)
        return;
      const nextIndex = (activeIndexRef.current + 1) % PAYWALL_FEATURES.length;
      const offset = nextIndex * screenWidth;
      flatListRef.current?.scrollToOffset({ offset, animated: true });
    }, AUTO_SCROLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [screenWidth]);

  const handleScrollBeginDrag = useCallback(() => {
    userHasScrolledRef.current = true;
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);
      if (index >= 0 && index < PAYWALL_FEATURES.length && index !== activeIndex) {
        setActiveIndex(index);
      }
    },
    [screenWidth, activeIndex],
  );

  const handlePurchase = useCallback(() => {
    if (settings.premium) {
      router.back();
      return;
    }
    update({ premium: true });
    router.back();
  }, [settings.premium, update, router]);

  const handleRestore = useCallback(() => {
    // TODO: Implement restore purchases
  }, []);

  const formattedPrice = formatAmount(
    LIFETIME_PRICE,
    settings.mainCurrency ?? 'TRY',
    settings.roundWholeNumbers ?? false,
  );

  return (
    <View>
      {/* Dynamic glow from active feature color */}
      <RadialGlow
        color={PAYWALL_FEATURES[activeIndex]?.color ?? '#22C55E'}
        centerY="25%"
        radiusX="80%"
        radiusY="80%"
        maxOpacity={0.6}
        gradientId="paywall-bg-glow"
      />

      <NativeSheet title="" showCloseIcon>
        <View style={{ flex: 1, gap: 24 }}>
          {/* Features carousel - each item full width so snap keeps all items centered */}
          <View style={{ marginHorizontal: -16 }}>
            <FlatList
              ref={flatListRef}
              data={PAYWALL_FEATURES}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={screenWidth}
              snapToAlignment="center"
              onScroll={handleScroll}
              onScrollBeginDrag={handleScrollBeginDrag}
              scrollEventThrottle={16}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: screenWidth,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FeatureCard feature={item} />
                </View>
              )}
            />
          </View>

          {/* Pagination dots */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {PAYWALL_FEATURES.map((_, i) => (
              <View
                key={PAYWALL_FEATURES[i].id}
                style={{
                  width: i === activeIndex ? 8 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === activeIndex ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </View>

          {/* Lifetime option */}
          <Pressable
            onPress={handlePurchase}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(0,0,0,0.25)',
                borderRadius: 16,
                paddingVertical: 18,
                paddingHorizontal: 20,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>
                Lifetime
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                Pay once, use forever!
              </Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>
              {formattedPrice}
            </Text>
          </Pressable>

          {/* Footer links */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Pressable onPress={handleRestore} hitSlop={8}>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                Restore Purchases
              </Text>
            </Pressable>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>•</Text>
            <Pressable hitSlop={8}>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                Privacy
              </Text>
            </Pressable>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>•</Text>
            <Pressable hitSlop={8}>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                Promo
              </Text>
            </Pressable>
          </View>
        </View>
      </NativeSheet>
    </View>
  );
}

type FeatureCardProps = {
  feature: (typeof PAYWALL_FEATURES)[number];
};

function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <View style={{ alignItems: 'center', width: '100%' }}>
      {/* Icon circle with glow - each feature has its own colored circle + shadow */}
      <View style={{ position: 'relative', marginBottom: 20, paddingTop: 20 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: feature.color,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: feature.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          <Image
            source={`sf:${feature.icon}`}
            style={{ width: 40, height: 40 }}
            tintColor="white"
          />
        </View>
      </View>
      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: 'white',
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        {feature.title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.85)',
          textAlign: 'center',
          lineHeight: 20,
          paddingHorizontal: '20%',
        }}
      >
        {feature.description}
      </Text>
    </View>
  );
}
