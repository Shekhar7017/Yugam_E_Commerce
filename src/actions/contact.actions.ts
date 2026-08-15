"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendEmail } from "@/lib/email/resend";
import { getSiteSettings } from "@/actions/settings.actions";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

export async function submitContactMessage(input: unknown) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  await prisma.contactMessage.create({ data });

  const settings = await getSiteSettings();
  if (settings.contactEmail) {
    await sendEmail(
      settings.contactEmail,
      `New message: ${data.subject || "General Inquiry"} — from ${data.name}`,
      `<div style="font-family: sans-serif; font-size: 14px;">
        <p><strong>From:</strong> ${data.name} (${data.email})</p>
        ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, "<br/>")}</p>
      </div>`
    );
  }

  return { success: true };
}