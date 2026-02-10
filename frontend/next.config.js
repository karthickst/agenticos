/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for deployment with FastAPI
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Trailing slash for proper routing
  trailingSlash: true,

  // Webpack configuration to exclude Node.js modules from client bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
