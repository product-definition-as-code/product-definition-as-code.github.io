// Sync spec content from the spec repository into the site's content collection.
// Usage: node scripts/sync-spec.mjs [path-to-spec-repo]   (default: ../spec)
// The spec repository is the single source of truth; everything written here is generated.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const specRepo = process.argv[2] ?? join(root, '..', 'spec');
const outSpec = join(root, 'src', 'content', 'docs', 'spec');
const outManifesto = join(root, 'src', 'content', 'docs', 'manifesto.md');

if (!existsSync(join(specRepo, 'spec'))) {
  console.error(`Spec repository not found at ${specRepo} (expected a spec/ directory).`);
  process.exit(1);
}

const GH = 'https://github.com/product-definition-as-code/spec/blob/main';

// Sidebar order follows the spec index, not the alphabet.
const ORDER = {
  'index.md': 0,
  'terminology.md': 1,
  'artifacts.md': 2,
  'frontmatter-reference.md': 3,
  'identifiers.md': 4,
  'relationships.md': 5,
  'citation-contract.md': 6,
  'validation.md': 7,
  'conformance.md': 8,
};

function transform(md, { slugBase, label }) {
  // Title from the first H1; strip it (Starlight renders the frontmatter title).
  const h1 = md.match(/^# (.+)$/m);
  const title = (h1 ? h1[1] : label).replace(/"/g, '\\"');
  if (h1) md = md.replace(/^# .+\n+/m, '');

  // Repo-level files → GitHub.
  md = md.replace(/\]\((?:\.\.\/)?(README|GOVERNANCE|CONTRIBUTING|SIGNATORIES|IMPLEMENTATIONS|ADOPTERS|CHANGELOG|LICENSE|CODE_OF_CONDUCT)\.md(#[^)]*)?\)/g, `](${GH}/$1.md$2)`);
  md = md.replace(/\]\(MANIFESTO\.md(#[^)]*)?\)/g, '](/manifesto/$1)');

  // Chapter cross-links → site routes.
  md = md.replace(/\]\((?:\.\/)?([a-z][a-z0-9-]*)\.md(#[^)]*)?\)/g, (m, name, hash = '') => {
    if (name === 'index') return `](/spec/${hash})`;
    return `](/spec/${name}/${hash})`;
  });

  return { title, body: md };
}

rmSync(outSpec, { recursive: true, force: true });
mkdirSync(outSpec, { recursive: true });

for (const file of readdirSync(join(specRepo, 'spec'))) {
  if (!file.endsWith('.md')) continue;
  const raw = readFileSync(join(specRepo, 'spec', file), 'utf8');
  const { title, body } = transform(raw, { label: file });
  const order = ORDER[file] ?? 99;
  const fm = [
    '---',
    `title: "${title}"`,
    `editUrl: "https://github.com/product-definition-as-code/spec/edit/main/spec/${file}"`,
    `sidebar:`,
    `  order: ${order}`,
    ...(file === 'index.md' ? ['  label: "Overview"'] : []),
    '---',
    '',
  ].join('\n');
  writeFileSync(join(outSpec, file), fm + body);
}

// Manifesto page.
{
  const raw = readFileSync(join(specRepo, 'MANIFESTO.md'), 'utf8');
  const { title, body } = transform(raw, { label: 'Manifesto' });
  const fm = [
    '---',
    `title: "${title}"`,
    `editUrl: "https://github.com/product-definition-as-code/spec/edit/main/MANIFESTO.md"`,
    '---',
    '',
  ].join('\n');
  writeFileSync(outManifesto, fm + body);
}

console.log(`Synced spec content from ${specRepo}`);
