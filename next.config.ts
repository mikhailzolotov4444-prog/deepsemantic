import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Do not advertise the framework in response headers.
  poweredByHeader: false,
  experimental: {
    // Admin uploads go through a Server Action. Vercel itself refuses bodies above 4.5 MB.
    serverActions: { bodySizeLimit: "4.5mb" },
  },
};

export default nextConfig;
