// Copies bundled story illustrations into public/ so the studio can preview them (gitignored).
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', '..', 'mobile', 'assets', 'stories', 'img');
const dest = join(here, '..', 'public', 'stories', 'img');
if (existsSync(src)) {
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log('✔ copied story illustrations to public/stories/img');
}
