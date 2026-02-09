import { Image } from 'expo-image';
import { Link, Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Pill } from '@/components/pill';
import { ScreenShell } from '@/components/screen-shell';
import { ServiceIcon } from '@/components/service-icon';
import { useTheme } from '@/lib/hooks/use-theme';
import { useSettingsStore, useSubscriptionsStore } from '@/lib/stores';
import { formatAmount } from '@/lib/utils/format';

export default function SearchScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { subscriptions } = useSubscriptionsStore();
  const { settings } = useSettingsStore();

  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return subscriptions;
    }
    return subscriptions.filter(sub => sub.name.toLowerCase().includes(normalized));
  }, [subscriptions, query]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScreenShell contentContainerStyle={{ gap: 18, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 12,
              height: 42,
              borderRadius: 18,
              borderCurve: 'continuous',
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.surfaceBorder,
              boxShadow: isDark
                ? '0 16px 28px rgba(0, 0, 0, 0.35)'
                : '0 16px 28px rgba(15, 23, 42, 0.12)',
            }}
          >
            <Image source="sf:magnifyingglass" style={{ width: 16, height: 16 }} tintColor={colors.textMuted} />
            <TextInput
              ref={inputRef}
              placeholder="Search subscriptions"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              style={{ flex: 1, color: colors.text, fontSize: 15 }}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')}>
                <Image
                  source="sf:xmark.circle.fill"
                  style={{ width: 18, height: 18 }}
                  tintColor={colors.textMuted}
                />
              </Pressable>
            )}
          </View>
          <Pressable onPress={() => router.back()}>
            <Text style={{ fontSize: 16, color: colors.text }} selectable>
              Cancel
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            borderRadius: 24,
            borderCurve: 'continuous',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.surfaceBorder,
            overflow: 'hidden',
            boxShadow: isDark
              ? '0 20px 32px rgba(0, 0, 0, 0.35)'
              : '0 20px 32px rgba(15, 23, 42, 0.12)',
          }}
        >
          {results.length === 0 && (
            <View style={{ padding: 18 }}>
              <Text style={{ color: colors.textMuted }} selectable>
                No subscriptions found.
              </Text>
            </View>
          )}

          {results.map((sub, index) => {
            const isActive = sub.status === 'active';
            const isLast = index === results.length - 1;

            return (
              <Link key={sub.id} href={`/subscription/${sub.id}`} asChild>
                <Link.Trigger withAppleZoom>
                  <Pressable>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        gap: 12,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                        <ServiceIcon iconKey={sub.iconKey} iconUri={sub.iconType === 'image' ? sub.iconUri : undefined} size={44} />
                        <View style={{ gap: 4, flex: 1 }}>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }} selectable>
                            {sub.name}
                          </Text>
                          <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
                            {sub.scheduleType}
                            {' '}
                            ·
                            {formatAmount(sub.amount, sub.currency, settings.roundWholeNumbers)}
                          </Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <Pill tone={isActive ? 'success' : 'neutral'}>{sub.status}</Pill>
                        <Image
                          source="sf:chevron.right"
                          style={{ width: 12, height: 12 }}
                          tintColor={colors.textMuted}
                        />
                      </View>
                    </View>
                    {!isLast && (
                      <View
                        style={{
                          height: 1,
                          marginLeft: 16,
                          marginRight: 16,
                          backgroundColor: colors.surfaceBorder,
                          opacity: 0.7,
                        }}
                      />
                    )}
                  </Pressable>
                </Link.Trigger>
              </Link>
            );
          })}
        </View>
      </ScreenShell>
    </>
  );
}
