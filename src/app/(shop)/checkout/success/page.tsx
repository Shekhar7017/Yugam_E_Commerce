import { getOrderByNumber } from "@/actions/order.actions";
import Link from "next/link";
import { formatINR } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  if (!orderNumber) notFound();

  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <div className="container py-24 max-w-xl mx-auto text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 text-2xl">
        ✓
      </div>
      <h1 className="font-display text-3xl mb-3">Thank you for your order</h1>
      <p className="text-muted-foreground mb-8">
        Order <span className="font-medium text-foreground">#{order.orderNumber}</span> has been
        placed successfully. A confirmation email is on its way.
      </p>

      <div className="border rounded-lg p-6 text-left mb-8">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-2 border-b last:border-0">
            <span>
              {item.titleSnapshot} × {item.quantity}
            </span>
            <span>{formatINR(Number(item.price) * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold pt-3">
          <span>Total</span>
          <span>{formatINR(Number(order.total))}</span>
        </div>
      </div>

      <Link href="/" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium">
        Continue Shopping
      </Link>
      <a
        href={`/api/orders/${order.id}/invoice${order.guestEmail ? `?email=${encodeURIComponent(order.guestEmail)}` : ""}`}
        className="inline-block ml-3 border px-6 py-3 rounded-md font-medium"
      >
        Download Invoice
      </a>
    </div>
  );
}
