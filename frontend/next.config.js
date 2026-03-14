/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
<<<<<<< HEAD
    domains: ['iho.sqtecnologiadainformacao.com', 'localhost'],
=======
    domains: ['iho.sqtecnologiadainformacao.com', 'localhost', '389bf6d0-2761-4f9b-ba77-881c8021d0b4-00-3skvmcsdsjstw.spock.replit.dev'],
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  experimental: {
    scrollRestoration: true,
  },

  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ],

  poweredByHeader: false,
}

module.exports = nextConfig
