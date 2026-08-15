import { getMyOrders } from "@/actions/order.actions";
import { OrderRow } from "@/components/account/order-row";
import Link from "next/link";

export default async function AccountOrdersPage() {
  const orders = await getMyOrders();

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
      <Link href="/" className="inline-block mt-8 text-sm text-primary underline">
        Continue Shopping
      </Link>
    </div>
  );
}