"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Tag,
  Sparkles,
  PartyPopper,
  Newspaper,
  Settings,
  ArrowLeft,
  Menu,
  X,
  Mail,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/contact", label: "Messages", icon: Mail },
  { href: "/admin/festivals", label: "Festival Banners", icon: PartyPopper },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/ai", label: "Divine Assistant", icon: Sparkles },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
];

export function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
            pathname === item.href ? "bg-muted font-medium" : "hover:bg-muted"
          }`}
        >
          <item.icon size={18} />
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-40">
        <div>
          <span className="font-display text-lg">Yugam Spritual Store</span>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
        <button onClick={() => setOpen(true)} aria-label="Open admin menu" className="p-2">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile slide-out drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <aside className="w-72 max-w-[85vw] h-full bg-card flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <span className="font-display text-xl">Yugam Spritual Store</span>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <NavLinks onNavigate={() => setOpen(false)} />
            </nav>
            <div className="p-4 border-t">
              <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowLeft size={16} />
                Back to store
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 border-r bg-card hidden md:flex flex-col">
        <div className="p-6 border-b">
          <span className="font-display text-xl">Yugam Spritual Store</span>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>
        <div className="p-4 border-t">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} />
            Back to store
          </Link>
        </div>
      </aside>
    </>
  );
}