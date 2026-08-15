import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function isAIConfigured() {
  return !!process.env.GEMINI_API_KEY;
}

export function getGemini() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "The Divine Assistant is not configured yet. Set GEMINI_API_KEY in your environment to enable it."
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

// gemini-3.5-flash: current-generation Flash model (May 2026 GA release) —
// near-Pro reasoning/coding quality at Flash-tier cost and latency.
export const CHAT_MODEL = process.env.AI_MODEL || "gemini-3.5-flash";

// gemini-embedding-001: GA text embedding model. Defaults to 3072
// dimensions, but we request a 1536-dim output via output dimensionality
// (Matryoshka Representation Learning) — see prisma/pgvector.sql for why.
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 1536;
