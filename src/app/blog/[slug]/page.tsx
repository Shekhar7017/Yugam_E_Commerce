import { getBlogBySlug, getRelatedBlogs } from "@/actions/blog.actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return {};
  return {
    title: blog.metaTitle ?? blog.title,
    description: blog.metaDescription ?? blog.excerpt ?? undefined,
    openGraph: { images: blog.featuredImage ? [blog.featuredImage] : [] },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  const related = await getRelatedBlogs(blog.id, blog.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    image: blog.featuredImage ? [blog.featuredImage] : undefined,
    datePublished: blog.publishedAt,
    description: blog.excerpt,
  };

  return (
    <article className="container py-16 max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/blog">Blog</Link> / <span>{blog.title}</span>
      </nav>

      {blog.category && <p className="text-xs text-primary uppercase tracking-wide mb-2">{blog.category}</p>}
      <h1 className="font-display text-4xl leading-tight mb-4">{blog.title}</h1>
      {blog.publishedAt && (
        <p className="text-sm text-muted-foreground mb-8">
          {new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}

      {blog.featuredImage && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-8">
          <Image src={blog.featuredImage} alt={blog.title} fill className="object-cover" priority />
        </div>
      )}

      <div className="prose-content space-y-4 text-[15px] leading-relaxed">
        {blog.content.split(/\n\n+/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10">
          {blog.tags.map((tag) => (
            <span key={tag} className="text-xs bg-muted px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-16 border-t pt-10">
          <h2 className="font-display text-2xl mb-6">More Articles</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((b) => (
              <Link key={b.id} href={`/blog/${b.slug}`} className="block group">
                <div className="relative aspect-video rounded-md overflow-hidden bg-muted mb-2">
                  {b.featuredImage && (
                    <Image src={b.featuredImage} alt={b.title} fill className="object-cover" />
                  )}
                </div>
                <p className="text-sm font-medium group-hover:underline">{b.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
