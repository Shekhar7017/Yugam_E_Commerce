"use client";

import { useState, useTransition } from "react";
import { updateOrderTracking } from "@/actions/admin.actions";
import { KNOWN_CARRIERS } from "@/lib/carrier-tracking";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function TrackingForm({
  orderId,
  currentCarrier,
  currentTrackingNumber,
}: {
  orderId: string;
  currentCarrier?: string | null;
  currentTrackingNumber?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [carrier, setCarrier] = useState(currentCarrier ?? KNOWN_CARRIERS[0]);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-primary underline">
        {currentTrackingNumber ? "Edit tracking" : "+ Add tracking"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
        className="text-xs border rounded-md px-2 py-1 bg-background"
      >
        {KNOWN_CARRIERS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        placeholder="AWB / tracking number"
        className="text-xs border rounded-md px-2 py-1 bg-background w-32"
      />
      <button
        disabled={isPending || !trackingNumber.trim()}
        onClick={() =>
          startTransition(async () => {
            await updateOrderTracking(orderId, trackingNumber.trim(), carrier);
            toast.success("Tracking saved — order marked Shipped");
            setOpen(false);
            router.refresh();
          })
        }
        className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md disabled:opacity-50"
      >
        Save
      </button>
    </div>
  );
}
