"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card rounded-lg p-8 shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <ShieldCheck size={22} className="text-primary" />
          </div>
          <h1 className="font-display text-2xl">Admin Access</h1>
          <p className="text-xs text-muted-foreground mt-1">Divine Store management console</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              const res = await signIn("credentials", { email, password, redirect: false });

              if (res?.error) {
                toast.error("Invalid email or password");
                return;
              }

              const sessionRes = await fetch("/api/auth/session");
              const session = await sessionRes.json();
              const role = session?.user?.role;

              if (role !== "ADMIN") {
                await signOut({ redirect: false });
                toast.error("This account doesn't have admin access. Use the customer login instead.");
                return;
              }

              toast.success("Welcome back");
              router.push("/admin");
              router.refresh();
            });
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          />
          <button
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground rounded-md py-3 font-medium disabled:opacity-50"
          >
            {isPending ? "Signing in..." : "Sign In to Admin Panel"}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Not an admin?{" "}
          <a href="/login/customer" className="text-primary underline">
            Go to customer login
          </a>
        </p>
      </div>
    </div>
  );
}