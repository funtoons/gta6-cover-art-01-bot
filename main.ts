// Vice Sunset Cover Studio — entry program for make.fun's gta6-cover-art-01.
// Node 22, standard library only. It takes the static app in app/ and the
// screenshots in screenshots/ from beside this file, copies both into the
// output directory, and writes dossier.json there with the vendored
// make.fun library (vendor/makefun-app.ts, unchanged).
// Outside the grader MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice into two directories and the two trees must match byte for byte.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps matching the scorer: the dossier text cap shapes the bytes, the rest
// refuse an entry the scorer would refuse anyway (over 4 screenshots, a
// screenshot over 256 KiB, over 993 app files, app over 48 MiB, or an app
// path over 1000 bytes). The program is deterministic: same input files,
// same dossier bytes, every run.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
