/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://pulseai-dashboard.onrender.com',
    NEXT_PUBLIC_MOCK_MODE: process.env.NEXT_PUBLIC_MOCK_MODE || 'false',
  },
}

module.exports = nextConfig
