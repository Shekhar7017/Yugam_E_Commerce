"use client";

import { useTransition } from "react";
import { toggleFestivalActive, deleteFestival } from "@/actions/admin.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function FestivalRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 shrink-0">
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await toggleFestivalActive(id, !isActive);
            router.refresh();
          })
        }
        className={`text-xs px-3 py-1 rounded-full font-medium ${
          isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {isActive ? "Live" : "Hidden"}
      </button>
      <button
        disabled={isPending}
        className="text-destructive text-xs underline"
        onClick={() => {
          if (!confirm("Delete this banner?")) return;
          startTransition(async () => {
            await deleteFestival(id);
            toast.success("Banner deleted");
            router.refresh();
          });
        }}
      >
        Delete
      </button>
    </div>
  );
}
