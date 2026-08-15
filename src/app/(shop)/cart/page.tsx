import { getCart } from "@/actions/cart.actions";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import Link from "next/link";

export default async function CartPage() {
  const items = await getCart();

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">
          Explore our collection and find something meaningful for your home.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12 grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-6">
        <h1 className="font-display text-3xl mb-4">Shopping Cart</h1>
        {items.map((item: any) => (
          <CartLineItem key={item.id} item={item} />
        ))}
      </div>
      <div>
        <CartSummary />
      </div>
    </div>
  );
}
