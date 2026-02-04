import { useRouter } from 'expo-router';
import { Button, Card, Chip, Input, Label, TextField } from 'heroui-native';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBootstrap } from '@/lib/hooks/use-bootstrap';
import { useServiceTemplatesStore } from '@/lib/stores';

export default function AddSubscriptionScreen() {
  useBootstrap();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { templates } = useServiceTemplatesStore();
  const [searchValue, setSearchValue] = useState('');

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => template.name.toLowerCase().includes(searchValue.toLowerCase()));
  }, [templates, searchValue]);

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottom + 40, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button variant="secondary" onPress={() => router.back()}>
            Close
          </Button>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Add Subscription</Text>
          <Button variant="primary" onPress={() => router.push('/(modals)/subscription-form')}>
            Custom
          </Button>
        </View>

        <Card>
          <Card.Body style={{ gap: 10 }}>
            <Text style={{ fontSize: 14, opacity: 0.7 }}>
              Start from a service template or create from scratch.
            </Text>
            <TextField>
              <Label>Search templates</Label>
              <Input
                placeholder="Netflix, Spotify, Cursor..."
                value={searchValue}
                onChangeText={setSearchValue}
              />
            </TextField>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Chip>
                {templates.length}
                {' templates'}
              </Chip>
              <Chip>
                {filteredTemplates.length}
                {' visible'}
              </Chip>
            </View>
          </Card.Body>
        </Card>

        {filteredTemplates.map(template => (
          <Card key={template.id}>
            <Card.Header style={{ gap: 6 }}>
              <Card.Title>{template.name}</Card.Title>
              <Card.Description>
                Icon key:
                {' '}
                {template.iconKey}
              </Card.Description>
            </Card.Header>
            <Card.Footer>
              <Button
                variant="primary"
                onPress={() => router.push({ pathname: '/(modals)/subscription-form', params: { templateId: template.id } })}
              >
                Use template
              </Button>
            </Card.Footer>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
