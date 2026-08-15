"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toggleBlogPublish, deleteBlog } from "@/actions/admin-blog.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function BlogRowActions({ blogId, isPublished }: { blogId: string; isPublished: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 justify-end text-xs">
      <Link href={`/admin/blog/${blogId}/edit`} className="text-primary underline">
        Edit
      </Link>
      <button
        disabled={isPending}
        className="underline"
        onClick={() =>
          startTransition(async () => {
            await toggleBlogPublish(blogId);
            toast.success(isPublished ? "Unpublished" : "Published");
            router.refresh();
          })
        }
      >
        {isPublished ? "Unpublish" : "Publish"}
      </button>
      <button
        disabled={isPending}
        className="text-destructive underline"
        onClick={() => {
          if (!confirm("Delete this post permanently?")) return;
          startTransition(async () => {
            await deleteBlog(blogId);
            toast.success("Post deleted");
            router.refresh();
          });
        }}
      >
        Delete
      </button>
    </div>
  );
}
