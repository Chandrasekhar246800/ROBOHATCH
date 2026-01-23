/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BACKEND_BASE_URL: 'http://10.0.1.7:3001',
  },
}

module.exports = nextConfig
