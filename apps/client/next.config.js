/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [{ hostname: "images.clerk.dev" }],
  },
};

module.exports = nextConfig;
