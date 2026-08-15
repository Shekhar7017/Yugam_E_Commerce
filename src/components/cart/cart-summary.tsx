"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { computeOrderSummary } from "@/actions/checkout.actions";
import { formatINR } from "@/lib/utils";
import { toast } from "sonner";

export function CartSummary() {
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>();
  const [summary, setSummary] = useState<{
    subtotal: number;
    discount: number;
    shippingFee: number;
    total: number;
    couponError: string | null;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    startTransition(async () => {
      const s = await computeOrderSummary(appliedCoupon);
      setSummary(s);
      if (s.couponError) toast.error(s.couponError);
    });
  }, [appliedCoupon]);

  if (!summary) {
    return <div className="border rounded-lg p-6 animate-pulse h-64" />;
  }

  return (
    <div className="border rounded-lg p-6 sticky top-24">
      <h2 className="font-display text-xl mb-4">Order Summary</h2>

      <div className="flex gap-2 mb-4">
        <input
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Coupon code"
          className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
        />
        <button
          onClick={() => setAppliedCoupon(coupon)}
          disabled={!coupon || isPending}
          className="text-sm border rounded-md px-4 disabled:opacity-50"
        >
          Apply
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatINR(summary.subtotal)}</span>
        </div>
        {summary.discount > 0 && (
          <div className="flex justify-between text-primary">
            <span>Discount</span>
            <span>-{formatINR(summary.discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{summary.shippingFee === 0 ? "Free" : formatINR(summary.shippingFee)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold text-base">
          <span>Total</span>
          <span>{formatINR(summary.total)}</span>
        </div>
      </div>

      <button
        onClick={() => router.push(`/checkout${appliedCoupon ? `?coupon=${appliedCoupon}` : ""}`)}
        className="w-full mt-6 bg-primary text-primary-foreground rounded-md py-3 font-medium hover:opacity-90"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
