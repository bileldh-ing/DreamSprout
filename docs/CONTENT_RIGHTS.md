# Content rights

Every story shipped in DreamSprout, where it comes from, and the rights status of its text, illustrations and narration. This file mirrors `packages/content/data/stories.json`; CI (`npm run validate:content`) fails if any story lacks a source or licence, any page lacks an image or narration file, or narration timings are missing.

## Summary

- **Story text** — 15 traditional tales whose source texts are in the **public domain** (Aesop's Fables, Hans Christian Andersen, the Brothers Grimm, English and American folk tales), each *retold in new words by DreamSprout*, plus 5 **DreamSprout Originals**. The retellings and originals are © DreamSprout.
- **Illustrations** — every page has its own illustration generated for DreamSprout (AI-assisted, editor reviewed). No third-party characters, brands or film stills are used. Before a commercial release, confirm the image-generation provider's terms permit commercial use; the prompts are kept as provenance in `packages/content/data/image-prompts.json`.
- **Narration** — synthesised for DreamSprout with Microsoft Edge neural text-to-speech (voice `en-US-AnaNeural`) by `scripts/tts/generate_narration.py`. Word timings come from the TTS word-boundary stream and are never fabricated. **Before a store release, confirm the TTS provider's terms allow commercial distribution of the audio, or replace it with licensed human or commercial-TTS narration** (re-run the script with another voice/provider; timings are regenerated).

Code is MIT-licensed (see `LICENSE`). Story text, illustrations and narration are **not** covered by the MIT licence.

## Catalogue

| # | Story | Source | Licence | Ages | Pages |
|---|---|---|---|---|---|
| 1 | The Tortoise and the Hare (`tortoise-hare`) | Aesop's Fables (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from Aesop's Fables; the source is in the public domain. This retelling is © DreamSprout. | 4-6 | 3 |
| 2 | The Lion and the Mouse (`lion-mouse`) | Aesop's Fables (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from Aesop's Fables; the source is in the public domain. This retelling is © DreamSprout. | 3-5 | 3 |
| 3 | The Crow and the Pitcher (`crow-pitcher`) | Aesop's Fables (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from Aesop's Fables; the source is in the public domain. This retelling is © DreamSprout. | 6-8 | 3 |
| 4 | Luna the Little Firefly (`luna-firefly`) | DreamSprout Original | DreamSprout Original — Original story written for DreamSprout. All rights reserved. | 3-5 | 3 |
| 5 | The Ugly Duckling (`ugly-duckling`) | Hans Christian Andersen (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from Hans Christian Andersen; the source is in the public domain. This retelling is © DreamSprout. | 4-6 | 3 |
| 6 | Goldilocks and the Three Bears (`goldilocks`) | English folk tale (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from English folk tale; the source is in the public domain. This retelling is © DreamSprout. | 3-5 | 3 |
| 7 | The Three Little Pigs (`three-pigs`) | English folk tale (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from English folk tale; the source is in the public domain. This retelling is © DreamSprout. | 3-5 | 3 |
| 8 | The Boy Who Cried Wolf (`boy-cried-wolf`) | Aesop's Fables (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from Aesop's Fables; the source is in the public domain. This retelling is © DreamSprout. | 6-8 | 3 |
| 9 | The Ant and the Grasshopper (`ant-grasshopper`) | Aesop's Fables (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from Aesop's Fables; the source is in the public domain. This retelling is © DreamSprout. | 4-6 | 3 |
| 10 | The Town Mouse and the Country Mouse (`town-country-mouse`) | Aesop's Fables (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from Aesop's Fables; the source is in the public domain. This retelling is © DreamSprout. | 4-6 | 3 |
| 11 | The Elves and the Shoemaker (`elves-shoemaker`) | Brothers Grimm (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from Brothers Grimm; the source is in the public domain. This retelling is © DreamSprout. | 4-6 | 3 |
| 12 | The Princess and the Pea (`princess-pea`) | Hans Christian Andersen (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from Hans Christian Andersen; the source is in the public domain. This retelling is © DreamSprout. | 4-6 | 3 |
| 13 | Jack and the Beanstalk (`jack-beanstalk`) | English folk tale (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from English folk tale; the source is in the public domain. This retelling is © DreamSprout. | 6-8 | 3 |
| 14 | The Fox and the Grapes (`fox-grapes`) | Aesop's Fables (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from Aesop's Fables; the source is in the public domain. This retelling is © DreamSprout. | 4-6 | 3 |
| 15 | The North Wind and the Sun (`north-wind-sun`) | Aesop's Fables (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from Aesop's Fables; the source is in the public domain. This retelling is © DreamSprout. | 6-8 | 3 |
| 16 | The Little Red Hen (`little-red-hen`) | English folk tale (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from English folk tale; the source is in the public domain. This retelling is © DreamSprout. | 3-5 | 3 |
| 17 | The Gingerbread Man (`gingerbread-man`) | American folk tale (public domain), retold by DreamSprout | Public domain (source text) — Traditional tale from American folk tale; the source is in the public domain. This retelling is © DreamSprout. | 3-5 | 3 |
| 18 | Pip, the Star Who Couldn't Sleep (`pip-star`) | DreamSprout Original | DreamSprout Original — Original story written for DreamSprout. All rights reserved. | 3-5 | 3 |
| 19 | Ollie the Owl's Moon Lantern (`ollie-owl`) | DreamSprout Original | DreamSprout Original — Original story written for DreamSprout. All rights reserved. | 4-6 | 3 |
| 20 | Nimbus, the Cloud Who Wanted to Dance (`cloud-dance`) | DreamSprout Original | DreamSprout Original — Original story written for DreamSprout. All rights reserved. | 3-5 | 3 |

## Per-page assets

Each page `n` of story `id` uses:

- illustration `apps/mobile/assets/stories/img/{id}-{n}.webp` (Supabase bucket `illustrations/{id}/{n}.webp`)
- narration `apps/mobile/assets/stories/audio/{id}-{n}.mp3` (Supabase bucket `narration/{id}/{n}.mp3`)
- word timings `packages/content/data/timings.json`, key `{id}-{n}`

## Adding content

1. Only add text that is public domain in every launch market, original, or licensed in writing. Record the source, licence kind, holder and notes.
2. Illustrations and narration must be first-party or licensed; record the credit in the story's `illustration` / `narration` fields.
3. In the studio, complete the rights checklist. Publishing is blocked, in the studio and by a database trigger, until the checklist is complete and every page has an image, audio and timings.
