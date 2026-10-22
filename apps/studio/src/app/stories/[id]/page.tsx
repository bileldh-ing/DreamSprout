import { notFound } from 'next/navigation';
import { StoryEditor } from '@/components/StoryEditor';
import { getStory, timings } from '@/lib/repo';

export const dynamic = 'force-dynamic';

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getStory(id);
  if (!record) notFound();
  const all = timings();
  const pageTimings = Object.fromEntries(record.story.pages.map((p) => [p.timingKey, all[p.timingKey] ?? []]));
  return <StoryEditor initial={record} timings={pageTimings} />;
}
