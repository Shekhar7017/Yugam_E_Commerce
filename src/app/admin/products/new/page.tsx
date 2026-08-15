import { getAdminCategories } from "@/actions/admin.actions";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">New Product</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Save the product first — you'll be able to add more images and variants (like bead size or
        mala length) once it exists.
      </p>
      <ProductForm categories={categories} />
    </div>
  );
}
