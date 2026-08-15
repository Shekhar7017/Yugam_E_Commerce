"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") throw new Error("Unauthorized");
}

export async function getAdminBlogs() {
  await requireAdmin();
  return prisma.blog.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdminBlog(id: string) {
  await requireAdmin();
  return prisma.blog.findUnique({ where: { id } });
}

export async function createBlog(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  category?: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
}) {
  await requireAdmin();
  await prisma.blog.create({
    data: { ...data, publishedAt: data.isPublished ? new Date() : null },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function updateBlog(
  id: string,
  data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featuredImage?: string;
    category?: string;
    tags: string[];
    metaTitle?: string;
    metaDescription?: string;
    isPublished: boolean;
  }
) {
  await requireAdmin();
  const existing = await prisma.blog.findUnique({ where: { id } });

  await prisma.blog.update({
    where: { id },
    data: {
      ...data,
      publishedAt: data.isPublished ? existing?.publishedAt ?? new Date() : existing?.publishedAt,
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  return { success: true };
}

export async function deleteBlog(id: string) {
  await requireAdmin();
  await prisma.blog.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function toggleBlogPublish(id: string) {
  await requireAdmin();
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) return { success: false };

  await prisma.blog.update({
    where: { id },
    data: {
      isPublished: !blog.isPublished,
      publishedAt: !blog.isPublished ? blog.publishedAt ?? new Date() : blog.publishedAt,
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}
