"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, ProductStatus } from "@prisma/client";
import { toPlain } from "@/lib/serialize";

export type ProductFilters = {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
  page?: number;
  perPage?: number;
};

export async function getProducts(filters: ProductFilters = {}) {
  const { categorySlug, search, minPrice, maxPrice, sort = "newest", page = 1, perPage = 12 } = filters;

  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.PUBLISHED,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { tags: { has: search.toLowerCase() } },
          ],
        }
      : {}),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice ? { gte: minPrice } : {}),
            ...(maxPrice ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
      ? { price: "desc" }
      : sort === "rating"
      ? { avgRating: "desc" }
      : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return { items: toPlain(items), total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, status: ProductStatus.PUBLISHED },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      faqs: { orderBy: { sortOrder: "asc" } },
      category: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, image: true } } },
      },
    },
  });
  return product ? toPlain(product) : null;
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  const products = await prisma.product.findMany({
    where: {
      id: { not: productId },
      categoryId,
      status: ProductStatus.PUBLISHED,
    },
    take: limit,
    include: { images: { take: 1 } },
  });
  return toPlain(products);
}

export async function getFeaturedProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { status: ProductStatus.PUBLISHED, isFeatured: true },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1 } },
  });
  return toPlain(products);
}

export async function getBestSellers(limit = 8) {
  const products = await prisma.product.findMany({
    where: { status: ProductStatus.PUBLISHED, isBestSeller: true },
    take: limit,
    include: { images: { take: 1 } },
  });
  return toPlain(products);
}

export async function getNewArrivals(limit = 8) {
  const products = await prisma.product.findMany({
    where: { status: ProductStatus.PUBLISHED, isNewArrival: true },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1 } },
  });
  return toPlain(products);
}

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}
