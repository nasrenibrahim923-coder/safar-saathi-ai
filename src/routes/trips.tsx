import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, MapPin, Calendar, Wallet, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { deleteTrip, loadTrips } from "@/lib/trips-store";
import type { SavedTrip } from "@/lib/trip-types";

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
          {trips.map((t) => (
            <Card key={t.id} className="overflow-hidden transition-all hover:-translate-y-0.5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="h-2 w-full" style={{ backgroundImage: "var(--gradient-hero)" }} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold leading-tight">
                      {t.itinerary.destinationResolved}
                    </h3>
                    <div className="mt-0.5 text-xs text-muted-foreground">From {t.input.startCity}</div>
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
                  <Badge variant="secondary" className="gap-1"><Calendar className="h-3 w-3" /> {t.itinerary.days.length} days</Badge>
                  <Badge variant="secondary" className="gap-1"><Wallet className="h-3 w-3" /> PKR {Math.round(t.itinerary.totalEstimatedCostPKR).toLocaleString("en-PK")}</Badge>
                  <Badge variant="outline">{t.input.groupSize}</Badge>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link to="/trips/$id" params={{ id: t.id }}>View itinerary</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}