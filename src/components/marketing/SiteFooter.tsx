import Link from "next/link";
import { Logo } from "@/components/Logo";
import { isLucidAgentsEnabled } from "@/lib/features";
import { productSurfaceList } from "@/lib/product-surfaces";

export function SiteFooter() {
  const isLucidEnabled = isLucidAgentsEnabled();

  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Logo size={20} />
          <span className="text-sm font-medium">SolarkBot</span>
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          Solana-native AI, wallet auth, and agent creation flows in one stack.
        </p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/for-agents" className="transition-colors hover:text-foreground">
            For Agents
          </Link>
          {isLucidEnabled ? (
            <Link href="/agents" className="transition-colors hover:text-foreground">
              Lucid Agents
            </Link>
          ) : null}
          <Link href="/chat" className="transition-colors hover:text-foreground">
            App
          </Link>
          {productSurfaceList.map((surface) => (
            <a
              key={surface.id}
              href={surface.url}
              className="transition-colors hover:text-foreground"
            >
              {surface.label}
            </a>
          ))}
          <a
            href="https://x.com/solarkbot"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            X
          </a>
          <a
            href="https://github.com/SolarkBot"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
