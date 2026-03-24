/** @type {import('next').NextConfig} */
const dexOrigin = (
  process.env.SOLARK_DEX_ORIGIN?.replace(/\/$/, "") || "https://solark-dex.vercel.app"
);

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "ioredis"],
  },
  async rewrites() {
    if (!dexOrigin) {
      return [];
    }

    return [
      {
        source: "/dex",
        destination: `${dexOrigin}/dex`,
      },
      {
        source: "/dex/:path*",
        destination: `${dexOrigin}/dex/:path*`,
      },
    ];
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "encoding");
    return config;
  },
};

module.exports = nextConfig;
