import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, Sparkles, MapPin, Wallet, Users, Compass, Mountain, Utensils, Waves, ScrollText, Church, Bike, Clock, ListChecks, Route as RouteIcon, HeartHandshake, ClipboardList, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SiteHeader } from "@/components/site-header";
import {
  DESTINATIONS,
  GROUP_SIZES,
  INTERESTS,
  PAKISTANI_CITIES,
  type GroupSize,
  type Interest,
  type SavedTrip,
} from "@/lib/trip-types";
import { generateItinerary } from "@/lib/itinerary.functions";
import { makeId, saveTrip } from "@/lib/trips-store";

export const Route = createFileRoute("/")({
  component: Landing,
});

const INTEREST_ICONS: Record<Interest, React.ComponentType<{ className?: string }>> = {
  Nature: Mountain,
  History: ScrollText,
  Food: Utensils,
  Adventure: Bike,
  "Religious Sites": Church,
  Beaches: Waves,
};

function Landing() {
  const navigate = useNavigate();
  const [startCity, setStartCity] = useState<string>("Lahore");
  const [destination, setDestination] = useState<string>("Surprise Me");
  const [days, setDays] = useState<number>(4);
  const [budget, setBudget] = useState<string>("25000");
  const [interests, setInterests] = useState<Interest[]>(["Nature", "Food"]);
  const [group, setGroup] = useState<GroupSize>("Friends group");
  const [loading, setLoading] = useState(false);

  function toggleInterest(i: Interest) {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const budgetPKR = Number(budget);
    if (!Number.isFinite(budgetPKR) || budgetPKR < 1000) {
      toast.error("Please enter a realistic PKR budget (min PKR 1,000).");
      return;
    }
    if (interests.length === 0) {
      toast.error("Pick at least one travel interest.");
      return;
    }
    setLoading(true);
    try {
      const itinerary = await generateItinerary({
        data: { startCity, destination, days, budgetPKR, interests, groupSize: group },
      });
      const trip: SavedTrip = {
        id: makeId(),
        createdAt: Date.now(),
        input: { startCity, destination, days, budgetPKR, interests, groupSize: group },
        itinerary,
      };
      saveTrip(trip);
      toast.success("Your itinerary is ready!");
      navigate({ to: "/trips/$id", params: { id: trip.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate itinerary");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundImage: "var(--gradient-soft)" }}>
      <Toaster richColors position="top-center" />
      <SiteHeader />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pt-12 pb-8 text-center">
        {/* Decorative travel background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <svg
            className="absolute inset-x-0 bottom-0 h-56 w-full text-primary/10 sm:h-72"
            viewBox="0 0 1200 300"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,220 L120,160 L220,210 L320,120 L430,200 L560,90 L680,190 L800,140 L920,210 L1050,150 L1200,200 L1200,300 L0,300 Z" opacity="0.55" />
            <path d="M0,250 L140,200 L260,240 L380,180 L520,240 L640,190 L780,240 L900,200 L1040,240 L1200,210 L1200,300 L0,300 Z" className="text-accent/10" fill="currentColor" />
          </svg>
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "22px 22px",
              color: "var(--primary)",
            }}
          />
          <Compass className="absolute right-6 top-8 h-24 w-24 text-primary/10 sm:right-16 sm:h-32 sm:w-32 animate-[spin_40s_linear_infinite]" />
          <Mountain className="absolute left-4 top-16 h-16 w-16 text-accent/15 sm:left-10 sm:h-24 sm:w-24" />
        </div>

        <div className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> AI-powered · Made for Pakistani students
        </div>
        <h1 className="mt-4 animate-fade-in text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl [animation-delay:80ms] [animation-fill-mode:both]">
          Explore Pakistan on a{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-hero)" }}
          >
            student budget
          </span>
          .
        </h1>
        <p className="mx-auto mt-4 max-w-2xl animate-fade-in text-base text-muted-foreground sm:text-lg [animation-delay:160ms] [animation-fill-mode:both]">
          Safar Saathi is your friendly local AI trip planner — day-by-day itineraries, cheap
          hostels, Daewoo routes, dhaba picks, and packing tips, all within your PKR budget.
        </p>

        {/* Stats row */}
        <div className="mx-auto mt-8 grid max-w-3xl animate-fade-in grid-cols-2 gap-3 sm:grid-cols-4 [animation-delay:240ms] [animation-fill-mode:both]">
          <StatPill icon={ListChecks} label="4 easy steps" />
          <StatPill icon={Clock} label="Under 60 seconds" />
          <StatPill icon={RouteIcon} label="15+ PK destinations" />
          <StatPill icon={HeartHandshake} label="Student-friendly costs" />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl animate-fade-in px-4 pb-4 [animation-delay:280ms] [animation-fill-mode:both]">
        <h2 className="mb-5 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          How it works
        </h2>
        <div className="relative">
          {/* Connector line (desktop) */}
          <div
            aria-hidden
            className="absolute left-[16.6%] right-[16.6%] top-5 hidden h-[2px] sm:block"
            style={{ backgroundImage: "var(--gradient-hero)", opacity: 0.35 }}
          />
          <ol className="relative grid gap-6 sm:grid-cols-3 sm:gap-4">
            <HowStep n={1} icon={ClipboardList} title="Enter your trip details" />
            <HowStep n={2} icon={Sparkles} title="AI creates your plan" />
            <HowStep n={3} icon={MapPinned} title="Get your budget itinerary" />
          </ol>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-3xl animate-fade-in px-4 pb-16 [animation-delay:320ms] [animation-fill-mode:both]">
        <Card className="overflow-hidden border-0" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <div style={{ backgroundImage: "var(--gradient-hero)" }} className="h-2 w-full" />
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Starting city
                  </Label>
                  <Select value={startCity} onValueChange={setStartCity}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAKISTANI_CITIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-accent" /> Destination
                  </Label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DESTINATIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Number of days</Label>
                    <span className="text-sm font-semibold text-primary">{days} {days === 1 ? "day" : "days"}</span>
                  </div>
                  <Slider
                    min={1}
                    max={14}
                    step={1}
                    value={[days]}
                    onValueChange={(v) => setDays(v[0])}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5" htmlFor="budget">
                    <Wallet className="h-3.5 w-3.5 text-primary" /> Total budget (PKR)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    inputMode="numeric"
                    min={1000}
                    step={1000}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 25000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Travel interests</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {INTERESTS.map((i) => {
                    const Icon = INTEREST_ICONS[i];
                    const active = interests.includes(i);
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => toggleInterest(i)}
                        className={
                          "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all " +
                          (active
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")
                        }
                        aria-pressed={active}
                      >
                        <Icon className="h-4 w-4" />
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-accent" /> Group size
                </Label>
                <RadioGroup
                  value={group}
                  onValueChange={(v) => setGroup(v as GroupSize)}
                  className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                >
                  {GROUP_SIZES.map((g) => (
                    <Label
                      key={g}
                      htmlFor={`group-${g}`}
                      className={
                        "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all " +
                        (group === g
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground")
                      }
                    >
                      <RadioGroupItem id={`group-${g}`} value={g} className="sr-only" />
                      {g}
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full text-base font-semibold text-primary-foreground shadow-md hover:opacity-95"
                style={{ backgroundImage: "var(--gradient-hero)" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Planning your safar…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Plan my trip
                  </>
                )}
              </Button>
              {loading && (
                <p className="text-center text-xs text-muted-foreground">
                  Our AI local guide is scouting cheap hostels, buses, and dhabas… hang tight.
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <FeatureCard title="Day-by-day plans" body="Places, activities, transport, food and stay for every day." />
          <FeatureCard title="Realistic PKR costs" body="Student-friendly hostels, Daewoo/local bus routes, dhaba meals." />
          <FeatureCard title="Save & refine" body="Save trips to My Trips and regenerate any day with one click." />
        </div>
      </section>
    </div>
  );
}

function StatPill({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-sm sm:text-sm"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <Icon className="h-4 w-4 text-primary" />
      <span>{label}</span>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-sm" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="font-semibold text-foreground">{title}</div>
      <p className="mt-1 text-muted-foreground">{body}</p>
    </div>
  );
}

function HowStep({
  n,
  icon: Icon,
  title,
}: {
  n: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <li className="flex flex-col items-center text-center">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground shadow-md ring-4 ring-background"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        {n}
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        <span>{title}</span>
      </div>
    </li>
  );
}
