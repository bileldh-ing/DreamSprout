import { storySchema } from '@dreamsprout/content';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStory, saveStory, timings } from '@/lib/repo';
import { canTransition } from '@/lib/workflow';

const checklistSchema = z.object({
  sourceVerified: z.boolean(),
  licenseVerified: z.boolean(),
  illustrationsCleared: z.boolean(),
  narrationCleared: z.boolean(),
  noThirdPartyTrademarks: z.boolean(),
});
const bodySchema = z.object({ story: storySchema, checklist: checklistSchema });

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rec = await getStory(id);
  return rec ? NextResponse.json(rec) : NextResponse.json({ error: 'not_found' }, { status: 404 });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid', issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) }, { status: 400 });
  }
  const existing = await getStory(id);
  if (!existing || parsed.data.story.id !== id) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const { story, checklist } = parsed.data;
  if (story.status !== existing.story.status) {
    const check = canTransition({ ...story, status: existing.story.status }, story.status, checklist, timings());
    if (!check.ok) return NextResponse.json({ error: 'transition_blocked', issues: check.reasons }, { status: 422 });
  }
  try {
    return NextResponse.json(await saveStory(story, checklist));
  } catch (e) {
    return NextResponse.json({ error: 'save_failed', issues: [(e as Error).message] }, { status: 500 });
  }
}
