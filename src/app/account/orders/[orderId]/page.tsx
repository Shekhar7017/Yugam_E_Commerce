import { getOrderById } from "@/actions/order.actions";
import { getSiteSettings } from "@/actions/settings.actions";
import { formatINR } from "@/lib/utils";
import { buildCarrierTrackingUrl } from "@/lib/carrier-tracking";
import { OrderStatusStepper } from "@/components/order-status-stepper";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Mail, Phone, MessageCircle, ChevronLeft } from "lucide-react";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const [order, settings] = await Promise.all([getOrderById(orderId), getSiteSettings()]);

  if (!order) notFound();

  const trackUrl = buildCarrierTrackingUrl(order.carrier, order.trackingNumber);
  const addr = order.shippingSnapshot as any;

  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft size={16} /> Back to Orders
      </Link>

      <div className="flex items-center justify-between mt-4 mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <a href={`/api/orders/${order.id}/invoice`} className="border px-4 py-2 rounded-md text-sm font-medium">
          Download Invoice
        </a>
      </div>

      <div className="border rounded-lg p-6 mb-6 overflow-x-auto">
        <OrderStatusStepper status={order.status} />
      </div>

      {order.trackingNumber && (
        <div className="border rounded-lg p-6 mb-6 bg-muted/30">
          <h2 className="font-medium mb-2">Shipment Tracking</h2>
          <p className="text-sm">
            Carrier: <span className="font-medium">{order.carrier}</span>
          </p>
          <p className="text-sm">
            AWB / Tracking No.: <span className="font-medium">{order.trackingNumber}</span>
          </p>
          {trackUrl && (
            <a
              href={trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
            >
              Track Live on {order.carrier} <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}

      <div className="border rounded-lg p-6 mb-6">
        <h2 className="font-medium mb-4">Items</h2>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-4 items-center">
              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                {item.imageSnapshot && (
                  <Image src={item.imageSnapshot} alt={item.titleSnapshot} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.titleSnapshot}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium shrink-0">{formatINR(Number(item.price) * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="border-t mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatINR(Number(order.subtotal))}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-primary">
              <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span>-{formatINR(Number(order.discount))}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{Number(order.shippingFee) === 0 ? "Free" : formatINR(Number(order.shippingFee))}</span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t pt-2 mt-2">
            <span>Total</span>
            <span>{formatINR(Number(order.total))}</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div className="border rounded-lg p-6">
          <h2 className="font-medium mb-3">Shipping Address</h2>
          <p className="text-sm">{addr?.fullName}</p>
          <p className="text-sm text-muted-foreground">{addr?.line1}</p>
          {addr?.line2 && <p className="text-sm text-muted-foreground">{addr.line2}</p>}
          <p className="text-sm text-muted-foreground">
            {addr?.city}, {addr?.state} - {addr?.postalCode}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Phone: {addr?.phone}</p>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="font-medium mb-3">Payment</h2>
          <p className="text-sm">Method: {order.paymentMethod}</p>
          <p className="text-sm">Status: {order.paymentStatus}</p>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="font-medium mb-3">Need Help With This Order?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Our team is happy to help with anything related to order #{order.orderNumber}.
        </p>
        <div className="flex flex-wrap gap-3">
          {settings.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}?subject=Order ${order.orderNumber}`}
              className="inline-flex items-center gap-1.5 border px-4 py-2 rounded-md text-sm"
                >
              <Mail size={14} /> Email Us
            </a>
          )}
          {settings.contactPhone && (
            <a href={`tel:${settings.contactPhone}`} className="inline-flex items-center gap-1.5 border px-4 py-2 rounded-md text-sm">
              <Phone size={14} /> Call Us
            </a>
          )}
          {settings.whatsappNumber && (
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                `Hi, I need help with order #${order.orderNumber}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-md text-sm"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}