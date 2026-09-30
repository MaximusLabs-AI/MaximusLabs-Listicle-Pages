import type {DocumentActionComponent} from 'sanity'

import {isLegacyUrl, SITE} from '../lib/legacyRules'

type SlugValue = {current?: string}

// Where a document is published on the live site (see sanity/lib/legacyRules.ts):
// its old-folder address when it has one, otherwise its /blog address.
function publicUrl(type: string, doc: Record<string, unknown>, slug: string): string {
  if (type === 'listiclePage' && isLegacyUrl(doc.canonicalUrl)) return doc.canonicalUrl
  if (type === 'infoArticle') {
    // A migrated article's live page is its original Webflow page.
    if (doc.sourceUrl) {
      if (isLegacyUrl(doc.sourceUrl)) return doc.sourceUrl
    } else if (isLegacyUrl(doc.replacesUrl)) {
      return doc.replacesUrl
    }
  }
  return `${SITE}/blog/${encodeURIComponent(slug)}`
}

export const VisitSiteAction: DocumentActionComponent = (props) => {
  if (!['listiclePage', 'infoArticle'].includes(props.type)) return null

  const document = props.draft || props.version || props.published
  const slug = (document?.slug as SlugValue | undefined)?.current

  return {
    label: 'Visit site',
    group: ['paneActions'],
    disabled: !slug,
    onHandle: () => {
      if (!slug || !document) return
      window.open(publicUrl(props.type, document, slug), '_blank', 'noopener,noreferrer')
    },
  }
}
