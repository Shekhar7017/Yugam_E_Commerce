import { getAdminCategories, getAdminProduct } from "@/actions/admin.actions";
import { ProductForm } from "@/components/admin/product-form";
import { ImageGalleryManager } from "@/components/admin/image-gallery-manager";
import { VariantManager } from "@/components/admin/variant-manager";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, product] = await Promise.all([getAdminCategories(), getAdminProduct(id)]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Edit Product</h1>
      <ProductForm
        categories={categories}
        productId={product.id}
        initial={{
          title: product.title,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          shortDesc: product.shortDesc ?? undefined,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
          material: product.material ?? undefined,
          careInfo: product.careInfo ?? undefined,
          usageInfo: product.usageInfo ?? undefined,
          inventory: product.inventory,
          categoryId: product.categoryId,
          status: product.status,
          metaTitle: product.metaTitle ?? undefined,
          metaDescription: product.metaDescription ?? undefined,
          imageUrl: product.images[0]?.url,
        }}
      />

      <div className="max-w-2xl mt-12 pt-8 border-t">
        <h2 className="font-display text-xl mb-4">Image Gallery</h2>
        <ImageGalleryManager
          productId={product.id}
          productTitle={product.title}
          initialImages={product.images}
        />
      </div>

      <div className="max-w-2xl mt-12 pt-8 border-t">
        <h2 className="font-display text-xl mb-4">Variants</h2>
        <VariantManager productId={product.id} initialVariants={product.variants as any} />
      </div>
    </div>
  );
}
