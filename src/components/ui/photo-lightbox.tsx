/**
 * PhotoLightbox Component
 * A full-screen modal to view photos with swipe-to-dismiss gesture
 */

import { X } from 'lucide-react-native';
import { useCallback } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  Text,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 100;

type PhotoLightboxProps = {
  /** The URI of the photo to display */
  photoUri: string | null;
  /** Callback when the lightbox should be closed */
  onClose: () => void;
  /** Aspect ratio of the photo (default: 3/4 for portrait) */
  aspectRatio?: number;
};

export function PhotoLightbox({
  photoUri,
  onClose,
  aspectRatio = 3 / 4,
}: PhotoLightboxProps) {
  const { t } = useTranslation();
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
      opacity.value = 1 - Math.abs(event.translationY) / (SCREEN_HEIGHT * 0.5);
    })
    .onEnd((event) => {
      if (Math.abs(event.translationY) > DISMISS_THRESHOLD) {
        translateY.value = withSpring(event.translationY > 0 ? SCREEN_HEIGHT : -SCREEN_HEIGHT);
        opacity.value = withSpring(0);
        runOnJS(handleClose)();
      }
      else {
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Reset animation values when modal opens
  const handleShow = useCallback(() => {
    translateY.value = 0;
    opacity.value = 1;
  }, [translateY, opacity]);

  return (
    <Modal
      visible={!!photoUri}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      onShow={handleShow}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View
          className="flex-1 items-center justify-center bg-black"
          style={animatedBackgroundStyle}
        >
          {/* Close button */}
          <Pressable
            onPress={handleClose}
            className="absolute top-14 right-4 z-10 size-10 items-center justify-center rounded-full bg-white/20"
          >
            <X size={24} color="#FFFFFF" />
          </Pressable>

          {/* Swipe to dismiss hint */}
          <Text className="absolute top-20 text-center text-sm text-white/60">
            {t('diary.lightbox_hint')}
          </Text>

          {/* Photo with pan gesture */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[{ width: '100%' }, animatedImageStyle]}>
              {photoUri && (
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: '100%', aspectRatio }}
                  resizeMode="contain"
                />
              )}
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}
