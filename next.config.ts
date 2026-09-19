import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Listicles moved under the unified /blog path.
      {source: '/listicles/:slug', destination: '/blog/:slug', permanent: true},
    ]
  },
  // The Vercel origin must never be indexed directly — only the public
  // maximuslabs.ai/blog/* URLs (served through the Cloudflare worker, which
  // strips this header) should be. Keeps ranking signal on the primary domain.
  async headers() {
    return [
      {source: '/:path*', headers: [{key: 'X-Robots-Tag', value: 'noindex'}]},
    ]
  },
}

export default nextConfig
