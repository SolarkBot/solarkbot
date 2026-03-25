import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { isLucidAgentsEnabled } from "@/lib/features";
import { productSurfaceList } from "@/lib/product-surfaces";
import { cn } from "@/lib/utils";
import WalletButton from "@/components/wallet/WalletButton";

interface SiteHeaderProps {
  currentPath?: "/" | "/agents" | "/chat" | "/for-agents" | "/dex";
}

export function SiteHeader({ currentPath = "/" }: SiteHeaderProps) {
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/for-agents", label: "For Agents" },
    ...(isLucidAgentsEnabled() ? [{ href: "/agents", label: "Lucid Agents" }] : []),
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <Logo size={32} />
          <span className="text-lg font-bold tracking-tight">SolarkBot</span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-border/50 bg-card/40 p-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                currentPath === item.href && "bg-secondary text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          {productSurfaceList.map((surface) => (
            <a
              key={surface.id}
              href={surface.url}
              className={cn(
                "rounded-full border border-solana-green/20 bg-gradient-to-r from-solana-purple/10 to-solana-green/10 px-4 py-2 text-sm font-medium text-foreground/85",
                "transition-colors hover:text-foreground"
              )}
            >
              {surface.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/chat" className="hidden sm:block">
            <Button
              variant={currentPath === "/chat" ? "solana" : "ghost"}
              size="sm"
            >
              Launch App
            </Button>
          </Link>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
