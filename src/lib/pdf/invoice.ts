import PDFDocument from "pdfkit";

type InvoiceOrder = {
  orderNumber: string;
  createdAt: Date;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  subtotal: number | string;
  discount: number | string;
  shippingFee: number | string;
  tax: number | string;
  total: number | string;
  couponCode?: string | null;
  shippingSnapshot: any;
  items: { titleSnapshot: string; quantity: number; price: number | string }[];
};

export async function generateInvoicePDF(order: InvoiceOrder): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const brand = "#C9822B";
    const maroon = "#5B1A18";

    // Header
    doc.fillColor(maroon).fontSize(22).font("Helvetica-Bold").text("Divine Store", 50, 50);
    doc.fillColor("#666").fontSize(9).font("Helvetica").text("Sacred products for everyday devotion", 50, 78);

    doc.fillColor("#000").fontSize(16).font("Helvetica-Bold").text("INVOICE", 400, 50, { align: "right" });
    doc.fontSize(10).font("Helvetica").fillColor("#333");
    doc.text(`Invoice #: ${order.orderNumber}`, 400, 75, { align: "right" });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`, 400, 90, { align: "right" });

    doc.moveTo(50, 115).lineTo(545, 115).strokeColor("#ddd").stroke();

    // Billing address
    const addr = order.shippingSnapshot ?? {};
    doc.fillColor(brand).fontSize(11).font("Helvetica-Bold").text("Bill To", 50, 130);
    doc.fillColor("#333").fontSize(10).font("Helvetica");
    doc.text(addr.fullName ?? "", 50, 148);
    doc.text(addr.line1 ?? "", 50, 162);
    if (addr.line2) doc.text(addr.line2, 50, 176);
    doc.text(`${addr.city ?? ""}, ${addr.state ?? ""} - ${addr.postalCode ?? ""}`, 50, addr.line2 ? 190 : 176);
    doc.text(`Phone: ${addr.phone ?? ""}`, 50, addr.line2 ? 204 : 190);

    doc.fillColor(brand).fontSize(11).font("Helvetica-Bold").text("Payment & Shipping", 350, 130);
    doc.fillColor("#333").fontSize(10).font("Helvetica");
    doc.text(`Method: ${order.paymentMethod}`, 350, 148);
    doc.text(`Status: ${order.paymentStatus}`, 350, 162);
    doc.text(`Order Status: ${order.status}`, 350, 176);
    if (order.carrier && order.trackingNumber) {
      doc.text(`Carrier: ${order.carrier}`, 350, 190);
      doc.text(`AWB / Tracking No.: ${order.trackingNumber}`, 350, 204);
    }

    // Items table
    let y = 240;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#ddd").stroke();
    y += 10;
    doc.fillColor(maroon).fontSize(10).font("Helvetica-Bold");
    doc.text("Item", 50, y);
    doc.text("Qty", 350, y, { width: 50, align: "right" });
    doc.text("Price", 420, y, { width: 60, align: "right" });
    doc.text("Total", 485, y, { width: 60, align: "right" });
    y += 18;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#ddd").stroke();
    y += 10;

    doc.font("Helvetica").fillColor("#333");
    for (const item of order.items) {
      const lineTotal = Number(item.price) * item.quantity;
      doc.fontSize(10).text(item.titleSnapshot, 50, y, { width: 280 });
      doc.text(String(item.quantity), 350, y, { width: 50, align: "right" });
      doc.text(`Rs. ${Number(item.price).toLocaleString("en-IN")}`, 420, y, { width: 60, align: "right" });
      doc.text(`Rs. ${lineTotal.toLocaleString("en-IN")}`, 485, y, { width: 60, align: "right" });
      y += 20;
    }

    y += 10;
    doc.moveTo(350, y).lineTo(545, y).strokeColor("#ddd").stroke();
    y += 10;

    const row = (label: string, value: string, bold = false) => {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10).fillColor(bold ? maroon : "#333");
      doc.text(label, 350, y, { width: 100 });
      doc.text(value, 450, y, { width: 95, align: "right" });
      y += 18;
    };

    row("Subtotal", `Rs. ${Number(order.subtotal).toLocaleString("en-IN")}`);
    if (Number(order.discount) > 0) {
      row(`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`, `- Rs. ${Number(order.discount).toLocaleString("en-IN")}`);
    }
    row("Shipping", Number(order.shippingFee) === 0 ? "Free" : `Rs. ${Number(order.shippingFee).toLocaleString("en-IN")}`);
    if (Number(order.tax) > 0) row("Tax", `Rs. ${Number(order.tax).toLocaleString("en-IN")}`);
    y += 4;
    doc.moveTo(350, y).lineTo(545, y).strokeColor("#333").stroke();
    y += 8;
    row("Total", `Rs. ${Number(order.total).toLocaleString("en-IN")}`, true);

    doc.fontSize(8).fillColor("#999").text(
      "This is a computer-generated invoice from Divine Store.",
      50,
      760,
      { align: "center", width: 495 }
    );

    doc.end();
  });
}