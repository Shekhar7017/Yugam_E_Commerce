"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addProductVariant, deleteProductVariant } from "@/actions/admin.actions";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Variant = { id: string; name: string; value: string; priceDiff: number | string; sku: string; inventory: number };

const EMPTY = { name: "", value: "", priceDiff: "0", sku: "", inventory: "0" };

export function VariantManager({ productId, initialVariants }: { productId: string; initialVariants: Variant[] }) {
  const [variants, setVariants] = useState(initialVariants);
  const [form, setForm] = useState(EMPTY);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAdd = () => {
    if (!form.name.trim() || !form.value.trim() || !form.sku.trim()) {
      toast.error("Name, value, and SKU are required");
      return;
    }
    startTransition(async () => {
      const res = await addProductVariant(productId, {
        name: form.name.trim(),
        value: form.value.trim(),
        priceDiff: parseFloat(form.priceDiff) || 0,
        sku: form.sku.trim(),
        inventory: parseInt(form.inventory) || 0,
      });
      if (!res.success) {
        toast.error(res.error ?? "Could not add variant");
        return;
      }
      setForm(EMPTY);
      router.refresh();
      toast.success("Variant added");
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteProductVariant(id);
      setVariants((v) => v.filter((x) => x.id !== id));
      toast.success("Variant removed");
    });
  };

  return (
    <div className="space-y-4">
      {variants.length > 0 && (
        <table className="w-full text-sm border rounded-md overflow-hidden">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="py-2 px-3">Option</th>
              <th className="py-2 px-3">Value</th>
              <th className="py-2 px-3">Price Diff</th>
              <th className="py-2 px-3">SKU</th>
              <th className="py-2 px-3">Stock</th>
              <th className="py-2 px-3" />
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="py-2 px-3">{v.name}</td>
                <td className="py-2 px-3">{v.value}</td>
                <td className="py-2 px-3">₹{Number(v.priceDiff)}</td>
                <td className="py-2 px-3">{v.sku}</td>
                <td className="py-2 px-3">{v.inventory}</td>
                <td className="py-2 px-3">
                  <button disabled={isPending} onClick={() => handleDelete(v.id)} className="text-destructive">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="border rounded-md p-3 grid grid-cols-5 gap-2 items-end">
        <div>
          <label className="text-xs text-muted-foreground">Option name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Bead Size" className="w-full border rounded-md px-2 py-1.5 text-sm bg-background" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Value</label>
          <input value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="8mm" className="w-full border rounded-md px-2 py-1.5 text-sm bg-background" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Price diff (₹)</label>
          <input type="number" value={form.priceDiff} onChange={(e) => setForm((f) => ({ ...f, priceDiff: e.target.value }))} className="w-full border rounded-md px-2 py-1.5 text-sm bg-background" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">SKU</label>
          <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="w-full border rounded-md px-2 py-1.5 text-sm bg-background" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Stock</label>
          <input type="number" value={form.inventory} onChange={(e) => setForm((f) => ({ ...f, inventory: e.target.value }))} className="w-full border rounded-md px-2 py-1.5 text-sm bg-background" />
        </div>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleAdd}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        Add Variant
      </button>
      <p className="text-xs text-muted-foreground">
        Example: "Bead Size" / "8mm" for a Rudraksha mala, or "Length" / "18 inch" for a chain.
      </p>
    </div>
  );
}
