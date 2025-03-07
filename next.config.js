/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['randomuser.me'],
  },
  // Disable ESLint during production builds
  eslint: {
    // Warning: only use this in development, not in production
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 