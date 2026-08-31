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
    'title: PDaC artifact templates',
    'description: Eleven copy-paste Markdown templates, one per PDaC artifact type plus the Product Change, machine-checked against the specification.',
    'editUrl: "https://github.com/product-definition-as-code/spec/tree/main/templates"',
    '---',
    '',
    'Copy the file for the kind you need, replace the ID, fill the sections. That is a valid PDaC artifact; no tool is needed to author one. To scaffold a repository at once, [download the ten model templates as a zip](/pdac-templates.zip): it extracts as `docs/product/model/`, every file already in its place, and the extracted set validates clean. The Product Change is not in the zip on purpose: your first change is `CHG-INITIAL`, authored for your product, not extracted from an example.',
    '',
    "The files come verbatim from the [specification repository's templates directory](https://github.com/product-definition-as-code/spec/tree/main/templates), where a check validates every one of them against the v1alpha1 schemas and the required sections of the [artifacts chapter](/spec/artifacts/) on every change. What you copy cannot have drifted from the specification. They are non-normative, like the diagrams: where a template and the specification appear to disagree, the specification wins.",
    '',
    'They use `EXAMPLE` IDs and one small worked domain, meeting room booking, and they reference each other, so the set also shows the relationships each type carries. Replace the IDs with your own before the first review; an ID is immutable once accepted. The comment inside each file explains its type and names where the file lives in the reference layout (the file is always named by its lowercase ID); delete the comment as you fill the template in.',
    '',
    sections.join('\n'),
  ].join('\n');
  writeFileSync(join(root, 'src', 'content', 'docs', 'templates.md'), page);
}

// pdac-templates.zip: the eleven templates laid out as the reference tree, so
// one extraction scaffolds docs/product/ in a repository. Each entry's path
// comes from the template's own "Reference layout:" line, the same line the
// reader sees, so the zip cannot disagree with the documentation; a template
// without one fails the build. Entries are stored uncompressed: they are small
// Markdown files, and a dependency-free writer beats a dependency.
{
  const templatesDir = join(specRepo, 'templates');
  // The Product Change template is deliberately not in the zip: extracted next
  // to a model that already contains BR-EXAMPLE-001, an active change adding
  // that ID would be invalid by construction, and a real first change is the
  // reader's own CHG-INITIAL. It stays copy-paste on the page.
  const files = readdirSync(templatesDir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md' && f !== 'product-change.md')
    .sort();

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c >>> 0;
  }
  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };

  // Fixed timestamp: the zip's bytes depend only on the templates' content.
  const dosDate = ((2026 - 1980) << 9) | (1 << 5) | 1;
  const dosTime = 0;

  const entries = [];
  for (const file of files) {
    const content = readFileSync(join(templatesDir, file));
    const m = content.toString('utf8').match(/Reference layout: (docs\/product\/\S+?\.md)/);
    if (!m) {
      console.error(`templates/${file}: no "Reference layout:" line; the zip has nowhere to put it.`);
      process.exit(1);
    }
    entries.push({ path: m[1], content });
  }
  entries.sort((a, b) => a.path.localeCompare(b.path));

  const chunks = [];
  const central = [];
  let offset = 0;
  for (const { path, content } of entries) {
    const name = Buffer.from(path, 'utf8');
    const crc = crc32(content);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(0, 8); // method: store
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(content.length, 18);
    local.writeUInt32LE(content.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, name, content);

    const dir = Buffer.alloc(46);
    dir.writeUInt32LE(0x02014b50, 0);
    dir.writeUInt16LE(20, 4); // made by
    dir.writeUInt16LE(20, 6); // version needed
    dir.writeUInt16LE(0, 8);
    dir.writeUInt16LE(0, 10);
    dir.writeUInt16LE(dosTime, 12);
    dir.writeUInt16LE(dosDate, 14);
    dir.writeUInt32LE(crc, 16);
    dir.writeUInt32LE(content.length, 20);
    dir.writeUInt32LE(content.length, 24);
    dir.writeUInt16LE(name.length, 28);
    // extra, comment, disk, internal attrs, external attrs: zero
    dir.writeUInt32LE(offset, 42);
    central.push(Buffer.concat([dir, name]));
    offset += local.length + name.length + content.length;
  }
  const centralBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  writeFileSync(join(root, 'public', 'pdac-templates.zip'), Buffer.concat([...chunks, centralBuf, eocd]));
  console.log(`pdac-templates.zip: ${entries.length} files in the reference layout`);
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

