import type {DocumentActionComponent} from 'sanity'

type SlugValue = {current?: string}

export const VisitSiteAction: DocumentActionComponent = (props) => {
  if (!['listiclePage', 'infoArticle'].includes(props.type)) return null

  const document = props.draft || props.version || props.published
  const slug = (document?.slug as SlugValue | undefined)?.current

  return {
    label: 'Visit site',
    disabled: !slug,
    onHandle: () => {
      if (!slug) return
      const prefix = props.type === 'listiclePage' ? '/listicles' : '/blog'
      const pageUrl = new URL(`${prefix}/${encodeURIComponent(slug)}`, window.location.origin)
      window.open(pageUrl.toString(), '_blank', 'noopener,noreferrer')
    },
  }
}