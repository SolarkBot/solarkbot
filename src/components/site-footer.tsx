import Link from "next/link";

import { contractAddress, footerLinks } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-black/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12">
        <div>
          <p className="font-display text-2xl tracking-[0.24em] text-white">SOLARKBOT</p>
          <p className="mt-2 text-sm text-white/[0.56]">solarkbot.xyz</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/[0.58]">
            Crypto apps made more interactive, more immersive, and less lifeless than the usual
            dashboard stack.
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:items-end">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {footerLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm uppercase tracking-[0.22em] text-white/[0.62] transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/[0.38]">
            CA: {contractAddress.slice(0, 6)}...{contractAddress.slice(-6)}
          </p>
          <p className="text-sm text-white/[0.44]">
            © {new Date().getFullYear()} SolarkBot. Interactive crypto studio.
          </p>
        </div>
      </div>
    </footer>
  );
}
