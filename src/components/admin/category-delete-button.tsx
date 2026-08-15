"use client";

import { useTransition } from "react";
import { deleteCategory } from "@/actions/admin.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CategoryDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      className="text-destructive text-xs underline"
      onClick={() => {
        if (!confirm("Delete this category?")) return;
        startTransition(async () => {
          const res = await deleteCategory(id);
          if (res.success) {
            toast.success("Category deleted");
            router.refresh();
          } else {
            toast.error(res.error ?? "Could not delete category");
          }
        });
      }}
    >
      Delete
    </button>
  );
}
