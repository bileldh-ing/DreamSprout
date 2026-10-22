#!/usr/bin/env python3
"""
DreamSprout narration generator (edge-tts).

Reads packages/content/data/stories.json, synthesises one MP3 per page with
Microsoft Edge neural TTS, captures the *real* word-boundary timestamps from the
TTS stream, normalises the audio with ffmpeg (mono, 22.05 kHz, 32 kbps) and writes:

  apps/mobile/assets/stories/audio/{storyId}-{n}.mp3
  packages/content/data/timings.json   ({"storyId-n": [[startSec, durSec, word], ...]})
  packages/content/data/stories.json   (audioDurationSec refreshed per page)

Usage:
  pip install -r scripts/tts/requirements.txt      # plus ffmpeg/ffprobe on PATH
  python scripts/tts/generate_narration.py                         # all stories
  python scripts/tts/generate_narration.py --story lion-mouse --voice en-GB-SoniaNeural
  python scripts/tts/generate_narration.py --rate=-12% --only-missing

Then run:  npm run seed:build && npm run validate:content

Rights: check the TTS provider's terms for commercial use of generated audio before
a release, and record the voice in each story's `narration` field (docs/CONTENT_RIGHTS.md).
An HTTPS proxy from HTTPS_PROXY / https_proxy is honoured if set.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote, urlsplit

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "packages" / "content" / "data"
AUDIO = ROOT / "apps" / "mobile" / "assets" / "stories" / "audio"


def proxy_url() -> str | None:
    p = next((os.environ[k] for k in ("HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy") if os.environ.get(k)), None)
    if not p:
        return None
    # edge-tts uses aiohttp; drop env proxies and pass an explicit, URL-encoded proxy instead.
    for k in list(os.environ):
        if "proxy" in k.lower():
            del os.environ[k]
    s = urlsplit(p)
    if "@" not in s.netloc:
        return p
    userinfo, host = s.netloc.rsplit("@", 1)
    user, pw = userinfo.split(":", 1) if ":" in userinfo else (userinfo, "")
    return f"{s.scheme}://{quote(user, safe='')}:{quote(pw, safe='')}@{host}"


async def synth(text: str, voice: str, rate: str, out_raw: Path, proxy: str | None) -> list[list]:
    import edge_tts  # lazy import so --help works without the dependency

    last: Exception | None = None
    for attempt in range(4):
        try:
            comm = edge_tts.Communicate(text, voice, rate=rate, pitch="+0Hz", proxy=proxy, boundary="WordBoundary")
            words: list[list] = []
            buf = bytearray()
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    buf.extend(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    words.append([round(chunk["offset"] / 1e7, 3), round(chunk["duration"] / 1e7, 3), chunk["text"]])
            out_raw.write_bytes(bytes(buf))
            if not words:
                raise RuntimeError("TTS returned no word boundaries")
            return words
        except Exception as e:  # noqa: BLE001 - retry transient network/TTS errors
            last = e
            print(f"  retry {attempt + 1}: {e}", file=sys.stderr)
            await asyncio.sleep(2 * (attempt + 1))
    raise RuntimeError(f"TTS failed: {last}")


def normalise(raw: Path, out: Path) -> float:
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-ac", "1", "-ar", "22050", "-b:a", "32k", str(out)], check=True)
    raw.unlink(missing_ok=True)
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)], capture_output=True, text=True, check=True
    )
    return round(float(r.stdout.strip()), 3)


async def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--story", help="only this story id")
    ap.add_argument("--voice", default="en-US-AnaNeural")
    ap.add_argument("--rate", default="-12%", help="speaking rate, e.g. -12%% (gentle bedtime pace)")
    ap.add_argument("--only-missing", action="store_true", help="skip pages whose mp3 and timings already exist")
    args = ap.parse_args()

    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        sys.exit("ffmpeg and ffprobe are required on PATH")

    stories = json.loads((DATA / "stories.json").read_text())
    timings_path = DATA / "timings.json"
    timings = json.loads(timings_path.read_text()) if timings_path.exists() else {}
    AUDIO.mkdir(parents=True, exist_ok=True)
    proxy = proxy_url()

    for story in stories:
        if args.story and story["id"] != args.story:
            continue
        for page in story["pages"]:
            key = page["timingKey"]
            out = AUDIO / f"{key}.mp3"
            if args.only_missing and out.exists() and timings.get(key):
                continue
            raw = AUDIO / f"{key}.raw.mp3"
            timings[key] = await synth(page["text"], args.voice, args.rate, raw, proxy)
            page["audioDurationSec"] = normalise(raw, out)
            print(f"✔ {key}: {len(timings[key])} words, {page['audioDurationSec']}s")
        story["narration"]["voice"] = args.voice

    timings_path.write_text(json.dumps(timings, separators=(",", ":")))
    (DATA / "stories.json").write_text(json.dumps(stories, indent=1, ensure_ascii=False))
    print("Done. Now run: npm run seed:build && npm run validate:content")


if __name__ == "__main__":
    asyncio.run(main())
