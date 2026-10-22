import { STORY_STATUSES, type StoryStatus } from '@dreamsprout/content';
import Link from 'next/link';
import { NewStoryButton } from '@/components/NewStoryButton';
import { listStories } from '@/lib/repo';
import { checklistComplete } from '@/lib/workflow';

export const dynamic = 'force-dynamic';

export default async function StoryList({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = STORY_STATUSES.includes(status as StoryStatus) ? (status as StoryStatus) : undefined;
  const all = await listStories();
  const list = filter ? all.filter((r) => r.story.status === filter) : all;
  const counts = Object.fromEntries(STORY_STATUSES.map((s) => [s, all.filter((r) => r.story.status === s).length]));

  return (
    <main>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 32 }}>Stories</h1>
        <NewStoryButton />
      </div>
      <nav className="filters" aria-label="Filter by status">
        <Link href="/" className={`chip ${!filter ? 'on' : ''}`}>
          All ({all.length})
        </Link>
        {STORY_STATUSES.map((s) => (
          <Link key={s} href={`/?status=${s}`} className={`chip ${filter === s ? 'on' : ''}`}>
            {s} ({counts[s]})
          </Link>
        ))}
      </nav>
      <section className="grid">
        {list.map(({ story, checklist }) => (
          <Link key={story.id} href={`/stories/${story.id}`} className="glass card" data-testid={`story-${story.id}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/stories/${story.pages[0]?.image ?? ''}`} alt="" />
            <div className="body">
              <h3>{story.title}</h3>
              <div className="row" style={{ gap: 6 }}>
                <span className={`badge ${story.status}`}>{story.status}</span>
                <span className="faint">
                  {story.ageBand} · {story.pages.length} pages · {checklistComplete(checklist) ? 'rights ✓' : 'rights pending'}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {list.length === 0 && <p className="muted">No stories in this state.</p>}
      </section>
    </main>
  );
}
