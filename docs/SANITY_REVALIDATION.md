# Sanity revalidation webhook

Create one GROQ-powered webhook in the Sanity project settings with these values.

| Field | Value |
| --- | --- |
| Name | `MaximusLabs listicle revalidation` |
| URL | `https://maximus-labs-listicle-pages.vercel.app/api/revalidate` |
| Dataset | `production` |
| Trigger on | `Create`, `Update`, and `Delete` |
| HTTP method | `POST` |
| Status | Enabled |
| API version | `v2026-09-16` |
| Drafts | Off |
| Versions | Off |
| HTTP headers | None |
| Secret | The exact value of `SANITY_REVALIDATE_SECRET` from Vercel |

Filter:

```groq
coalesce(after()._type, before()._type) in ["listiclePage", "agency", "listicleTemplate"]
```

Projection:

```groq
{
  "_type": coalesce(after()._type, before()._type),
  "_id": coalesce(after()._id, before()._id),
  "slug": coalesce(after().slug.current, before().slug.current),
  "operation": delta::operation()
}
```

Sanity uses the secret to sign the request in the `sanity-webhook-signature` header. The route validates that signature with `next-sanity/webhook` before revalidating the homepage, listicle route, and the specific listicle slug when available.

Draft triggering intentionally remains off. Draft documents do not appear on the published site, and enabling draft events would call the webhook repeatedly while an editor types. Publishing a draft creates or updates the published document and triggers revalidation.
