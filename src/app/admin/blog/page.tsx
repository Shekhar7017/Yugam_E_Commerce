import { getAdminBlogs } from "@/actions/admin-blog.actions";
import Link from "next/link";
import { BlogRowActions } from "@/components/admin/blog-row-actions";

export default async function AdminBlogPage() {
  const blogs = await getAdminBlogs();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Blog</h1>
        <Link href="/admin/blog/new" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
          + New Post
        </Link>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground bg-muted/50">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {blogs.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="py-3 px-4">{b.title}</td>
                  <td className="py-3 px-4 text-muted-foreground">{b.category ?? "—"}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                      {b.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <BlogRowActions blogId={b.id} isPublished={b.isPublished} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {blogs.length === 0 && <p className="text-center text-muted-foreground py-12">No posts yet.</p>}
      </div>
    </div>
  );
}
