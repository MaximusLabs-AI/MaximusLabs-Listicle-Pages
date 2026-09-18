import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Listicles moved under the unified /blog path.
      {source: '/listicles/:slug', destination: '/blog/:slug', permanent: true},
    ]
  },
}

export default nextConfig
