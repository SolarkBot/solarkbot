import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";

import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SolarkBot | Crypto apps that feel alive",
  description:
    "SolarkBot builds playful on-chain experiences and interactive crypto apps, including Solark DEX and Solark NFT.",
  metadataBase: new URL("https://solarkbot.xyz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SolarkBot",
    description: "Crypto apps made fun, interactive, and more alive than the usual dashboard stack.",
    url: "https://solarkbot.xyz",
    siteName: "SolarkBot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SolarkBot",
    description: "Interactive crypto products by SolarkBot.",
  },
  icons: {
    icon: "/solarkbot-logo.png",
    apple: "/solarkbot-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${display.variable} ${body.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
