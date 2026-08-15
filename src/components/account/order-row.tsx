"use client";

import { useRouter } from "next/navigation";
import { ExternalLink, ChevronRight } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { buildCarrierTrackingUrl } from "@/lib/carrier-tracking";

export function OrderRow({ order }: { order: any }) {
  const router = useRouter();
  const trackUrl = buildCarrierTrackingUrl(order.carrier, order.trackingNumber);

  return (
    <div
      onClick={() => router.push(`/account/orders/${order.id}`)}
      className="border rounded-lg p-5 hover:border-primary transition-colors cursor-pointer flex items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <p className="font-medium">#{order.orderNumber}</p>
        <p className="text-xs text-muted-foreground">
          {order.items.length} item(s) · {new Date(order.createdAt).toLocaleDateString("en-IN")}
        </p>
        {order.trackingNumber && (
          <p className="text-xs text-muted-foreground mt-1">
            {order.carrier} · AWB: <span className="font-medium text-foreground">{order.trackingNumber}</span>
          </p>
        )}
        {trackUrl && (
          <a
            href={trackUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-primary underline mt-1"
          >
            Track live on {order.carrier} <ExternalLink size={12} />
          </a>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="font-semibold">{formatINR(Number(order.total))}</p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{order.status}</span>
        </div>
        <ChevronRight size={18} className="text-muted-foreground" />
      </div>
    </div>
  );
}