import { AGE_BANDS, seedStories, type AgeBand } from '@dreamsprout/content';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip, PrimaryButton } from '@/components/Buttons';
import { Glass } from '@/components/Glass';
import { GradientBackground } from '@/components/GradientBackground';
import { coverFor } from '@/content';
import { useStrings } from '@/i18n';
import { useAppStore } from '@/store/app-store';
import { colors, radii } from '@/theme/tokens';

export default function Onboarding() {
  const t = useStrings();
  const router = useRouter();
  const complete = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState<AgeBand>('4-6');
  const hero = seedStories.find((s) => s.id === 'luna-firefly') ?? seedStories[0]!;

  if (step === 0) {
    return (
      <GradientBackground>
        <Image source={coverFor(hero)} style={styles.heroImg} contentFit="cover" accessible={false} />
        <LinearGradient colors={['rgba(11,15,36,0)', 'rgba(11,15,36,0.85)', '#0b0f24']} locations={[0, 0.55, 0.8]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.welcome}>
          <Text style={styles.brand}>🌱 {t.appName}</Text>
          <Text style={styles.welcomeTitle} accessibilityRole="header">
            {t.onboarding.welcomeTitle}
          </Text>
          <Text style={styles.welcomeBody}>{t.onboarding.welcomeBody}</Text>
          <View style={{ height: 56, marginTop: 28 }}>
            <PrimaryButton label={t.onboarding.start} onPress={() => setStep(1)} icon="sparkles" testID="onboarding-start" />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <Text style={styles.formTitle} accessibilityRole="header">
              {t.onboarding.profileTitle}
            </Text>
            <Glass style={styles.card}>
              <Text style={styles.label}>{t.onboarding.nameLabel}</Text>
              <TextInput
                testID="onboarding-name"
                value={name}
                onChangeText={setName}
                placeholder={t.onboarding.namePlaceholder}
                placeholderTextColor={colors.textFaint}
                style={styles.input}
                maxLength={20}
                autoCapitalize="words"
                autoComplete="off"
                autoCorrect={false}
                accessibilityLabel={t.onboarding.nameLabel}
              />
              <Text style={[styles.label, { marginTop: 18 }]}>{t.onboarding.ageLabel}</Text>
              <View style={styles.chips}>
                {AGE_BANDS.map((b) => (
                  <Chip key={b} label={b} selected={age === b} onPress={() => setAge(b)} testID={`onboarding-age-${b}`} />
                ))}
              </View>
            </Glass>
            <Text style={styles.note}>🔒 {t.onboarding.privacyNote}</Text>
            <View style={{ height: 56, marginTop: 20 }}>
              <PrimaryButton
                testID="onboarding-finish"
                label={t.onboarding.finish}
                icon="book"
                disabled={!name.trim()}
                onPress={() => {
                  complete(name, age);
                  router.replace('/');
                }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  heroImg: { position: 'absolute', top: 0, left: 0, right: 0, height: '65%' },
  welcome: { flex: 1, justifyContent: 'flex-end', padding: 24, paddingBottom: 40, maxWidth: 560, width: '100%', alignSelf: 'center' },
  brand: { color: colors.textMuted, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  welcomeTitle: { color: '#fff', fontSize: 38, lineHeight: 44, fontWeight: '800', letterSpacing: -0.5 },
  welcomeBody: { color: colors.textMuted, fontSize: 17, lineHeight: 25, marginTop: 12 },
  form: { padding: 24, paddingTop: 48, maxWidth: 560, width: '100%', alignSelf: 'center' },
  formTitle: { color: '#fff', fontSize: 30, fontWeight: '800', marginBottom: 20 },
  card: { padding: 20 },
  label: { color: colors.textMuted, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    color: '#fff',
    fontSize: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 50,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  note: { color: colors.textFaint, fontSize: 13, lineHeight: 19, marginTop: 16 },
});
