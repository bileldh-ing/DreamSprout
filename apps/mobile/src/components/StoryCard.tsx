import type { Story } from '@dreamsprout/content';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { coverFor } from '@/content';
import { colors, gradients, radii } from '@/theme/tokens';
import { tap } from './Buttons';

interface Props {
  story: Story;
  onPress: () => void;
  width?: number | `${number}%`;
  height?: number;
  progress?: number;
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
}

/** Tall rounded story card with the cover art, a soft scrim and the title. */
export function StoryCard({ story, onPress, width = '100%', height = 230, progress, style, subtitle }: Props) {
  return (
    <Pressable
      testID={`story-card-${story.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${story.title}. ${subtitle ?? story.origin}`}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.card, { width, height, transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}
    >
      <Image source={coverFor(story)} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} accessible={false} />
      <LinearGradient colors={gradients.cardScrim} locations={[0.35, 0.6, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={2}>
          {story.title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {subtitle ?? story.origin}
        </Text>
        {progress !== undefined && progress > 0 && (
          <View style={styles.track} accessibilityLabel={`${Math.round(progress * 100)}%`}>
            <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
        )}
      </View>
      <View pointerEvents="none" style={styles.border} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg, overflow: 'hidden', backgroundColor: '#20265a' },
  meta: { position: 'absolute', left: 14, right: 14, bottom: 14 },
  title: { color: colors.text, fontSize: 16, fontWeight: '800', lineHeight: 20 },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  border: { ...StyleSheet.absoluteFill, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.glassBorder },
  track: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 8, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: colors.violetLight },
});
