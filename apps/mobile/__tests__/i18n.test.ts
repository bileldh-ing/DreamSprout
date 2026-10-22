import { format, getStrings } from '@/i18n';
import { en } from '@/i18n/en';
import { fr } from '@/i18n/fr';

function keys(o: object, prefix = ''): string[] {
  return Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v as object, `${prefix}${k}.`) : [`${prefix}${k}`]));
}

describe('i18n', () => {
  it('French covers every English key', () => {
    expect(keys(fr).sort()).toEqual(keys(en).sort());
  });
  it('formats placeholders', () => {
    expect(format('Page {n} of {total}', { n: 1, total: 3 })).toBe('Page 1 of 3');
    expect(format('Hi {name}', {})).toBe('Hi {name}');
  });
  it('returns dictionaries', () => {
    expect(getStrings('fr').details.read).toBe('Lire le livre');
    expect(getStrings('en').details.read).toBe('Read Book');
  });
});
