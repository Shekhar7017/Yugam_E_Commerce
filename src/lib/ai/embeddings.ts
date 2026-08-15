import { getGemini, EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from "@/lib/ai/gemini";

export async function embedText(text: string): Promise<number[]> {
  const ai = getGemini();
  const res = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text.slice(0, 8000), // guard against oversized inputs
    config: { outputDimensionality: EMBEDDING_DIMENSIONS },
  });
  const values = res.embeddings?.[0]?.values;
  if (!values) throw new Error("Gemini did not return an embedding for this text.");
  return values;
}

export function toVectorLiteral(embedding: number[]) {
  return `[${embedding.join(",")}]`;
}
