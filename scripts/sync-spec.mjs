// Sync spec content from the spec repository into the site's content collection.
// Usage: node scripts/sync-spec.mjs [path-to-spec-repo]   (default: ../spec)
// The spec repository is the single source of truth; everything written here is generated.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkVersionGuard, collectGuardedFiles } from './check-version-guard.mjs';
import { resolveVersion } from './resolve-version.mjs';

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

  // Signing block: a generated view of SIGNATORIES.md, injected after the
  // Signing section's canonical sentence so the page shows who signed and how
  // to join them without leaving the site. The ledger stays canonical in the
  // spec repository; do not edit names here.
  const signatories = readFileSync(join(specRepo, 'SIGNATORIES.md'), 'utf8');
  const rows = [...signatories.matchAll(/^\|\s*(\d+)\s*\|([^|]*)\|([^|]*)\|([^|]*)\|\s*$/gm)];
  if (rows.length === 0) {
    console.error('SIGNATORIES.md: no signature rows found; refusing to render an empty signing block.');
    process.exit(1);
  }
  const count = rows.length;
  const editUrl = 'https://github.com/product-definition-as-code/spec/edit/main/SIGNATORIES.md';
  const signingBlock = [
    '',
    'Signing takes one pull request, no manual fork needed:',
    '',
    `1. <a href="${editUrl}" data-goatcounter-click="sign-edit-click">Open SIGNATORIES.md in GitHub's editor</a>; GitHub forks the repository for you.`,
    '2. Add one line to the table: `| n | Your Name | Affiliation (optional) | link (optional) |`',
    '3. Propose the change as a pull request titled `sign: <your name>`.',
    '',
    'Signing means you endorse the values and principles of the manifesto. It does not commit you, your employer, or your projects to anything else.',
    '',
    '### Founding signatories',
    '',
    `${count} so far. The list is short because the manifesto is young; signing now is what founding means.`,
    '',
    '| # | Name | Affiliation | Link |',
    '| --- | --- | --- | --- |',
    ...rows.map((r) => `| ${r[1]} |${r[2]}|${r[3]}|${r[4]}|`),
    '',
  ].join('\n');
  const signingMarker = /## Signing\n\n[^\n]*\n/;
  if (!signingMarker.test(body)) {
    console.error('MANIFESTO.md: Signing section not found; the signing block has nowhere to land.');
    process.exit(1);
  }
  const bodyWithSigning = body.replace(signingMarker, (section) => section + signingBlock);

  const fm = [
    '---',
    `title: "${title}"`,
    `editUrl: "https://github.com/product-definition-as-code/spec/edit/main/MANIFESTO.md"`,
    '---',
    '',
  ].join('\n');
  writeFileSync(outManifesto, fm + bodyWithSigning);
}

// Templates page. The spec repository's templates/ directory is canonical;
// this page renders it as one copy-paste block per file. The list is explicit
// on purpose: a template added or renamed upstream breaks the build loudly
// instead of silently changing the page.
{
  const templatesDir = join(specRepo, 'templates');
  const order = [
    ['actor', 'Actor'],
    ['journey', 'Journey'],
    ['use-case', 'Use Case'],
    ['business-rule', 'Business Rule'],
    ['domain-term', 'Domain Term'],
    ['bounded-context', 'Bounded Context'],
    ['functional-requirement', 'Functional Requirement'],
    ['quality-requirement', 'Quality Requirement'],
    ['constraint', 'Constraint'],
    ['structured-behaviour', 'Structured Behaviour'],
    ['product-change', 'Product Change'],
  ];
  const present = readdirSync(templatesDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
  const expected = order.map(([slug]) => `${slug}.md`);
  const missing = expected.filter((f) => !present.includes(f));
  const extra = present.filter((f) => !expected.includes(f));
  if (missing.length || extra.length) {
    console.error(
      `templates/ changed upstream: missing [${missing.join(', ')}], unlisted [${extra.join(', ')}]. Update the order list in sync-spec.mjs deliberately.`,
    );
    process.exit(1);
  }
  const sections = order.map(([slug, label]) => {
    const content = readFileSync(join(templatesDir, `${slug}.md`), 'utf8').trimEnd();
    return `## ${label}\n\n\`\`\`\`markdown\n${content}\n\`\`\`\`\n`;
  });
  const page = [
    '---',
    'title: Templates',
    'description: Eleven copy-paste Markdown templates, one per PDaC artifact type plus the Product Change, machine-checked against the specification.',
    'editUrl: "https://github.com/product-definition-as-code/spec/tree/main/templates"',
    '---',
    '',
    'Copy the file for the kind you need, replace the ID, fill the sections. That is a valid PDaC artifact; no tool is needed to author one.',
    '',
    "The files come verbatim from the [specification repository's templates directory](https://github.com/product-definition-as-code/spec/tree/main/templates), where a check validates every one of them against the v1alpha1 schemas and the required sections of the [artifacts chapter](/spec/artifacts/) on every change. What you copy cannot have drifted from the specification. They are non-normative, like the diagrams: where a template and the specification appear to disagree, the specification wins.",
    '',
    'They use `EXAMPLE` IDs and one small worked domain, meeting room booking, and they reference each other, so the set also shows the relationships each type carries. Replace the IDs with your own before the first review; an ID is immutable once accepted. The comment inside each file explains its type; delete it as you fill the template in.',
    '',
    sections.join('\n'),
  ].join('\n');
  writeFileSync(join(root, 'src', 'content', 'docs', 'templates.md'), page);
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

// CLI version. Authored content carries a %PRODSHAPE_VERSION% placeholder
// instead of a hand-pinned version; resolve it and substitute here so
// index.mdx and demo.sh always show the same, current version.
{
  const guardOffenders = checkVersionGuard(collectGuardedFiles(root));
  if (guardOffenders.length) {
    console.error('Hard-coded @prodshape/cli version found (use %PRODSHAPE_VERSION% or @latest instead):');
    for (const offender of guardOffenders) console.error(`  ${offender}`);
    process.exit(1);
  }

  const version = await resolveVersion();
  const indexMdx = join(root, 'src', 'content', 'docs', 'index.mdx');
  const demoSh = join(root, 'public', 'demo.sh');
  for (const file of [indexMdx, demoSh]) {
    writeFileSync(file, readFileSync(file, 'utf8').replaceAll('%PRODSHAPE_VERSION%', version));
  }
  console.log(`Resolved @prodshape/cli version: ${version}`);
}
