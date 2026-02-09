/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig
