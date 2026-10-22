'use client';

import { AGE_BANDS, LICENSE_KINDS, type Story, type StoryStatus, type TimingsFile } from '@dreamsprout/content';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { StudioRecord } from '@/lib/repo';
import { canTransition, CHECKLIST_LABELS, checklistComplete, nextActions, type RightsChecklist } from '@/lib/workflow';

interface Props {
  initial: StudioRecord;
  timings: TimingsFile;
}

export function StoryEditor({ initial, timings }: Props) {
  const [story, setStory] = useState<Story>(initial.story);
  const [checklist, setChecklist] = useState<RightsChecklist>(initial.checklist);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string; issues?: string[] } | null>(null);

  const set = <K extends keyof Story>(key: K, value: Story[K]) => setStory((s) => ({ ...s, [key]: value }));
  const setPage = (i: number, patch: Partial<Story['pages'][number]>) =>
    setStory((s) => ({ ...s, pages: s.pages.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) }));

  const publishCheck = useMemo(() => canTransition({ ...story, status: 'review' }, 'published', checklist, timings), [story, checklist, timings]);

  const save = async (status: StoryStatus = story.status) => {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/stories/${story.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ story: { ...story, status }, checklist }),
    });
    const json = (await res.json()) as { story?: Story; issues?: string[]; error?: string };
    setSaving(false);
    if (res.ok && json.story) {
      setStory(json.story);
      setMessage({ ok: true, text: status !== story.status ? `Moved to ${status}` : 'Saved' });
    } else {
      setMessage({ ok: false, text: json.error ?? 'Save failed', issues: json.issues });
    }
  };

  const addPage = () =>
    setStory((s) => {
      const n = s.pages.length + 1;
      return {
        ...s,
        pages: [
          ...s.pages,
          {
            index: n,
            text: 'Page text to be written.',
            sceneDescription: 'Scene to be described.',
            image: `img/${s.id}-${n}.webp`,
            audio: `audio/${s.id}-${n}.mp3`,
            audioDurationSec: 1,
            timingKey: `${s.id}-${n}`,
          },
        ],
      };
    });

  return (
    <main>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Link href="/" className="faint">
            ← All stories
          </Link>
          <h1 style={{ margin: '6px 0 0', fontSize: 30 }}>{story.title}</h1>
        </div>
        <div className="row">
          <span className={`badge ${story.status}`} data-testid="status">
            {story.status}
          </span>
          <button className="btn btn-ghost" disabled={saving} onClick={() => save()}>
            Save
          </button>
          {nextActions(story.status).map((a) => {
            const blocked = a.to === 'published' && !publishCheck.ok;
            return (
              <button
                key={a.to}
                className={a.to === 'published' ? 'btn btn-primary' : 'btn btn-pill'}
                disabled={saving || blocked}
                title={blocked ? publishCheck.reasons.join('\n') : undefined}
                onClick={() => save(a.to)}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {message && (
        <div className="glass panel" style={{ marginBottom: 16 }} role="status">
          <span className={message.ok ? 'ok' : 'issues'}>{message.text}</span>
          {message.issues && (
            <ul className="issues">
              {message.issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="editor">
        <section>
          <div className="glass panel">
            <h2>Story</h2>
            <label htmlFor="title">Title</label>
            <input id="title" value={story.title} onChange={(e) => set('title', e.target.value)} />
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="age">Age band</label>
                <select id="age" value={story.ageBand} onChange={(e) => set('ageBand', e.target.value as Story['ageBand'])}>
                  {AGE_BANDS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="mins">Minutes</label>
                <input id="mins" type="number" min={1} max={60} value={story.minutes} onChange={(e) => set('minutes', Number(e.target.value) || 1)} />
              </div>
            </div>
            <label htmlFor="tags">Tags (comma separated)</label>
            <input
              id="tags"
              value={story.tags.join(', ')}
              onChange={(e) =>
                set(
                  'tags',
                  e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                )
              }
            />
            <label htmlFor="synopsis">Synopsis</label>
            <textarea id="synopsis" value={story.synopsis} onChange={(e) => set('synopsis', e.target.value)} />
            <label htmlFor="moral">Moral</label>
            <input id="moral" value={story.moral} onChange={(e) => set('moral', e.target.value)} />
          </div>

          <h2 style={{ margin: '24px 0 4px' }}>Pages</h2>
          {story.pages.map((p, i) => {
            const words = timings[p.timingKey]?.length ?? 0;
            return (
              <div key={p.index} className="glass page">
                <div>
                  <img src={`/stories/${p.image}`} alt={p.sceneDescription} />
                  <div className="drop">
                    Illustration: {p.image}
                    <br />
                    Narration: {p.audio}
                    <br />
                    <span>Uploads go to Supabase Storage (illustrations / narration buckets) when the studio is connected.</span>
                  </div>
                </div>
                <div>
                  <strong>Page {p.index}</strong>{' '}
                  <span className={words ? 'ok' : 'issues'}>{words ? `✓ ${words} aligned words` : 'alignment unfinished (no narration timings)'}</span>
                  <label htmlFor={`text-${i}`}>Text</label>
                  <textarea id={`text-${i}`} value={p.text} onChange={(e) => setPage(i, { text: e.target.value })} />
                  <label htmlFor={`scene-${i}`}>Scene description (illustration brief / alt text)</label>
                  <input id={`scene-${i}`} value={p.sceneDescription} onChange={(e) => setPage(i, { sceneDescription: e.target.value })} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-ghost" onClick={addPage}>
              + Add page
            </button>
          </div>
        </section>

        <aside>
          <div className="glass panel">
            <h2>Source & licence</h2>
            <label htmlFor="source">Source</label>
            <input id="source" value={story.source} onChange={(e) => set('source', e.target.value)} />
            <label htmlFor="lkind">Licence type</label>
            <select
              id="lkind"
              value={story.license.kind}
              onChange={(e) => set('license', { ...story.license, kind: e.target.value as Story['license']['kind'] })}
            >
              {LICENSE_KINDS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
            <label htmlFor="lname">Licence name</label>
            <input id="lname" value={story.license.name} onChange={(e) => set('license', { ...story.license, name: e.target.value })} />
            <label htmlFor="lholder">Rights holder</label>
            <input id="lholder" value={story.license.holder} onChange={(e) => set('license', { ...story.license, holder: e.target.value })} />
            <label htmlFor="lnotes">Notes</label>
            <textarea id="lnotes" value={story.license.notes} onChange={(e) => set('license', { ...story.license, notes: e.target.value })} />
            <p className="faint">🎨 {story.illustration.credit}</p>
            <p className="faint">🎙️ {story.narration.credit}</p>
          </div>

          <div className="glass panel" style={{ marginTop: 16 }}>
            <h2>Rights checklist</h2>
            {(Object.keys(CHECKLIST_LABELS) as (keyof RightsChecklist)[]).map((k) => (
              <label key={k} className="check">
                <input type="checkbox" checked={checklist[k]} onChange={(e) => setChecklist((c) => ({ ...c, [k]: e.target.checked }))} />
                <span>{CHECKLIST_LABELS[k]}</span>
              </label>
            ))}
            <p className={checklistComplete(checklist) ? 'ok' : 'issues'}>{checklistComplete(checklist) ? 'Rights complete' : 'Required before publishing'}</p>
          </div>

          <div className="glass panel" style={{ marginTop: 16 }}>
            <h2>Publish readiness</h2>
            {publishCheck.ok ? (
              <p className="ok">Ready to publish ✓</p>
            ) : (
              <ul className="issues">
                {publishCheck.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
            <p className="faint">Workflow: draft → review → published (→ archived). The database re-checks rights on publish.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
