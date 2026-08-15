const BRAND_COLOR = "#C9822B";
const MAROON = "#5B1A18";

function wrapper(bodyHtml: string) {
  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; background:#FAF6EE; padding: 32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
      <div style="background:${MAROON};color:#FAF6EE;padding:24px 32px;">
        <span style="font-size:22px;letter-spacing:0.5px;">Divine Store</span>
      </div>
      <div style="padding:32px;color:#2b1d1c;">
        ${bodyHtml}
      </div>
      <div style="padding:20px 32px;background:#FAF6EE;color:#8a7a68;font-size:12px;text-align:center;">
        Divine Store · Sacred products for everyday devotion
      </div>
    </div>
  </div>`;
}

function itemsTable(items: { titleSnapshot: string; quantity: number; price: number | string }[]) {
  return `
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    ${items
      .map(
        (i) => `
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:8px 0;font-size:14px;">${i.titleSnapshot} × ${i.quantity}</td>
        <td style="padding:8px 0;font-size:14px;text-align:right;">₹${(Number(i.price) * i.quantity).toLocaleString("en-IN")}</td>
      </tr>`
      )
      .join("")}
  </table>`;
}

export function orderConfirmationEmail(params: {
  customerName?: string | null;
  orderNumber: string;
  items: { titleSnapshot: string; quantity: number; price: number | string }[];
  total: number | string;
  paymentMethod: string;
}) {
  const { customerName, orderNumber, items, total, paymentMethod } = params;
  return {
    subject: `Order Confirmed — #${orderNumber}`,
    html: wrapper(`
      <h2 style="color:${BRAND_COLOR};margin-top:0;">Thank you${customerName ? `, ${customerName}` : ""}!</h2>
      <p style="font-size:15px;line-height:1.6;">
        Your order <strong>#${orderNumber}</strong> has been placed successfully
        ${paymentMethod === "COD" ? "and will be paid on delivery." : "and payment was received."}
      </p>
      ${itemsTable(items)}
      <p style="text-align:right;font-weight:bold;font-size:16px;">
        Total: ₹${Number(total).toLocaleString("en-IN")}
      </p>
      <p style="font-size:14px;color:#6b5a4d;margin-top:24px;">
        We'll email you again as soon as your order ships, with tracking details.
      </p>
    `),
  };
}

export function orderShippedEmail(params: {
  customerName?: string | null;
  orderNumber: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}) {
  const { customerName, orderNumber, carrier, trackingNumber, trackingUrl } = params;
  return {
    subject: `Your order #${orderNumber} has shipped`,
    html: wrapper(`
      <h2 style="color:${BRAND_COLOR};margin-top:0;">Good news${customerName ? `, ${customerName}` : ""}!</h2>
      <p style="font-size:15px;line-height:1.6;">
        Your order <strong>#${orderNumber}</strong> is on its way via <strong>${carrier ?? "our courier partner"}</strong>.
      </p>
      ${trackingNumber ? `<p style="font-size:14px;">Tracking number: <strong>${trackingNumber}</strong></p>` : ""}
      ${
        trackingUrl
          ? `<a href="${trackingUrl}" style="display:inline-block;margin-top:12px;background:${BRAND_COLOR};color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">Track Your Package</a>`
          : ""
      }
    `),
  };
}

export function orderDeliveredEmail(params: { customerName?: string | null; orderNumber: string }) {
  return {
    subject: `Delivered — Order #${params.orderNumber}`,
    html: wrapper(`
      <h2 style="color:${BRAND_COLOR};margin-top:0;">Delivered!</h2>
      <p style="font-size:15px;line-height:1.6;">
        Your order <strong>#${params.orderNumber}</strong> has been delivered. We hope it brings peace and
        positivity to your home. If anything isn't right, just reply to this email.
      </p>
    `),
  };
}

export function newsletterWelcomeEmail() {
  return {
    subject: "Welcome to Divine Store",
    html: wrapper(`
      <h2 style="color:${BRAND_COLOR};margin-top:0;">You're on the list 🙏</h2>
      <p style="font-size:15px;line-height:1.6;">
        Thank you for subscribing. We'll let you know about new arrivals, festival collections, and
        exclusive discounts — nothing else, no spam.
      </p>
    `),
  };
}

export function contactReplyEmail(params: {
  customerName: string;
  originalMessage: string;
  reply: string;
}) {
  const { customerName, originalMessage, reply } = params;
  return {
    subject: "Re: Your message to Divine Store",
    html: wrapper(`
      <h2 style="color:${BRAND_COLOR};margin-top:0;">Hi ${customerName},</h2>
      <p style="font-size:15px;line-height:1.6;">${reply.replace(/\n/g, "<br/>")}</p>
      <div style="margin-top:24px;padding:16px;background:#FAF6EE;border-radius:8px;font-size:13px;color:#8a7a68;">
        <strong>Your original message:</strong><br/>
        ${originalMessage.replace(/\n/g, "<br/>")}
      </div>
    `),
  };
}
