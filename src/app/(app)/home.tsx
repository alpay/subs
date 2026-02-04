import type { Subscription } from '@/lib/db/schema';

import { Stack, useRouter } from 'expo-router';
import { Button, Dialog, Input, Label, Select, TextField, useToast } from 'heroui-native';
import { useMemo, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { CalendarGrid } from '@/components/calendar-grid';
import { GlassCard, GlassCardBody } from '@/components/glass-card';
import { IconButton } from '@/components/icon-button';
import { Pill } from '@/components/pill';
import { ScreenShell } from '@/components/screen-shell';
import { ServiceIcon } from '@/components/service-icon';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCurrencyRatesStore, useListsStore, useSettingsStore, useSubscriptionsStore } from '@/lib/stores';
import { formatAmount, formatMonthYear } from '@/lib/utils/format';
import { calculateAverageMonthly, calculateMonthlyTotal, calculateYearlyForecast } from '@/lib/utils/totals';

type SelectOption = { label: string; value: string } | undefined;

type StatusFilter = 'active' | 'all';

const ALL_LISTS = 'all';

function getMonthBadge(monthlyTotal: number, averageMonthly: number) {
  if (averageMonthly === 0) {
    return { label: 'New Month', tone: 'accent' as const };
  }

  if (monthlyTotal > averageMonthly * 1.1) {
    return { label: 'Peak Month', tone: 'accent' as const };
  }

  if (monthlyTotal < averageMonthly * 0.9) {
    return { label: 'Low Month', tone: 'neutral' as const };
  }

  return { label: 'Regular Month', tone: 'success' as const };
}

