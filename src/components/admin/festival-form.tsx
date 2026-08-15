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
};

export function FestivalForm() {
  const [form, setForm] = useState(EMPTY);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

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
      <input required value={form.title} onChange={set("title")} placeholder="Title, e.g. Diwali Sale"
        className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
      <input value={form.subtitle} onChange={set("subtitle")} placeholder="Subtitle (optional)"
        className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
      <input value={form.discountText} onChange={set("discountText")} placeholder="Discount badge text, e.g. 'Up to 30% off'"
        className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
      <ImageUploadInput
        label="Background Image"
        value={form.image}
        onChange={(url) => setForm((f) => ({ ...f, image: url }))}
        folder="festivals"
      />
      <div className="grid grid-cols-2 gap-3">
        <input value={form.ctaLabel} onChange={set("ctaLabel")} placeholder="Button label"
          className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
        <input value={form.ctaLink} onChange={set("ctaLink")} placeholder="Button link, e.g. /category/idols"
          className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Starts</label>
          <input type="date" value={form.startDate} onChange={set("startDate")}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Ends</label>
          <input type="date" value={form.endDate} onChange={set("endDate")}
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
