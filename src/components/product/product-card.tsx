"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { formatINR, calculateDiscountPercent } from "@/lib/utils";
import { addToCart } from "@/actions/cart.actions";
import { toggleWishlist } from "@/actions/wishlist.actions";
import { toast } from "sonner";
import { useTransition } from "react";

type Props = {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number | string;
    compareAtPrice?: number | string | null;
    images: { url: string; altText?: string | null }[];
  };
};

export function ProductCard({ product }: Props) {
  const [isPending, startTransition] = useTransition();
  const discount = calculateDiscountPercent(
    Number(product.price),
    product.compareAtPrice ? Number(product.compareAtPrice) : undefined
  );

  return (
    <div className="group relative">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {product.images[0] && (
            <Image
              src={product.images[0].url}
              alt={product.images[0].altText ?? product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          )}
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded">
              {discount}% OFF
            </span>
          )}
        </div>
        <h3 className="mt-3 text-sm font-medium leading-snug line-clamp-2">{product.title}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold">{formatINR(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatINR(product.compareAtPrice)}
            </span>
          )}
        </div>
      </Link>

      <button
        aria-label="Add to wishlist"
        className="absolute top-3 right-3 bg-white/80 dark:bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() =>
          startTransition(async () => {
            const res = await toggleWishlist(product.id);
            if (!res.success) toast.info(res.error ?? "Sign in to save items to your wishlist");
            else toast.success(res.added ? "Added to wishlist" : "Removed from wishlist");
          })
        }
      >
        <Heart size={16} />
      </button>

      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await addToCart(product.id, 1);
            toast.success("Added to cart");
          })
        }
        className="mt-2 w-full text-xs font-medium border rounded-md py-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors disabled:opacity-50"
      >
        {isPending ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}
