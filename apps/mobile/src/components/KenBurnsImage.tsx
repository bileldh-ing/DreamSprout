import { Image, type ImageSource } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

interface Props {
  source: ImageSource | number | null;
  /** Changing the key restarts the slow pan. */
  animKey: string;
  motion: boolean;
  accessibilityLabel?: string;
}

/**
 * Per-page illustration: cross-fades between pages (expo-image transition) and
 * runs a slow Ken Burns pan/zoom. Static when reduced motion is requested.
 */
export function KenBurnsImage({ source, animKey, motion, accessibilityLabel }: Props) {
  const p = useSharedValue(0);
  useEffect(() => {
    cancelAnimation(p);
    p.value = 0;
    if (motion) p.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => cancelAnimation(p);
  }, [animKey, motion, p]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1.06 + p.value * 0.08 }, { translateX: -10 + p.value * 20 }, { translateY: 6 - p.value * 12 }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={motion ? { duration: 700, effect: 'cross-dissolve' } : 0}
        accessibilityLabel={accessibilityLabel}
      />
    </Animated.View>
  );
}
