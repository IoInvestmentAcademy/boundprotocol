/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add any domains you need to load images from
  images: {
    domains: ['your-domain.com'],
  },
  // Add any rewrites or redirects if needed
  async rewrites() {
    return [];
  },
  // Enable static optimization where possible
  experimental: {
    optimizeFonts: true,
  },
}

module.exports = nextConfig 