import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router, Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NativeSheetScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View className="relative flex-1 bg-black/10 px-10" style={{ paddingBottom: insets.bottom }}>
        <BlurView
          intensity={10}
          tint="dark"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <View className="absolute top-0 right-0 flex w-full flex-row items-center justify-end p-3">
          <Pressable className="rounded-full bg-white/5 p-3" onPress={() => router.back()}>
            <Feather name="x" size={20} color="white" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center pt-4">
          <View className="mb-7 flex size-20 items-center justify-center rounded-full bg-white/10">
            <Feather name="check" size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold text-white">Added to cart</Text>
          <Text className="text-lg text-white/60">You have 1 item in your cart.</Text>
        </View>

        {/* Bottom button */}
        <Pressable
          onPress={() => router.back()}
          className="flex items-center justify-center rounded-full bg-white py-4"
        >
          <Text className="text-lg font-semibold text-black">Go to checkout</Text>
        </Pressable>
      </View>
    </>
  );
}
