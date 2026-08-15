import { getProducts, getCategoryBySlug } from "@/actions/product.actions";
import { ProductCard } from "@/components/product/product-card";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.metaTitle ?? category.name,
    description: category.metaDescription ?? category.description ?? undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort, page } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { items, totalPages, page: currentPage } = await getProducts({
    categorySlug: slug,
    sort: (sort as any) ?? "newest",
    page: page ? parseInt(page) : 1,
  });

  return (
    <div className="container py-12">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/">Home</Link> / <span>{category.name}</span>
      </nav>
      <h1 className="font-display text-4xl mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-muted-foreground max-w-xl mb-8">{category.description}</p>
      )}

      <div className="flex justify-end mb-6">
        <form>
          <select
            name="sort"
            defaultValue={sort ?? "newest"}
            className="text-sm border rounded-md px-3 py-2 bg-background"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </form>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground py-20 text-center">
          No products found in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/category/${slug}?page=${p}${sort ? `&sort=${sort}` : ""}`}
              className={`w-9 h-9 flex items-center justify-center rounded-md text-sm border ${
                p === currentPage ? "bg-primary text-primary-foreground border-primary" : ""
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
