import {redirect} from 'next/navigation'

// The blog lives at /blog (matching the public maximuslabs.ai/blog path served
// through the Cloudflare worker). The origin root just forwards there.
export default function RootRedirect() {
  redirect('/blog')
}
