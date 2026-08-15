"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { updateCartItemQuantity, removeFromCart } from "@/actions/cart.actions";

type Props = {
  item: {
    productId: string;
    variantId?: string | null;
    quantity: number;
    product: {
      title: string;
      slug: string;
      price: number | string;
      images: { url: string; altText?: string | null }[];
    };
    variant?: { value: string; priceDiff: number | string } | null;
  };
};

export function CartLineItem({ item }: Props) {
  const [isPending, startTransition] = useTransition();
  const unitPrice = Number(item.product.price) + Number(item.variant?.priceDiff ?? 0);

  return (
    <div className="flex gap-4 border rounded-lg p-4">
      <Link href={`/products/${item.product.slug}`} className="relative w-24 h-24 shrink-0 rounded-md overflow-hidden bg-muted">
        {item.product.images[0] && (
          <Image src={item.product.images[0].url} alt={item.product.title} fill className="object-cover" />
        )}
      </Link>

      <div className="flex-1">
        <div className="flex justify-between">
          <div>
            <Link href={`/products/${item.product.slug}`} className="font-medium hover:underline">
              {item.product.title}
            </Link>
            {item.variant && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.variant.value}</p>
            )}
          </div>
          <button
            aria-label="Remove item"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await removeFromCart(item.productId, item.variantId ?? undefined);
              })
            }
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border rounded-md">
            <button
              disabled={isPending}
              className="px-3 py-1"
              onClick={() =>
                startTransition(async () => {
                  await updateCartItemQuantity(
                    item.productId,
                    item.quantity - 1,
                    item.variantId ?? undefined
                  );
                })
              }
            >
              -
            </button>
            <span className="px-4 text-sm">{item.quantity}</span>
            <button
              disabled={isPending}
              className="px-3 py-1"
              onClick={() =>
                startTransition(async () => {
                  await updateCartItemQuantity(
                    item.productId,
                    item.quantity + 1,
                    item.variantId ?? undefined
                  );
                })
              }
            >
              +
            </button>
          </div>
          <span className="font-semibold">{formatINR(unitPrice * item.quantity)}</span>
        </div>
      </div>
    </div>
  );
}
