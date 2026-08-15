"use client";

import { useState, useTransition } from "react";
import { createCategory, updateCategory } from "@/actions/admin.actions";
import { ImageUploadInput } from "@/components/admin/image-upload-input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
};

export function CategoryForm({ category }: { category?: Category }) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isEdit = !!category;

  return (
    <form
      className="bg-card border rounded-lg p-5 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const payload = { name, slug, description: description || undefined, image: image || undefined };
          const res = isEdit
            ? await updateCategory(category!.id, payload)
            : await createCategory(payload);

          if (res.success) {
            toast.success(isEdit ? "Category updated" : "Category created");
            if (!isEdit) {
              setName("");
              setSlug("");
              setDescription("");
              setImage("");
            }
            router.refresh();
          } else {
            toast.error("Could not save category");
          }
        });
      }}
    >
      <input
        required
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (!isEdit) {
            setSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
          }
        }}
        placeholder="Category name"
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
      />
      <input
        required
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="url-slug"
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
      />
      <ImageUploadInput label="Category Image" value={image} onChange={setImage} folder="categories" />
      <button
        disabled={isPending}
        className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Category"}
      </button>
    </form>
  );
}