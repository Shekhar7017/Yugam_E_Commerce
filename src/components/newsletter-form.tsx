"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletter } from "@/actions/newsletter.actions";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await subscribeNewsletter(email);
          if (res.success) {
            toast.success("Subscribed! Welcome to Divine Store.");
            setEmail("");
          } else {
            toast.error(res.error ?? "Something went wrong");
          }
        });
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="flex-1 rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder:opacity-60 outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? "..." : "Join"}
      </button>
    </form>
  );
}
