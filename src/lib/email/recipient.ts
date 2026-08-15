import { prisma } from "@/lib/prisma";

export async function getOrderRecipient(order: { userId?: string | null; guestEmail?: string | null; guestName?: string | null }) {
  if (order.userId) {
    const user = await prisma.user.findUnique({ where: { id: order.userId }, select: { email: true, name: true } });
    return { email: user?.email ?? null, name: user?.name ?? null };
  }
  return { email: order.guestEmail ?? null, name: order.guestName ?? null };
}
