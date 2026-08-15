"use server";

import { auth } from "@/lib/auth";
import { getGemini, CHAT_MODEL, isAIConfigured } from "@/lib/ai/gemini";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") throw new Error("Unauthorized");
}

function requireAIConfigured() {
  if (!isAIConfigured()) {
    throw new Error("Set GEMINI_API_KEY in your environment to use AI content tools.");
  }
}

async function complete(system: string, user: string): Promise<string> {
  const ai = getGemini();
  const res = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: [{ role: "user", parts: [{ text: user }] }],
    config: { systemInstruction: system, temperature: 0.6 },
  });
  return res.text?.trim() ?? "";
}

export async function generateProductDescription(input: {
  title: string;
  category: string;
  material?: string;
  keywords?: string;
}) {
  await requireAdmin();
  try {
    requireAIConfigured();
    const content = await complete(
      "You write warm, accurate e-commerce product descriptions for an Indian spiritual products store. " +
        "Write 3-4 sentences, no exaggerated claims, no medical/miracle promises, mention material and traditional use naturally. Plain text only, no markdown.",
      `Product: ${input.title}\nCategory: ${input.category}\nMaterial: ${input.material ?? "not specified"}\nKeywords: ${input.keywords ?? "none"}`
    );
    return { success: true, content };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function generateSEOMeta(input: { title: string; description: string }) {
  await requireAdmin();
  try {
    requireAIConfigured();
    const raw = await complete(
      "You write concise SEO metadata. Reply with EXACTLY two lines, no labels, no quotes: " +
        "line 1 = meta title (under 60 characters), line 2 = meta description (under 155 characters).",
      `Product: ${input.title}\nDescription: ${input.description}`
    );
    const [metaTitle, metaDescription] = raw.split("\n").filter(Boolean);
    return { success: true, metaTitle: metaTitle ?? input.title, metaDescription: metaDescription ?? "" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function generateAltText(input: { title: string; category?: string }) {
  await requireAdmin();
  try {
    requireAIConfigured();
    const content = await complete(
      "You write accessible, descriptive image alt text for e-commerce product photos. " +
        "Reply with ONLY the alt text, one sentence, under 15 words, no quotes.",
      `Product: ${input.title}${input.category ? `, category: ${input.category}` : ""}`
    );
    return { success: true, content };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function generateBlogDraft(input: { topic: string }) {
  await requireAdmin();
  try {
    requireAIConfigured();
    const raw = await complete(
      "You are a content writer for an Indian spiritual products e-commerce blog. Write factually about " +
        "traditions, festivals, and product care — never medical or supernatural guarantees. " +
        "Reply in exactly this format with no markdown symbols:\n" +
        "TITLE: <title>\nEXCERPT: <one sentence summary>\nCONTENT: <4-6 short paragraphs separated by blank lines>",
      `Topic: ${input.topic}`
    );

    const titleMatch = raw.match(/TITLE:\s*(.+)/);
    const excerptMatch = raw.match(/EXCERPT:\s*(.+)/);
    const contentMatch = raw.match(/CONTENT:\s*([\s\S]+)/);

    return {
      success: true,
      title: titleMatch?.[1]?.trim() ?? input.topic,
      excerpt: excerptMatch?.[1]?.trim() ?? "",
      content: contentMatch?.[1]?.trim() ?? raw,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
