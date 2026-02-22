import { Stack, useRouter } from 'expo-router';
import { Button, Card } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Haptic } from '@/lib/haptics';

export default function NotFoundScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleBackToHome = () => {
    Haptic.Light();
    router.replace('/home');
  };

  return (
    <>
      <Stack.Screen options={{ title: t('not_found.title') }} />
      <View className="flex-1 items-center justify-center px-6">
        <Card className="w-full max-w-lg">
          <Card.Header>
            <Card.Title>{t('not_found.page_title')}</Card.Title>
            <Card.Description>{t('not_found.route_description')}</Card.Description>
          </Card.Header>
          <Card.Footer className="gap-3">
            <Button variant="primary" onPress={handleBackToHome}>
              {t('not_found.back_to_home')}
            </Button>
          </Card.Footer>
        </Card>
      </View>
    </>
  );
}
