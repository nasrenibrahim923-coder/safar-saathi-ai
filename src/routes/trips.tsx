import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, MapPin, Calendar, Wallet, Sparkles, Mountain, Building2, Waves, Trees, TrendingUp, Layers } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { deleteTrip, loadTrips } from "@/lib/trips-store";
import type { SavedTrip } from "@/lib/trip-types";

type DestTheme = {
  icon: typeof Mountain;
  label: string;
  gradient: string;
  tint: string;
};

function themeForDestination(dest: string): DestTheme {
  const d = (dest || "").toLowerCase();
  const northern = ["hunza", "skardu", "gilgit", "murree", "naran", "kaghan", "swat", "chitral", "kalash", "nathia", "ayubia", "malam", "fairy", "khunjerab", "shogran", "kumrat", "deosai"];
  const coastal = ["karachi", "gwadar", "ormara", "keenjhar", "clifton", "sonmiani", "astola"];
  const desert = ["cholistan", "thar", "bahawalpur", "derawar"];
  const urban = ["lahore", "islamabad", "rawalpindi", "faisalabad", "multan", "peshawar", "quetta", "sialkot", "hyderabad", "sukkur"];
  if (northern.some((k) => d.includes(k))) {
    return { icon: Mountain, label: "Northern areas", gradient: "linear-gradient(135deg, oklch(0.58 0.11 195), oklch(0.72 0.12 190))", tint: "var(--primary)" };
  }
  if (coastal.some((k) => d.includes(k))) {
    return { icon: Waves, label: "Coastal", gradient: "linear-gradient(135deg, oklch(0.62 0.12 220), oklch(0.75 0.1 200))", tint: "oklch(0.62 0.12 220)" };
  }
  if (desert.some((k) => d.includes(k))) {
    return { icon: Trees, label: "Desert", gradient: "linear-gradient(135deg, #C9A961, oklch(0.72 0.17 30))", tint: "#C9A961" };
  }
  if (urban.some((k) => d.includes(k))) {
    return { icon: Building2, label: "City break", gradient: "linear-gradient(135deg, oklch(0.72 0.17 30), oklch(0.8 0.15 35))", tint: "var(--accent)" };
  }
  return { icon: MapPin, label: "Adventure", gradient: "var(--gradient-hero)", tint: "var(--primary)" };
}

function formatPKR(n: number) {
  return "PKR " + Math.round(n).toLocaleString("en-PK");
}

export const Route = createFileRoute("/trips")({
  component: TripsShell,
});

function TripsShell() {
  // Nested route (/trips/$id) renders via <Outlet />; index (/trips) shows list.
  const matches = useMatches();
  const isChild = matches.some((m) => m.routeId === "/trips/$id");
  return (
    <div className="min-h-screen" style={{ backgroundImage: "var(--gradient-soft)" }}>
      <Toaster richColors position="top-center" />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {isChild ? <Outlet /> : <TripsList />}
      </main>
      <SiteFooter />
    </div>
  );
}

function TripsList() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);

  useEffect(() => {
    setTrips(loadTrips());
  }, []);

  function handleDelete(id: string) {
    deleteTrip(id);
    setTrips(loadTrips());
  }

  const totalTrips = trips.length;
  const totalBudget = trips.reduce((s, t) => s + (t.input.budgetPKR || 0), 0);
  const totalCost = trips.reduce((s, t) => s + (t.itinerary.totalEstimatedCostPKR || 0), 0);
  const avgCost = totalTrips > 0 ? totalCost / totalTrips : 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Trips</h1>
          <p className="text-sm text-muted-foreground">Your saved Safar Saathi itineraries.</p>
        </div>
        <Button asChild style={{ backgroundImage: "var(--gradient-hero)" }} className="text-primary-foreground">
          <Link to="/"><Sparkles className="mr-1 h-4 w-4" /> Plan a new trip</Link>
        </Button>
      </div>

      {trips.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Total Trips Planned", value: String(totalTrips), icon: <Layers className="h-4 w-4" />, color: "var(--primary)" },
            { label: "Total Budget Planned", value: formatPKR(totalBudget), icon: <Wallet className="h-4 w-4" />, color: "var(--accent)" },
            { label: "Average Trip Cost", value: formatPKR(avgCost), icon: <TrendingUp className="h-4 w-4" />, color: "#C9A961" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: s.color }}
                >
                  {s.icon}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </span>
              </div>
              <div className="mt-2 text-xl font-bold text-foreground">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {trips.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold">No trips yet</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Plan your first budget adventure across Pakistan. It only takes a few seconds.
            </p>
            <Button asChild className="mt-2">
              <Link to="/">Plan my first trip</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => {
            const theme = themeForDestination(t.itinerary.destinationResolved);
            const ThemeIcon = theme.icon;
            return (
            <Card key={t.id} className="overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="h-2 w-full" style={{ backgroundImage: theme.gradient }} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                      style={{ backgroundImage: theme.gradient }}
                      aria-hidden
                    >
                      <ThemeIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold leading-tight">
                        {t.itinerary.destinationResolved}
                      </h3>
                      <div className="mt-0.5 text-xs text-muted-foreground">From {t.input.startCity}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(t.id)}
                    aria-label="Delete trip"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="gap-1" style={{ color: theme.tint, borderColor: "color-mix(in oklab, " + theme.tint + " 40%, transparent)" }}>
                    <ThemeIcon className="h-3 w-3" /> {theme.label}
                  </Badge>
                  <Badge variant="secondary" className="gap-1"><Calendar className="h-3 w-3" /> {t.itinerary.days.length} days</Badge>
                  <Badge variant="secondary" className="gap-1"><Wallet className="h-3 w-3" /> PKR {Math.round(t.itinerary.totalEstimatedCostPKR).toLocaleString("en-PK")}</Badge>
                  <Badge variant="outline">{t.input.groupSize}</Badge>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link to="/trips/$id" params={{ id: t.id }}>View itinerary</Link>
                </Button>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}