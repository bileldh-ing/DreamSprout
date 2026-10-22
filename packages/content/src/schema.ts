import { z } from 'zod';

export const AGE_BANDS = ['3-5', '4-6', '6-8'] as const;
export const STORY_STATUSES = ['draft', 'review', 'published', 'archived'] as const;
export const LICENSE_KINDS = ['public-domain', 'original', 'licensed', 'cc-by', 'cc-by-sa'] as const;

export const ageBandSchema = z.enum(AGE_BANDS);
export const storyStatusSchema = z.enum(STORY_STATUSES);

export const licenseSchema = z.object({
  kind: z.enum(LICENSE_KINDS),
  name: z.string().min(3),
  holder: z.string().min(2),
  notes: z.string().min(3),
  url: z.string().url().optional(),
});

/** One narrated word: [startSec, durationSec, word] as produced by the TTS word-boundary stream. */
export const wordTimingSchema = z.tuple([z.number().nonnegative(), z.number().nonnegative(), z.string().min(1)]);
export const pageTimingsSchema = z.array(wordTimingSchema);
export const timingsFileSchema = z.record(z.string(), pageTimingsSchema);

export const storyPageSchema = z.object({
  index: z.number().int().positive(),
  text: z.string().min(10),
  sceneDescription: z.string().min(5),
  image: z.string().regex(/^img\/[a-z0-9-]+\.(webp|png|jpg)$/),
  audio: z.string().regex(/^audio\/[a-z0-9-]+\.(mp3|m4a|aac)$/),
  audioDurationSec: z.number().positive(),
  timingKey: z.string().min(3),
});

export const storySchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(2),
  origin: z.string().min(2),
  source: z.string().min(5),
  license: licenseSchema,
  ageBand: ageBandSchema,
  minutes: z.number().int().positive().max(60),
  tags: z.array(z.string().min(2)).min(1),
  moral: z.string().min(3),
  synopsis: z.string().min(10),
  characters: z.string().min(3),
  language: z.string().length(2),
  status: storyStatusSchema,
  illustration: z.object({ credit: z.string().min(5), kind: z.enum(['static', 'parallax', 'vector', 'video']) }),
  narration: z.object({ credit: z.string().min(5), voice: z.string().min(2), kind: z.enum(['human', 'tts']) }),
  pages: z.array(storyPageSchema).min(1),
});

export const storiesFileSchema = z.array(storySchema);

export type AgeBand = z.infer<typeof ageBandSchema>;
export type StoryStatus = z.infer<typeof storyStatusSchema>;
export type License = z.infer<typeof licenseSchema>;
export type WordTiming = z.infer<typeof wordTimingSchema>;
export type TimingsFile = z.infer<typeof timingsFileSchema>;
export type StoryPage = z.infer<typeof storyPageSchema>;
export type Story = z.infer<typeof storySchema>;
