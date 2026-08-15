"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { toPlain } from "@/lib/serialize";

export async function getMyOrders() {
  const session = await auth();
  if (!session?.user) return [];
  const userId = (session.user as any).id as string;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return toPlain(orders);
}

export async function getOrderById(orderId: string) {
  const session = await auth();
  if (!session?.user) return null;
  const userId = (session.user as any).id as string;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.userId !== userId) return null;
  return toPlain(order);
}

export async function getOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, address: true },
  });
  return order ? toPlain(order) : null;
}

export async function trackOrder(orderNumber: string, email: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) return null;

  const emailMatches =
    order.guestEmail?.toLowerCase() === email.toLowerCase() ||
    (await prisma.user.findFirst({
      where: { id: order.userId ?? undefined, email: { equals: email, mode: "insensitive" } },
    }));

  if (!emailMatches) return null;
  return toPlain(order);
}