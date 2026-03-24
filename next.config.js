/** @type {import('next').NextConfig} */
const dexOrigin = (
  process.env.SOLARK_DEX_ORIGIN?.replace(/\/$/, "") || "https://dex.solarkbot.xyz"
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
        destination: dexOrigin,
      },
      {
        source: "/dex/:path*",
        destination: `${dexOrigin}/:path*`,
      },
    ];
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "encoding");
    return config;
  },
};

module.exports = nextConfig;