export default function HomeScreen() {
  useBootstrap();
  const router = useRouter();
  const { toast } = useToast();
  const { colors } = useTheme();

  const { subscriptions, remove, setStatus } = useSubscriptionsStore();
  const { lists } = useListsStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();

  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [selectedListId, setSelectedListId] = useState(ALL_LISTS);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);

  const listOptions = useMemo(
    () => [
      { label: 'All subs', value: ALL_LISTS },
      ...lists.map(list => ({ label: list.name, value: list.id })),
    ],
    [lists],
  );

  const statusOptions = useMemo(
    () => [
      { label: 'Active only', value: 'active' },
      { label: 'All statuses', value: 'all' },
    ],
    [],
  );

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      if (statusFilter === 'active' && sub.status !== 'active') {
        return false;
      }
      if (selectedListId !== ALL_LISTS && sub.listId !== selectedListId) {
        return false;
      }
      if (searchValue && !sub.name.toLowerCase().includes(searchValue.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [subscriptions, statusFilter, selectedListId, searchValue]);

  const monthlyTotal = useMemo(
    () => calculateMonthlyTotal({
      subscriptions: filteredSubscriptions,
      monthDate: new Date(),
      settings,
      rates,
    }),
    [filteredSubscriptions, settings, rates],
  );

  const yearlyForecast = useMemo(
    () => calculateYearlyForecast({ subscriptions: filteredSubscriptions, settings, rates }),
    [filteredSubscriptions, settings, rates],
  );

  const averageMonthly = useMemo(
    () => calculateAverageMonthly({ subscriptions: filteredSubscriptions, settings, rates }),
    [filteredSubscriptions, settings, rates],
  );

  const selectedListOption = listOptions.find(option => option.value === selectedListId);
  const selectedStatusOption = statusOptions.find(option => option.value === statusFilter) as SelectOption;

  const badge = getMonthBadge(monthlyTotal, averageMonthly);

  const handleDelete = () => {
    if (!subscriptionToDelete) {
      return;
    }
    remove(subscriptionToDelete.id);
    toast.show(`${subscriptionToDelete.name} removed`);
    setSubscriptionToDelete(null);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Subscriptions',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text, fontWeight: '600' },
          headerTitleAlign: 'center',
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <IconButton symbol="magnifyingglass" onPress={() => searchInputRef.current?.focus()} />
              <IconButton symbol="chart.bar" onPress={() => router.push('/(modals)/analytics')} />
              <IconButton symbol="gearshape" onPress={() => router.push('/(modals)/settings')} />
            </View>
          ),
        }}
      />

      <ScreenShell>
        <GlassCard>
          <GlassCardBody style={{ alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 14, color: colors.textMuted }} selectable>
              {formatMonthYear(new Date())}
            </Text>
            <Text
              style={{ fontSize: 44, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] }}
              selectable
            >
              {formatAmount(monthlyTotal, settings.mainCurrency, settings.roundWholeNumbers)}
            </Text>
            <Pill tone={badge.tone}>{badge.label}</Pill>
          </GlassCardBody>
        </GlassCard>

        <GlassCard>
          <GlassCardBody style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: colors.textMuted }} selectable>
                Yearly forecast
              </Text>
              <Text
                style={{ fontSize: 16, fontWeight: '600', color: colors.text, fontVariant: ['tabular-nums'] }}
                selectable
              >
                {formatAmount(yearlyForecast, settings.mainCurrency, settings.roundWholeNumbers)}
              </Text>
            </View>
            <CalendarGrid date={new Date()} subscriptions={filteredSubscriptions} />
            <Button variant="primary" onPress={() => router.push('/(modals)/add-subscription')}>
              Add subscription
            </Button>
          </GlassCardBody>
        </GlassCard>

        <GlassCard>
          <GlassCardBody style={{ gap: 10 }}>
            <TextField>
              <Label>Search</Label>
              <Input
                ref={searchInputRef}
                placeholder="Search subscriptions"
                value={searchValue}
                onChangeText={setSearchValue}
              />
            </TextField>

            <View style={{ gap: 10 }}>
              <TextField>
                <Label>List</Label>
                <Select
                  value={selectedListOption}
                  onValueChange={option => setSelectedListId(option?.value ?? ALL_LISTS)}
                  presentation="bottom-sheet"
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Choose list" />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Overlay />
                    <Select.Content presentation="bottom-sheet">
                      {listOptions.map(option => (
                        <Select.Item key={option.value} value={option.value} label={option.label} />
                      ))}
                    </Select.Content>
                  </Select.Portal>
                </Select>
              </TextField>

              <TextField>
                <Label>Status</Label>
                <Select
                  value={selectedStatusOption}
                  onValueChange={option => setStatusFilter((option?.value as StatusFilter | undefined) ?? 'active')}
                  presentation="bottom-sheet"
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Choose status" />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Overlay />
                    <Select.Content presentation="bottom-sheet">
                      {statusOptions.map(option => (
                        <Select.Item key={option.value} value={option.value} label={option.label} />
                      ))}
                    </Select.Content>
                  </Select.Portal>
                </Select>
              </TextField>
            </View>
          </GlassCardBody>
        </GlassCard>

        <View style={{ gap: 12 }}>
          {filteredSubscriptions.length === 0 && (
            <GlassCard>
              <GlassCardBody>
                <Text style={{ fontSize: 14, color: colors.textMuted }} selectable>
                  No subscriptions match this filter yet.
                </Text>
              </GlassCardBody>
            </GlassCard>
          )}

          {filteredSubscriptions.map((sub) => {
            const isActive = sub.status === 'active';

            return (
              <GlassCard key={sub.id}>
                <GlassCardBody style={{ gap: 12 }}>
                  <Pressable
                    onPress={() => router.push({ pathname: '/(modals)/subscription-form', params: { id: sub.id } })}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <ServiceIcon iconKey={sub.iconKey} />
                        <View style={{ gap: 4 }}>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }} selectable>
                            {sub.name}
                          </Text>
                          <Text
                            style={{ fontSize: 12, color: colors.textMuted, fontVariant: ['tabular-nums'] }}
                            selectable
                          >
                            {sub.scheduleType} · {formatAmount(sub.amount, sub.currency, settings.roundWholeNumbers)}
                          </Text>
                        </View>
                      </View>
                      <Pill tone={isActive ? 'success' : 'neutral'}>{sub.status}</Pill>
                    </View>
                  </Pressable>

                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() => router.push({ pathname: '/(modals)/subscription-form', params: { id: sub.id } })}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={isActive ? 'outline' : 'primary'}
                      onPress={() => {
                        setStatus(sub.id, isActive ? 'paused' : 'active');
                        toast.show(`${sub.name} is now ${isActive ? 'paused' : 'active'}`);
                      }}
                    >
                      {isActive ? 'Pause' : 'Resume'}
                    </Button>
                    <Button size="sm" variant="danger" onPress={() => setSubscriptionToDelete(sub)}>
                      Delete
                    </Button>
                  </View>
                </GlassCardBody>
              </GlassCard>
            );
          })}
        </View>
      </ScreenShell>

      <Dialog isOpen={Boolean(subscriptionToDelete)} onOpenChange={isOpen => !isOpen && setSubscriptionToDelete(null)}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title>Delete subscription?</Dialog.Title>
            <Dialog.Description>
              This action permanently removes the subscription from your tracker.
            </Dialog.Description>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Button variant="secondary" onPress={() => setSubscriptionToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" onPress={handleDelete}>
                Delete
              </Button>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  );
}
