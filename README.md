# pdac.dev

The website for Product Definition as Code: landing page, the manifesto, and the specification rendered per chapter. Built with [Astro Starlight](https://starlight.astro.build).

## Source of truth

This repository contains no specification content. Everything under `/spec/` and `/manifesto/` is synced at build time from the [`spec`](https://github.com/product-definition-as-code/spec) repository by `scripts/sync-spec.mjs`. To change the spec or the manifesto, open a PR there.

## Local development

```bash
npm ci
npm run sync            # expects ../spec checked out next to this repo
npm run dev
```

`npm run sync <path>` accepts an explicit path to a spec checkout.

## Deployment

Pushed to `main`, built and deployed by `.github/workflows/deploy.yml` (GitHub Actions → GitHub Pages). One-time repository setup:

1. Settings → Pages → Source: **GitHub Actions**.
2. Settings → Pages → Custom domain: `pdac.dev` (DNS: CNAME to `product-definition-as-code.github.io`, DNS-only), then enable **Enforce HTTPS** once the certificate is issued.
3. Org Settings → Verified and approved domains → add `pdac.dev`.

To rebuild when the spec changes without touching this repo, the spec repository can send a `repository_dispatch` event of type `spec-updated` (or just re-run the workflow manually).
