import type {CustomValidator} from 'sanity'

import {isLegacyUrl, LEGACY_FOLDERS, SITE} from './legacyRules'

// Studio check for a page published at an old Webflow-folder address. The address
// must be free: not a migrated article's page (those stay on Webflow) and not
// already claimed by another page. `mustBeOld` rejects addresses outside the old
// folders ("Replaces old page"); otherwise they are allowed (a listicle's
// Canonical URL may be its /blog address).
export const checkOldAddress =
  ({mustBeOld}: {mustBeOld: boolean}): CustomValidator<string | undefined> =>
  async (value, context) => {
    if (!value) return true
    if (!isLegacyUrl(value)) {
      return mustBeOld ? `Use an address that starts with ${LEGACY_FOLDERS.map((folder) => SITE + folder).join(' or ')}` : true
    }
    const id = String(context.document?._id || '').replace(/^drafts\./, '')
    const clash = await context.getClient({apiVersion: '2026-09-16'}).fetch<{title?: string; migrated: boolean} | null>(
      `*[_type in ["infoArticle", "listiclePage"] && !(_id in [$id, "drafts." + $id]) && $url in [sourceUrl, replacesUrl, canonicalUrl]][0]{title, "migrated": defined(sourceUrl)}`,
      {id, url: value},
    )
    if (!clash) return true
    return clash.migrated
      ? 'This address belongs to a migrated article, which stays on Webflow. Choose another page.'
      : `"${clash.title || 'Another page'}" already uses this address.`
  }
