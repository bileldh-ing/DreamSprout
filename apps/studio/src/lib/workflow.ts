import { validateLibrary, type Story, type StoryStatus, type TimingsFile } from '@dreamsprout/content';

export interface RightsChecklist {
  sourceVerified: boolean;
  licenseVerified: boolean;
  illustrationsCleared: boolean;
  narrationCleared: boolean;
  noThirdPartyTrademarks: boolean;
}

export const CHECKLIST_LABELS: Record<keyof RightsChecklist, string> = {
  sourceVerified: 'Source text verified (public domain, original, or licensed)',
  licenseVerified: 'Licence recorded with holder and notes',
  illustrationsCleared: 'Every illustration is first-party or licensed',
  narrationCleared: 'Narration is first-party or licensed (voice rights cleared)',
  noThirdPartyTrademarks: 'No third-party characters, brands or trademarks',
};

export const emptyChecklist = (): RightsChecklist => ({
  sourceVerified: false,
  licenseVerified: false,
  illustrationsCleared: false,
  narrationCleared: false,
  noThirdPartyTrademarks: false,
});

export const checklistComplete = (c: RightsChecklist) => Object.values(c).every(Boolean);

/** Allowed editorial transitions. Published content can only be archived or pulled back to draft. */
const TRANSITIONS: Record<StoryStatus, StoryStatus[]> = {
  draft: ['review'],
  review: ['draft', 'published'],
  published: ['draft', 'archived'],
  archived: ['draft'],
};

export interface TransitionCheck {
  ok: boolean;
  reasons: string[];
}

export function canTransition(story: Story, to: StoryStatus, checklist: RightsChecklist, timings: TimingsFile): TransitionCheck {
  const reasons: string[] = [];
  if (!TRANSITIONS[story.status].includes(to)) reasons.push(`Cannot move from ${story.status} to ${to}`);
  if (to === 'review' || to === 'published') {
    const v = validateLibrary([{ ...story, status: 'published' }], timings);
    for (const i of v.issues) reasons.push(`${i.page ? `Page ${i.page}: ` : ''}${i.message}`);
  }
  if (to === 'published' && !checklistComplete(checklist)) reasons.push('Rights checklist must be complete before publishing');
  return { ok: reasons.length === 0, reasons };
}

export function nextActions(status: StoryStatus): { to: StoryStatus; label: string }[] {
  const labels: Record<StoryStatus, string> = {
    draft: 'Back to draft',
    review: 'Submit for review',
    published: 'Publish',
    archived: 'Archive',
  };
  return TRANSITIONS[status].map((to) => ({ to, label: labels[to] }));
}

export function newDraft(id: string, title: string): Story {
  return {
    id,
    title,
    origin: 'DreamSprout',
    source: 'DreamSprout Original',
    license: { kind: 'original', name: 'DreamSprout Original', holder: 'DreamSprout', notes: 'Original story written for DreamSprout.' },
    ageBand: '4-6',
    minutes: 3,
    tags: ['Bedtime'],
    moral: 'Moral to be written.',
    synopsis: 'Synopsis to be written.',
    characters: 'Characters to be described.',
    language: 'en',
    status: 'draft',
    illustration: { credit: 'Illustrations created for DreamSprout', kind: 'static' },
    narration: { credit: 'Narration created for DreamSprout', voice: 'en-US-AnaNeural', kind: 'tts' },
    pages: [
      {
        index: 1,
        text: 'Page text to be written.',
        sceneDescription: 'Scene to be described.',
        image: `img/${id}-1.webp`,
        audio: `audio/${id}-1.mp3`,
        audioDurationSec: 1,
        timingKey: `${id}-1`,
      },
    ],
  };
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}
