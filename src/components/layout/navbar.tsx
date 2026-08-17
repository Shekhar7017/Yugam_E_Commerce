"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Heart, ShoppingBag, Menu, Sun, Moon, X } from "lucide-react";
import { useTheme } from "@/components/providers";
import { UserMenu } from "@/components/layout/user-menu";
import { useSession, signOut} from "next-auth/react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "Idols", href: "/category/idols" },
  { name: "Rudraksha", href: "/category/rudraksha" },
  { name: "Malas", href: "/category/malas" },
  { name: "Puja Samagri", href: "/category/puja-samagri" },
  { name: "Yantras", href: "/category/yantras" },
  { name: "Incense & Dhoop", href: "/category/incense-dhoop" },
  { name: "Gift Boxes", href: "/category/gift-boxes" },
];

export function Navbar({ storeName, logoUrl }: { storeName: string; logoUrl?: string }) {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-secondary text-secondary-foreground text-center text-xs py-2 tracking-wide">
        Free shipping across India on orders above ₹999
      </div>
      <div className="glass border-b">
        <div className="container flex items-center justify-between h-16">
          <button
            className="lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="flex items-center gap-2 font-display text-2xl tracking-wide">
            {logoUrl && logoUrl.trim() && (
              <span className="relative w-8 h-8 shrink-0">
                <Image src={logoUrl} alt={storeName} fill className="object-contain" />
              </span>
            )}
            {storeName}
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="hover:text-primary transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/search" aria-label="Search" className="hover:text-primary">
              <Search size={20} />
            </Link>
            <button onClick={toggle} aria-label="Toggle theme" className="hover:text-primary">
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <UserMenu />
            <Link href="/account/wishlist" aria-label="Wishlist" className="hover:text-primary">
              <Heart size={20} />
            </Link>
            <Link href="/cart" aria-label="Cart" className="hover:text-primary">
              <ShoppingBag size={20} />
            </Link>
          </div>
        </div>

        {menuOpen && (
          <MobileMenuLinks onClose={() =>setMenuOpen(false)} />
        )}
      </div>
    </header>
  );
}
function MobileMenuLinks({ onClose }: { onClose: () => void }) {
  const { data: session, status } = useSession();

  return (
    <nav className="lg:hidden container pb-4 flex flex-col gap-3 text-sm">
      {CATEGORIES.map((c) => (
        <Link key={c.href} href={c.href} onClick={onClose}>
          {c.name}
        </Link>
      ))}
      <div className="border-t pt-3 flex flex-col gap-3">
        {status === "loading" ? null : session?.user ? (
          <>
            <Link href="/account/orders" onClick={onClose}>
              My Orders
            </Link>
            <Link href="/account/wishlist" onClick={onClose}>
              Wishlist
            </Link>
            <Link href="/account/profile" onClick={onClose}>
              Change Password
            </Link>
            {(session.user as any).role === "ADMIN" && (
              <Link href="/admin" onClick={onClose}>
                Admin Panel
              </Link>
            )}
            <button
              onClick={() => {
                onClose();
                signOut({ callbackUrl: "/" });
              }}
              className="text-left text-destructive"
            >
              Log Out
            </button>
          </>
        ) : (
          <Link href="/login/customer" onClick={onClose}>
            Login / Register
          </Link>
        )}
      </div>
    </nav>
  );
}