import { getContactMessages } from "@/actions/admin.actions";
import { ContactReplyForm } from "@/components/admin/contact-reply-form";

export default async function AdminContactPage() {
  const messages = await getContactMessages();

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Contact Messages</h1>
      <div className="space-y-4">
        {messages.map((m: any) => (
          <div key={m.id} className="border rounded-lg p-5">
            <div className="flex justify-between mb-1 flex-wrap gap-1">
              <p className="font-medium">
                {m.name} <span className="text-muted-foreground text-xs">({m.email})</span>
              </p>
              <p className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString("en-IN")}</p>
            </div>
            {m.subject && <p className="text-sm font-medium mb-1">{m.subject}</p>}
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{m.message}</p>
            {m.phone && <p className="text-xs mt-2">Phone: {m.phone}</p>}

            <ContactReplyForm messageId={m.id} customerEmail={m.email} existingReply={m.reply} />
          </div>
        ))}
        {messages.length === 0 && <p className="text-muted-foreground">No messages yet.</p>}
      </div>
    </div>
  );
}