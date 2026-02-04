import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Button, Input, Label, TextField, useToast } from 'heroui-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { GlassCard, GlassCardBody } from '@/components/glass-card';
import { ModalHeader } from '@/components/modal-header';
import { ScreenShell } from '@/components/screen-shell';
import { ServiceIcon } from '@/components/service-icon';
import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useTheme } from '@/lib/hooks/use-theme';
import { useServiceTemplatesStore } from '@/lib/stores';

const IMPORT_OPTIONS = [
  { id: 'notion', label: 'Import from Notion', symbol: 'doc.richtext' },
  { id: 'sheets', label: 'Import from Sheets', symbol: 'tablecells' },
  { id: 'file', label: 'Import from file', symbol: 'tray.and.arrow.down' },
];

export default function AddSubscriptionScreen() {
  useBootstrap();
  const router = useRouter();
  const { toast } = useToast();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { templates } = useServiceTemplatesStore();
  const [searchValue, setSearchValue] = useState('');

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => template.name.toLowerCase().includes(searchValue.toLowerCase()));
  }, [templates, searchValue]);

  const tileGap = 12;
  const tileWidth = Math.floor((width - 40 - tileGap) / 2);

  const handleImport = (id: string) => {
    if (id === 'file') {
      router.push('/(modals)/csv-import');
      return;
    }

    toast.show('Import connector coming soon');
  };

  return (
    <>
      <ModalHeader title="Add Subscription" />
      <ScreenShell>
        <GlassCard>
          <GlassCardBody style={{ gap: 12 }}>
            <Text style={{ fontSize: 13, color: colors.textMuted }} selectable>
              Bring in services fast or start from scratch.
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {IMPORT_OPTIONS.map(option => (
                <Pressable key={option.id} onPress={() => handleImport(option.id)}>
                  <View
                    style={{
                      width: 140,
                      padding: 12,
                      borderRadius: 20,
                      borderCurve: 'continuous',
                      backgroundColor: colors.surfaceMuted,
                      borderWidth: 1,
                      borderColor: colors.surfaceBorder,
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        borderCurve: 'continuous',
                        backgroundColor: colors.surface,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Image
                        source={`sf:${option.symbol}`}
                        style={{ width: 18, height: 18 }}
                        tintColor={colors.text}
                      />
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }} selectable>
                      {option.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            <Button variant="secondary" onPress={() => router.push('/(modals)/subscription-form')}>
              Create custom subscription
            </Button>
          </GlassCardBody>
        </GlassCard>

        <GlassCard>
          <GlassCardBody style={{ gap: 12 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted, letterSpacing: 1 }} selectable>
              POPULAR SERVICES
            </Text>
            <TextField>
              <Label>Search services</Label>
              <Input placeholder="Netflix, Spotify, Cursor..." value={searchValue} onChangeText={setSearchValue} />
            </TextField>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: tileGap }}>
              {filteredTemplates.map(template => (
                <Pressable
                  key={template.id}
                  onPress={() =>
                    router.push({ pathname: '/(modals)/subscription-form', params: { templateId: template.id } })
                  }
                >
                  <View
                    style={{
                      width: tileWidth,
                      padding: 14,
                      borderRadius: 22,
                      borderCurve: 'continuous',
                      backgroundColor: colors.surfaceMuted,
                      borderWidth: 1,
                      borderColor: colors.surfaceBorder,
                      gap: 10,
                      alignItems: 'center',
                    }}
                  >
                    <ServiceIcon iconKey={template.iconKey} size={48} />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }} selectable>
                      {template.name}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </GlassCardBody>
        </GlassCard>
      </ScreenShell>
    </>
  );
}
