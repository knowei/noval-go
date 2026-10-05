import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NOVAL_BUILD_DIR || '.next',
  output: "standalone",
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    '192.168.0.105',
    '192.168.31.142',
    '192.168.237.1',
    'localhost:3000',
    '127.0.0.1:3000',
  ],
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5173';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
