import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItineraryView } from "@/components/itinerary-view";
import { deleteTrip, getTrip } from "@/lib/trips-store";
import type { SavedTrip } from "@/lib/trip-types";

export const Route = createFileRoute("/trips/$id")({
  component: TripDetail,
});

function TripDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<SavedTrip | null | undefined>(undefined);

  useEffect(() => {
    setTrip(getTrip(id) ?? null);
  }, [id]);

  if (trip === undefined) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (trip === null) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold">Trip not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been deleted or was saved on another device.
        </p>
        <Button asChild className="mt-4">
          <Link to="/trips">Back to My Trips</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/trips"><ArrowLeft className="mr-1 h-4 w-4" /> My Trips</Link>
      </Button>
      <ItineraryView
        trip={trip}
        onUpdated={(t) => setTrip(t)}
        onDelete={() => {
          deleteTrip(trip.id);
          navigate({ to: "/trips" });
        }}
      />
    </div>
  );
}