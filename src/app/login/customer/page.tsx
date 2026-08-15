"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === "true";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="container py-24 max-w-sm mx-auto">
      <h1 className="font-display text-3xl mb-6 text-center">Customer Sign In</h1>

      {GOOGLE_ENABLED && (
        <>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/account/orders" })}
            className="w-full border rounded-md py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.4 0-13.8 4.1-17.1 10.2l-.6.5z"/>
              <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.3 35 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.9 39.6 16.4 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.3 5.3C41.6 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 border-t" />
          </div>
        </>
      )}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const res = await signIn("credentials", { email, password, redirect: false });
            if (res?.error) {
              toast.error("Invalid email or password");
            } else {
              router.push("/account/orders");
              router.refresh();
            }
          });
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
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
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-sm text-center text-muted-foreground mt-6">
        New here?{" "}
        <Link href="/register" className="text-primary underline">
          Create an account
        </Link>
      </p>
      <p className="text-xs text-center text-muted-foreground mt-3">
        <Link href="/login" className="underline">
          ← Back to sign-in options
        </Link>
      </p>
    </div>
  );
}