import type { NextConfig } from "next";

const backendUrl =
  process.env.INTERNAL_BACKEND_URL ||
  (process.env.API_URL
    ? process.env.API_URL.replace(/\/api\/v1\/?$/, "")
    : "http://localhost:8000");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;

