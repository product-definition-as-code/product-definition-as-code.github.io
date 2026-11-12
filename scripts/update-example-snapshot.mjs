// Regenerate the example Product Snapshot served at /example/shop/ from a ProductShape checkout.
//
//   node scripts/update-example-snapshot.mjs [path-to-productshape] [--check] [--allow-dirty]
//
// The example model lives in the ProductShape repository (examples/shop). This script runs that
// checkout's built CLI against it and writes two files here:
//   public/example/shop/index.html   the standalone, read-only Snapshot
//   src/data/example-snapshot.json   where it came from: CLI version, source revision, counts
// The /example/ page reads the JSON, so the provenance line cannot disagree with the file.
//
// --check regenerates in memory and exits 1 if either committed file differs, so a stale copy
// is caught instead of drifting silently. Run it against the revision the JSON names.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const check = args.includes('--check');
const allowDirty = args.includes('--allow-dirty');
const productshape = resolve(
  args.find((arg) => !arg.startsWith('--')) ?? process.env.PRODUCTSHAPE_REPO ?? '../productshape',
);
const example = join(productshape, 'examples', 'shop');
const cli = join(productshape, 'src', 'packages', 'cli', 'dist', 'bin.js');
const snapshotFile = join(here, 'public', 'example', 'shop', 'index.html');
const provenanceFile = join(here, 'src', 'data', 'example-snapshot.json');

function fail(message) {
  console.error(message);
  process.exit(2);
}

function git(...gitArgs) {
  return execFileSync('git', gitArgs, { cwd: productshape, encoding: 'utf8' }).trim();
}

try {
  await readFile(join(example, '.product', 'config.yaml'));
} catch {
  fail(`No example model at ${example}. Pass the path to a ProductShape checkout.`);
}
try {
  await readFile(cli);
} catch {
  fail(`No built CLI at ${cli}. Run \`pnpm install && pnpm build\` in ${productshape} first.`);
}
const dirty = git('status', '--porcelain', '--', 'examples/shop', 'src/packages');
if (dirty && !allowDirty) {
  fail(
    `${productshape} has uncommitted changes in examples/shop or src/packages; the Snapshot would not match its revision. Commit them or pass --allow-dirty.`,
  );
}

const result = spawnSync(
  process.execPath,
  [
    cli,
    'graph',
    '--format',
    'html',
    '--product-name',
    'Example shop',
    '--product-url',
    'https://github.com/juangcarmona/productshape',
  ],
  { cwd: example, encoding: 'utf8' },
);
if (result.status !== 0) fail(`Generation failed:\n${result.stdout}${result.stderr}`);

const snapshot = await readFile(join(example, '.product', 'generated', 'snapshot.html'), 'utf8');
const graph = JSON.parse(
  await readFile(join(example, '.product', 'generated', 'product-graph.json'), 'utf8'),
);
const cliPackage = JSON.parse(
  await readFile(join(productshape, 'src', 'packages', 'cli', 'package.json'), 'utf8'),
);
const provenance = `${JSON.stringify(
  {
    generator: 'ProductShape',
    version: cliPackage.version,
    sourceRepository: 'https://github.com/juangcarmona/productshape',
    sourcePath: 'examples/shop',
    sourceRevision: git('rev-parse', 'HEAD'),
    artifacts: graph.nodes.length,
    relationships: graph.edges.length,
  },
  null,
  2,
)}\n`;

if (check) {
  const stale = [];
  for (const [file, expected] of [
    [snapshotFile, snapshot],
    [provenanceFile, provenance],
  ]) {
    const current = await readFile(file, 'utf8').catch(() => null);
    if (current !== expected) stale.push(file);
  }
  if (stale.length > 0) {
    console.error(`Example Snapshot is out of date:\n  ${stale.join('\n  ')}`);
    console.error('Run node scripts/update-example-snapshot.mjs and commit the result.');
    process.exit(1);
  }
  console.log('Example Snapshot matches the ProductShape checkout.');
} else {
  await mkdir(dirname(snapshotFile), { recursive: true });
  await mkdir(dirname(provenanceFile), { recursive: true });
  await writeFile(snapshotFile, snapshot);
  await writeFile(provenanceFile, provenance);
  console.log(
    `Wrote the example Snapshot from ProductShape ${cliPackage.version} at ${git('rev-parse', '--short', 'HEAD')}.`,
  );
}
