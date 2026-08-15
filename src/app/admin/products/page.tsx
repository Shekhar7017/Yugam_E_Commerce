import { getAdminProducts } from "@/actions/admin.actions";
import { formatINR } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
        >
          + New Product
        </Link>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground bg-muted/50">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-3 px-4 flex items-center gap-3">
                    {p.images[0] && (
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                        <Image src={p.images[0].url} alt={p.title} fill className="object-cover" />
                      </div>
                    )}
                    <span className="line-clamp-1">{p.title}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{p.category.name}</td>
                  <td className="py-3 px-4">{formatINR(Number(p.price))}</td>
                  <td className="py-3 px-4">{p.inventory}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{p.status}</span>
                </td>
                  <td className="py-3 px-4">
                    <ProductRowActions productId={p.id} status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No products yet.</p>
        )}
      </div>
    </div>
  );
}
