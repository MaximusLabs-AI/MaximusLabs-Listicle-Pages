# MaximusLabs listicle data audit

## Conclusion

The workbook can populate the reusable agency records, ranking tables, comparison matrix, agency cards, detailed profiles, ratings, reviews, case studies, portfolio, service coverage, vertical service menus, and source lists for both current listicles.

It cannot reproduce every sentence and link in the sample HTML without additional page-level and source-level data. Imported pages therefore start with `editorialStatus: needsData` and carry visible import warnings in Sanity.

## Workbook coverage

| Workbook area | Sanity destination | Coverage |
| --- | --- | --- |
| `players` | `agency` identity, pricing, trust, engine coverage, wins and losses | Complete for 12 agencies |
| `listings` | `listiclePage.entries` | Complete for two 10-entry rankings with ranks 1 through 10 |
| `directions` | `listicleEntry.directions` | Content present, but the join is ambiguous because there is no `listing_slug` or `vertical` column |
| `service_axis` | `listiclePage.serviceAxis` | Complete, 20 rows per vertical |
| `coverage` | `listicleEntry.coverage` | Complete, 400 marks across the two listicles |
| `vertical_services` | `agency.verticalProfiles[].serviceLines` and universal service lines | Complete for the supplied agencies and verticals |
| `vertical_meta` | `agency.verticalProfiles[]` | Core fields complete; three industry-surface columns are blank on the 10 B2B SaaS rows |
| `quick_answer` | `listiclePage.quickAnswers` | Complete, 10 entries per listicle |
| `ratings` | `agency.ratings` | Rating text complete; all 25 `profile_url` cells are blank |
| `reviews` | `agency.reviews` | Review text complete; all 18 `source_url` cells are blank |
| `cases` | `agency.caseStudies` | Case text complete; all 34 `source_url` cells are blank and 28 of 34 vertical tags are blank |
| `portfolio` | `agency.portfolio` | Complete |
| `below_the_line` | `listiclePage.alsoConsidered` | Scores and exclusion reasons present; all 6 `what_they_are` cells are blank, and `home`/`url` columns do not exist |
| `sources` | `agency.sources` | Complete for the supplied player records |
| `page_spec` | Template structure | Defines section order only; it does not contain publishable page copy |

## Excel updates needed for exact future pages

1. Add a one-row-per-page `listicle_pages` tab with:
   - `listing_slug`
   - `headline`
   - `service_name`
   - `vertical_key`
   - `vertical_label`
   - `year`
   - `dek`
   - `publisher_disclosure`
   - `reviewed_at`
   - `published_at`
   - `seo_title`
   - `meta_description`
   - `canonical_url`
   - `footer_review_note`
   - `footer_link_note`

2. Add `listing_slug` or `vertical` to `directions`. The current importer must infer B2B SaaS rows from the free-text `shown_in` column.

3. Add page-specific methodology data. The sample contains substantial methodology copy, a community finding, and a correction note; `page_spec` only says that those sections exist.

4. Add page-specific question records if question wording or explanatory copy changes by vertical. The current importer supplies the four sample question types as template defaults.

5. Complete `below_the_line` with `home`, `url`, and `what_they_are`. Four cybersecurity IDs (`amplifyed`, `nola`, `platypus`, and `req`) do not exist in `players`, so they cannot inherit website data.

6. Add `profile_url` to ratings, `source_url` to reviews and case studies, and vertical tags to every case study. These are optional for the current card layout but necessary for a fully auditable CMS record.

7. Add an agency-level `review_note` field. The sample HTML displays a narrative evidence note below each agency’s reviews, but the workbook has no source column for it.

8. Populate `named_industry_clients`, `declared_surface`, and `cited_on_prompts` for every vertical, or rename these columns to make their cybersecurity-only scope explicit.

## Sanity model

The implementation normalizes the feed into two documents:

- `agency`: reusable facts, commercials, proof, AEO capability, vertical profiles, and sources. An agency is edited once and reused across listicles.
- `listiclePage`: page copy, ranked entries, scores, directions, coverage matrix, quick answers, methodology, comparison questions, and also-considered firms.

This prevents the repeated agency facts in `listings` from becoming duplicated CMS content while preserving listing-specific rank, scores, positioning, and service coverage.

