"use client";

import { useState, useTransition } from "react";
import { replyToContactMessage } from "@/actions/admin.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ContactReplyForm({
  messageId,
  customerEmail,
  existingReply,
}: {
  messageId: string;
  customerEmail: string;
  existingReply?: string | null;
}) {
  const [reply, setReply] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (existingReply) {
    return (
      <div className="mt-3 bg-primary/5 border border-primary/20 rounded-md p-3">
        <p className="text-xs font-medium text-primary mb-1">Your reply (sent):</p>
        <p className="text-sm whitespace-pre-wrap">{existingReply}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex gap-2">
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Type your reply — it will be emailed to the customer"
        rows={2}
        className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
      />
      <div className="flex flex-col gap-2">
        <button
          disabled={isPending || !reply.trim()}
          onClick={() =>
            startTransition(async () => {
              await replyToContactMessage(messageId, reply.trim());
              toast.success("Reply sent to " + customerEmail);
              router.refresh();
            })
          }
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-xs font-medium disabled:opacity-50 whitespace-nowrap"
        >
          {isPending ? "Sending..." : "Send Reply"}
        </button>
        <a
          href={`mailto:${customerEmail}`}
          className="text-center text-xs text-muted-foreground underline"
        >
          or open in email app
        </a>
      </div>
    </div>
  );
}