import { NextResponse } from 'next/server';
import { getStory, saveStory } from '@/lib/repo';
import { emptyChecklist, newDraft, slugify } from '@/lib/workflow';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { title?: string };
  const title = (body.title ?? '').trim();
  const id = slugify(title);
  if (title.length < 2 || !id) return NextResponse.json({ error: 'A title is required' }, { status: 400 });
  if (await getStory(id)) return NextResponse.json({ error: 'A story with this id already exists' }, { status: 409 });
  const rec = await saveStory(newDraft(id, title), emptyChecklist());
  return NextResponse.json(rec, { status: 201 });
}
