/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output only for Docker deployment
  // Vercel handles this automatically
  ...(process.env.DOCKER_BUILD === 'true' && { output: 'standalone' }),

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  },

  async rewrites() {
    // Only use rewrites in development or when RUST_API_URL is set
    if (process.env.NODE_ENV === 'development' || process.env.RUST_API_URL) {
      return [
        {
          source: '/api/v1/:path*',
          destination: `${process.env.RUST_API_URL || 'http://localhost:3001'}/api/v1/:path*`,
        },
      ];
    }
    return [];
  },

  // Webpack configuration to exclude Node.js modules from client bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'path' modules on the client to prevent bundling errors
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
