import { NextRequest } from "next/server";
import { getGemini, CHAT_MODEL, isAIConfigured } from "@/lib/ai/gemini";
import { retrieveContext } from "@/lib/ai/retrieval";
import { AI_TOOLS, executeAITool } from "@/lib/ai/tools";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getOrCreateGuestSessionId } from "@/lib/guest-session";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are "Divine Assistant", the shopping and support assistant for Divine Store, an Indian
e-commerce site selling idols, Rudraksha, malas, yantras, puja samagri, and spiritual gifts.

Rules you must always follow:
- Only describe or recommend products, prices, stock, and policies that appear in the CONTEXT block below or
  in tool results. Never invent a product, price, or stock status.
- If the context and tools don't have an answer, say so honestly and suggest how the person can find out
  (e.g. contact support, browse a category).
- Use the search_products, get_order_status, check_coupon, and list_categories tools whenever a question needs
  live, current data rather than relying on the context block alone.
- Reply in the same language style the person used — English, Hindi, or Hinglish are all fine.
- Keep answers concise and warm, like a knowledgeable person at a small family-run shop, not a corporate bot.
- For order tracking, always ask for both the order number and the email used at checkout before calling the tool.
  If the tool result includes a trackingUrl, share it so the customer can see live courier status.`;

function extractText(response: any): string {
  const direct = response.text?.trim();
  if (direct) return direct;
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p: any) => p.text ?? "").join("").trim();
}

export async function POST(req: NextRequest) {
  if (!isAIConfigured()) {
    return new Response(
      "The Divine Assistant isn't configured yet — the store owner needs to add a GEMINI_API_KEY.",
      { status: 200 }
    );
  }

  const { message, conversationId } = await req.json();
  if (!message || typeof message !== "string") {
    return new Response("Message is required", { status: 400 });
  }

  const session = await auth();
  const userId = session?.user ? (session.user as any).id : undefined;
  const sessionId = userId ? undefined : await getOrCreateGuestSessionId();

  let conversation = conversationId
    ? await prisma.conversation.findUnique({ where: { id: conversationId } })
    : null;

  if (!conversation) {
    conversation = await prisma.conversation.create({ data: { userId, sessionId } });
  }

  await prisma.conversationMessage.create({
    data: { conversationId: conversation.id, role: "user", content: message },
  });

  const history = await prisma.conversationMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const context = await retrieveContext(message);
  const ai = getGemini();
  const systemInstruction = `${SYSTEM_PROMPT}\n\nCONTEXT (retrieved from the store database):\n${context}`;

  const contents: any[] = history.map((h) => ({
    role: h.role === "assistant" ? "model" : "user",
    parts: [{ text: h.content }],
  }));

  const config = {
    systemInstruction,
    tools: [{ functionDeclarations: AI_TOOLS }],
    temperature: 0.4,
    thinkingConfig: { thinkingBudget: 0 },
  };

  let finalText = "";

  // Up to 3 rounds: call the model, execute any tool calls it asks for, repeat.
  // As soon as a round comes back with plain text (no more tool calls), that
  // text IS the final answer — we don't make a second, differently-configured
  // call afterward, which is what was silently producing empty replies.
  for (let round = 0; round < 3; round++) {
    const response = await ai.models.generateContent({ model: CHAT_MODEL, contents, config });
    const calls = response.functionCalls;

    if (!calls || calls.length === 0) {
      finalText = extractText(response);
      break;
    }

    const modelContent = response.candidates?.[0]?.content;
    if (modelContent) {
      contents.push(modelContent);
    }else {
      contents.push({
        role: "model",
        parts: calls.map((call) => ({ functionCall: { name: call.name, args: call.args } })),
      });
    }

    const responseParts = await Promise.all(
      calls.map(async (call) => ({
        functionResponse: {
          name: call.name,
          response: { result: await executeAITool(call.name!, call.args) },
        },
      }))
    );
    contents.push({ role: "function", parts: responseParts });
  }

  // Rare fallback: all 3 rounds kept calling tools without ever answering.
  // Force one last plain-text attempt.
  if (!finalText.trim()) {
    const forced = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents,
      config: { systemInstruction, temperature: 0.4, thinkingConfig: { thinkingBudget: 0 } },
    });
    finalText = extractText(forced);
  }

  if (!finalText.trim()) {
    finalText = "I'm not able to answer that right now — could you try rephrasing your question?";
  }

  await prisma.conversationMessage.create({
    data: { conversationId: conversation.id, role: "assistant", content: finalText },
  });

  // Stream the already-complete answer out in small pieces so the widget
  // still gets a "typing" feel, without depending on a second live-streaming
  // API call.
  const encoder = new TextEncoder();
  const tokens = finalText.split(/(\s+)/);

  const readable = new ReadableStream({
    async start(controller) {
      for (const token of tokens) {
        controller.enqueue(encoder.encode(token));
        await new Promise((r) => setTimeout(r, 12));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": conversation.id,
    },
  });
}