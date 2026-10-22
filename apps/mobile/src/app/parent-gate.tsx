import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PillButton, tap } from '@/components/Buttons';
import { Glass } from '@/components/Glass';
import { useParentSession } from '@/features/parents/session';
import { createChallenge, initialGateState, isLocked, submitAnswer } from '@/features/parents/gate';
import { format, useStrings } from '@/i18n';
import { colors, radii } from '@/theme/tokens';

/** Parental gate shown before any adult-only area (settings, downloads, rights, data deletion). */
export default function ParentGate() {
  const t = useStrings();
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const [challenge, setChallenge] = useState(() => createChallenge());
  const [gate, setGate] = useState(initialGateState);
  const [message, setMessage] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const locked = isLocked(gate, now);

  useEffect(() => {
    if (!gate.lockedUntil) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [gate.lockedUntil]);

  const answer = (v: number) => {
    tap();
    const res = submitAnswer(gate, challenge, v, Date.now());
    setGate(res.state);
    if (res.passed) {
      useParentSession.getState().unlock();
      router.replace((next && next.startsWith('/parents') ? next : '/parents') as Href);
      return;
    }
    setChallenge(createChallenge());
    setNow(Date.now());
    setMessage(res.state.lockedUntil ? null : t.gate.wrong);
  };

  return (
    <View style={styles.backdrop}>
      <SafeAreaView style={styles.safe}>
        <Glass style={styles.card} strong intensity={60}>
          <Text style={styles.lock}>🔒</Text>
          <Text style={styles.title} accessibilityRole="header">
            {t.gate.title}
          </Text>
          <Text style={styles.body}>{t.gate.body}</Text>
          {locked ? (
            <Text style={styles.locked} testID="gate-locked">
              {format(t.gate.locked, { s: Math.ceil(((gate.lockedUntil ?? now) - now) / 1000) })}
            </Text>
          ) : (
            <>
              <Text style={styles.question} testID="gate-question">
                {format(t.gate.question, { a: challenge.a, b: challenge.b })}
              </Text>
              <View style={styles.grid}>
                {challenge.choices.map((c) => (
                  <Pressable
                    key={c}
                    testID={`gate-choice-${c}`}
                    accessibilityRole="button"
                    accessibilityLabel={String(c)}
                    onPress={() => answer(c)}
                    style={({ pressed }) => [styles.choice, pressed && { backgroundColor: colors.violet }]}
                  >
                    <Text style={styles.choiceText}>{c}</Text>
                  </Pressable>
                ))}
              </View>
              {message && <Text style={styles.wrong}>{message}</Text>}
            </>
          )}
          <View style={{ height: 52, marginTop: 18 }}>
            <PillButton label={t.gate.cancel} testID="gate-cancel" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          </View>
        </Glass>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(5,7,20,0.82)' },
  safe: { flex: 1, justifyContent: 'center', padding: 24, maxWidth: 480, width: '100%', alignSelf: 'center' },
  card: { padding: 24, alignItems: 'stretch' },
  lock: { fontSize: 36, textAlign: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  body: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: 6 },
  question: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 18, justifyContent: 'center' },
  choice: {
    width: '45%',
    minHeight: 56,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  choiceText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  wrong: { color: colors.danger, textAlign: 'center', marginTop: 12 },
  locked: { color: colors.moon, fontSize: 17, textAlign: 'center', marginTop: 24 },
});
