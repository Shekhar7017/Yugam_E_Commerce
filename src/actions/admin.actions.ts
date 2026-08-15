"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/validations";
import { OrderStatus, ProductStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email/resend";
import { orderShippedEmail, orderDeliveredEmail, contactReplyEmail } from "@/lib/email/templates";
import { getOrderRecipient } from "@/lib/email/recipient";
import { buildCarrierTrackingUrl } from "@/lib/carrier-tracking";
import { toPlain } from "@/lib/serialize";
import type { SiteSettings } from "@/lib/site-settings";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") {
    throw new Error("Unauthorized: admin access required");
  }
  return session;
}

// ---------- Dashboard ----------

export async function getDashboardStats() {
  await requireAdmin();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    revenueAgg,
    todayRevenueAgg,
    orderCount,
    pendingCount,
    customerCount,
    productCount,
    trackedProducts,
    recentOrders,
    statusGroups,
    topProductsRaw,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID", createdAt: { gte: startOfToday } },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count(),
    prisma.product.findMany({
      where: { trackStock: true },
      select: { id: true, title: true, inventory: true, lowStockAt: true },
    }),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { items: true } }),
    prisma.order.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const lowStock = trackedProducts.filter((p) => p.inventory <= p.lowStockAt).slice(0, 5);

  const last30Days = await prisma.order.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    select: { createdAt: true, total: true },
  });
  const salesByDay: Record<string, number> = {};
  for (const order of last30Days) {
    const day = order.createdAt.toISOString().slice(0, 10);
    salesByDay[day] = (salesByDay[day] ?? 0) + Number(order.total);
  }
  const chartData = Object.entries(salesByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));

  const topProductIds = topProductsRaw.map((t) => t.productId);
  const topProductDetails = topProductIds.length
    ? await prisma.product.findMany({ where: { id: { in: topProductIds } }, select: { id: true, title: true } })
    : [];
  const topProducts = topProductsRaw.map((t) => ({
    title: topProductDetails.find((p) => p.id === t.productId)?.title ?? "Unknown product",
    sold: t._sum.quantity ?? 0,
  }));

  return {
    totalRevenue: Number(revenueAgg._sum.total ?? 0),
    todayRevenue: Number(todayRevenueAgg._sum.total ?? 0),
    orderCount,
    pendingOrders: pendingCount,
    customerCount,
    productCount,
    recentOrders,
    chartData,
    lowStock,
    statusCounts: statusGroups.map((s) => ({ status: s.status, count: s._count.status })),
    topProducts,
  };
}

// ---------- Products ----------

export async function getAdminProducts() {
  await requireAdmin();
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, images: { take: 1 } },
  });
}

export async function getAdminProduct(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      category: true,
    },
  });
  return product ? toPlain(product) : null;
}

export async function createProduct(input: unknown, imageUrl?: string) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      images: imageUrl
        ? { create: [{ url: imageUrl, altText: parsed.data.title, sortOrder: 0 }] }
        : undefined,
    },
  });

  revalidatePath("/admin/products");
  return { success: true, id: product.id };
}

export async function updateProduct(id: string, input: unknown, imageUrl?: string) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message };

  await prisma.product.update({ where: { id }, data: parsed.data });

  if (imageUrl) {
    const existing = await prisma.productImage.findFirst({ where: { productId: id, sortOrder: 0 } });
    if (existing) {
      await prisma.productImage.update({ where: { id: existing.id }, data: { url: imageUrl } });
    } else {
      await prisma.productImage.create({
        data: { productId: id, url: imageUrl, altText: parsed.data.title, sortOrder: 0 },
      });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  return { success: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  return { success: true };
}

export async function toggleProductStatus(id: string, status: keyof typeof ProductStatus) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { status } });
  revalidatePath("/admin/products");
  return { success: true };
}

// ---------- Product Image Gallery ----------

export async function getProductImages(productId: string) {
  await requireAdmin();
  return prisma.productImage.findMany({ where: { productId }, orderBy: { sortOrder: "asc" } });
}

export async function addProductImage(productId: string, url: string, altText?: string) {
  await requireAdmin();
  const count = await prisma.productImage.count({ where: { productId } });
  await prisma.productImage.create({
    data: { productId, url, altText, sortOrder: count },
  });
  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true };
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin();
  const image = await prisma.productImage.delete({ where: { id: imageId } });
  revalidatePath(`/admin/products/${image.productId}/edit`);
  return { success: true };
}

export async function reorderProductImages(productId: string, orderedImageIds: string[]) {
  await requireAdmin();
  await Promise.all(
    orderedImageIds.map((id, index) =>
      prisma.productImage.update({ where: { id }, data: { sortOrder: index } })
    )
  );
  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true };
}

// ---------- Product Variants ----------

export async function getProductVariants(productId: string) {
  await requireAdmin();
  return prisma.productVariant.findMany({ where: { productId } });
}

export async function addProductVariant(
  productId: string,
  data: { name: string; value: string; priceDiff: number; sku: string; inventory: number }
) {
  await requireAdmin();
  try {
    await prisma.productVariant.create({ data: { productId, ...data } });
    revalidatePath(`/admin/products/${productId}/edit`);
    return { success: true };
  } catch {
    return { success: false, error: "SKU must be unique — this one is already in use." };
  }
}

export async function updateProductVariant(
  id: string,
  data: { name: string; value: string; priceDiff: number; sku: string; inventory: number }
) {
  await requireAdmin();
  const variant = await prisma.productVariant.update({ where: { id }, data });
  revalidatePath(`/admin/products/${variant.productId}/edit`);
  return { success: true };
}

