/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Enable static exports for Render
  distDir: '.next',
  // Configure environment variables
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig; 