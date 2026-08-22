// Fail the build if a hand-pinned @prodshape/cli version slips into authored
// content. The only sanctioned ways to reference a version are the
// %PRODSHAPE_VERSION% placeholder (substituted by sync-spec.mjs at build
// time) or an unpinned @prodshape/cli@latest.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PIN_PATTERN = /@prodshape\/cli@0\.\d+\.\d+/;

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    files.push(...(statSync(path).isDirectory() ? walk(path) : [path]));
  }
  return files;
}

// Files to scan: everything under src/content plus public/demo.sh.
export function collectGuardedFiles(root) {
  return [...walk(join(root, 'src', 'content')), join(root, 'public', 'demo.sh')];
}

// Returns a list of "file:line: text" strings, one per hard-coded pin found.
export function checkVersionGuard(files) {
  const offenders = [];
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (PIN_PATTERN.test(line)) offenders.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }
  return offenders;
}

// Standalone usage: node scripts/check-version-guard.mjs
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  const offenders = checkVersionGuard(collectGuardedFiles(root));
  if (offenders.length) {
    console.error('Hard-coded @prodshape/cli version found (use %PRODSHAPE_VERSION% or @latest instead):');
    for (const o of offenders) console.error(`  ${o}`);
    process.exit(1);
  }
  console.log('No hard-coded @prodshape/cli versions found.');
}
