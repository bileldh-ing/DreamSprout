// Supabase Edge Function (Deno): queue/produce TTS narration for a story page.
// POST { storyId: string, pageIndex: number, voice?: string }
// Requires a studio-role JWT. The heavy lifting (edge-tts / provider TTS + ffmpeg + word timings)
// runs in scripts/tts/generate_narration.py or a media worker; this function validates the request,
// checks the caller's role and records a job in audit_log so the worker can pick it up.
import { createClient } from 'npm:@supabase/supabase-js@2';

interface Body {
  storyId?: string;
  pageIndex?: number;
  voice?: string;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  const auth = req.headers.get('Authorization');
  if (!auth) return json(401, { error: 'missing_authorization' });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: isStudio, error: roleErr } = await supabase.rpc('is_studio');
  if (roleErr || !isStudio) return json(403, { error: 'studio_role_required' });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json(400, { error: 'invalid_json' });
  }
  if (!body.storyId || !/^[a-z0-9-]+$/.test(body.storyId) || !Number.isInteger(body.pageIndex) || (body.pageIndex ?? 0) < 1) {
    return json(400, { error: 'storyId and positive integer pageIndex are required' });
  }
  const { data: page, error } = await supabase
    .from('story_pages')
    .select('id, text')
    .eq('story_id', body.storyId)
    .eq('page_index', body.pageIndex!)
    .single();
  if (error || !page) return json(404, { error: 'page_not_found' });

  const voice = body.voice ?? 'en-US-AnaNeural';
  const { error: auditErr } = await supabase.from('audit_log').insert({
    action: 'TTS_REQUESTED',
    entity: 'story_pages',
    entity_id: page.id,
    diff: { storyId: body.storyId, pageIndex: body.pageIndex, voice, chars: page.text.length },
  });
  if (auditErr) return json(500, { error: 'could_not_queue', detail: auditErr.message });
  return json(202, { status: 'queued', storyId: body.storyId, pageIndex: body.pageIndex, voice });
});
