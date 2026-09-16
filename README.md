# MaximusLabs Listicle Pages

This project turns the approved Excel feed into reusable Sanity documents and renders every page through one fixed Next.js listicle template based on the supplied sample HTML.

## What is included

- Embedded Sanity Studio at `/studio`
- A separate singleton `listicleTemplate.default` collection containing the required 15-section anatomy and workbook writing memory, fetched globally rather than stored on each page
- Reusable `agency` and `listiclePage` schemas with workbook-to-field mappings
- Workbook validation and idempotent Sanity import scripts
- Dynamic `/listicles/[slug]` pages; adding a valid workbook slug creates another page on the same template
- Desktop and mobile preview controls

The detailed authoring rules and worksheet mapping live in [docs/LISTICLE_WRITING_MEMORY.md](./docs/LISTICLE_WRITING_MEMORY.md).

The signed Sanity webhook values are documented in [docs/SANITY_REVALIDATION.md](./docs/SANITY_REVALIDATION.md). Add the same private SANITY_REVALIDATE_SECRET value to .env.local, Vercel, and the webhook secret field.

## Setup

The local `.env.local` supplies the Sanity project, dataset, API version, and private tokens. Tokens must never use a `NEXT_PUBLIC_` prefix. Because the production dataset is private, Vercel must also contain the server-only `SANITY_API_READ_TOKEN`; keep `SANITY_API_WRITE_TOKEN` local.

```powershell
pnpm install
pnpm audit:workbook
pnpm import:workbook
pnpm dev
```

`pnpm import:workbook` is a dry run. When the audit reports zero warnings, write the singleton template, agencies, and pages to Sanity with:

```powershell
pnpm import:workbook -- --commit
```

Stable IDs such as `listicleTemplate.default`, `agency.maximuslabs`, and `listicle.10-best-aeo-agencies-cybersecurity` make every later import an update rather than a duplicate.

## Editorial workflow

The workbook is the source of truth for agency data, page copy, methodology, questions, SEO, and template-writing rules. A complete imported page starts as `Ready for review`. Review the rendered page in the browser, then change its status to `Approved` in Studio.

To create another page, add all required rows under one new `listing_slug`, run the audit, and import. The homepage and dynamic route discover the new Sanity document automatically.

## Commands

- `pnpm dev`: run the Next.js site and embedded Studio
- `pnpm build`: production build
- `pnpm lint`: TypeScript check
- `pnpm audit:workbook`: validate joins, required page data, and template memory
- `pnpm import:workbook`: preview the import
- `pnpm import:workbook -- --commit`: write the template, agencies, and pages to Sanity
- `pnpm draft:listicles -- --commit`: create or replace the two complete workbook pages as Sanity drafts
- `pnpm studio`: run the standalone Sanity Studio development server
- `pnpm schema:validate`: validate the complete Studio schema
- `pnpm schema:deploy`: register the schema with the configured Sanity workspace
- `pnpm vercel-link`: link this checkout to the existing Vercel project
- `pnpm vercel-pull`: pull linked Vercel settings and environment variables
- `pnpm vercel-build`: generate a local Vercel build
- `pnpm deploy-preview`: create a Vercel preview deployment
- `pnpm deploy-production`: deploy to Vercel production

## Vercel deployment

`vercel.json` locks the framework to Next.js and clears the incorrect `dist` output-directory override. The connected Vercel Git integration creates production deployments from `main` and preview deployments from other branches and pull requests.

The GitHub workflow at `.github/workflows/deploy.yml` runs the TypeScript check for every push and pull request and provides a manual preview or production CLI deployment. Its repository secrets are `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.

## Schema deployment permission

Viewer and Editor content tokens can read and import documents. Remote schema registration separately requires `Deploy Studio` / `deploySchema` permission. The schema remains fully available in the embedded Studio even if the current token cannot register it remotely.
