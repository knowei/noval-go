import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5173/api/:path*',
      },
      {
        source: '/proxy',
        destination: 'http://127.0.0.1:5173/proxy',
      },
    ];
  },
};

export default nextConfig;
