import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ServiceGridItem from '@/components/subscriptions/service-grid-item';
import ServiceIcon from '@/components/subscriptions/service-icon';
import { Pressable, Text, View } from '@/components/ui';
import { SearchBar } from '@/components/ui/search-bar';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useServiceTemplatesStore } from '@/lib/stores';

export default function AddSubscriptionScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();
  const { templates } = useServiceTemplatesStore();
  const { top } = useSafeAreaInsets();
  const [searchValue, setSearchValue] = useState('');

  const filtered = useMemo(
    () => templates.filter(template => template.name.toLowerCase().includes(searchValue.toLowerCase())),
    [templates, searchValue],
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background, paddingTop: top }}>
      <View className="px-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-base" style={{ color: colors.primary }}>
              Cancel
            </Text>
          </Pressable>
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            Add Subscription
          </Text>
          <View className="w-12" />
        </View>

        <View className="mt-4 flex-row items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: colors.card }}>
          <Text className="text-sm" style={{ color: colors.text }}>
            Import from file
          </Text>
          <Pressable onPress={() => router.push('/(modals)/csv-import')}>
            <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
              Import
            </Text>
          </Pressable>
        </View>

        <Text className="mt-6 text-xs uppercase" style={{ color: colors.secondaryText }}>
          Popular services
        </Text>
      </View>

      <SearchBar
        value={searchValue}
        onChangeText={setSearchValue}
        placeholder="Search services"
        containerClassName="mx-5"
      />

      <FlashList
        data={filtered}
        numColumns={2}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View className="mb-4 flex-1 px-2">
            <ServiceGridItem
              title={item.name}
              icon={<ServiceIcon iconKey={item.iconKey} />}
              onPress={() => router.push({ pathname: '/(modals)/subscription-form', params: { templateId: item.id } })}
            />
          </View>
        )}
        ListFooterComponent={(
          <View className="mt-4 px-2">
            <ServiceGridItem
              title="Custom Service"
              icon={<ServiceIcon iconKey="custom" />}
              onPress={() => router.push('/(modals)/subscription-form')}
            />
          </View>
        )}
      />
    </View>
  );
}
