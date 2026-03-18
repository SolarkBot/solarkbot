import { dash, sentinel } from "@better-auth/infra";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "../db/prisma";
import {
  getAuthBaseUrl,
  getAuthSecret,
  isBetterAuthInfraEnabled,
} from "./config";
import { solanaAuth } from "./solana-plugin";

const plugins = [];

if (isBetterAuthInfraEnabled()) {
  plugins.push(
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY,
      apiUrl: process.env.BETTER_AUTH_API_URL,
      kvUrl: process.env.BETTER_AUTH_KV_URL,
    }),
    sentinel({
      apiKey: process.env.BETTER_AUTH_API_KEY,
      apiUrl: process.env.BETTER_AUTH_API_URL,
      kvUrl: process.env.BETTER_AUTH_KV_URL,
    })
  );
}

plugins.push(solanaAuth(), nextCookies());

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: getAuthBaseUrl(),
  secret: getAuthSecret(),
  plugins,
});
