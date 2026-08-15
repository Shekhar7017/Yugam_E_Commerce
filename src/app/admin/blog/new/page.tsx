import { BlogForm } from "@/components/admin/blog-form";

export default function NewBlogPage() {
  return (
    <div>
      <h1 className="font-display text-3xl mb-8">New Blog Post</h1>
      <BlogForm />
    </div>
  );
}
