import { getAdminSiteSettings } from "@/actions/admin.actions";
import { DEFAULT_SETTINGS } from "@/lib/site-settings";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export default async function AdminSettingsPage() {
  const saved = await getAdminSiteSettings();
  const settings = { ...DEFAULT_SETTINGS, ...(saved as any) };

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Site Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Edit the homepage hero banner and "Why Choose Us" section — changes go live immediately,
        no code changes needed.
      </p>
      <SiteSettingsForm initial={settings} />
    </div>
  );
}
