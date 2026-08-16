import Link from "next/link";
import Image from "next/image";
import {
  getFeaturedProducts,
  getBestSellers,
  getNewArrivals,
  getAllCategories,
} from "@/actions/product.actions";
import { getActiveFestivals } from "@/actions/festival.actions";
import { getSiteSettings } from "@/actions/settings.actions";
import { ProductCard } from "@/components/product/product-card";
import { HeroSlideshow } from "@/components/home/hero-slideshow";

export default async function HomePage() {
  const [featured, bestSellers, newArrivals, categories, festivals, settings] = await Promise.all([
    getFeaturedProducts(8),
    getBestSellers(8),
    getNewArrivals(8),
    getAllCategories(),
    getActiveFestivals(),
    getSiteSettings(),
  ]);

  return (
    <div>
      {/* Hero */}
      

      <HeroSlideshow settings={settings} festivals={festivals as any} />

      {/* Categories */}
      <section className="container py-20">
        <h2 className="font-display text-3xl text-center mb-10">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative aspect-square rounded-xl overflow-hidden bg-muted flex items-end p-4"
            >
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <span className="relative z-10 text-white font-medium bg-black/30 px-2 py-1 rounded">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <ProductRail title="Featured" products={featured as any} />
      )}
      {bestSellers.length > 0 && (
        <ProductRail title="Best Sellers" products={bestSellers as any} />
      )}
      {newArrivals.length > 0 && (
        <ProductRail title="New Arrivals" products={newArrivals as any} />
      )}

      {/* Why choose us */}
      <section className="container py-20 grid md:grid-cols-3 gap-10 text-center">
        {settings.whyChooseUs.map((f) => (
          <div key={f.title}>
            <h3 className="font-display text-xl mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function ProductRail({
  title,
  products,
}: {
  title: string;
  products: Array<{
    id: string;
    slug: string;
    title: string;
    price: number;
    compareAtPrice: number | null;
    images: { url: string; altText: string | null }[];
  }>;
}) {
  return (
    <section className="container py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-3xl">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
