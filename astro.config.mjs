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
      // The default description for pages without their own, the synced spec
      // chapters included. It is also the share-preview text, so it stays the
      // canonical one-liner: verbatim, and between 100 and 160 characters.
      description:
        'Product Definition as Code keeps the agreed product definition in versioned Markdown that delivery work cites instead of restating.',
      logo: { src: './src/assets/pdac.png', alt: 'PDaC' },
      favicon: '/favicon.png',
      head: [
        {
          // The card is rendered by scripts/render-og.mjs and committed. The
          // v query is a cache buster: scrapers key their cache on the full
          // URL, so bump it whenever the card's design changes.
          tag: 'meta',
          attrs: { property: 'og:image', content: 'https://pdac.dev/og-card.png?v=2' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image:width', content: '1200' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image:height', content: '630' },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:alt',
            content: 'Product Definition as Code: define the product once.',
          },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:card', content: 'summary_large_image' },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:image', content: 'https://pdac.dev/og-card.png?v=2' },
        },
        {
          tag: 'script',
          attrs: {
            'data-goatcounter': 'https://pdac-dev.goatcounter.com/count',
            async: true,
            src: '//gc.zgo.at/count.js',
          },
        },
        {
          // Site-wide structured data. Articles add their own TechArticle
          // objects via per-page frontmatter and reference the ids below.
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': 'https://pdac.dev/#org',
                name: 'Product Definition as Code',
                url: 'https://pdac.dev/',
                logo: 'https://pdac.dev/favicon.png',
                sameAs: ['https://github.com/product-definition-as-code'],
              },
              {
                '@type': 'WebSite',
                '@id': 'https://pdac.dev/#website',
                name: 'Product Definition as Code',
                url: 'https://pdac.dev/',
                description:
                  'Product Definition as Code keeps the agreed product definition in versioned Markdown that delivery work cites instead of restating.',
                publisher: { '@id': 'https://pdac.dev/#org' },
              },
            ],
          }),
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
        { label: 'Templates', slug: 'templates' },
        { label: 'Manifesto', slug: 'manifesto' },
        { label: 'Diagrams', slug: 'diagrams' },
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
            {
              label: 'The layer above Spec Kit',
              slug: 'articles/the-layer-above-spec-kit',
            },
          ],
        },
        { label: 'Known limits', slug: 'known-limits' },
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
