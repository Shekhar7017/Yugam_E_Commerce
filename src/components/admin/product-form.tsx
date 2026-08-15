"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { productSchema } from "@/lib/validations";
import { createProduct, updateProduct } from "@/actions/admin.actions";
import { generateProductDescription, generateSEOMeta } from "@/actions/ai/content.actions";
import { ImageUploadInput } from "@/components/admin/image-upload-input";
import { z } from "zod";
import { Sparkles } from "lucide-react";

type FormValues = z.infer<typeof productSchema>;

export function ProductForm({
  categories,
  initial,
  productId,
}: {
  categories: { id: string; name: string }[];
  initial?: Partial<FormValues> & { imageUrl?: string };
  productId?: string;
}) {
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [isPending, startTransition] = useTransition();
  const [isGeneratingDesc, startGeneratingDesc] = useTransition();
  const [isGeneratingSEO, startGeneratingSEO] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: "DRAFT",
      inventory: 0,
      categoryId: categories[0]?.id,
      ...initial,
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = productId
        ? await updateProduct(productId, values, imageUrl || undefined)
        : await createProduct(values, imageUrl || undefined);

      if (!result.success) {
        toast.error(result.error ?? "Something went wrong");
        return;
      }
      toast.success(productId ? "Product updated" : "Product created — now add images and variants below");
      router.push(productId ? "/admin/products" : `/admin/products/${(result as any).id}/edit`);
    });
  };

  const handleGenerateDescription = () => {
    const title = getValues("title");
    const categoryId = getValues("categoryId");
    if (!title) {
      toast.error("Enter a product title first");
      return;
    }
    startGeneratingDesc(async () => {
      const category = categories.find((c) => c.id === categoryId)?.name ?? "spiritual product";
      const res = await generateProductDescription({
        title,
        category,
        material: getValues("material"),
      });
      if (res.success) {
        setValue("description", res.content!);
        toast.success("Description generated — review before saving");
      } else {
        toast.error(res.error ?? "Could not generate description");
      }
    });
  };

  const handleGenerateSEO = () => {
    const title = getValues("title");
    const description = getValues("description");
    if (!title || !description) {
      toast.error("Add a title and description first");
      return;
    }
    startGeneratingSEO(async () => {
      const res = await generateSEOMeta({ title, description });
      if (res.success) {
        setValue("metaTitle", res.metaTitle);
        setValue("metaDescription", res.metaDescription);
        toast.success("SEO metadata generated");
      } else {
        toast.error(res.error ?? "Could not generate SEO metadata");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      <div>
        <label className="text-sm font-medium">Title</label>
        <input {...register("title")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Slug</label>
          <input {...register("slug")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
          {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">SKU</label>
          <input {...register("sku")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
          {errors.sku && <p className="text-xs text-destructive mt-1">{errors.sku.message}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Short Description</label>
        <input {...register("shortDesc")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Full Description</label>
          <button
            type="button"
            disabled={isGeneratingDesc}
            onClick={handleGenerateDescription}
            className="text-xs text-primary flex items-center gap-1 disabled:opacity-50"
          >
            <Sparkles size={12} /> {isGeneratingDesc ? "Writing..." : "Generate with AI"}
          </button>
        </div>
        <textarea
          {...register("description")}
          rows={5}
          className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1"
        />
        {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Price (₹)</label>
          <input
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Compare-at Price (₹)</label>
          <input
            type="number"
            step="0.01"
            {...register("compareAtPrice", { valueAsNumber: true })}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Inventory</label>
          <input
            type="number"
            {...register("inventory", { valueAsNumber: true })}
            className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Material</label>
          <input {...register("material")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <select {...register("categoryId")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Traditional Usage</label>
        <textarea {...register("usageInfo")} rows={2} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
      </div>

      <div>
        <label className="text-sm font-medium">Care Instructions</label>
        <textarea {...register("careInfo")} rows={2} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
      </div>

      <div>
        <ImageUploadInput label="Primary Image" value={imageUrl} onChange={setImageUrl} folder="products" />
        <p className="text-xs text-muted-foreground mt-1">
          You can add more images (a full gallery) after saving this product.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">SEO Metadata</label>
          <button
            type="button"
            disabled={isGeneratingSEO}
            onClick={handleGenerateSEO}
            className="text-xs text-primary flex items-center gap-1 disabled:opacity-50"
          >
            <Sparkles size={12} /> {isGeneratingSEO ? "Writing..." : "Generate with AI"}
          </button>
        </div>
        <input {...register("metaTitle")} placeholder="Meta title" className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
        <input {...register("metaDescription")} placeholder="Meta description" className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-2" />
      </div>

      <div>
        <label className="text-sm font-medium">Status</label>
        <select {...register("status")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <button
        disabled={isPending}
        className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium disabled:opacity-50"
      >
        {isPending ? "Saving..." : productId ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}
