"use client";

import { useTransition } from "react";
import { toggleCouponActive } from "@/actions/admin.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CouponToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleCouponActive(id, !isActive);
          toast.success(isActive ? "Coupon deactivated" : "Coupon activated");
          router.refresh();
        })
      }
      className={`text-xs px-3 py-1 rounded-full font-medium ${
        isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
