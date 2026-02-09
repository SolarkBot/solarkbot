import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { consumeNonce } from "@/lib/redis";
import {
  verifySIWSSignature,
  extractWalletAddress,
  extractNonce,
  extractDomain,
} from "@/lib/solana/wallet-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "solana",
      name: "Solana",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature) {
          return null;
        }

        const { message, signature } = credentials;

        // Extract fields from the SIWS message
        const walletAddress = extractWalletAddress(message);
        if (!walletAddress) {
          return null;
        }

        // Verify domain matches the configured NEXTAUTH_URL
        const messageDomain = extractDomain(message);
        const expectedDomain = new URL(
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        ).host;

        if (messageDomain !== expectedDomain) {
          return null;
        }

        // Verify nonce from Redis (one-time use)
        const messageNonce = extractNonce(message);
        if (!messageNonce) {
          return null;
        }

        const storedNonce = await consumeNonce(walletAddress);
        if (!storedNonce || storedNonce !== messageNonce) {
          return null;
        }

        // Verify the cryptographic signature
        const isValid = verifySIWSSignature(message, signature, walletAddress);
        if (!isValid) {
          return null;
        }

        // Upsert the user in the database
        const user = await prisma.user.upsert({
          where: { walletAddress },
          update: { lastLoginAt: new Date() },
          create: { walletAddress },
        });

        return {
          id: user.walletAddress,
          name: user.walletAddress,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.walletAddress = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.walletAddress) {
        session.user = {
          ...session.user,
          name: token.walletAddress as string,
          walletAddress: token.walletAddress as string,
        };
      }
      return session;
    },
  },

  pages: {
    signIn: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
