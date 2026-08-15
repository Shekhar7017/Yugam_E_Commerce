"use client";

import { useState, useTransition } from "react";
import { createCoupon } from "@/actions/admin.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CouponForm() {
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENT" as "PERCENT" | "FIXED",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    usageLimit: "",
  });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      className="bg-card border rounded-lg p-5 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await createCoupon({
            code: form.code,
            discountType: form.discountType,
            discountValue: parseFloat(form.discountValue),
            minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : undefined,
            maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
            usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
          });
          if (res.success) {
            toast.success("Coupon created");
            setForm({ code: "", discountType: "PERCENT", discountValue: "", minOrderValue: "", maxDiscount: "", usageLimit: "" });
            router.refresh();
          } else {
            toast.error("Could not create coupon — check the code isn't already in use");
          }
        });
      }}
    >
      <input
        required
        value={form.code}
        onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
        placeholder="CODE"
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
      />
      <select
        value={form.discountType}
        onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as any }))}
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
      >
        <option value="PERCENT">Percentage off</option>
        <option value="FIXED">Fixed amount off (₹)</option>
      </select>
      <input
        required
        type="number"
        value={form.discountValue}
        onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
        placeholder="Discount value"
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
      />
      <input
        type="number"
        value={form.minOrderValue}
        onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
        placeholder="Min order value (₹, optional)"
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
      />
      <input
        type="number"
        value={form.maxDiscount}
        onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
        placeholder="Max discount cap (₹, optional)"
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
      />
      <input
        type="number"
        value={form.usageLimit}
        onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
        placeholder="Usage limit (optional)"
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
      />
      <button
        disabled={isPending}
        className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Coupon"}
      </button>
    </form>
  );
}
