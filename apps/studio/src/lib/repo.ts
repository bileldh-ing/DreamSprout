import 'server-only';
import { seedStories, seedTimings, storySchema, type Story, type TimingsFile } from '@dreamsprout/content';
import { createClient } from '@supabase/supabase-js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { emptyChecklist, type RightsChecklist } from './workflow';

export interface StudioRecord {
  story: Story;
  checklist: RightsChecklist;
  updatedAt: string;
}

const LOCAL_DIR = join(process.cwd(), '.studio-data');
const LOCAL_FILE = join(LOCAL_DIR, 'stories.json');

/** Supabase when the server has a service-role key; otherwise a local JSON store seeded from the bundled library. */
export function dataMode(): 'supabase' | 'local' {
  return process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? 'supabase' : 'local';
}

function supabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

const fullChecklist = (): RightsChecklist => ({
  sourceVerified: true,
  licenseVerified: true,
  illustrationsCleared: true,
  narrationCleared: true,
  noThirdPartyTrademarks: true,
});

function readLocal(): Record<string, StudioRecord> {
  if (existsSync(LOCAL_FILE)) return JSON.parse(readFileSync(LOCAL_FILE, 'utf8')) as Record<string, StudioRecord>;
  const now = new Date().toISOString();
  return Object.fromEntries(seedStories.map((s) => [s.id, { story: s, checklist: fullChecklist(), updatedAt: now }]));
}

function writeLocal(db: Record<string, StudioRecord>) {
  mkdirSync(LOCAL_DIR, { recursive: true });
  writeFileSync(LOCAL_FILE, JSON.stringify(db, null, 1));
}

export function timings(): TimingsFile {
  return seedTimings;
}

interface Row {
  id: string;
  title: string;
  origin: string;
  source: string;
  age_band: Story['ageBand'];
  minutes: number;
  tags: string[];
  moral: string;
  synopsis: string;
  characters: string;
  language: string;
  status: Story['status'];
  illustration_credit: string;
  illustration_kind: Story['illustration']['kind'];
  narration_credit: string;
  narration_voice: string;
  narration_kind: Story['narration']['kind'];
  updated_at: string;
  content_licenses: Story['license'];
  story_pages: { page_index: number; text: string; scene_description: string | null; audio_duration_sec: number | null }[];
  rights_checklist: Record<string, boolean> | null;
}

function fromRow(r: Row): StudioRecord {
  const pages = [...r.story_pages].sort((a, b) => a.page_index - b.page_index);
  const rc = r.rights_checklist ?? {};
  return {
    story: {
      id: r.id,
      title: r.title,
      origin: r.origin,
      source: r.source,
      license: { kind: r.content_licenses.kind, name: r.content_licenses.name, holder: r.content_licenses.holder, notes: r.content_licenses.notes },
      ageBand: r.age_band,
      minutes: r.minutes,
      tags: r.tags,
      moral: r.moral,
      synopsis: r.synopsis,
      characters: r.characters,
      language: r.language,
      status: r.status,
      illustration: { credit: r.illustration_credit, kind: r.illustration_kind },
      narration: { credit: r.narration_credit, voice: r.narration_voice, kind: r.narration_kind },
      pages: pages.map((p) => ({
        index: p.page_index,
        text: p.text,
        sceneDescription: p.scene_description ?? '',
        image: `img/${r.id}-${p.page_index}.webp`,
        audio: `audio/${r.id}-${p.page_index}.mp3`,
        audioDurationSec: Number(p.audio_duration_sec ?? 1),
        timingKey: `${r.id}-${p.page_index}`,
      })),
    },
    checklist: {
      sourceVerified: !!rc.source_verified,
      licenseVerified: !!rc.license_verified,
      illustrationsCleared: !!rc.illustrations_cleared,
      narrationCleared: !!rc.narration_cleared,
      noThirdPartyTrademarks: !!rc.no_third_party_trademarks,
    },
    updatedAt: r.updated_at,
  };
}

const SELECT = '*, content_licenses(*), story_pages(page_index,text,scene_description,audio_duration_sec), rights_checklist(*)';

export async function listStories(): Promise<StudioRecord[]> {
  if (dataMode() === 'supabase') {
    const { data, error } = await supabase().from('stories').select(SELECT).order('title');
    if (error) throw new Error(error.message);
    return (data as unknown as Row[]).map(fromRow);
  }
  return Object.values(readLocal()).sort((a, b) => a.story.title.localeCompare(b.story.title));
}

export async function getStory(id: string): Promise<StudioRecord | null> {
  if (dataMode() === 'supabase') {
    const { data, error } = await supabase().from('stories').select(SELECT).eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data as unknown as Row) : null;
  }
  return readLocal()[id] ?? null;
}

export async function saveStory(story: Story, checklist: RightsChecklist = emptyChecklist()): Promise<StudioRecord> {
  const parsed = storySchema.parse(story);
  const record: StudioRecord = { story: parsed, checklist, updatedAt: new Date().toISOString() };
  if (dataMode() === 'local') {
    const db = readLocal();
    db[parsed.id] = record;
    writeLocal(db);
    return record;
  }
  const sb = supabase();
  const licId = `lic-${parsed.id}`;
  const check = (e: { message: string } | null) => {
    if (e) throw new Error(e.message);
  };
  check((await sb.from('content_licenses').upsert({ id: licId, ...parsed.license })).error);
  check(
    (
      await sb.from('stories').upsert({
        id: parsed.id,
        title: parsed.title,
        origin: parsed.origin,
        source: parsed.source,
        license_id: licId,
        age_band: parsed.ageBand,
        minutes: parsed.minutes,
        tags: parsed.tags,
        moral: parsed.moral,
        synopsis: parsed.synopsis,
        characters: parsed.characters,
        language: parsed.language,
        illustration_credit: parsed.illustration.credit,
        illustration_kind: parsed.illustration.kind,
        narration_credit: parsed.narration.credit,
        narration_voice: parsed.narration.voice,
        narration_kind: parsed.narration.kind,
      })
    ).error,
  );
  check(
    (
      await sb.from('rights_checklist').upsert({
        story_id: parsed.id,
        source_verified: checklist.sourceVerified,
        license_verified: checklist.licenseVerified,
        illustrations_cleared: checklist.illustrationsCleared,
        narration_cleared: checklist.narrationCleared,
        no_third_party_trademarks: checklist.noThirdPartyTrademarks,
      })
    ).error,
  );
  for (const p of parsed.pages) {
    check(
      (
        await sb
          .from('story_pages')
          .upsert({ story_id: parsed.id, page_index: p.index, text: p.text, scene_description: p.sceneDescription }, { onConflict: 'story_id,page_index' })
      ).error,
    );
  }
  // Status last: the database trigger re-checks the rights gate on publish.
  check((await sb.from('stories').update({ status: parsed.status }).eq('id', parsed.id)).error);
  return record;
}
