"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateSiteSettings } from "@/actions/admin.actions";
import { ImageUploadInput } from "@/components/admin/image-upload-input";
import type { SiteSettings } from "@/lib/site-settings";
import { useRouter } from "next/navigation";

export function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [settings, setSettings] = useState<SiteSettings>(initial);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const setField = (key: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setSettings((s) => ({ ...s, [key]: e.target.value }));

  const setWhyChooseUs = (index: number, field: "title" | "description", value: string) => {
    setSettings((s) => {
      const updated = [...s.whyChooseUs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...s, whyChooseUs: updated };
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateSiteSettings(settings);
      toast.success("Site settings updated — check the homepage");
      router.refresh();
    });
  };

  return (
    <div className="max-w-2xl space-y-8">
      <section className="bg-card border rounded-lg p-6">
        <h2 className="font-medium mb-4">Store Branding</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Store Name</label>
            <input value={settings.storeName} onChange={setField("storeName")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Footer Tagline</label>
            <textarea value={settings.footerTagline} onChange={setField("footerTagline")} rows={2} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
          </div>
        </div>
      </section>

      <section className="bg-card border rounded-lg p-6">
        <h2 className="font-medium mb-4">Homepage Hero</h2>
        <div className="space-y-3">
          <div>
            <ImageUploadInput
              label="Background Image"
              value={settings.heroImage}
              onChange={(url) => setSettings((s) => ({ ...s, heroImage: url }))}
              folder="hero"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave blank to show a solid brand-color background instead of a photo.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Small badge text</label>
            <input value={settings.heroBadgeText} onChange={setField("heroBadgeText")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Heading</label>
            <input value={settings.heroHeading} onChange={setField("heroHeading")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Subheading</label>
            <textarea value={settings.heroSubheading} onChange={setField("heroSubheading")} rows={2} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Button label</label>
              <input value={settings.heroCtaLabel} onChange={setField("heroCtaLabel")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Button link</label>
              <input value={settings.heroCtaLink} onChange={setField("heroCtaLink")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card border rounded-lg p-6">
        <h2 className="font-medium mb-4">"Why Choose Us" Cards</h2>
        <div className="space-y-5">
          {settings.whyChooseUs.map((card, i) => (
            <div key={i} className="border rounded-md p-3 space-y-2">
              <input
                value={card.title}
                onChange={(e) => setWhyChooseUs(i, "title", e.target.value)}
                placeholder="Card title"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
              <textarea
                value={card.description}
                onChange={(e) => setWhyChooseUs(i, "description", e.target.value)}
                rows={2}
                placeholder="Card description"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
          ))}
        </div>
      </section>
      <section className="bg-card border rounded-lg p-6">
        <h2 className="font-medium mb-4">Contact Info (shown to customers on order pages)</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Support Email</label>
            <input value={settings.contactEmail} onChange={setField("contactEmail")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Support Phone</label>
            <input value={settings.contactPhone} onChange={setField("contactPhone")} placeholder="+91 98765 43210" className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">WhatsApp Number</label>
            <input value={settings.whatsappNumber} onChange={setField("whatsappNumber")} placeholder="919876543210 (country code, no + or spaces)" className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
          </div>
        </div>
      </section>

      <button
        disabled={isPending}
        onClick={handleSave}
        className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
