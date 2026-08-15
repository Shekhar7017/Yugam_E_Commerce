import { computeOrderSummary } from "@/actions/checkout.actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { redirect } from "next/navigation";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ coupon?: string }>;
}) {
  const { coupon } = await searchParams;
  const session = await auth();
  const userId = session?.user ? (session.user as any).id : null;

  const summary = await computeOrderSummary(coupon);
  if (summary.cartItems.length === 0) redirect("/cart");

  const addresses = userId
    ? await prisma.address.findMany({ where: { userId }, orderBy: { isDefault: "desc" } })
    : [];

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl mb-8">Checkout</h1>
      <CheckoutForm
        summary={{
          subtotal: summary.subtotal,
          discount: summary.discount,
          shippingFee: summary.shippingFee,
          total: summary.total,
        }}
        addresses={addresses as any}
        isLoggedIn={!!userId}
        couponCode={coupon}
        razorpayKeyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ""}
      />
    </div>
  );
}
