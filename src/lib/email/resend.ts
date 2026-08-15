import { Resend } from "resend";

let client: Resend | null = null;

export function isEmailConfigured() {
  return !!process.env.RESEND_API_KEY;
}

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Resend is not configured — set RESEND_API_KEY to enable transactional email.");
  }
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export const EMAIL_FROM = process.env.EMAIL_FROM || "Divine Store <onboarding@resend.dev>";

/**
 * Sends an email if Resend is configured. If it isn't, this logs the intent
 * and returns { skipped: true } instead of throwing — so order placement,
 * shipping updates, etc. never fail just because email isn't set up yet.
 */
export async function sendEmail(to: string, subject: string, html: string) {
  if (!isEmailConfigured()) {
    console.log(`[email skipped — RESEND_API_KEY not set] To: ${to} | Subject: ${subject}`);
    return { success: false, skipped: true };
  }

  try {
    const resend = getResend();
    const result = await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false, error: (err as Error).message };
  }
}
