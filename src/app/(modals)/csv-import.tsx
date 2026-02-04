import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { Input, Pressable, ScrollView, Text, View } from '@/components/ui';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCategoriesStore, useListsStore, usePaymentMethodsStore, useSubscriptionsStore } from '@/lib/stores';

const REQUIRED_COLUMNS = ['name', 'amount', 'currency', 'schedule', 'start_date'];

function parseCsv(raw: string) {
  const lines = raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { rows: [], error: 'No data found.' };
  }

  const header = lines[0].split(',').map(item => item.trim().toLowerCase());
  const missing = REQUIRED_COLUMNS.filter(col => !header.includes(col));
  if (missing.length > 0) {
    return { rows: [], error: `Missing columns: ${missing.join(', ')}` };
  }

  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map(item => item.trim());
    const row: Record<string, string> = {};
    header.forEach((col, idx) => {
      row[col] = values[idx] ?? '';
    });
    return row;
  });

  return { rows, error: null };
}

export default function CsvImportScreen() {
  useBootstrap();
  const router = useRouter();
  const { colors } = useTheme();
  const { add: addCategory } = useCategoriesStore();
  const { add: addList } = useListsStore();
  const { add: addMethod } = usePaymentMethodsStore();
  const { add: addSubscription } = useSubscriptionsStore();

  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const preview = useMemo(() => rows.slice(0, 5), [rows]);

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
    const result = parseCsv(csvText);
    if (result.error) {
      setError(result.error);
      return;
    }

    result.rows.forEach((row) => {
      const name = row.name || 'Subscription';
      const amount = Number(row.amount || 0);
      const currency = row.currency || 'EUR';
      const scheduleType = (row.schedule || 'monthly').toLowerCase();
      const startDate = row.start_date || new Date().toISOString().slice(0, 10);

      const categoryId = row.category ? addCategory(row.category, '#4F46E5').id : 'cat-utilities';
      const listId = row.list ? addList(row.list).id : 'list-personal';
      const paymentMethodId = row.payment_method ? addMethod(row.payment_method).id : undefined;

      addSubscription({
        name,
        status: (row.status as any) || 'active',
        iconType: 'builtIn',
        iconKey: 'custom',
        amount: Number.isFinite(amount) ? amount : 0,
        currency,
        scheduleType: scheduleType as any,
        intervalCount: 1,
        intervalUnit: undefined,
        billingAnchor: startDate,
        startDate,
        categoryId,
        listId,
        paymentMethodId,
        notificationMode: 'default',
        notes: row.notes || undefined,
      });
    });

    router.back();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-base" style={{ color: colors.primary }}>
              Close
            </Text>
          </Pressable>
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            CSV Import
          </Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <View className="mt-6 rounded-3xl p-4" style={{ backgroundColor: colors.card }}>
          <Text className="text-sm" style={{ color: colors.secondaryText }}>
            Paste CSV text matching the strict template.
          </Text>
          <Input
            label="CSV"
            value={csvText}
            onChangeText={setCsvText}
            placeholder="name,amount,currency,schedule,start_date"
            multiline
            style={{ minHeight: 140 }}
          />
          <Pressable
            onPress={handlePickFile}
            className="mt-2 items-center justify-center rounded-2xl py-3"
            style={{ backgroundColor: colors.background }}
          >
            <Text className="text-sm" style={{ color: colors.text }}>
              Pick CSV File
            </Text>
          </Pressable>
          {fileName && (
            <Text className="mt-2 text-xs" style={{ color: colors.secondaryText }}>
              Selected:
              {' '}
              {fileName}
            </Text>
          )}
          {error && (
            <Text className="text-xs" style={{ color: colors.error }}>
              {error}
            </Text>
          )}
          <Pressable
            onPress={handlePreview}
            className="mt-2 items-center justify-center rounded-2xl py-3"
            style={{ backgroundColor: colors.background }}
          >
            <Text className="text-sm" style={{ color: colors.text }}>
              Preview
            </Text>
          </Pressable>
        </View>

        {preview.length > 0 && (
          <View className="mt-4 rounded-3xl p-4" style={{ backgroundColor: colors.card }}>
            <Text className="text-sm font-semibold" style={{ color: colors.text }}>
              Preview
              {' '}
              (
              {rows.length}
              {' '}
              rows)
            </Text>
            {preview.map(row => (
              <View key={`${row.name}-${row.start_date}-${row.amount}`} className="mt-3">
                <Text className="text-sm" style={{ color: colors.text }}>
                  {row.name}
                  {' '}
                  ·
                  {' '}
                  {row.amount}
                  {' '}
                  {row.currency}
                </Text>
                <Text className="text-xs" style={{ color: colors.secondaryText }}>
                  {row.schedule}
                  {' '}
                  ·
                  {' '}
                  {row.start_date}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={handleImport}
          className="mt-6 items-center justify-center rounded-2xl py-4"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-base font-semibold" style={{ color: colors.headerText }}>
            Import
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
