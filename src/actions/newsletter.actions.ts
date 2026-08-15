"use server";

import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations";
import { sendEmail } from "@/lib/email/resend";
import { newsletterWelcomeEmail } from "@/lib/email/templates";

export async function subscribeNewsletter(email: string) {
  const parsed = newsletterSchema.safeParse({ email });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  try {
    const existing = await prisma.newsletter.findUnique({ where: { email: parsed.data.email } });
    await prisma.newsletter.upsert({
      where: { email: parsed.data.email },
      update: { isActive: true },
      create: { email: parsed.data.email },
    });

    if (!existing) {
      const { subject, html } = newsletterWelcomeEmail();
      await sendEmail(parsed.data.email, subject, html);
    }

    return { success: true };
  } catch {
    return { success: false, error: "Could not subscribe right now, please try again." };
  }
}
