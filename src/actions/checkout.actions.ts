"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCart } from "@/actions/cart.actions";
import { generateOrderNumber } from "@/lib/utils";
import { getRazorpay } from "@/lib/razorpay";
import crypto from "crypto";
import { checkoutSchema } from "@/lib/validations";
import { sendEmail } from "@/lib/email/resend";
import { orderConfirmationEmail } from "@/lib/email/templates";
import { getOrderRecipient } from "@/lib/email/recipient";
import { toPlain } from "@/lib/serialize";

const FLAT_SHIPPING_FEE = 79;
const FREE_SHIPPING_THRESHOLD = 999;

export async function computeOrderSummary(couponCode?: string) {
  const cartItems = await getCart();

  const subtotal = cartItems.reduce((sum, item: any) => {
    const price = Number(item.variant?.priceDiff ?? 0) + Number(item.product.price);
    return sum + price * item.quantity;
  }, 0);

  let discount = 0;
  let couponError: string | null = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (!coupon || !coupon.isActive) {
      couponError = "Invalid or expired coupon";
    } else if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
      couponError = `Minimum order value ₹${coupon.minOrderValue} required for this coupon`;
    } else if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      couponError = "Coupon usage limit reached";
    } else {
      discount =
        coupon.discountType === "PERCENT"
          ? (subtotal * Number(coupon.discountValue)) / 100
          : Number(coupon.discountValue);
      if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
    }
  }

  const shippingFee = subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const tax = 0; // GST handling can be enabled per product category if required
  const total = Math.max(subtotal - discount + shippingFee + tax, 0);

  return toPlain({ cartItems, subtotal, discount, shippingFee, tax, total, couponError });
}

export async function createRazorpayOrder(amountInRupees: number) {
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: Math.round(amountInRupees * 100), // paise
    currency: "INR",
    receipt: generateOrderNumber(),
  });
  return order;
}

export async function verifyRazorpaySignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const body = `${params.razorpay_order_id}|${params.razorpay_payment_id}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(body)
    .digest("hex");
  return expected === params.razorpay_signature;
}

export async function placeOrder(input: unknown) {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid checkout data" };
  }
  const data = parsed.data;

  const session = await auth();
  const userId = session?.user ? (session.user as any).id : null;

  const { cartItems, subtotal, discount, shippingFee, tax, total, couponError } =
    await computeOrderSummary(data.couponCode);

  if (couponError) return { success: false, error: couponError };
  if (cartItems.length === 0) return { success: false, error: "Your cart is empty" };

  let addressSnapshot: any;
  if (data.addressId) {
    const addr = await prisma.address.findUnique({ where: { id: data.addressId } });
    if (!addr) return { success: false, error: "Address not found" };
    addressSnapshot = addr;
  } else if (data.newAddress) {
    addressSnapshot = data.newAddress;
    if (userId) {
      await prisma.address.create({ data: { ...data.newAddress, userId } });
    }
  } else {
    return { success: false, error: "Shipping address is required" };
  }

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: userId ?? undefined,
      guestEmail: !userId ? data.guestEmail : undefined,
      guestName: !userId ? data.guestName : undefined,
      guestPhone: !userId ? data.guestPhone : undefined,
      addressId: data.addressId,
      shippingSnapshot: addressSnapshot,
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      couponCode: data.couponCode,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === "COD" ? "PENDING" : "PENDING",
      status: "PENDING",
      items: {
        create: cartItems.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId ?? undefined,
          titleSnapshot: item.product.title,
          imageSnapshot: item.product.images?.[0]?.url,
          price: Number(item.variant?.priceDiff ?? 0) + Number(item.product.price),
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  });

  // Decrement inventory
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { inventory: { decrement: item.quantity } },
    });
  }

  if (data.couponCode) {
    await prisma.coupon.update({
      where: { code: data.couponCode.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  }

  // Clear cart
  if (userId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  // COD is confirmed immediately; Razorpay orders get their confirmation
  // email after payment is verified in confirmRazorpayPayment().
  if (data.paymentMethod === "COD") {
    const recipient = await getOrderRecipient(order);
    if (recipient.email) {
      const { subject, html } = orderConfirmationEmail({
        customerName: recipient.name,
        orderNumber: order.orderNumber,
        items: order.items,
        total,
        paymentMethod: "COD",
      });
      await sendEmail(recipient.email, subject, html);
    }
  }

  return { success: true, orderId: order.id, orderNumber: order.orderNumber, total };
}

export async function confirmRazorpayPayment(orderId: string, paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const valid = await verifyRazorpaySignature(paymentData);
  if (!valid) return { success: false, error: "Payment verification failed" };

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "PAID",
      status: "PROCESSING",
      razorpayOrderId: paymentData.razorpay_order_id,
      razorpayPaymentId: paymentData.razorpay_payment_id,
    },
    include: { items: true },
  });

  const recipient = await getOrderRecipient(order);
  if (recipient.email) {
    const { subject, html } = orderConfirmationEmail({
      customerName: recipient.name,
      orderNumber: order.orderNumber,
      items: order.items,
      total: order.total,
      paymentMethod: "RAZORPAY",
    });
    await sendEmail(recipient.email, subject, html);
  }

  return { success: true };
}
