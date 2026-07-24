import { Compass } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-6 text-xs text-muted-foreground">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-md text-primary-foreground"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        >
          <Compass className="h-3.5 w-3.5" />
        </span>
        <span>
          Made with <span className="text-accent">❤</span> for Pakistani students · Safar Saathi
        </span>
      </div>
    </footer>
  );
}