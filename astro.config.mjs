// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypePdacIds from './scripts/rehype-pdac-ids.mjs';

export default defineConfig({
  site: 'https://pdac.dev',
  markdown: {
    rehypePlugins: [rehypePdacIds],
  },
  integrations: [
    starlight({
      title: 'Product Definition as Code',
      description:
        'Product Definition as Code keeps the agreed product definition in versioned Markdown that delivery work cites instead of restating. When cited text changes, tools detect documentation drift in the recorded citations.',
      logo: { src: './src/assets/pdac.png', alt: 'PDaC' },
      favicon: '/favicon.png',
      head: [
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: 'https://pdac.dev/og.png' },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:card', content: 'summary_large_image' },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:image', content: 'https://pdac.dev/og.png' },
        },
        {
          tag: 'script',
          attrs: {
            'data-goatcounter': 'https://pdac-dev.goatcounter.com/count',
            async: true,
            src: '//gc.zgo.at/count.js',
          },
        },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/product-definition-as-code',
        },
      ],
      editLink: {
        // Site-authored pages live in this repository. Synced spec pages carry a
        // per-page editUrl (injected by scripts/sync-spec.mjs) pointing at their
        // true source in the spec repository.
        baseUrl:
          'https://github.com/product-definition-as-code/product-definition-as-code.github.io/edit/main/',
      },
      sidebar: [
        { label: 'Adoption', slug: 'adoption' },
        { label: 'Manifesto', slug: 'manifesto' },
        { label: 'Diagrams', slug: 'diagrams' },
        { label: 'Known limits', slug: 'known-limits' },
        {
          label: 'Articles',
          items: [
            { label: 'Overview', slug: 'articles' },
            {
              label: 'Your software specification is not your product definition',
              slug: 'articles/your-software-specification-is-not-your-product-definition',
            },
            {
              label: 'Where Product Definition as Code comes from',
              slug: 'articles/what-product-definition-as-code-puts-together',
            },
          ],
        },
        {
          // Mirrors the spec index's grouping (kernel, reference profile, reference
          // workflow). Explicit on purpose: a chapter renamed upstream breaks the
          // build loudly instead of silently reordering the nav.
          label: 'Specification',
          items: [
            { label: 'Overview', slug: 'spec' },
            'spec/terminology',
            {
              label: 'The kernel',
              items: [
                'spec/identifiers',
                'spec/relationships',
                'spec/citation-contract',
                'spec/validation',
                'spec/configuration',
              ],
            },
            {
              label: 'The reference profile',
              items: ['spec/artifacts', 'spec/frontmatter-reference'],
            },
            {
              label: 'The reference workflow',
              items: ['spec/product-changes'],
            },
            'spec/conformance',
          ],
        },
        {
          label: 'Governance',
          link: 'https://github.com/product-definition-as-code/spec/blob/main/GOVERNANCE.md',
        },
        {
          label: 'Reference implementation',
          link: 'https://github.com/juangcarmona/productshape',
        },
      ],
      components: {
        // Starlight ships no header navigation and the splash homepage has no
        // sidebar, so the header is overridden to add one. The override still
        // renders the stock SiteTitle, Search, SocialIcons and ThemeSelect.
        Header: './src/components/Header.astro',
      },
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
