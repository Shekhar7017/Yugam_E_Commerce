import { getAdminFestivals } from "@/actions/admin.actions";
import { FestivalForm } from "@/components/admin/festival-form";
import { FestivalRowActions } from "@/components/admin/festival-row-actions";

export default async function AdminFestivalsPage() {
  const festivals = await getAdminFestivals();

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="font-display text-3xl mb-2">Festival & Event Banners</h1>
        <p className="text-sm text-muted-foreground mb-8">
          These show as a full-width banner strip on the homepage, right below the hero. Add one
          for each upcoming festival or sale — set an end date and the homepage will show a live
          countdown and automatically stop showing it once it expires.
        </p>

        <div className="space-y-4">
          {festivals.map((f) => (
            <div key={f.id} className="bg-card border rounded-lg p-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{f.title}</p>
                {f.discountText && <p className="text-xs text-primary">{f.discountText}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {f.startDate ? new Date(f.startDate).toLocaleDateString("en-IN") : "No start date"} –{" "}
                  {f.endDate ? new Date(f.endDate).toLocaleDateString("en-IN") : "No end date"}
                </p>
              </div>
              <FestivalRowActions id={f.id} isActive={f.isActive} />
            </div>
          ))}
          {festivals.length === 0 && (
            <p className="text-muted-foreground text-sm">No festival banners yet — add one on the right.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-medium mb-4">Add Banner</h2>
        <FestivalForm />
      </div>
    </div>
  );
}
