import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";
import { buildCarrierTrackingUrl } from "@/lib/carrier-tracking";
import { Type, type FunctionDeclaration } from "@google/genai";

// Gemini's function-calling schema: flat {name, description, parameters}
// objects (no OpenAI-style {type:"function", function:{...}} wrapper), and
// JSON-schema types as uppercase strings (STRING, OBJECT, etc).
export const AI_TOOLS: FunctionDeclaration[] = [
  {
    name: "search_products",
    description:
      "Search the live product catalog by keyword and optional category. Always use this before recommending or describing specific products.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "Search keywords, e.g. 'rudraksha mala' or 'diwali gift'" },
        categorySlug: { type: Type.STRING, description: "Optional category slug to filter by" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_order_status",
    description: "Look up the status of a specific order using the order number and the email used at checkout.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        orderNumber: { type: Type.STRING },
        email: { type: Type.STRING },
      },
      required: ["orderNumber", "email"],
    },
  },
  {
    name: "check_coupon",
    description: "Check whether a coupon code is valid and what discount it offers.",
    parameters: {
      type: Type.OBJECT,
      properties: { code: { type: Type.STRING } },
      required: ["code"],
    },
  },
  {
    name: "list_categories",
    description: "List all available product categories in the store.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
];

export async function executeAITool(name: string, args: any): Promise<string> {
  switch (name) {
    case "search_products": {
      const products = await prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          ...(args.categorySlug ? { category: { slug: args.categorySlug } } : {}),
          OR: [
            { title: { contains: args.query, mode: "insensitive" } },
            { description: { contains: args.query, mode: "insensitive" } },
          ],
        },
        take: 6,
        include: { category: true },
      });

      if (products.length === 0) return "No matching products were found in the catalog.";

      return JSON.stringify(
        products.map((p) => ({
          title: p.title,
          slug: p.slug,
          price: formatINR(Number(p.price)),
          category: p.category.name,
          inStock: p.inventory > 0,
          url: `/products/${p.slug}`,
        }))
      );
    }

    case "get_order_status": {
      const order = await prisma.order.findUnique({
        where: { orderNumber: args.orderNumber },
        include: { items: true },
      });
      if (!order) return "No order found with that order number.";

      const emailMatches =
        order.guestEmail?.toLowerCase() === String(args.email).toLowerCase() ||
        (order.userId &&
          (await prisma.user.findFirst({
            where: { id: order.userId, email: { equals: args.email, mode: "insensitive" } },
          })));

      if (!emailMatches) return "The email does not match our records for this order number.";

      return JSON.stringify({
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        trackingUrl: buildCarrierTrackingUrl(order.carrier, order.trackingNumber),
        items: order.items.map((i) => `${i.titleSnapshot} x${i.quantity}`),
        total: formatINR(Number(order.total)),
      });
    }

    case "check_coupon": {
      const coupon = await prisma.coupon.findUnique({ where: { code: String(args.code).toUpperCase() } });
      if (!coupon) return "That coupon code does not exist.";
      return JSON.stringify({
        code: coupon.code,
        active: coupon.isActive,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
        minOrderValue: coupon.minOrderValue?.toString() ?? null,
        description: coupon.description,
      });
    }

    case "list_categories": {
      const categories = await prisma.category.findMany({ select: { name: true, slug: true } });
      return JSON.stringify(categories);
    }

    default:
      return "Unknown tool.";
  }
}
