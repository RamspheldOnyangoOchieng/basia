/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['candy.ai'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'candy.ai',
        pathname: '/assets/**',
      },
    ],
  },
}

export default nextConfig
