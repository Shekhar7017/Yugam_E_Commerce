"use client";

import { useTransition } from "react";
import { reindexKnowledgeBase } from "@/actions/ai/knowledge.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ReindexButton({ disabled }: { disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={disabled || isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await reindexKnowledgeBase();
          if (res.success) {
            toast.success(`Indexed ${res.indexed} knowledge chunks`);
            router.refresh();
          } else {
            toast.error(res.error ?? "Reindexing failed");
          }
        })
      }
      className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium disabled:opacity-50"
    >
      {isPending ? "Indexing..." : "Re-index Knowledge Base"}
    </button>
  );
}
