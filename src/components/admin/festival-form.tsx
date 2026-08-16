"use client";

import { useState, useTransition } from "react";
import { createFestival } from "@/actions/admin.actions";
import { ImageUploadInput } from "@/components/admin/image-upload-input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const EMPTY = {
  title: "",
  subtitle: "",
  discountText: "",
  image: "",
  ctaLabel: "Shop Now",
  ctaLink: "/",
  startDate: "",
  endDate: "",
  hasTextOverlay: true,
};

export function FestivalForm() {
  const [form, setForm] = useState(EMPTY);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      className="bg-card border rounded-lg p-5 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await createFestival(form);
          if (res.success) {
            toast.success("Banner added to homepage");
            setForm(EMPTY);
            router.refresh();
          } else {
            toast.error("Could not create banner");
          }
        });
      }}
    >
      <div>
        <label className="text-sm font-medium block mb-1">Banner Type</label>
        <div className="flex border rounded-md overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, hasTextOverlay: true }))}
            className={`flex-1 py-2 transition-colors ${form.hasTextOverlay ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
          >
            With Text
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, hasTextOverlay: false }))}
            className={`flex-1 py-2 transition-colors ${!form.hasTextOverlay ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
          >
            Image Only
          </button>
        </div>
        {!form.hasTextOverlay && (
          <p className="text-xs text-muted-foreground mt-1">
            Use this when the text is already part of your uploaded image.
          </p>
        )}
      </div>

      <input
        required
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        placeholder={form.hasTextOverlay ? "Title, e.g. Diwali Sale" : "Internal label (for your reference only)"}
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
      />

      {form.hasTextOverlay && (
        <>
          <input
            value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            placeholder="Subtitle (optional)"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          />
          <input
            value={form.discountText}
            onChange={(e) => setForm((f) => ({ ...f, discountText: e.target.value }))}
            placeholder="Discount badge text, e.g. 'Up to 30% off'"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          />
        </>
      )}

      <ImageUploadInput
        label="Banner Image"
        value={form.image}
        onChange={(url) => setForm((f) => ({ ...f, image: url }))}
        folder="festivals"
      />

      {form.hasTextOverlay && (
        <input
          value={form.ctaLabel}
          onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
          placeholder="Button label"
          className="w-full border rounded-md px-3 py-2 text-sm bg-background"
        />
      )}

      <input
        value={form.ctaLink}
        onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))}
        placeholder="Where the banner links to, e.g. /category/idols"
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Starts</label>
          <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Ends</label>
          <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
        </div>
      </div>
      <button disabled={isPending}
        className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium disabled:opacity-50">
        {isPending ? "Adding..." : "Add Banner"}
      </button>
    </form>
  );
}