/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['node:sqlite'],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
