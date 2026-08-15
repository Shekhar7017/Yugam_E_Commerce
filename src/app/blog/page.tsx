import { getPublishedBlogs } from "@/actions/blog.actions";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Puja guides, festival traditions, and spiritual product care from Divine Store.",
};

export default async function BlogListPage() {
  const blogs = await getPublishedBlogs();

  return (
    <div className="container py-16">
      <h1 className="font-display text-4xl mb-2 text-center">Divine Store Blog</h1>
      <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
        Puja guides, festival traditions, and how to care for your spiritual products.
      </p>

      {blogs.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No articles published yet — check back soon.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {blogs.map((b) => (
            <Link key={b.id} href={`/blog/${b.slug}`} className="group block">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-3">
                {b.featuredImage && (
                  <Image
                    src={b.featuredImage}
                    alt={b.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              {b.category && <p className="text-xs text-primary uppercase tracking-wide mb-1">{b.category}</p>}
              <h2 className="font-display text-xl leading-snug group-hover:underline">{b.title}</h2>
              {b.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{b.excerpt}</p>}
              {b.publishedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(b.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
