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
  async redirects() {
    return [
      {
        source: "/simulator",
        destination: "/dataroom",
        permanent: true,
      },
      {
        source: "/simulator/:path*",
        destination: "/dataroom/:path*",
        permanent: true,
      },
    ];
  },
  // Serve the whitepaper PDF inline in the browser (not as a forced download)
  async headers() {
    return [
      {
        source: "/bound-whitepaper-2026.pdf",
        headers: [
          { key: "Content-Type", value: "application/pdf" },
          { key: "Content-Disposition", value: 'inline; filename="Bound Whitepaper 2026.pdf"' },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/Bound%20Whitepaper%202026.pdf",
        headers: [
          { key: "Content-Type", value: "application/pdf" },
          { key: "Content-Disposition", value: 'inline; filename="Bound Whitepaper 2026.pdf"' },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
  // Enable static optimization where possible
  experimental: {
    optimizeFonts: true,
  },
}

module.exports = nextConfig
