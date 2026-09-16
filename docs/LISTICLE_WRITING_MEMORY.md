# MaximusLabs listicle writing memory

This is the repository-side companion to the `writing_memory` worksheet in `MaximusLabs listicle feed.xlsx`. The workbook is the content source of truth; Sanity is the structured publishing layer; the Next.js `ListicleTemplate` is the fixed renderer.

## Non-negotiable writing rules

1. Use approved workbook data. Do not restore copy from an earlier draft.
2. Join reusable agency records with `player_id`.
3. Preserve the order of pipe-separated values when converting them to arrays.
4. Write `Not published` when evidence is unknown. Never invent a claim, rating, result, client, or price.
5. Reuse an existing agency document and add only the missing vertical-specific evidence.
6. Give every new vertical its own service axis; do not reuse another vertical taxonomy.
7. Keep scores as editorial and audit inputs. Publish the explanation and evidence, not a score-led sales claim.
8. Every outbound link rendered by the page must use `rel="nofollow noopener"`.

## Fixed page anatomy

Every listicle uses the same ordered structure:

1. Top navigation
2. Breadcrumb and review row
3. Headline
4. One-sentence dek
5. Publisher disclosure
6. Three-up assessment key
7. Quick answer panel
8. Sticky contents rail
9. Side-by-side comparison
10. Ranked agency cards and full profiles
11. Methodology
12. Service matrix
13. Comparison questions
14. Also considered
15. Footer disclosures

The singleton Sanity document `listicleTemplate.default` stores this section order and the workbook writing rules. The frontend fetches it globally for every `listiclePage`; individual page documents do not expose internal template-reference fields. Editors change content fields, while the shared React template and global CSS preserve the structure and design.

## Workbook-to-Sanity mapping

| Workbook tab | Sanity destination |
| --- | --- |
| `players` | Reusable `agency` identity, positioning, pricing, trust, services, tools, and verification date |
| `ratings`, `reviews`, `review_notes` | Agency proof, source URLs, verification, and evidence note |
| `cases`, `portfolio`, `sources` | Agency case studies, work samples, and evidence links |
| `vertical_meta`, `vertical_services` | Agency vertical profile and service lines |
| `listicle_pages` | Page headline, dek, disclosure, dates, methodology notes, SEO, canonical URL, footer, and workflow status |
| `listings`, `directions`, `coverage` | Ranked entries, reasons, service directions, scores, and coverage marks |
| `quick_answer`, `assessment_keys` | Hero quick answers and three-up assessment key |
| `service_axis` | Vertical-specific comparison taxonomy |
| `methodology`, `questions` | Page methodology steps and comparison sections |
| `below_the_line` | Also-considered firms and exclusion rationale |
| `page_spec`, `writing_memory` | Singleton `listicleTemplate.default` structure and reusable authoring rules |

## Adding a new listicle

1. Add one row to `listicle_pages` with a unique `listing_slug` and complete page-level copy.
2. Add ten or the intended number of ranked rows to `listings`.
3. Add matching `quick_answer`, `assessment_keys`, `methodology`, and `questions` rows for the same slug.
4. Add vertical-specific `service_axis`, `directions`, `coverage`, and `vertical_meta`/`vertical_services` records where needed.
5. Add excluded candidates to `below_the_line` with evidence and reconsideration criteria.
6. Run `pnpm audit:workbook`. Resolve every warning.
7. Run `pnpm import:workbook` to preview document counts.
8. Run `pnpm import:workbook -- --commit` to create or update the Sanity documents.
9. Review the rendered `/listicles/[slug]` page, then move the page from `Ready for review` to `Approved` in Studio.

The importer uses stable IDs, so repeating an import updates the same template, agencies, and listicle pages without creating duplicates.
