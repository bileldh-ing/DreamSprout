import { getLocales } from 'expo-localization';
import { useAppStore } from '@/store/app-store';
import { en, type Strings } from './en';
import { fr } from './fr';

export type Lang = 'en' | 'fr';
export const LANGS: Lang[] = ['en', 'fr'];
const dictionaries: Record<Lang, Strings> = { en, fr };

export function deviceLanguage(): Lang {
  try {
    const code = getLocales()[0]?.languageCode ?? 'en';
    return code === 'fr' ? 'fr' : 'en';
  } catch {
    return 'en';
  }
}

/** Replace `{key}` placeholders. */
export function format(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function getStrings(lang: Lang): Strings {
  return dictionaries[lang] ?? en;
}

export function useStrings(): Strings {
  const lang = useAppStore((s) => s.settings.language);
  return getStrings(lang === 'system' ? deviceLanguage() : lang);
}
