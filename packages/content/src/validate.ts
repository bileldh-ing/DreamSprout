import { storiesFileSchema, timingsFileSchema, type Story, type TimingsFile } from './schema';

export interface ValidationIssue {
  storyId: string;
  page?: number;
  message: string;
}

export interface ValidateOptions {
  /** Return true when the given relative asset path (e.g. `img/x-1.webp`) exists. */
  assetExists?: (relPath: string) => boolean;
  /** Require status=published stories to carry full rights data (always true for the seed). */
  requireRights?: boolean;
}

/**
 * Validates the content library. Fails when a story lacks source/licence,
 * a page lacks image/audio, or narration timings are missing or malformed.
 */
export function validateLibrary(
  storiesRaw: unknown,
  timingsRaw: unknown,
  opts: ValidateOptions = {},
): { ok: boolean; issues: ValidationIssue[]; stories: Story[] } {
  const issues: ValidationIssue[] = [];
  const parsed = storiesFileSchema.safeParse(storiesRaw);
  if (!parsed.success) {
    for (const iss of parsed.error.issues) {
      const [idx] = iss.path;
      const story = Array.isArray(storiesRaw) && typeof idx === 'number' ? (storiesRaw[idx] as { id?: string }) : undefined;
      issues.push({ storyId: story?.id ?? `#${String(idx)}`, message: `${iss.path.join('.')}: ${iss.message}` });
    }
    return { ok: false, issues, stories: [] };
  }
  const timingsParsed = timingsFileSchema.safeParse(timingsRaw);
  if (!timingsParsed.success) {
    issues.push({ storyId: '*', message: `timings file invalid: ${timingsParsed.error.issues[0]?.message ?? 'unknown'}` });
    return { ok: false, issues, stories: parsed.data };
  }
  const timings: TimingsFile = timingsParsed.data;
  const seen = new Set<string>();
  for (const story of parsed.data) {
    if (seen.has(story.id)) issues.push({ storyId: story.id, message: 'duplicate story id' });
    seen.add(story.id);
    if (!story.source.trim()) issues.push({ storyId: story.id, message: 'missing source' });
    if (!story.license.name.trim()) issues.push({ storyId: story.id, message: 'missing licence' });
    story.pages.forEach((page, i) => {
      if (page.index !== i + 1) issues.push({ storyId: story.id, page: page.index, message: 'page index out of order' });
      if (!page.image) issues.push({ storyId: story.id, page: page.index, message: 'missing image' });
      if (!page.audio) issues.push({ storyId: story.id, page: page.index, message: 'missing audio' });
      if (opts.assetExists) {
        if (!opts.assetExists(page.image)) issues.push({ storyId: story.id, page: page.index, message: `image file not found: ${page.image}` });
        if (!opts.assetExists(page.audio)) issues.push({ storyId: story.id, page: page.index, message: `audio file not found: ${page.audio}` });
      }
      const words = timings[page.timingKey];
      if (!words || words.length === 0) {
        issues.push({ storyId: story.id, page: page.index, message: `missing narration timings for ${page.timingKey}` });
        return;
      }
      let prev = -1;
      for (const [start] of words) {
        if (start < prev) {
          issues.push({ storyId: story.id, page: page.index, message: 'timings are not monotonic' });
          break;
        }
        prev = start;
      }
      const last = words[words.length - 1]!;
      if (last[0] > page.audioDurationSec + 0.5) {
        issues.push({ storyId: story.id, page: page.index, message: 'timings extend past audio duration' });
      }
    });
  }
  return { ok: issues.length === 0, issues, stories: parsed.data };
}
