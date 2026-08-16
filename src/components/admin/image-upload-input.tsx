"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export function ImageUploadInput({
  value,
  onChange,
  folder = "misc",
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }

      onChange(data.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed — check your connection and try again");
    } finally {
      setIsUploading(false);
    }
  };

  // Check whether the stored value is a usable image URL
  const isValidImageUrl = (url: string) => {
    if (!url) return false;

    // Allow local paths such as /logo.png
    if (url.startsWith("/")) return true;

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const hasValidImage = isValidImageUrl(value);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label}
        </label>
      )}

      {hasValidImage ? (
        <div className="relative w-full max-w-[200px]">
          <div className="relative aspect-square rounded-md overflow-hidden bg-muted border">
            <Image
              src={value}
              alt="Uploaded"
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>

          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
            aria-label="Remove image"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files?.[0];

            if (file) {
              upload(file);
            }
          }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={20} className="animate-spin" />
              Uploading...
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Upload size={20} />
              Click or drag an image here
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                upload(file);
              }

              e.target.value = "";
            }}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          or paste a URL:
        </span>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder="https://..."
          className="flex-1 border rounded-md px-2 py-1 text-xs bg-background"
        />
      </div>
    </div>
  );
}