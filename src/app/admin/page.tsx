import Link from "next/link";
import { getDashboardStats } from "@/actions/admin.actions";
import { formatINR } from "@/lib/utils";
import { RevenueChart } from "@/components/admin/revenue-chart";
import {
  IndianRupee,
  ShoppingCart,
  Users,
  Package,
  Clock,
  Sun,
  Plus,
  AlertTriangle,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  PACKED: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-200 text-gray-800",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Total Revenue", value: formatINR(stats.totalRevenue), icon: IndianRupee },
    { label: "Today's Revenue", value: formatINR(stats.todayRevenue), icon: Sun },
    { label: "Orders", value: stats.orderCount.toString(), icon: ShoppingCart },
    { label: "Pending Orders", value: stats.pendingOrders.toString(), icon: Clock },
    { label: "Customers", value: stats.customerCount.toString(), icon: Users },
    { label: "Products", value: stats.productCount.toString(), icon: Package },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="font-display text-3xl">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
          >
            <Plus size={16} /> New Product
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 border px-4 py-2 rounded-md text-sm font-medium"
          >
            View Orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <c.icon size={16} className="text-primary" />
            </div>
            <p className="text-xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border rounded-lg p-6">
          <h2 className="font-medium mb-4">Revenue — Last 30 Days</h2>
          <RevenueChart data={stats.chartData} />
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="font-medium mb-4">Orders by Status</h2>
          {stats.statusCounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.statusCounts.map((s) => (
                <li key={s.status} className="flex items-center justify-between text-sm">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] ?? "bg-muted"}`}>
                    {s.status}
                  </span>
                  <span className="font-medium">{s.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-destructive" />
            <h2 className="font-medium">Low Stock Alerts</h2>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">All products are well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <Link href={`/admin/products/${p.id}/edit`} className="hover:underline">
                    {p.title}
                  </Link>
                  <span className="text-destructive font-medium">{p.inventory} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="font-medium mb-4">Top Selling Products</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales data yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{p.title}</span>
                  <span className="font-medium">{p.sold} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary underline">
            View all
          </Link>
        </div>
        <div className="bg-card border rounded-lg overflow-hiddenS">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr>
                  <th className="py-2">Order</th>
                  <th className="py-2">Items</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-2">#{order.orderNumber}</td>
                    <td className="py-2">{order.items.length}</td>
                    <td className="py-2">{formatINR(Number(order.total))}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-muted"}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {stats.recentOrders.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No orders yet.</p>
        )}
      </div>
    </div>
  );
}