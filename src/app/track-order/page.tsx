"use client";

import { useState, useTransition } from "react";
import { trackOrder } from "@/actions/order.actions";
import { formatINR } from "@/lib/utils";
import { buildCarrierTrackingUrl } from "@/lib/carrier-tracking";
import { ExternalLink } from "lucide-react";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any>(null);
  const [notFoundMsg, setNotFoundMsg] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="container py-16 max-w-lg mx-auto">
      <h1 className="font-display text-3xl mb-6">Track Your Order</h1>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setNotFoundMsg(false);
          startTransition(async () => {
            const order = await trackOrder(orderNumber.trim(), email.trim());
            if (order) setResult(order);
            else {
              setResult(null);
              setNotFoundMsg(true);
            }
          });
        }}
      >
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Order number (e.g. DS12345678)"
          required
          className="w-full border rounded-md px-3 py-2 text-sm bg-background"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email used at checkout"
          type="email"
          required
          className="w-full border rounded-md px-3 py-2 text-sm bg-background"
        />
        <button
          disabled={isPending}
          className="w-full bg-primary text-primary-foreground rounded-md py-3 font-medium disabled:opacity-50"
        >
          {isPending ? "Searching..." : "Track Order"}
        </button>
      </form>

      {notFoundMsg && (
        <p className="text-sm text-destructive mt-4">
          We couldn't find a matching order. Double check the order number and email.
        </p>
      )}

      {result && (
        <div className="border rounded-lg p-6 mt-6">
          <p className="font-medium mb-1">Order #{result.orderNumber}</p>
          <p className="text-sm text-muted-foreground mb-4">Status: {result.status}</p>

          {result.trackingNumber && (
            <div className="bg-muted rounded-md p-3 mb-4 text-sm">
              <p>
                Carrier: <span className="font-medium">{result.carrier}</span>
              </p>
              <p>
                AWB / Tracking No.: <span className="font-medium">{result.trackingNumber}</span>
              </p>
              {buildCarrierTrackingUrl(result.carrier, result.trackingNumber) && (
                <a
                  href={buildCarrierTrackingUrl(result.carrier, result.trackingNumber)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline mt-2 text-sm"
                >
                  Track live on {result.carrier} <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}

          {result.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span>{item.titleSnapshot} × {item.quantity}</span>
              <span>{formatINR(Number(item.price) * item.quantity)}</span>
            </div>
          ))}

          <a
            href={`/api/orders/${result.id}/invoice?email=${encodeURIComponent(email)}`}
            className="inline-block mt-4 text-sm text-primary underline"
          >
            Download Invoice
          </a>
        </div>
      )}
    </div>
  );
}
