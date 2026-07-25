import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_4px_20px_-8px_oklch(0.4_0.05_210/0.15)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-sm transition-transform group-hover:scale-105"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            <Compass className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold tracking-tight">Safar Saathi</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Budget travel · Pakistan
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:text-foreground [&.active]:bg-secondary"
            activeOptions={{ exact: true }}
          >
            Plan a trip
          </Link>
          <Link
            to="/trips"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:text-foreground [&.active]:bg-secondary"
          >
            My Trips
          </Link>
        </nav>
      </div>
    </header>
  );
}