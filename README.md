# MaximusLabs Listicle Pages

This project turns the supplied Excel feed into reusable Sanity documents and renders them through a Next.js template based on the supplied sample HTML.

## What is included

- Embedded Sanity Studio at `/studio`
- `agency` and `listiclePage` schemas with reusable object types
- Workbook audit and dry-run import scripts
- Idempotent Sanity import using stable document IDs
- Dynamic `/listicles/[slug]` pages with the sample directory, comparison, cards, profile, methodology, service matrix, questions, and also-considered structure
- Desktop and mobile preview controls

## Setup

The existing `.env.local` supplies the Sanity project, dataset, API version, and private tokens. Tokens must never use a `NEXT_PUBLIC_` prefix.

```powershell
pnpm install
pnpm audit:workbook
pnpm import:workbook
pnpm dev
```

`pnpm import:workbook` is a dry run. After reviewing [DATA_AUDIT.md](./DATA_AUDIT.md), write the documents to Sanity with:

```powershell
pnpm import:workbook -- --commit
```

The importer uses stable IDs such as `agency.maximuslabs` and `listicle.10-best-aeo-agencies-cybersecurity`, so a later import updates the same documents instead of creating duplicates.

## Editorial workflow

Imported listicle pages intentionally start as `Needs data`. Complete the warnings shown in the Sanity workflow group, review the rendered page, and then change the status to `Approved`.

The workbook is the source of truth for reusable agency and ranking data. Sanity is the source of truth for page-level editorial copy that the workbook does not currently contain.

## Commands

- `pnpm dev`: run the Next.js site and embedded Studio
- `pnpm build`: production build
- `pnpm lint`: TypeScript check
- `pnpm audit:workbook`: validate joins and report missing page data
- `pnpm import:workbook`: prepare a dry run
- `pnpm import:workbook -- --commit`: write published documents to Sanity
- `pnpm studio`: run the standalone Sanity Studio development server
- `pnpm schema:validate`: validate the complete Studio schema
- `pnpm schema:deploy`: register the schema with the configured Sanity workspace
- `pnpm vercel-link`: link this checkout to the existing Vercel project
- `pnpm vercel-pull`: pull linked Vercel settings and environment variables
- `pnpm vercel-build`: generate a local Vercel build
- `pnpm deploy-preview`: create a Vercel preview deployment
- `pnpm deploy-production`: deploy to Vercel production

## Vercel deployment

`vercel.json` locks the framework to Next.js and clears the incorrect `dist` output-directory override. Vercel will use its managed Next.js build output.

The connected Vercel Git integration remains the automatic deployment path:

- pushes to `main` create production deployments
- pushes to other branches create preview deployments
- pull requests receive Vercel previews

The GitHub workflow at `.github/workflows/deploy.yml` runs the TypeScript check for every push and pull request. It also provides a manual **Run workflow** action for preview or production CLI deployments without creating duplicate automatic deployments.

Before using the manual deployment job, add these GitHub repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Create a scoped token in Vercel. The organization and project IDs are available in `.vercel/project.json` after running `pnpm vercel-link`. Never commit that directory or any token.


## Schema deployment permission

The supplied Viewer and Editor tokens are sufficient for reading content and importing documents. Sanity schema registration is a separate management operation and requires a token or logged-in user with `Deploy Studio` / `deploySchema` permission (normally Developer or an appropriately scoped custom role).

The current tokens do not have that permission, so the schema is complete and available in the local embedded Studio but has not been registered in the remote Sanity workspace. After supplying an authorized token as `SANITY_AUTH_TOKEN`, run `pnpm schema:deploy`.

No workbook documents have been written to the production dataset. The importer remains dry-run by default because the audit identifies publish-blocking editorial gaps.
