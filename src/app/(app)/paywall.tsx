import type { FlashListRef } from '@shopify/flash-list';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  Text,
  View,
} from 'react-native';

import * as Linking from 'expo-linking';

import { NativeSheet } from '@/components/native-sheet';
import { RadialGlow } from '@/components/radial-glow';
import { Haptic } from '@/lib/haptics';
import {
  getLifetimePackage,
  isRevenueCatConfigured,
  purchaseLifetime,
  restorePurchases,
} from '@/lib/revenuecat';
import { useSettingsStore } from '@/lib/stores';

const AUTO_SCROLL_INTERVAL_MS = 5000;

const PAYWALL_FEATURE_IDS = [
  { id: 'unlimited', icon: 'infinity', color: '#22C55E' },
  { id: 'icloud', icon: 'icloud.and.arrow.down.fill', color: '#3B82F6' },
  { id: 'analytics', icon: 'chart.bar.fill', color: '#A855F7' },
  { id: 'categories', icon: 'square.grid.2x2.fill', color: '#F97316' },
  { id: 'support', icon: 'heart.fill', color: '#E11D48' },
  { id: 'updates', icon: 'arrow.up.circle.fill', color: '#0EA5E9' },
] as const;

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { settings } = useSettingsStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [lifetimePriceString, setLifetimePriceString] = useState<string | null>(null);
  const listRef = useRef<FlashListRef<{ id: string; icon: string; color: string; title: string; description: string }> | null>(null);
  const activeIndexRef = useRef(0);
  const userHasScrolledRef = useRef(false);
  const { width: screenWidth } = Dimensions.get('window');
  const hasRevenueCat = isRevenueCatConfigured();

  const paywallFeatures = PAYWALL_FEATURE_IDS.map(({ id, icon, color }) => ({
    id,
    icon,
    color,
    title: t(`paywall.features.${id}.title`),
    description: t(`paywall.features.${id}.description`),
  }));

  activeIndexRef.current = activeIndex;

  useEffect(() => {
    if (!hasRevenueCat)
      return;
    getLifetimePackage()
      .then(pkg => (pkg ? setLifetimePriceString(pkg.product.priceString) : null))
      .catch(() => {});
  }, [hasRevenueCat]);

  useEffect(() => {
    const id = setInterval(() => {
      if (userHasScrolledRef.current)
        return;
      const nextIndex = (activeIndexRef.current + 1) % paywallFeatures.length;
      const offset = nextIndex * screenWidth;
      listRef.current?.scrollToOffset({ offset, animated: true });
    }, AUTO_SCROLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [screenWidth, paywallFeatures.length]);

  const handleScrollBeginDrag = useCallback(() => {
    userHasScrolledRef.current = true;
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);
      if (index >= 0 && index < paywallFeatures.length && index !== activeIndex) {
        setActiveIndex(index);
      }
    },
    [screenWidth, activeIndex, paywallFeatures.length],
  );

  const handlePurchase = useCallback(async () => {
    Haptic.Medium();
    if (settings.premium) {
      router.back();
      return;
    }
    if (!hasRevenueCat) {
      Alert.alert(
        t('paywall.not_available_title'),
        t('paywall.not_available_message'),
      );
      return;
    }
    setPurchasing(true);
    try {
      const result = await purchaseLifetime();
      if (result.success) {
        router.back();
      }
      else if (!result.userCancelled) {
        const message
          = result.error instanceof Error
            ? result.error.message
            : t('paywall.purchase_failed_message');
        Alert.alert(t('paywall.purchase_failed_title'), message);
      }
    }
    finally {
      setPurchasing(false);
    }
  }, [settings.premium, hasRevenueCat, router, t]);

  const handleRestore = useCallback(async () => {
    Haptic.Light();
    if (!hasRevenueCat) {
      Alert.alert(
        t('paywall.not_available_title'),
        t('paywall.restore_not_available'),
      );
      return;
    }
    setRestoring(true);
    try {
      const result = await restorePurchases();
      if (result.success) {
        if (result.hadPremium) {
          router.back();
        }
        else {
          Alert.alert(
            t('paywall.restore_complete_title'),
            t('paywall.restore_complete_no_purchase'),
          );
        }
      }
      else {
        const message
          = result.error instanceof Error
            ? result.error.message
            : t('paywall.restore_failed_message');
        Alert.alert(t('paywall.restore_failed_title'), message);
      }
    }
    finally {
      setRestoring(false);
    }
  }, [hasRevenueCat, router, t]);

  const displayPrice = lifetimePriceString ?? '—';

  return (
    <View>
      {/* Dynamic glow from active feature color */}
      <RadialGlow
        color={paywallFeatures[activeIndex]?.color ?? '#22C55E'}
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
            <FlashList
              ref={listRef}
              data={paywallFeatures}
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
            {paywallFeatures.map((_, i) => (
              <View
                key={paywallFeatures[i].id}
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
            disabled={purchasing}
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
              (pressed || purchasing) && { opacity: 0.85 },
            ]}
          >
            <View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>
                {t('paywall.lifetime')}
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                {t('paywall.pay_once_forever')}
              </Text>
            </View>
            {purchasing
              ? (
                  <ActivityIndicator size="small" color="white" />
                )
              : (
                  <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>
                    {displayPrice}
                  </Text>
                )}
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
            <Pressable
              onPress={handleRestore}
              disabled={restoring}
              hitSlop={8}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: restoring ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)',
                }}
              >
                {restoring ? t('paywall.restoring') : t('paywall.restore_purchases')}
              </Text>
            </Pressable>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>•</Text>
            <Pressable
              hitSlop={8}
              onPress={() => {
                Haptic.Light();
                Linking.openURL('https://subs.alpay.dev/privacy');
              }}
            >
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                {t('paywall.privacy')}
              </Text>
            </Pressable>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>•</Text>
            <Pressable
              hitSlop={8}
              onPress={() => {
                Haptic.Light();
                Linking.openURL('https://subs.alpay.dev/terms');
              }}
            >
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                {t('paywall.terms')}
              </Text>
            </Pressable>
          </View>
        </View>
      </NativeSheet>
    </View>
  );
}

type FeatureCardProps = {
  feature: {
    id: string;
    icon: string;
    color: string;
    title: string;
    description: string;
  };
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
