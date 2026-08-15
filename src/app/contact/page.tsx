"use client";

import { useState, useTransition } from "react";
import { submitContactMessage } from "@/actions/contact.actions";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  return (
    <div className="container py-16 max-w-lg mx-auto">
      <h1 className="font-display text-3xl mb-2 text-center">Contact Us</h1>
      <p className="text-muted-foreground text-center mb-10">
        Have a question about an order, a product, or anything else? Send us a message.
      </p>

      {sent ? (
        <div className="border rounded-lg p-8 text-center">
          <p className="font-medium mb-1">Message sent!</p>
          <p className="text-sm text-muted-foreground">We'll get back to you as soon as possible.</p>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              const res = await submitContactMessage(form);
              if (res.success) setSent(true);
              else toast.error(res.error ?? "Could not send message");
            });
          }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" className="border rounded-md px-3 py-2 text-sm bg-background" />
            <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Your email" className="border rounded-md px-3 py-2 text-sm bg-background" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Phone (optional)" className="border rounded-md px-3 py-2 text-sm bg-background" />
            <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Subject" className="border rounded-md px-3 py-2 text-sm bg-background" />
          </div>
          <textarea required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Your message" rows={5} className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
          <button disabled={isPending} className="w-full bg-primary text-primary-foreground rounded-md py-3 font-medium disabled:opacity-50">
            {isPending ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}