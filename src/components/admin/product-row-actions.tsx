"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toggleProductStatus, deleteProduct } from "@/actions/admin.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ProductRowActions({
  productId,
  status,
}: {
  productId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 justify-end text-xs">
      <Link href={`/admin/products/${productId}/edit`} className="text-primary underline">
        Edit
      </Link>
      <button
        disabled={isPending}
        className="underline"
        onClick={() =>
          startTransition(async () => {
            await toggleProductStatus(
              productId,
              status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
            );
            toast.success(status === "PUBLISHED" ? "Unpublished" : "Published");
          })
        }
      >
        {status === "PUBLISHED" ? "Unpublish" : "Publish"}
      </button>
      <button
        disabled={isPending}
        className="text-destructive underline"
        onClick={() => {
          if (!confirm("Delete this product permanently?")) return;
          startTransition(async () => {
            await deleteProduct(productId);
            toast.success("Product deleted");
            router.refresh();
          });
        }}
      >
        Delete
      </button>
    </div>
  );
}
