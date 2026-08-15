"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { toPlain } from "@/lib/serialize";

export async function getWishlist() {
  const session = await auth();
  if (!session?.user) return [];
  const userId = (session.user as any).id as string;

  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { images: { take: 1 } } } },
    orderBy: { createdAt: "desc" },
  });
  return toPlain(items);
}

export async function toggleWishlist(productId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Please sign in to save items" };
  const userId = (session.user as any).id as string;

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlistItem.create({ data: { userId, productId } });
  }

  revalidatePath("/account/wishlist");
  return { success: true, added: !existing };
}
