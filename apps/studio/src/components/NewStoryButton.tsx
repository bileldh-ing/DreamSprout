'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function NewStoryButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="row">
      {error && <span className="issues">{error}</span>}
      <button
        className="btn btn-primary"
        disabled={busy}
        onClick={async () => {
          const title = window.prompt('Story title');
          if (!title) return;
          setBusy(true);
          setError(null);
          const res = await fetch('/api/stories', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title }) });
          setBusy(false);
          const json = (await res.json()) as { story?: { id: string }; error?: string };
          if (!res.ok || !json.story) return setError(json.error ?? 'Could not create story');
          router.push(`/stories/${json.story.id}`);
        }}
      >
        + New draft
      </button>
    </div>
  );
}
