"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Heart, ShoppingBag, Menu, Sun, Moon, X } from "lucide-react";
import { useTheme } from "@/components/providers";
import { UserMenu } from "@/components/layout/user-menu";
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

export function Navbar({ storeName }: { storeName: string }) {
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

          <Link href="/" className="font-display text-2xl tracking-wide">
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
          <nav className="lg:hidden container pb-4 flex flex-col gap-3 text-sm">
            {CATEGORIES.map((c) => (
              <Link key={c.href} href={c.href} onClick={() => setMenuOpen(false)}>
                {c.name}
              </Link>
            ))}
            <div className="border-t pt-3 flex flex-col gap-3">
              <Link href="/account/orders" onClick={() => setMenuOpen(false)}>
                My Orders
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                Login / Register
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
