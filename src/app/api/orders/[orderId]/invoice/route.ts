import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateInvoicePDF } from "@/lib/pdf/invoice";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return new Response("Order not found", { status: 404 });

  const session = await auth();
  const userId = session?.user ? (session.user as any).id : null;
  const role = (session?.user as any)?.role;

  const isAdmin = role === "ADMIN";
  const isOwner = userId && order.userId === userId;

  const emailParam = req.nextUrl.searchParams.get("email");
  const isVerifiedGuest =
    !order.userId && emailParam && order.guestEmail?.toLowerCase() === emailParam.toLowerCase();

  if (!isAdmin && !isOwner && !isVerifiedGuest) {
    return new Response("Not authorized to view this invoice", { status: 403 });
  }

  const pdfBuffer = await generateInvoicePDF(order as any);

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
    },
  });
}
