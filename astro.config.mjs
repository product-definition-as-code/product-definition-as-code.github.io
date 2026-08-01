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
        'PDaC is an open methodology to model your product as a versioned, validated graph upstream of Spec-Driven Development.',
      logo: { src: './src/assets/pdac.png', alt: 'PDaC' },
      favicon: '/favicon.png',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/product-definition-as-code',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/product-definition-as-code/spec/edit/main/',
      },
      sidebar: [
        { label: 'Manifesto', slug: 'manifesto' },
        { label: 'Known limits', slug: 'known-limits' },
        { label: 'Specification', items: [{ autogenerate: { directory: 'spec' } }] },
        {
          label: 'Governance',
          link: 'https://github.com/product-definition-as-code/spec/blob/main/GOVERNANCE.md',
        },
        {
          label: 'Reference implementation',
          link: 'https://github.com/juangcarmona/productshape',
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
