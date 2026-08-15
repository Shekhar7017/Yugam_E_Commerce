"use server";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/site-settings";

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "site" } });
    if (!row) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(row.value as Partial<SiteSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
});
