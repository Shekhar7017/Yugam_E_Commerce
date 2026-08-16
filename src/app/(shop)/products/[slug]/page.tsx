import { getProductBySlug, getRelatedProducts } from "@/actions/product.actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatINR, calculateDiscountPercent } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { AddToCartPanel } from "@/components/product/add-to-cart-panel";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.metaTitle ?? product.title,
    description: product.metaDescription ?? product.shortDesc ?? undefined,
    openGraph: {
      images: product.images[0] ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId);
  const discount = calculateDiscountPercent(
    Number(product.price),
    product.compareAtPrice ? Number(product.compareAtPrice) : undefined
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images.map((i) => i.url),
    description: product.shortDesc ?? product.description,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price.toString(),
      availability:
        product.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.avgRating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  return (
    <div className="container py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-xs text-muted-foreground mb-6">
        <Link href="/">Home</Link> / <Link href={`/category/${product.category.slug}`}>{product.category.name}</Link> /{" "}
        <span>{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            {product.images[0] && (
              <Image
                src={product.images[0].url}
                alt={product.images[0].altText ?? product.title}
                fill
                priority
                className="object-cover"
              />
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-medium px-3 py-1.5 rounded">
                {discount}% OFF
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-3 mt-3">
              {product.images.slice(1).map((img) => (
                <div key={img.id} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                  <Image src={img.url} alt={img.altText ?? product.title} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl md:text-4xl mb-3">{product.title}</h1>
          {product.reviewCount > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              ★ {product.avgRating.toFixed(1)} ({product.reviewCount} reviews)
            </p>
          )}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-semibold">{formatINR(product.price.toString())}</span>
            {product.compareAtPrice && (
              <span className="text-muted-foreground line-through">
                {formatINR(product.compareAtPrice?.toString() ?? "")}
              </span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6">{product.shortDesc}</p>

          <AddToCartPanel
            productId={product.id}
            variants={product.variants}
            inStock={product.inventory > 0}
          />

          <dl className="mt-8 space-y-3 text-sm border-t pt-6">
            {product.material && (
              <div className="flex gap-2">
                <dt className="font-medium w-32 shrink-0">Material</dt>
                <dd className="text-muted-foreground">{product.material}</dd>
              </div>
            )}
            {product.usageInfo && (
              <div className="flex gap-2">
                <dt className="font-medium w-32 shrink-0">Traditional Use</dt>
                <dd className="text-muted-foreground">{product.usageInfo}</dd>
              </div>
            )}
            {product.careInfo && (
              <div className="flex gap-2">
                <dt className="font-medium w-32 shrink-0">Care</dt>
                <dd className="text-muted-foreground">{product.careInfo}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="font-medium w-32 shrink-0">Delivery</dt>
              <dd className="text-muted-foreground">
                Ships in 1-2 business days. Free delivery above ₹999.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl mb-4">Description</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">{product.description}</p>
      </section>

      {product.faqs.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl mb-4">FAQs</h2>
          <div className="space-y-4 max-w-3xl">
            {product.faqs.map((faq) => (
              <div key={faq.id} className="border-b pb-4">
                <p className="font-medium mb-1">{faq.question}</p>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-16">
        <h2 className="font-display text-2xl mb-4">
          Reviews {product.reviewCount > 0 && `(${product.reviewCount})`}
        </h2>
        {product.reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="space-y-6 max-w-3xl">
            {product.reviews.map((r) => (
              <div key={r.id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{r.user.name ?? "Verified Customer"}</span>
                  <span className="text-xs text-accent">{"★".repeat(r.rating)}</span>
                </div>
                {r.title && <p className="font-medium text-sm">{r.title}</p>}
                <p className="text-sm text-muted-foreground">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
