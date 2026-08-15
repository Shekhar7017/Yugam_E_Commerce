import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";

export function Footer({ storeName, tagline }: { storeName: string; tagline: string }) {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-24">
      <div className="container py-16 grid gap-10 md:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl mb-3">{storeName}</h3>
          <p className="text-sm opacity-80 leading-relaxed">{tagline}</p>
        </div>
        <div>
          <h4 className="mb-3 font-medium">Shop</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link href="/category/idols">Idols</Link></li>
            <li><Link href="/category/rudraksha">Rudraksha</Link></li>
            <li><Link href="/category/malas">Malas</Link></li>
            <li><Link href="/category/gift-boxes">Gift Boxes</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-medium">Support</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link href="/track-order">Track Order</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/policies/shipping">Shipping Policy</Link></li>
            <li><Link href="/policies/returns">Returns & Refunds</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-medium">Stay Connected</h4>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs opacity-70">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}
