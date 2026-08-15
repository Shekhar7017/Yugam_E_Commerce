import { getAdminOrders } from "@/actions/admin.actions";
import { formatINR } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { TrackingForm } from "@/components/admin/tracking-form";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Orders</h1>
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground bg-muted/50">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tracking</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="py-3 px-4">
                    #{order.orderNumber}
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </td>
                  <td className="py-3 px-4">{order.user?.name ?? order.guestName ?? "Guest"}</td>
                  <td className="py-3 px-4">{order.items.length}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                      {order.paymentMethod} · {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">{formatINR(Number(order.total))}</td>
                  <td className="py-3 px-4">
                    <OrderStatusSelect orderId={order.id} status={order.status} />
                  </td>
                  <td className="py-3 px-4">
                    <TrackingForm
                      orderId={order.id}
                      currentCarrier={order.carrier}
                      currentTrackingNumber={order.trackingNumber}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <a href={`/api/orders/${order.id}/invoice`} className="text-xs text-primary underline">
                      Invoice
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
