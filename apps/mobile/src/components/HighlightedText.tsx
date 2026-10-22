import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { Token } from '@/features/player/timing';
import type { SubtitleMode } from '@/store/app-store';
import { colors, type as typo } from '@/theme/tokens';

interface Props {
  tokens: Token[];
  activeToken: number;
  mode: SubtitleMode;
  onWordPress?: (tokenIndex: number) => void;
  fontScale?: number;
}

const Word = memo(function Word({
  token,
  index,
  state,
  onPress,
}: {
  token: Token;
  index: number;
  state: 'active' | 'sentence' | 'spoken' | 'idle';
  onPress?: (i: number) => void;
}) {
  return (
    <Text
      testID={`word-${index}`}
      onPress={onPress ? () => onPress(index) : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      style={[state === 'active' && styles.active, state === 'sentence' && styles.sentence, state === 'spoken' && styles.spoken]}
    >
      {token.text}{' '}
    </Text>
  );
});

/**
 * Story text with karaoke-style highlighting. Only words whose state changes re-render
 * (memoised spans), so a 10 Hz playback clock does not repaint the whole page.
 */
export function HighlightedText({ tokens, activeToken, mode, onWordPress, fontScale = 1 }: Props) {
  const activeSentence = activeToken >= 0 ? tokens[activeToken]?.sentence : -1;
  return (
    <Text
      style={[styles.base, { fontSize: typo.reader.fontSize * fontScale, lineHeight: typo.reader.lineHeight * fontScale }]}
      accessibilityRole="text"
      accessibilityLabel={tokens.map((t) => t.text).join(' ')}
    >
      {tokens.map((tok, i) => {
        let state: 'active' | 'sentence' | 'spoken' | 'idle' = 'idle';
        if (mode === 'word') state = i === activeToken ? 'active' : i < activeToken ? 'spoken' : 'idle';
        else if (mode === 'sentence') state = tok.sentence === activeSentence ? 'sentence' : 'idle';
        return <Word key={i} token={tok} index={i} state={state} onPress={onWordPress} />;
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { color: colors.text, fontWeight: typo.reader.fontWeight },
  active: { color: colors.highlight, textShadowColor: 'rgba(255,214,107,0.6)', textShadowRadius: 10 },
  sentence: { color: colors.highlight },
  spoken: { color: 'rgba(255,255,255,0.95)' },
});
