import { getAdminCategories } from "@/actions/admin.actions";
import { CategoryForm } from "@/components/admin/category-form";
import { CategoryDeleteButton } from "@/components/admin/category-delete-button";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="font-display text-3xl mb-8">Categories</h1>
        <div className="bg-card border rounded-lg overflow-hidden">
          <div  className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground bg-muted/50">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="py-3 px-4">{c.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{c.slug}</td>
                    <td className="py-3 px-4">{c._count.products}</td>
                    <td className="py-3 px-4 text-right">
                      <CategoryDeleteButton id={c.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        <h2 className="font-medium mb-4">Add Category</h2>
        <CategoryForm />
      </div>
    </div>
  );
}
