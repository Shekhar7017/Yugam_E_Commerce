import { getProducts } from "@/actions/product.actions";
import { ProductCard } from "@/components/product/product-card";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const results = q ? await getProducts({ search: q, perPage: 24 }) : null;

  return (
    <div className="container py-12">
      <form className="max-w-lg mb-10">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search for idols, malas, rudraksha..."
          className="w-full border rounded-md px-4 py-3 text-sm bg-background"
        />
      </form>

      {!q ? (
        <p className="text-muted-foreground">Start typing to search the catalog.</p>
      ) : results!.items.length === 0 ? (
        <p className="text-muted-foreground">No products matched "{q}".</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {results!.items.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      )}
    </div>
  );
}
