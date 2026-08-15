import { getAdminBlog } from "@/actions/admin-blog.actions";
import { BlogForm } from "@/components/admin/blog-form";
import { notFound } from "next/navigation";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blog = await getAdminBlog(id);
  if (!blog) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Edit Blog Post</h1>
      <BlogForm
        blogId={blog.id}
        initial={{
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt ?? "",
          content: blog.content,
          featuredImage: blog.featuredImage ?? "",
          category: blog.category ?? "",
          tags: blog.tags.join(", "),
          metaTitle: blog.metaTitle ?? "",
          metaDescription: blog.metaDescription ?? "",
          isPublished: blog.isPublished,
        }}
      />
    </div>
  );
}
