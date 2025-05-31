/** @type {import('next').NextConfig} */
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    domains: [
      'randomuser.me',
      'localhost',
      'renavestapp.com',
      'www.renavestapp.com',
      'renavest-therapist-images.s3.amazonaws.com',
      'd2qcuj7ucxw61o.cloudfront.net',
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '*',
        pathname: '/api/images/**',
      },
      {
        protocol: 'https',
        hostname: 'renavestapp.com',
        port: '*',
        pathname: '/api/images/**',
      },
      {
        protocol: 'https',
        hostname: 'renavestapp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.renavestapp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'renavest-therapist-images.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'renavest-therapist-images.s3.amazonaws.com',
        pathname: '/therapists/**',
      },
    ],
    unoptimized: false,
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    swcPlugins: [
      [
        '@preact-signals/safe-react/swc',
        {
          mode: 'auto',
        },
      ],
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // {
      //   source: '/',
      //   destination: '/',
      //   permanent: false,
      // },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
      {
        source: '/api/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
    ];
  },
};

export default config;