export async function deleteProductVariant(id: string) {
  await requireAdmin();
  const variant = await prisma.productVariant.delete({ where: { id } });
  revalidatePath(`/admin/products/${variant.productId}/edit`);
  return { success: true };
}

// ---------- Categories ----------

export async function getAdminCategories() {
  await requireAdmin();
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}) {
  await requireAdmin();
  await prisma.category.create({ data });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function updateCategory(
  id: string,
  data: { name: string; slug: string; description?: string; image?: string }
) {
  await requireAdmin();
  await prisma.category.update({ where: { id }, data });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath(`/category/${data.slug}`);
  return { success: true };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return { success: false, error: "Move or delete products in this category first" };
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { success: true };
}

// ---------- Orders ----------

export async function getAdminOrders() {
  await requireAdmin();
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, user: { select: { name: true, email: true } } },
  });
}

export async function updateOrderStatus(orderId: string, status: keyof typeof OrderStatus) {
  await requireAdmin();
  const order = await prisma.order.update({ where: { id: orderId }, data: { status } });

  if (status === "DELIVERED") {
    const recipient = await getOrderRecipient(order);
    if (recipient.email) {
      const { subject, html } = orderDeliveredEmail({
        customerName: recipient.name,
        orderNumber: order.orderNumber,
      });
      await sendEmail(recipient.email, subject, html);
    }
  }

  revalidatePath("/admin/orders");
  return { success: true };
}

export async function updateOrderTracking(orderId: string, trackingNumber: string, carrier: string) {
  await requireAdmin();
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { trackingNumber, carrier, status: "SHIPPED" },
  });

  const recipient = await getOrderRecipient(order);
  if (recipient.email) {
    const { subject, html } = orderShippedEmail({
      customerName: recipient.name,
      orderNumber: order.orderNumber,
      carrier,
      trackingNumber,
      trackingUrl: buildCarrierTrackingUrl(carrier, trackingNumber),
    });
    await sendEmail(recipient.email, subject, html);
  }

  revalidatePath("/admin/orders");
  return { success: true };
}

// ---------- Coupons ----------

export async function getAdminCoupons() {
  await requireAdmin();
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createCoupon(data: {
  code: string;
  description?: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
}) {
  await requireAdmin();
  await prisma.coupon.create({ data: { ...data, code: data.code.toUpperCase() } });
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/coupons");
  return { success: true };
}

// ---------- Festivals / Homepage Banners ----------

export async function getAdminFestivals() {
  await requireAdmin();
  return prisma.festival.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function createFestival(data: {
  title: string;
  subtitle?: string;
  discountText?: string;
  image?: string;
  ctaLabel?: string;
  ctaLink?: string;
  startDate?: string;
  endDate?: string;
  sortOrder?: number;
}) {
  await requireAdmin();
  await prisma.festival.create({
    data: {
      title: data.title,
      subtitle: data.subtitle || undefined,
      discountText: data.discountText || undefined,
      image: data.image || undefined,
      ctaLabel: data.ctaLabel || "Shop Now",
      ctaLink: data.ctaLink || "/",
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      sortOrder: data.sortOrder ?? 0,
    },
  });
  revalidatePath("/admin/festivals");
  revalidatePath("/");
  return { success: true };
}

export async function updateFestival(
  id: string,
  data: {
    title: string;
    subtitle?: string;
    discountText?: string;
    image?: string;
    ctaLabel?: string;
    ctaLink?: string;
    startDate?: string;
    endDate?: string;
    sortOrder?: number;
  }
) {
  await requireAdmin();
  await prisma.festival.update({
    where: { id },
    data: {
      title: data.title,
      subtitle: data.subtitle || null,
      discountText: data.discountText || null,
      image: data.image || null,
      ctaLabel: data.ctaLabel || "Shop Now",
      ctaLink: data.ctaLink || "/",
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      sortOrder: data.sortOrder ?? 0,
    },
  });
  revalidatePath("/admin/festivals");
  revalidatePath("/");
  return { success: true };
}

export async function toggleFestivalActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.festival.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/festivals");
  revalidatePath("/");
  return { success: true };
}

export async function deleteFestival(id: string) {
  await requireAdmin();
  await prisma.festival.delete({ where: { id } });
  revalidatePath("/admin/festivals");
  revalidatePath("/");
  return { success: true };
}

// ---------- Site Settings (hero, branding, "why choose us") ----------

export async function getAdminSiteSettings() {
  await requireAdmin();
  const row = await prisma.setting.findUnique({ where: { key: "site" } });
  return row?.value ?? null;
}

export async function updateSiteSettings(settings: SiteSettings) {
  await requireAdmin();
  await prisma.setting.upsert({
    where: { key: "site" },
    update: { value: settings as any },
    create: { key: "site", value: settings as any },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}


export async function getContactMessages() {
  await requireAdmin();
  return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}

export async function replyToContactMessage(id: string, replyText: string) {
  await requireAdmin();

  const msg = await prisma.contactMessage.update({
    where: { id },
    data: { reply: replyText, repliedAt: new Date(), isRead: true },
  });

  const { subject, html } = contactReplyEmail({
    customerName: msg.name,
    originalMessage: msg.message,
    reply: replyText,
  });

  await sendEmail(msg.email, subject, html);

  revalidatePath("/admin/contact");
  return { success: true };
}