import type { Subscription } from '@/lib/db/schema';

import { useRouter } from 'expo-router';
import { Button, Card, Chip, Dialog, Input, Label, Select, TextField, useToast } from 'heroui-native';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useCurrencyRatesStore, useListsStore, useSettingsStore, useSubscriptionsStore } from '@/lib/stores';
import { calculateMonthlyTotal, calculateYearlyForecast } from '@/lib/utils/totals';

type SelectOption = { label: string; value: string } | undefined;
type StatusFilter = 'active' | 'all';

const ALL_LISTS = 'all';

function formatAmount(value: number, currency: string, roundWholeNumbers: boolean) {
  return `${value.toFixed(roundWholeNumbers ? 0 : 2)} ${currency}`;
}

export default function HomeScreen() {
  useBootstrap();
  const router = useRouter();
  const { toast } = useToast();
  const { top, bottom } = useSafeAreaInsets();

  const { subscriptions, remove, setStatus } = useSubscriptionsStore();
  const { lists } = useListsStore();
  const { settings } = useSettingsStore();
  const { rates } = useCurrencyRatesStore();

  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [selectedListId, setSelectedListId] = useState(ALL_LISTS);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);

  const listOptions = useMemo(
    () => [
      { label: 'All lists', value: ALL_LISTS },
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

  const selectedListOption = listOptions.find(option => option.value === selectedListId);
  const selectedStatusOption = statusOptions.find(option => option.value === statusFilter) as SelectOption;

  const handleDelete = () => {
    if (!subscriptionToDelete) {
      return;
    }
    remove(subscriptionToDelete.id);
    toast.show(`${subscriptionToDelete.name} removed`);
    setSubscriptionToDelete(null);
  };

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottom + 40, gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 30, fontWeight: '700' }}>Subscriptions</Text>
          <Text style={{ fontSize: 14, opacity: 0.7 }}>
            Fully migrated to HeroUI Native components.
          </Text>
        </View>

        <Card>
          <Card.Body style={{ gap: 8 }}>
            <Text style={{ fontSize: 14, opacity: 0.7 }}>This Month</Text>
            <Text style={{ fontSize: 28, fontWeight: '700' }}>
              {formatAmount(monthlyTotal, settings.mainCurrency, settings.roundWholeNumbers)}
            </Text>
            <Text style={{ fontSize: 14, opacity: 0.7 }}>Yearly forecast</Text>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>
              {formatAmount(yearlyForecast, settings.mainCurrency, settings.roundWholeNumbers)}
            </Text>
          </Card.Body>
        </Card>

        <TextField>
          <Label>Search</Label>
          <Input
            placeholder="Search subscriptions"
            value={searchValue}
            onChangeText={setSearchValue}
          />
        </TextField>

        <View style={{ gap: 10 }}>
          <TextField>
            <Label>List filter</Label>
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
            <Label>Status filter</Label>
            <Select
              value={selectedStatusOption}
              onValueChange={option => setStatusFilter((option?.value as StatusFilter | undefined) ?? 'active')}
              presentation="bottom-sheet"
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose status filter" />
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

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Button variant="primary" onPress={() => router.push('/(modals)/add-subscription')}>
            Add subscription
          </Button>
          <Button variant="secondary" onPress={() => router.push('/(modals)/analytics')}>
            Analytics
          </Button>
          <Button variant="secondary" onPress={() => router.push('/(modals)/settings')}>
            Settings
          </Button>
        </View>

        <View style={{ gap: 12 }}>
          {filteredSubscriptions.length === 0 && (
            <Card>
              <Card.Body>
                <Text style={{ fontSize: 14, opacity: 0.7 }}>
                  No subscriptions match this filter yet.
                </Text>
              </Card.Body>
            </Card>
          )}

          {filteredSubscriptions.map((sub) => {
            const isActive = sub.status === 'active';
            return (
              <Card key={sub.id}>
                <Card.Header style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Card.Title>{sub.name}</Card.Title>
                    <Chip>{sub.status}</Chip>
                  </View>
                  <Card.Description>
                    {formatAmount(sub.amount, sub.currency, settings.roundWholeNumbers)}
                    {' · '}
                    {sub.scheduleType}
                  </Card.Description>
                </Card.Header>
                <Card.Footer style={{ gap: 8 }}>
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
                </Card.Footer>
              </Card>
            );
          })}
        </View>
      </ScrollView>

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
    </View>
  );
}
