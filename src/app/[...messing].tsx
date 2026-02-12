import { Stack, useRouter } from 'expo-router';
import { Button, Card } from 'heroui-native';
import { View } from 'react-native';

import { Haptic } from '@/lib/haptics';

export default function NotFoundScreen() {
  const router = useRouter();

  const handleBackToHome = () => {
    Haptic.Light();
    router.replace('/home');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View className="flex-1 items-center justify-center px-6">
        <Card className="w-full max-w-lg">
          <Card.Header>
            <Card.Title>Page not found</Card.Title>
            <Card.Description>This route does not exist in the new HeroUI flow.</Card.Description>
          </Card.Header>
          <Card.Footer className="gap-3">
            <Button variant="primary" onPress={handleBackToHome}>
              Back to Home
            </Button>
          </Card.Footer>
        </Card>
      </View>
    </>
  );
}
