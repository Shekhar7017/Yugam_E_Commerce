"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { registerUser } from "@/actions/auth.actions";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [isPending, startTransition] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const router = useRouter();

  const handleGoogleSignup = async () => {
    try {
      setIsGoogleLoading(true);

      await signIn("google", {
        callbackUrl: "/account/orders",
      });
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error("Unable to sign up with Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="container py-24 max-w-sm mx-auto">
      <h1 className="font-display text-3xl mb-6 text-center">
        Create Account
      </h1>

      {/* Email / Password Registration */}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();

          startTransition(async () => {
            const res = await registerUser(form);

            if (!res.success) {
              toast.error(res.error ?? "Something went wrong");
              return;
            }

            await signIn("credentials", {
              email: form.email,
              password: form.password,
              redirect: false,
            });

            toast.success("Account created!");
            router.push("/account/orders");
            router.refresh();
          });
        }}
      >
        {(
          [
            "name",
            "email",
            "phone",
            "password",
            "confirmPassword",
          ] as const
        ).map((field) => (
          <input
            key={field}
            required
            type={
              field.toLowerCase().includes("password")
                ? "password"
                : field === "email"
                  ? "email"
                  : "text"
            }
            value={form[field]}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                [field]: e.target.value,
              }))
            }
            placeholder={
              field === "confirmPassword"
                ? "Confirm Password"
                : field.charAt(0).toUpperCase() + field.slice(1)
            }
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          />
        ))}

        <button
          type="submit"
          disabled={isPending || isGoogleLoading}
          className="w-full bg-primary text-primary-foreground rounded-md py-3 font-medium disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Account"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-border" />

        <span className="text-xs text-muted-foreground">
          OR
        </span>

        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Google Signup */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={isPending || isGoogleLoading}
        className="w-full border rounded-md py-3 font-medium flex items-center justify-center gap-3 bg-background hover:bg-muted transition-colors disabled:opacity-50"
      >
        {/* Google Icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.93-4.18 2.93-7.39Z"
          />

          <path
            fill="#34A853"
            d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.29v2.5A9.74 9.74 0 0 0 12 21.5Z"
          />

          <path
            fill="#FBBC05"
            d="M6.54 13.62A5.85 5.85 0 0 1 6.23 12c0-.56.1-1.1.31-1.62v-2.5H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.38l3.25-2.76Z"
          />

          <path
            fill="#EA4335"
            d="M12 6.35c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.45 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.71 5.38l3.25 2.5 3.25 2.5C7.31 8.07 9.46 6.35 12 6.35Z"
          />
        </svg>

        {isGoogleLoading
          ? "Connecting to Google..."
          : "Continue with Google"}
      </button>

      {/* Login Link */}
      <p className="text-sm text-center text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}