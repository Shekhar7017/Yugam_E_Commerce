import { prisma } from "@/lib/prisma";
import { embedText, toVectorLiteral } from "@/lib/ai/embeddings";
import { isAIConfigured } from "@/lib/ai/gemini";

type RetrievedChunk = { content: string; sourceType: string };

async function vectorSearch(query: string, topK: number): Promise<RetrievedChunk[] | null> {
  if (!isAIConfigured()) return null;
  try {
    const embedding = await embedText(query);
    const vector = toVectorLiteral(embedding);

    const rows = await prisma.$queryRawUnsafe<{ content: string; sourceType: string }[]>(
      `
      SELECT content, "sourceType"
      FROM "KnowledgeChunk"
      ORDER BY embedding <=> $1::vector
      LIMIT $2
      `,
      vector,
      topK
    );
    return rows;
  } catch {
    // pgvector not enabled, or knowledge base not yet indexed — fall back gracefully
    return null;
  }
}

async function keywordFallback(query: string, topK: number): Promise<RetrievedChunk[]> {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .slice(0, 5);

  if (terms.length === 0) return [];

  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      OR: terms.flatMap((t) => [
        { title: { contains: t, mode: "insensitive" as const } },
        { description: { contains: t, mode: "insensitive" as const } },
        { tags: { has: t } },
      ]),
    },
    include: { category: true },
    take: topK,
  });

  return products.map((p) => ({
    sourceType: "product",
    content: [
      `Product: ${p.title}`,
      `Category: ${p.category.name}`,
      `Price: ₹${p.price}`,
      `In stock: ${p.inventory > 0 ? "Yes" : "No"}`,
      `Description: ${p.shortDesc ?? p.description}`,
      p.usageInfo ? `Traditional usage: ${p.usageInfo}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  }));
}

export async function retrieveContext(query: string, topK = 6): Promise<string> {
  const vectorResults = await vectorSearch(query, topK);
  const results = vectorResults ?? (await keywordFallback(query, topK));

  if (results.length === 0) return "No directly matching products were found in the catalog for this query.";

  return results.map((r, i) => `[${i + 1}] (${r.sourceType})\n${r.content}`).join("\n\n");
}
