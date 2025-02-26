import type { NextConfig } from 'next';

const nextConfig = {
  experimental: {
    swcPlugins: [
      [
        '@preact-signals/safe-react/swc',
        {
          // you should use `auto` mode to track only components which uses `.value` access.
          // Can be useful to avoid tracking of server side components
          mode: 'auto',
        } /* plugin options here */,
      ],
    ],
  },
};

export default nextConfig;
