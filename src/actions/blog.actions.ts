"use server";

import { prisma } from "@/lib/prisma";

export async function getPublishedBlogs() {
  return prisma.blog.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getBlogBySlug(slug: string) {
  return prisma.blog.findUnique({
    where: { slug, isPublished: true },
  });
}

export async function getRelatedBlogs(currentId: string, category?: string | null, limit = 3) {
  return prisma.blog.findMany({
    where: {
      id: { not: currentId },
      isPublished: true,
      ...(category ? { category } : {}),
    },
    take: limit,
    orderBy: { publishedAt: "desc" },
  });
}
