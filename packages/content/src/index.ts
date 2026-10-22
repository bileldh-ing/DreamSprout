import storiesJson from '../data/stories.json';
import timingsJson from '../data/timings.json';
import type { AgeBand, Story, TimingsFile, WordTiming } from './schema';

export * from './schema';
export * from './validate';
export * from './library';

/** The bundled seed library (published, rights-cleared). Validated in CI by `npm run validate:content`. */
export const seedStories = storiesJson as unknown as Story[];
export const seedTimings = timingsJson as unknown as TimingsFile;

export function getStory(id: string): Story | undefined {
  return seedStories.find((s) => s.id === id);
}

export function getPageTimings(timingKey: string): WordTiming[] {
  return seedTimings[timingKey] ?? [];
}

export type { AgeBand };
