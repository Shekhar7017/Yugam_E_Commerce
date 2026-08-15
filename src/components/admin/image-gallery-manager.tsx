"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { addProductImage, deleteProductImage, reorderProductImages } from "@/actions/admin.actions";
import { generateAltText } from "@/actions/ai/content.actions";
import { ImageUploadInput } from "@/components/admin/image-upload-input";
import { ArrowLeft, ArrowRight, Trash2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

type ImageItem = { id: string; url: string; altText: string | null };

export function ImageGalleryManager({
  productId,
  productTitle,
  initialImages,
}: {
  productId: string;
  productTitle: string;
  initialImages: ImageItem[];
}) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isGeneratingAlt, startGeneratingAlt] = useTransition();
  const router = useRouter();

  const handleAdd = () => {
    if (!url.trim()) return;
    startTransition(async () => {
      await addProductImage(productId, url.trim(), altText.trim() || undefined);
      setUrl("");
      setAltText("");
      router.refresh();
      toast.success("Image added");
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteProductImage(id);
      setImages((imgs) => imgs.filter((i) => i.id !== id));
      toast.success("Image removed");
    });
  };

  const move = (index: number, direction: -1 | 1) => {
    const newOrder = [...images];
    const target = index + direction;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    setImages(newOrder);
    startTransition(async () => {
      await reorderProductImages(productId, newOrder.map((i) => i.id));
    });
  };

  const handleGenerateAlt = () => {
    startGeneratingAlt(async () => {
      const res = await generateAltText({ title: productTitle });
      if (res.success) {
        setAltText(res.content!);
      } else {
        toast.error(res.error ?? "Could not generate alt text");
      }
    });
  };

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={img.id} className="relative group">
              <div className="relative aspect-square rounded-md overflow-hidden bg-muted border">
                <Image src={img.url} alt={img.altText ?? productTitle} fill className="object-cover" />
              </div>
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
              <div className="flex items-center justify-between mt-1">
                <button type="button" disabled={i === 0 || isPending} onClick={() => move(i, -1)} className="disabled:opacity-30">
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(img.id)}
                  className="text-destructive"
                >
                  <Trash2 size={14} />
                </button>
                <button type="button" disabled={i === images.length - 1 || isPending} onClick={() => move(i, 1)} className="disabled:opacity-30">
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border rounded-md p-3 space-y-2">
        <ImageUploadInput value={url} onChange={setUrl} folder="products" />
        <div className="flex gap-2">
          <input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Alt text (for accessibility & SEO)"
            className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
          />
          <button
            type="button"
            disabled={isGeneratingAlt}
            onClick={handleGenerateAlt}
            title="Generate alt text with AI"
            className="border rounded-md px-3 text-sm disabled:opacity-50 flex items-center gap-1"
          >
            <Sparkles size={14} /> {isGeneratingAlt ? "..." : "AI"}
          </button>
        </div>
        <button
          type="button"
          disabled={isPending || !url.trim()}
          onClick={handleAdd}
          className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add Image"}
        </button>
      </div>
    </div>
  );
}
