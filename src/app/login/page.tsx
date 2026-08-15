import Link from "next/link";
import { User, ShieldCheck } from "lucide-react";

export default function LoginSelectorPage() {
  return (
    <div className="container py-24 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl mb-2 text-center">Sign In</h1>
      <p className="text-muted-foreground text-center mb-10">Choose how you'd like to sign in</p>

      <div className="grid sm:grid-cols-2 gap-6">
        <Link
          href="/login/customer"
          className="group border rounded-xl p-8 text-center hover:border-primary transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User size={24} className="text-primary" />
          </div>
          <h2 className="font-display text-xl mb-1">Customer</h2>
          <p className="text-sm text-muted-foreground">
            Shop, track orders, and manage your account
          </p>
        </Link>

        <Link
          href="/admin/login"
          className="group border rounded-xl p-8 text-center hover:border-primary transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} className="text-secondary" />
          </div>
          <h2 className="font-display text-xl mb-1">Admin / Seller</h2>
          <p className="text-sm text-muted-foreground">
            Manage products, orders, and store settings
          </p>
        </Link>
      </div>
    </div>
  );
}