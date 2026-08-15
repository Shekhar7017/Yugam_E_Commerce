"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getOrCreateGuestSessionId, getGuestSessionId } from "@/lib/guest-session";
import { revalidatePath } from "next/cache";
import { toPlain } from "@/lib/serialize";

type GuestCartItem = { productId: string; variantId: string | null; quantity: number };

async function getGuestCartRecord(sessionId: string) {
  return prisma.guestCart.upsert({
    where: { sessionId },
    update: {},
    create: { sessionId, items: [] },
  });
}

// Prisma's compound-unique lookup syntax (cartId_productId_variantId) can't
// take `null` for a nullable member like variantId, even though the column
// itself allows null — so we look items up with a plain findFirst instead of
// relying on that composite key for upsert/update.
async function findCartItem(cartId: string, productId: string, variantId?: string | null) {
  return prisma.cartItem.findFirst({
    where: { cartId, productId, variantId: variantId ?? null },
  });
}

export async function addToCart(productId: string, quantity = 1, variantId?: string) {
  const session = await auth();

  if (session?.user) {
    const userId = (session.user as any).id as string;
    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const existing = await findCartItem(cart.id, productId, variantId);
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, variantId: variantId ?? undefined, quantity },
      });
    }
  } else {
    const sessionId = await getOrCreateGuestSessionId();
    const record = await getGuestCartRecord(sessionId);
    const items = (record.items as unknown as GuestCartItem[]) ?? [];
    const existing = items.find(
      (i) => i.productId === productId && i.variantId === (variantId ?? null)
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ productId, variantId: variantId ?? null, quantity });
    }
    await prisma.guestCart.update({
      where: { sessionId },
      data: { items: items as any },
    });
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartItemQuantity(
  productId: string,
  quantity: number,
  variantId?: string
) {
  const session = await auth();

  if (quantity <= 0) {
    return removeFromCart(productId, variantId);
  }

  if (session?.user) {
    const userId = (session.user as any).id as string;
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return { success: false };

    const existing = await findCartItem(cart.id, productId, variantId);
    if (!existing) return { success: false };

    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity },
    });
  } else {
    const sessionId = await getOrCreateGuestSessionId();
    const record = await getGuestCartRecord(sessionId);
    const items = (record.items as unknown as GuestCartItem[]) ?? [];
    const target = items.find(
      (i) => i.productId === productId && i.variantId === (variantId ?? null)
    );
    if (target) target.quantity = quantity;
    await prisma.guestCart.update({ where: { sessionId }, data: { items: items as any } });
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(productId: string, variantId?: string) {
  const session = await auth();

  if (session?.user) {
    const userId = (session.user as any).id as string;
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return { success: false };

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId, variantId: variantId ?? null },
    });
  } else {
    const sessionId = await getOrCreateGuestSessionId();
    const record = await getGuestCartRecord(sessionId);
    const items = ((record.items as unknown as GuestCartItem[]) ?? []).filter(
      (i) => !(i.productId === productId && i.variantId === (variantId ?? null))
    );
    await prisma.guestCart.update({ where: { sessionId }, data: { items: items as any } });
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function getCart() {
  const session = await auth();

  if (session?.user) {
    const userId = (session.user as any).id as string;
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { include: { images: true } }, variant: true },
        },
      },
    });
    return toPlain(cart?.items ?? []);
  }

  const sessionId = await getGuestSessionId();
  if (!sessionId) return []; // no guest session yet — cart is empty, nothing to create during render

  const record = await prisma.guestCart.findUnique({ where: { sessionId } });
  if (!record) return [];
  const items = (record.items as unknown as GuestCartItem[]) ?? [];
  if (items.length === 0) return [];

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { images: true },
  });
  const variantIds = items.filter((i) => i.variantId).map((i) => i.variantId!) as string[];
  const variants = variantIds.length
    ? await prisma.productVariant.findMany({ where: { id: { in: variantIds } } })
    : [];

  return toPlain(
    items.map((item) => ({
      id: `${item.productId}-${item.variantId ?? "base"}`,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      product: products.find((p) => p.id === item.productId)!,
      variant: variants.find((v) => v.id === item.variantId) ?? null,
    }))
  );
}

// Merge guest cart into user cart right after login
export async function mergeGuestCartIntoUserCart(userId: string, sessionId: string) {
  const record = await prisma.guestCart.findUnique({ where: { sessionId } });
  if (!record) return;

  const items = (record.items as unknown as GuestCartItem[]) ?? [];
  if (items.length === 0) return;

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  for (const item of items) {
    const existing = await findCartItem(cart.id, item.productId, item.variantId);
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: item.quantity } },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.productId,
          variantId: item.variantId ?? undefined,
          quantity: item.quantity,
        },
      });
    }
  }

  await prisma.guestCart.delete({ where: { sessionId } });
}