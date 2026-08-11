// Sync spec content from the spec repository into the site's content collection.
// Usage: node scripts/sync-spec.mjs [path-to-spec-repo]   (default: ../spec)
// The spec repository is the single source of truth; everything written here is generated.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const specRepo = process.argv[2] ?? join(root, '..', 'spec');
const outSpec = join(root, 'src', 'content', 'docs', 'spec');
const outManifesto = join(root, 'src', 'content', 'docs', 'manifesto.md');
const outDiagrams = join(root, 'public', 'diagrams');

if (!existsSync(join(specRepo, 'spec'))) {
  console.error(`Spec repository not found at ${specRepo} (expected a spec/ directory).`);
  process.exit(1);
}

const GH = 'https://github.com/product-definition-as-code/spec/blob/main';

// Sidebar structure and order live in astro.config.mjs (explicit slugs grouped
// by kernel, reference profile and reference workflow, mirroring the spec index).

function transform(md, { slugBase, label }) {
  // Title from the first H1; strip it (Starlight renders the frontmatter title).
  const h1 = md.match(/^# (.+)$/m);
  const title = (h1 ? h1[1] : label).replace(/"/g, '\\"');
  if (h1) md = md.replace(/^# .+\n+/m, '');

  // Diagrams → the published copy under public/. Chapters reference them as
  // ../assets/diagrams/x.png; the repository root as assets/diagrams/x.png.
  md = md.replace(/\]\((?:\.\.\/)?assets\/diagrams\/([a-z0-9-]+\.png)\)/g, '](/diagrams/$1)');

  // Repo-level files → GitHub.
  md = md.replace(/\]\((?:\.\.\/)?(README|GOVERNANCE|CONTRIBUTING|SIGNATORIES|IMPLEMENTATIONS|ADOPTERS|CHANGELOG|LICENSE|CODE_OF_CONDUCT)\.md(#[^)]*)?\)/g, `](${GH}/$1.md$2)`);
  md = md.replace(/\]\((?:\.\.\/)?rfcs\/([a-z0-9-]+)\.md(#[^)]*)?\)/g, `](${GH}/rfcs/$1.md$2)`);

  // The manifesto is a site page. Chapters link to it as ../MANIFESTO.md; the
  // repository root links to it as MANIFESTO.md.
  md = md.replace(/\]\((?:\.\.\/)?MANIFESTO\.md(#[^)]*)?\)/g, '](/manifesto/$1)');

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
  const fm = [
    '---',
    `title: "${title}"`,
    `editUrl: "https://github.com/product-definition-as-code/spec/edit/main/spec/${file}"`,
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

// Diagrams. The spec repository is their canonical home; this is the published
// copy that /diagrams/<file> and https://pdac.dev/diagrams/<file> resolve to.
// Removed first so a diagram renamed upstream does not linger here.
{
  const srcDiagrams = join(specRepo, 'assets', 'diagrams');
  rmSync(outDiagrams, { recursive: true, force: true });
  if (existsSync(srcDiagrams)) {
    mkdirSync(outDiagrams, { recursive: true });
    // Images only: the directory's own README documents the assets and is not published.
    for (const file of readdirSync(srcDiagrams)) {
      if (file.endsWith('.png')) copyFileSync(join(srcDiagrams, file), join(outDiagrams, file));
    }
  } else {
    console.warn(`No diagrams found at ${srcDiagrams}; skipping.`);
  }
}

console.log(`Synced spec content from ${specRepo}`);
