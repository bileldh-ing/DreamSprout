/** DreamSprout design tokens — midnight navy + liquid glass + violet glow. */
export const colors = {
  bgTop: '#1a1f4b',
  bgBottom: '#0b0f24',
  bgDeep: '#070a1a',
  glassFill: 'rgba(255,255,255,0.08)',
  glassFillStrong: 'rgba(255,255,255,0.14)',
  glassBorder: 'rgba(255,255,255,0.18)',
  glassHighlight: 'rgba(255,255,255,0.32)',
  violet: '#7B6CF6',
  violetLight: '#9B8CFF',
  violetGlow: 'rgba(123,108,246,0.55)',
  moon: '#FFE7A3',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.72)',
  textFaint: 'rgba(255,255,255,0.5)',
  highlight: '#FFD66B',
  danger: '#FF7A8A',
  success: '#7EE2B8',
  pill: '#FFFFFF',
  pillText: '#141838',
} as const;

export const gradients = {
  background: [colors.bgTop, colors.bgBottom] as const,
  primary: [colors.violet, colors.violetLight] as const,
  cardScrim: ['rgba(11,15,36,0)', 'rgba(11,15,36,0.35)', 'rgba(11,15,36,0.92)'] as const,
};

export const radii = { sm: 12, md: 18, lg: 24, xl: 32, pill: 999 } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const type = {
  hero: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '800' as const },
  section: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  reader: { fontSize: 22, lineHeight: 34, fontWeight: '600' as const },
};

/** Minimum touch target in points (Apple HIG 44pt). */
export const HIT = 44;
