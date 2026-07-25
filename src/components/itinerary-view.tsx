import { useState } from "react";
import { toast } from "sonner";
import { Bus, Utensils, BedDouble, MapPin, Sparkles, Calendar, Wallet, PackageCheck, Lightbulb, RefreshCw, Trash2, Download, Share2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Itinerary, SavedTrip } from "@/lib/trip-types";
import { regenerateDay, generateItinerary } from "@/lib/itinerary.functions";
import { saveTrip } from "@/lib/trips-store";
import { downloadTripPdf } from "@/lib/pdf-export";

function formatPKR(n: number) {
  return "PKR " + Math.round(n).toLocaleString("en-PK");
}

export function ItineraryView({
  trip,
  onDelete,
  onUpdated,
}: {
  trip: SavedTrip;
  onDelete?: () => void;
  onUpdated?: (t: SavedTrip) => void;
}) {
  const [itinerary, setItinerary] = useState<Itinerary>(trip.itinerary);
  const [regenerating, setRegenerating] = useState<number | null>(null);
  const [regeneratingAll, setRegeneratingAll] = useState(false);

  async function handleRegenerate(dayNumber: number) {
    setRegenerating(dayNumber);
    try {
      const newDay = await regenerateDay({
        data: { input: trip.input, currentItinerary: itinerary, dayNumber },
      });
      const updated: Itinerary = {
        ...itinerary,
        days: itinerary.days.map((d) => (d.day === dayNumber ? newDay : d)),
      };
      updated.totalEstimatedCostPKR = updated.days.reduce((s, d) => s + (d.totalCostPKR || 0), 0);
      setItinerary(updated);
      const saved: SavedTrip = { ...trip, itinerary: updated };
      saveTrip(saved);
      onUpdated?.(saved);
      toast.success(`Day ${dayNumber} refreshed with a new plan`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to regenerate day");
    } finally {
      setRegenerating(null);
    }
  }

  async function handleRegenerateAll() {
    setRegeneratingAll(true);
    try {
      const fresh = await generateItinerary({ data: trip.input });
      setItinerary(fresh);
      const saved: SavedTrip = { ...trip, itinerary: fresh };
      saveTrip(saved);
      onUpdated?.(saved);
      toast.success("Itinerary regenerated with a fresh plan");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to regenerate itinerary");
    } finally {
      setRegeneratingAll(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-0 rounded-2xl animate-slide-up" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div style={{ backgroundImage: "var(--gradient-hero)" }} className="p-6 text-primary-foreground">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Sparkles className="h-4 w-4" /> Your Safar Saathi itinerary
              </div>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{itinerary.destinationResolved}</h1>
              <p className="mt-2 max-w-2xl text-sm opacity-95">{itinerary.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={regeneratingAll}
                onClick={handleRegenerateAll}
              >
                <RefreshCw className={"mr-1 h-4 w-4 " + (regeneratingAll ? "animate-spin" : "")} />
                {regeneratingAll ? "Regenerating…" : "Regenerate Full Itinerary"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  const url = typeof window !== "undefined" ? window.location.href : "";
                  try {
                    await navigator.clipboard.writeText(url);
                    toast.success("Link copied!");
                  } catch {
                    toast.error("Couldn't copy link");
                  }
                }}
              >
                <Share2 className="mr-1 h-4 w-4" /> Share
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  try {
                    downloadTripPdf({ ...trip, itinerary });
                    toast.success("PDF downloaded");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Failed to generate PDF");
                  }
                }}
              >
                <Download className="mr-1 h-4 w-4" /> Download PDF
              </Button>
              {onDelete && (
                <Button variant="secondary" size="sm" onClick={onDelete}>
                  <Trash2 className="mr-1 h-4 w-4" /> Delete trip
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary" className="gap-1 bg-white/20 text-white hover:bg-white/25">
              <Calendar className="h-3 w-3" /> {itinerary.days.length} days
            </Badge>
            <Badge variant="secondary" className="gap-1 bg-white/20 text-white hover:bg-white/25">
              <Wallet className="h-3 w-3" /> Est. {formatPKR(itinerary.totalEstimatedCostPKR)} / Budget {formatPKR(trip.input.budgetPKR)}
            </Badge>
            <Badge variant="secondary" className="gap-1 bg-white/20 text-white hover:bg-white/25">
              From {trip.input.startCity}
            </Badge>
            <Badge variant="secondary" className="gap-1 bg-white/20 text-white hover:bg-white/25">
              {trip.input.groupSize}
            </Badge>
          </div>
        </div>
        <div className="border-b px-6 py-5">
          {(() => {
            const transport = itinerary.days.reduce((s, d) => s + (d.transport?.costPKR || 0), 0);
            const food = itinerary.days.reduce((s, d) => s + (d.food?.costPKR || 0), 0);
            const stay = itinerary.days.reduce((s, d) => s + (d.stay?.costPKR || 0), 0);
            const stats = [
              { label: "Transport", value: transport, icon: <Bus className="h-4 w-4" />, color: "var(--primary)" },
              { label: "Food", value: food, icon: <Utensils className="h-4 w-4" />, color: "var(--accent)" },
              { label: "Stay", value: stay, icon: <BedDouble className="h-4 w-4" />, color: "#C9A961" },
            ];
            return (
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" /> Total Trip Summary
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5"
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
                          Total {s.label}
                        </span>
                      </div>
                      <div className="mt-2 text-xl font-bold text-foreground">{formatPKR(s.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
        <div className="border-b px-6 py-5">
          {(() => {
            const used = itinerary.totalEstimatedCostPKR;
            const budget = trip.input.budgetPKR;
            const pct = budget > 0 ? (used / budget) * 100 : 0;
            const clamped = Math.min(100, Math.max(0, pct));
            const over = pct > 100;
            return (
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Wallet className="h-4 w-4 text-primary" /> Budget usage
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{formatPKR(used)}</span> of{" "}
                    <span className="font-medium text-foreground">{formatPKR(budget)}</span> used
                    <span className={"ml-2 font-semibold " + (over ? "text-accent" : "text-primary")}>
                      ({pct.toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: clamped + "%",
                      backgroundImage: "linear-gradient(90deg, var(--primary), var(--accent))",
                    }}
                  />
                </div>
                {over && (
                  <p className="mt-2 text-xs text-accent">
                    Heads up: estimated cost is over your budget by {formatPKR(used - budget)}.
                  </p>
                )}
              </div>
            );
          })()}
        </div>
        <div className="border-b px-6 py-5">
          {(() => {
            const transport = itinerary.days.reduce((s, d) => s + (d.transport?.costPKR || 0), 0);
            const food = itinerary.days.reduce((s, d) => s + (d.food?.costPKR || 0), 0);
            const stay = itinerary.days.reduce((s, d) => s + (d.stay?.costPKR || 0), 0);
            const total = transport + food + stay;
            const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
            const data = [
              { key: "Transport", value: transport, color: "var(--primary)", icon: <Bus className="h-4 w-4" /> },
              { key: "Food", value: food, color: "var(--accent)", icon: <Utensils className="h-4 w-4" /> },
              { key: "Stay", value: stay, color: "#C9A961", icon: <BedDouble className="h-4 w-4" /> },
            ];
            return (
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Wallet className="h-4 w-4 text-primary" /> Cost Breakdown
                </div>
                <div className="grid items-center gap-4 sm:grid-cols-2">
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data}
                          dataKey="value"
                          nameKey="key"
                          innerRadius="55%"
                          outerRadius="85%"
                          paddingAngle={2}
                          stroke="none"
                        >
                          {data.map((d) => (
                            <Cell key={d.key} fill={d.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number, n: string) => [formatPKR(v) + ` (${pct(v)}%)`, n]}
                          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="space-y-2">
                    {data.map((d) => (
                      <li key={d.key} className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-white"
                            style={{ backgroundColor: d.color }}
                          >
                            {d.icon}
                          </span>
                          <span className="text-sm font-medium">{d.key}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{formatPKR(d.value)}</span>{" "}
                          <span className="text-xs">({pct(d.value)}%)</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}
        </div>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Calendar className="h-4 w-4 text-primary" /> Best time to visit
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{itinerary.bestTimeToVisit}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet className="h-4 w-4 text-accent" /> Interests
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {trip.input.interests.map((i) => (
                <Badge key={i} variant="outline">{i}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5">
        {itinerary.days.map((d, idx) => (
          <Card
            key={d.day}
            className="overflow-hidden rounded-2xl border-border/60 animate-slide-up transition-shadow hover:shadow-lg"
            style={{ boxShadow: "var(--shadow-premium)", animationDelay: `${idx * 80}ms` }}
          >
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 border-b bg-secondary/40">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-primary-foreground"
                  style={{ backgroundImage: "var(--gradient-hero)" }}
                >
                  {d.day}
                </div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Day {d.day}</div>
                  <CardTitle className="text-lg">{d.title}</CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Wallet className="h-3 w-3" /> {formatPKR(d.totalCostPKR)}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={regenerating === d.day}
                  onClick={() => handleRegenerate(d.day)}
                >
                  <RefreshCw className={"mr-1 h-3.5 w-3.5 " + (regenerating === d.day ? "animate-spin" : "")} />
                  {regenerating === d.day ? "Refreshing" : "Regenerate"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-5">
              <div className="md:col-span-3 space-y-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="h-4 w-4 text-primary" /> Places to visit
                  </div>
                  <ul className="space-y-2">
                    {d.places.map((p, i) => (
                      <li key={i} className="rounded-lg border bg-card p-3">
                        <div className="font-medium text-sm">{p.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{p.description}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                {d.activities?.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Sparkles className="h-4 w-4 text-accent" /> Activities
                    </div>
                    <ul className="grid gap-1 text-sm text-muted-foreground">
                      {d.activities.map((a, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-accent">•</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 grid content-start gap-3">
                <CostRow icon={<Bus className="h-4 w-4" />} label="Transport" desc={d.transport.description} cost={d.transport.costPKR} tint="primary" />
                <CostRow icon={<Utensils className="h-4 w-4" />} label="Food" desc={d.food.description} cost={d.food.costPKR} tint="accent" />
                <CostRow icon={<BedDouble className="h-4 w-4" />} label="Stay" desc={d.stay.description} cost={d.stay.costPKR} tint="primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="rounded-2xl animate-slide-up" style={{ boxShadow: "var(--shadow-premium)" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-accent" /> Budget tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {itinerary.budgetTips.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="rounded-2xl animate-slide-up" style={{ boxShadow: "var(--shadow-premium)", animationDelay: "80ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PackageCheck className="h-4 w-4 text-primary" /> Packing checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2 text-sm">
              {itinerary.packingChecklist.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 text-primary">□</span>
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator />
      <p className="text-center text-xs text-muted-foreground">
        Costs are AI estimates for Pakistani students. Always confirm prices locally before booking.
      </p>
    </div>
  );
}

function CostRow({
  icon,
  label,
  desc,
  cost,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  cost: number;
  tint: "primary" | "accent";
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between">
        <div className={"flex items-center gap-2 text-xs font-semibold uppercase tracking-wide " + (tint === "primary" ? "text-primary" : "text-accent")}>
          {icon} {label}
        </div>
        <span className="text-xs font-medium">{formatPKR(cost)}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}