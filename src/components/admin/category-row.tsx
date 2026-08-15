"use client";

import { useState } from "react";
import Image from "next/image";
import { CategoryForm } from "@/components/admin/category-form";
import { CategoryDeleteButton } from "@/components/admin/category-delete-button";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count: { products: number };
};

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <tr className="border-t">
        <td className="py-3 px-4 flex items-center gap-3">
          {category.image ? (
            <div className="relative w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
              <Image src={category.image} alt={category.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded bg-muted shrink-0" />
          )}
          {category.name}
        </td>
        <td className="py-3 px-4 text-muted-foreground">{category.slug}</td>
        <td className="py-3 px-4">{category._count.products}</td>
        <td className="py-3 px-4 text-right space-x-3">
          <button onClick={() => setEditing((e) => !e)} className="text-primary text-xs underline">
            {editing ? "Close" : "Edit"}
          </button>
          <CategoryDeleteButton id={category.id} />
        </td>
      </tr>
      {editing && (
        <tr className="border-t bg-muted/30">
          <td colSpan={4} className="p-4">
            <CategoryForm category={category} />
          </td>
        </tr>
      )}
    </>
  );
}