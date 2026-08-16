"use client";

import { useState, useTransition } from "react";
import { changePassword } from "@/actions/auth.actions";
import { toast } from "sonner";

export default function ProfilePage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="container py-16 max-w-sm mx-auto">
      <h1 className="font-display text-3xl mb-8 text-center">Change Password</h1>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (next !== confirm) {
            toast.error("New passwords don't match");
            return;
          }
          startTransition(async () => {
            const res = await changePassword(current, next);
            if (res.success) {
              toast.success("Password updated");
              setCurrent("");
              setNext("");
              setConfirm("");
            } else {
              toast.error(res.error ?? "Could not update password");
            }
          });
        }}
      >
        <input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)}
          placeholder="Current password" className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
        <input type="password" required value={next} onChange={(e) => setNext(e.target.value)}
          placeholder="New password" className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
        <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password" className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
        <button disabled={isPending} className="w-full bg-primary text-primary-foreground rounded-md py-3 font-medium disabled:opacity-50">
          {isPending ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}