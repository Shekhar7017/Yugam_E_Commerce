import { getKnowledgeBaseStats } from "@/actions/ai/knowledge.actions";
import { getAIAnalytics } from "@/actions/ai/analytics.actions";
import { ReindexButton } from "@/components/admin/reindex-button";

export default async function AdminAIPage() {
  const isConfigured = !!process.env.GEMINI_API_KEY;
  const [kb, analytics] = await Promise.all([getKnowledgeBaseStats(), getAIAnalytics()]);

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Divine Assistant</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border rounded-lg p-5">
          <p className="text-xs text-muted-foreground mb-1">Status</p>
          <p className={`text-lg font-semibold ${isConfigured ? "text-primary" : "text-destructive"}`}>
            {isConfigured ? "Configured" : "Not Configured"}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <p className="text-xs text-muted-foreground mb-1">Knowledge Chunks Indexed</p>
          <p className="text-lg font-semibold">{kb.count}</p>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <p className="text-xs text-muted-foreground mb-1">Conversations</p>
          <p className="text-lg font-semibold">{analytics.conversationCount}</p>
        </div>
      </div>

      {!isConfigured && (
        <div className="bg-muted border rounded-lg p-5 mb-8 text-sm">
          Add <code className="bg-background px-1.5 py-0.5 rounded">GEMINI_API_KEY</code> (and optionally{" "}
          <code className="bg-background px-1.5 py-0.5 rounded">AI_MODEL</code>) to your environment to turn
          the assistant on. It will start answering from the live catalog as soon as the key is set — no
          other changes needed.
        </div>
      )}

      <div className="bg-card border rounded-lg p-6 mb-8">
        <h2 className="font-medium mb-2">Knowledge Base</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Re-index whenever you add or change products, categories, or blog posts so the assistant's answers
          stay current. This embeds your catalog and store policies into the vector search index.
        </p>
        <ReindexButton disabled={!isConfigured} />
      </div>

      <div className="bg-card border rounded-lg p-6">
        <h2 className="font-medium mb-4">Recent Customer Questions</h2>
        {analytics.recentUserMessages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conversations yet.</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {analytics.recentUserMessages.map((m, i) => (
              <li key={i} className="border-b pb-2 last:border-0">
                <p>{m.content}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(m.createdAt).toLocaleString("en-IN")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
