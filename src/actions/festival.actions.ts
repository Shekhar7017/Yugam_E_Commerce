"use server";

import { prisma } from "@/lib/prisma";

export async function getActiveFestivals() {
  const now = new Date();

  return prisma.festival.findMany({
    where: {
      isActive: true,
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    orderBy: { sortOrder: "asc" },
  });
}