// llms.txt and llms-full.txt: the machine-reader entry points. The index file
// follows the llms.txt convention (H1, blockquote summary, link sections); the
// full file concatenates the manifesto, the adoption guide, the templates and
// the specification with their canonical URLs, so an agent can read the whole
// method in one fetch. The canonical definition comes verbatim from the spec
// README's markers; a missing marker fails the build rather than paraphrasing.
{
  const readme = readFileSync(join(specRepo, 'README.md'), 'utf8');
  const marked = readme.match(
    /<!-- canonical-pdac-definition:start[^>]*-->\n([\s\S]*?)<!-- canonical-pdac-definition:end -->/,
  );
  if (!marked) {
    console.error('README.md: canonical-pdac-definition markers not found; llms.txt would paraphrase.');
    process.exit(1);
  }
  const definition = marked[1].trim();
  const site = 'https://pdac.dev';
  const absolute = (md) => md.replace(/\]\(\//g, `](${site}/`);

  const llms = [
    '# Product Definition as Code (PDaC)',
    '',
    `> ${definition.split('\n')[0]}`,
    '',
    absolute(definition.split('\n').slice(1).join('\n').trim()),
    '',
    'The specification is v0.2.0, an early draft open for public comment. One reference implementation exists (ProductShape); a second independent implementation and external pilots are release gates for v1, not assumed achievements.',
    '',
    '## Core',
    '',
    `- [The specification](${site}/spec/): nine normative chapters, RFC 2119 language, stable diagnostic codes`,
    `- [Terminology](${site}/spec/terminology/): the defined terms`,
    `- [Citation Contract](${site}/spec/citation-contract/): how delivery documents cite product text by stable ID and content digest`,
    `- [Templates](${site}/templates/): eleven copy-paste artifact templates, machine-checked against the schemas`,
    `- [Adoption](${site}/adoption/): start with one decision; three doors, not three floors`,
    `- [The manifesto](${site}/manifesto/): four values, ten principles, signed by pull request`,
    '',
    '## Proof',
    '',
    `- [demo.sh](${site}/demo.sh): the three-minute demo as a runnable POSIX script; an agent can execute it in a temporary directory`,
    `- [Known limits](${site}/known-limits/): what PDaC cannot claim yet, named before anyone has to discover it`,
    '',
    '## Reference',
    '',
    `- [Diagrams](${site}/diagrams/): nine non-normative diagrams, one question each`,
    `- [Articles](${site}/articles/): the argument behind the method`,
    '- [Schemas](https://github.com/product-definition-as-code/spec/tree/main/schemas/v1alpha1): JSON Schemas for every artifact type',
    '- [ProductShape](https://github.com/juangcarmona/productshape): the reference implementation, @prodshape/cli on npm',
    '',
    '## Optional',
    '',
    `- [llms-full.txt](${site}/llms-full.txt): the manifesto, the adoption guide, the templates and the full specification in one file`,
    '',
  ].join('\n');
  writeFileSync(join(root, 'public', 'llms.txt'), llms);

  const parts = [
    '# Product Definition as Code, the full text in one file',
    '',
    'Generated from the specification repository (https://github.com/product-definition-as-code/spec).',
    'Each section names its canonical URL. Relative links resolve against https://pdac.dev.',
    '',
    definition,
    '',
  ];
  const section = (title, url, body) => {
    parts.push('---', '', `# ${title}`, '', `Canonical URL: ${url}`, '', absolute(body).trim(), '');
  };

  const manifesto = transform(readFileSync(join(specRepo, 'MANIFESTO.md'), 'utf8'), { label: 'Manifesto' });
  section(manifesto.title, `${site}/manifesto/`, manifesto.body);

  const adoption = readFileSync(join(root, 'src', 'content', 'docs', 'adoption.md'), 'utf8')
    .replace(/^---\n[\s\S]*?\n---\n/, '');
  section('Adopt PDaC', `${site}/adoption/`, adoption);

  const templateFiles = readdirSync(join(specRepo, 'templates')).filter(
    (f) => f.endsWith('.md') && f !== 'README.md',
  );
  const templateBodies = templateFiles.map(
    (f) => `## templates/${f}\n\n\`\`\`\`markdown\n${readFileSync(join(specRepo, 'templates', f), 'utf8').trimEnd()}\n\`\`\`\``,
  );
  section('Artifact templates', `${site}/templates/`, templateBodies.join('\n\n'));

  const chapterFiles = readdirSync(join(specRepo, 'spec'))
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => (a === 'index.md' ? -1 : b === 'index.md' ? 1 : a.localeCompare(b)));
  for (const file of chapterFiles) {
    const raw = readFileSync(join(specRepo, 'spec', file), 'utf8');
    const { title, body } = transform(raw, { label: file });
    const slug = file === 'index.md' ? '' : `${file.replace(/\.md$/, '')}/`;
    section(title, `${site}/spec/${slug}`, body);
  }

  const knownLimits = readFileSync(join(root, 'src', 'content', 'docs', 'known-limits.md'), 'utf8')
    .replace(/^---\n[\s\S]*?\n---\n/, '');
  section('Known limits', `${site}/known-limits/`, knownLimits);

  writeFileSync(join(root, 'public', 'llms-full.txt'), parts.join('\n'));
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
