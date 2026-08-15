"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { embedText, toVectorLiteral } from "@/lib/ai/embeddings";
import { STORE_POLICIES } from "@/lib/ai/store-policies";
import { isAIConfigured } from "@/lib/ai/gemini";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") throw new Error("Unauthorized");
}

async function upsertChunk(id: string, sourceType: string, sourceId: string | null, content: string) {
  const embedding = await embedText(content);
  const vector = toVectorLiteral(embedding);

  await prisma.$executeRawUnsafe(
    `
    INSERT INTO "KnowledgeChunk" (id, "sourceType", "sourceId", content, embedding, "createdAt")
    VALUES ($1, $2, $3, $4, $5::vector, now())
    ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, embedding = EXCLUDED.embedding
    `,
    id,
    sourceType,
    sourceId,
    content,
    vector
  );
}

export async function reindexKnowledgeBase() {
  await requireAdmin();

  if (!isAIConfigured()) {
    return { success: false, error: "Set GEMINI_API_KEY before indexing the knowledge base." };
  }

  let indexed = 0;

  try {
    // Products
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true, faqs: true },
    });

    for (const p of products) {
      const content = [
        `Product: ${p.title}`,
        `Category: ${p.category.name}`,
        `Price: ₹${p.price}`,
        `Material: ${p.material ?? "N/A"}`,
        `Description: ${p.description}`,
        p.usageInfo ? `Traditional usage: ${p.usageInfo}` : "",
        p.careInfo ? `Care: ${p.careInfo}` : "",
        `In stock: ${p.inventory > 0 ? "Yes" : "No"} (${p.inventory} units)`,
      ]
        .filter(Boolean)
        .join("\n");

      await upsertChunk(`product-${p.id}`, "product", p.id, content);
      indexed++;

      for (const faq of p.faqs) {
        await upsertChunk(
          `product-faq-${faq.id}`,
          "faq",
          p.id,
          `FAQ about ${p.title}: Q: ${faq.question} A: ${faq.answer}`
        );
        indexed++;
      }
    }

    // Categories
    const categories = await prisma.category.findMany();
    for (const c of categories) {
      await upsertChunk(
        `category-${c.id}`,
        "category",
        c.id,
        `Category: ${c.name}. ${c.description ?? ""}`
      );
      indexed++;
    }

    // Blogs
    const blogs = await prisma.blog.findMany({ where: { isPublished: true } });
    for (const b of blogs) {
      await upsertChunk(`blog-${b.id}`, "blog", b.id, `Blog: ${b.title}\n${b.excerpt ?? ""}\n${b.content}`);
      indexed++;
    }

    // Static policies
    for (const policy of STORE_POLICIES) {
      await upsertChunk(policy.id, "policy", null, `${policy.title}: ${policy.content}`);
      indexed++;
    }

    return { success: true, indexed };
  } catch (err: any) {
    return {
      success: false,
      error:
        err.message?.includes("vector") || err.code === "42704"
          ? "pgvector extension isn't enabled on this database yet. Run prisma/pgvector.sql first."
          : err.message ?? "Indexing failed",
    };
  }
}

export async function getKnowledgeBaseStats() {
  await requireAdmin();
  try {
    const count = await prisma.knowledgeChunk.count();
    return { count, vectorReady: true };
  } catch {
    return { count: 0, vectorReady: false };
  }
}
