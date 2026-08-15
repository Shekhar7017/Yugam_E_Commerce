"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") throw new Error("Unauthorized");
}

export async function getAIAnalytics() {
  await requireAdmin();

  const [conversationCount, messageCount, recentUserMessages] = await Promise.all([
    prisma.conversation.count(),
    prisma.conversationMessage.count(),
    prisma.conversationMessage.findMany({
      where: { role: "user" },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { content: true, createdAt: true },
    }),
  ]);

  return { conversationCount, messageCount, recentUserMessages };
}
