"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/actions/admin.actions";
import { toast } from "sonner";

const STATUSES = ["PENDING", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(async () => {
          await updateOrderStatus(orderId, e.target.value as any);
          toast.success("Order status updated");
        })
      }
      className="text-xs border rounded-md px-2 py-1 bg-background"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
