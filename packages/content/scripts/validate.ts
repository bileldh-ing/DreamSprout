import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateLibrary } from '../src/validate';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', 'data');
const assetDir = join(here, '..', '..', '..', 'apps', 'mobile', 'assets', 'stories');

const stories: unknown = JSON.parse(readFileSync(join(dataDir, 'stories.json'), 'utf8'));
const timings: unknown = JSON.parse(readFileSync(join(dataDir, 'timings.json'), 'utf8'));
const result = validateLibrary(stories, timings, { assetExists: (rel) => existsSync(join(assetDir, rel)) });

if (!result.ok) {
  console.error(`✖ Content validation failed with ${result.issues.length} issue(s):`);
  for (const i of result.issues) console.error(`  - [${i.storyId}${i.page ? ` p${i.page}` : ''}] ${i.message}`);
  process.exit(1);
}
const pages = result.stories.reduce((n, s) => n + s.pages.length, 0);
console.log(`✔ ${result.stories.length} stories, ${pages} pages: sources, licences, images, audio and timings all present.`);
