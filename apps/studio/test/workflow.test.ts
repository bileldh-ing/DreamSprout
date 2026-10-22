import { seedStories, seedTimings } from '@dreamsprout/content';
import { describe, expect, it } from 'vitest';
import { canTransition, checklistComplete, emptyChecklist, newDraft, nextActions, slugify } from '@/lib/workflow';

const full = { sourceVerified: true, licenseVerified: true, illustrationsCleared: true, narrationCleared: true, noThirdPartyTrademarks: true };

describe('publish workflow', () => {
  const story = { ...seedStories[0]!, status: 'review' as const };

  it('publishes a valid story with a complete rights checklist', () => {
    expect(canTransition(story, 'published', full, seedTimings)).toEqual({ ok: true, reasons: [] });
  });

  it('blocks publishing without the rights checklist', () => {
    const r = canTransition(story, 'published', { ...full, narrationCleared: false }, seedTimings);
    expect(r.ok).toBe(false);
    expect(r.reasons.join()).toMatch(/Rights checklist/);
  });

  it('blocks publishing when timings are missing (alignment unfinished)', () => {
    const r = canTransition(story, 'published', full, {});
    expect(r.ok).toBe(false);
    expect(r.reasons.join()).toMatch(/timings/);
  });

  it('blocks illegal transitions', () => {
    expect(canTransition({ ...story, status: 'draft' }, 'published', full, seedTimings).ok).toBe(false);
    expect(canTransition({ ...story, status: 'archived' }, 'review', full, seedTimings).ok).toBe(false);
  });

  it('lists next actions per state', () => {
    expect(nextActions('draft').map((a) => a.to)).toEqual(['review']);
    expect(nextActions('review').map((a) => a.to)).toEqual(['draft', 'published']);
  });

  it('builds drafts and slugs', () => {
    expect(slugify('  Le Petit Éléphant!  ')).toBe('le-petit-elephant');
    const d = newDraft('x-y', 'X Y');
    expect(d.status).toBe('draft');
    expect(d.pages).toHaveLength(1);
    expect(checklistComplete(emptyChecklist())).toBe(false);
    expect(checklistComplete(full)).toBe(true);
    // A fresh draft cannot be sent to review: it has no narration timings yet.
    expect(canTransition(d, 'review', full, seedTimings).ok).toBe(false);
  });
});
