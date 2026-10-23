import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/settings',
        destination: '/profile',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
