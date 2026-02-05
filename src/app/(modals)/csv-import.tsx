import type { ScheduleType, SubscriptionStatus } from '@/lib/db/schema';

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { Button, Label, TextField, useToast } from 'heroui-native';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { GlassCard, GlassCardBody } from '@/components/glass-card';
import { ModalSheet } from '@/components/modal-sheet';
import { SheetTextArea } from '@/components/sheet-input';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCategoriesStore, useListsStore, usePaymentMethodsStore, useSubscriptionsStore } from '@/lib/stores';

const REQUIRED_COLUMNS = ['name', 'amount', 'currency', 'schedule', 'start_date'];
const VALID_SCHEDULES: ScheduleType[] = ['monthly', 'yearly', 'weekly', 'custom'];
const VALID_STATUSES: SubscriptionStatus[] = ['active', 'paused', 'canceled'];

function parseCsv(raw: string) {
  const lines = raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { rows: [] as Record<string, string>[], error: 'No data found.' };
  }

  const header = lines[0].split(',').map(item => item.trim().toLowerCase());
  const missing = REQUIRED_COLUMNS.filter(column => !header.includes(column));
  if (missing.length > 0) {
    return { rows: [] as Record<string, string>[], error: `Missing columns: ${missing.join(', ')}` };
  }

  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map(item => item.trim());
    const row: Record<string, string> = {};

    header.forEach((column, index) => {
      row[column] = values[index] ?? '';
    });

    return row;
  });

  return { rows, error: null as string | null };
}

function normalizeSchedule(value: string): ScheduleType {
  const candidate = value.toLowerCase() as ScheduleType;
  return VALID_SCHEDULES.includes(candidate) ? candidate : 'monthly';
}

function normalizeStatus(value: string): SubscriptionStatus {
  const candidate = value.toLowerCase() as SubscriptionStatus;
  return VALID_STATUSES.includes(candidate) ? candidate : 'active';
}

export default function CsvImportScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const { colors } = useTheme();

  const { add: addCategory } = useCategoriesStore();
  const { add: addList } = useListsStore();
  const { add: addPaymentMethod } = usePaymentMethodsStore();
  const { add: addSubscription } = useSubscriptionsStore();

  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

  const handlePreview = () => {
    const result = parseCsv(csvText);
    setRows(result.rows);
    setError(result.error);
  };

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/plain', 'application/vnd.ms-excel'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const file = result.assets[0];
    const content = await FileSystem.readAsStringAsync(file.uri);

    setFileName(file.name ?? 'CSV file');
    setCsvText(content);

    const parsed = parseCsv(content);
    setRows(parsed.rows);
    setError(parsed.error);
  };

  const handleImport = () => {
    const parsed = parseCsv(csvText);
    setError(parsed.error);

    if (parsed.error) {
      return;
    }

    parsed.rows.forEach((row) => {
      const name = row.name || 'Subscription';
      const amount = Number(row.amount || 0);
      const currency = row.currency || 'EUR';
      const scheduleType = normalizeSchedule(row.schedule || 'monthly');
      const startDate = row.start_date || new Date().toISOString().slice(0, 10);

      const categoryId = row.category ? addCategory(row.category, '#4F46E5').id : 'cat-utilities';
      const listId = row.list ? addList(row.list).id : 'list-personal';
      const paymentMethodId = row.payment_method ? addPaymentMethod(row.payment_method).id : undefined;

      addSubscription({
        name,
        status: normalizeStatus(row.status || 'active'),
        iconType: 'builtIn',
        iconKey: row.icon_key || 'custom',
        amount: Number.isFinite(amount) ? amount : 0,
        currency,
        scheduleType,
        intervalCount: Number(row.interval_count || 1) || 1,
        intervalUnit: scheduleType === 'custom'
          ? ((row.interval_unit as 'week' | 'month' | undefined) ?? 'month')
          : undefined,
        billingAnchor: startDate,
        startDate,
        categoryId,
        listId,
        paymentMethodId,
        notificationMode: 'default',
        notes: row.notes || undefined,
      });
    });

    toast.show(`${parsed.rows.length} subscriptions imported`);
    router.back();
  };

  return (
    <ModalSheet title="CSV Import">
      <GlassCard>
        <GlassCardBody style={{ gap: 10 }}>
          <Text style={{ color: colors.textMuted }} selectable>
            Required columns:
            {' '}
            {REQUIRED_COLUMNS.join(', ')}
          </Text>

          <TextField>
            <Label>CSV data</Label>
            <SheetTextArea
              value={csvText}
              onChangeText={setCsvText}
              placeholder="name,amount,currency,schedule,start_date"
              numberOfLines={8}
            />
          </TextField>

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" onPress={handlePickFile}>
              Pick CSV file
            </Button>
            <Button variant="secondary" onPress={handlePreview}>
              Preview
            </Button>
            <Button variant="primary" onPress={handleImport}>
              Import
            </Button>
          </View>

          {fileName && (
            <Text style={{ fontSize: 12, color: colors.textMuted }} selectable>
              {fileName}
            </Text>
          )}
          {error && (
            <Text style={{ color: colors.danger }} selectable>
              {error}
            </Text>
          )}
        </GlassCardBody>
      </GlassCard>

      {previewRows.length > 0 && (
        <GlassCard>
          <GlassCardBody style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, color: colors.textMuted }} selectable>
              Preview (
              {rows.length}
              {' '}
              row(s))
            </Text>
            {previewRows.map(row => (
              <View key={`${row.name}-${row.start_date}-${row.amount}`} style={{ gap: 2 }}>
                <Text style={{ fontWeight: '600', color: colors.text }} selectable>
                  {row.name}
                  {' '}
                  ·
                  {row.amount}
                  {' '}
                  {row.currency}
                </Text>
                <Text style={{ color: colors.textMuted }} selectable>
                  {row.schedule}
                  {' '}
                  ·
                  {row.start_date}
                </Text>
              </View>
            ))}
          </GlassCardBody>
        </GlassCard>
      )}
    </ModalSheet>
  );
}
