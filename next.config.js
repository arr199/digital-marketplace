/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",
  experimental: {
    webpackBuildWorker: true,
  },
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: "memory",
      });
    }
    // Important: return the modified config
    return config;
  },
  images: {
    remotePatterns: [
      {
        hostname: "digital.marketplace.abielrodriguez.dev",
        pathname: "**",
        port: "",
        protocol: "https",
      },
      {
        hostname: "www.digital.marketplace.abielrodriguez.dev",
        pathname: "**",
        port: "",
        protocol: "https",
      },
      {
        hostname: "localhost",
        pathname: "**",
        port: "3400",
        protocol: "http",
      },

      {
        hostname: "188.245.190.65",
        pathname: "**",
        port: "3400",
        protocol: "https",
      },
      {
        hostname: "188.245.190.65",
        pathname: "**",
        port: "3400",
        protocol: "http",
      },
    ],
  },
};

module.exports = nextConfig;
