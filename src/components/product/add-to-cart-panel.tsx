"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/actions/cart.actions";
import { toast } from "sonner";

type Variant = { id: string; name: string; value: string; inventory: number };

export function AddToCartPanel({
  productId,
  variants,
  inStock,
}: {
  productId: string;
  variants: Variant[];
  inStock: boolean;
}) {
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAdd = (redirectToCheckout: boolean) => {
    startTransition(async () => {
      await addToCart(productId, quantity, selectedVariant);
      if (redirectToCheckout) {
        router.push("/checkout");
      } else {
        toast.success("Added to cart");
      }
    });
  };

  if (!inStock) {
    return (
      <div className="rounded-md bg-muted p-4 text-sm">
        Currently out of stock.{" "}
        <button className="underline" onClick={() => toast.info("We'll notify you when this is back in stock.")}>
          Notify me
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {variants.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">{variants[0].name}</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v.id)}
                className={`px-3 py-1.5 text-sm rounded-md border ${
                  selectedVariant === v.id ? "border-primary bg-primary/10" : ""
                }`}
              >
                {v.value}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center border rounded-md">
          <button className="px-3 py-2" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
            -
          </button>
          <span className="px-4">{quantity}</span>
          <button className="px-3 py-2" onClick={() => setQuantity((q) => q + 1)}>
            +
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          disabled={isPending}
          onClick={() => handleAdd(false)}
          className="flex-1 border border-primary text-primary rounded-md py-3 font-medium hover:bg-primary/5 disabled:opacity-50"
        >
          Add to Cart
        </button>
        <button
          disabled={isPending}
          onClick={() => handleAdd(true)}
          className="flex-1 bg-primary text-primary-foreground rounded-md py-3 font-medium hover:opacity-90 disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
