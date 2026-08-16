"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Link href="/login" aria-label="Login" className="hover:text-primary">
        <User size={20} />
      </Link>
    );
  }

  const isAdmin = (session.user as any).role === "ADMIN";

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Account menu" className="hover:text-primary">
        <User size={20} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-lg shadow-lg py-2 text-sm z-50">
          <div className="px-4 py-2 border-b">
            <p className="font-medium truncate">{session.user.name ?? "My Account"}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </div>
          <Link href="/account/orders" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-muted">
            My Orders
          </Link>
          <Link href="/account/profile" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-muted">
           Change Password
          </Link>
          <Link href="/account/wishlist" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-muted">
            Wishlist
          </Link>
          {isAdmin && (
            <Link href="/admin" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-muted">
              Admin Panel
            </Link>
          )}
          <button
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="block w-full text-left px-4 py-2 hover:bg-muted text-destructive"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
