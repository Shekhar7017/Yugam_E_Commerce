import { getAdminCoupons } from "@/actions/admin.actions";
import { CouponForm } from "@/components/admin/coupon-form";
import { CouponToggle } from "@/components/admin/coupon-toggle";
import { formatINR } from "@/lib/utils";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="font-display text-3xl mb-8">Coupons</h1>
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground bg-muted/50">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Used</th>
                <th className="py-3 px-4">Active</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="py-3 px-4 font-medium">{c.code}</td>
                  <td className="py-3 px-4">
                    {c.discountType === "PERCENT"
                      ? `${c.discountValue}%`
                      : formatINR(Number(c.discountValue))}
                  </td>
                  <td className="py-3 px-4">
                    {c.usedCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="py-3 px-4">
                    <CouponToggle id={c.id} isActive={c.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {coupons.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No coupons yet.</p>
          )}
        </div>
      </div>
      <div>
        <h2 className="font-medium mb-4">Create Coupon</h2>
        <CouponForm />
      </div>
    </div>
  );
}
