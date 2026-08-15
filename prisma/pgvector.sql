-- Run this AFTER `npx prisma db push`.
-- Adds pgvector support for the Divine Assistant's RAG knowledge base.
-- Requires a Postgres provider with the pgvector extension available
-- (Supabase, Neon, and most managed Postgres providers support this).
--
-- Dimension is 1536: Gemini's embedding-001 model defaults to 3072
-- dimensions, but we request a 1536-dim output (it supports flexible
-- output sizes) to stay safely under pgvector's ivfflat index limit
-- (~2000 dims) and avoid any migration for setups that already ran this.

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "KnowledgeChunk"
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX IF NOT EXISTS knowledge_chunk_embedding_idx
  ON "KnowledgeChunk"
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
