"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTED_PROMPTS = [
  "Which Rudraksha mala is best for daily meditation?",
  "Suggest a gift for Diwali under ₹1500",
  "Track my order",
  "Do you have a coupon code?",
];

export function DivineAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [unavailable, setUnavailable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setIsStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000); // 35s hard cap

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const newConvoId = res.headers.get("X-Conversation-Id");
      if (newConvoId) setConversationId(newConvoId);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let firstChunkText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;

        if (acc.includes("isn't configured yet")) {
          firstChunkText = acc;
        }

        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }

      if (firstChunkText) {
        setUnavailable(true);
      }   else if (!acc.trim()) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "Sorry, I couldn't generate a reply just now. Please try asking again.",
          };
          return copy;
        });
      }
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError";
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: isTimeout
            ? "That took too long to answer. Please try again — shorter questions usually respond faster."
            : "Sorry, something went wrong reaching the assistant. Please try again.",
        };
        return copy;
      });
    } finally {
      clearTimeout(timeout);
      setIsStreaming(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open Divine Assistant"
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:opacity-90"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-card border rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-secondary text-secondary-foreground px-4 py-3">
            <p className="font-display text-lg">Divine Assistant</p>
            <p className="text-xs opacity-80">Ask about products, orders, or puja guidance</p>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Try asking:</p>
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="block w-full text-left text-sm border rounded-md px-3 py-2 hover:bg-muted"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm relative group ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {m.content || (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Loader2 size={14} className="animate-spin" /> thinking...
                    </span>
                  )}
                  {m.role === "assistant" && m.content && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(m.content);
                        toast.success("Copied");
                      }}
                      className="absolute -bottom-2 -right-2 bg-card border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Copy response"
                    >
                      <Copy size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {unavailable && (
              <p className="text-xs text-center text-muted-foreground">
                The assistant needs a Gemini API key configured by the store owner to answer questions.
              </p>
            )}
          </div>

          <form
            className="border-t p-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              disabled={isStreaming}
              className="flex-1 border rounded-md px-3 py-2 text-sm bg-background disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="bg-primary text-primary-foreground rounded-md px-3 disabled:opacity-50"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
