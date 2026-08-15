"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBlog, updateBlog } from "@/actions/admin-blog.actions";
import { generateBlogDraft } from "@/actions/ai/content.actions";
import { ImageUploadInput } from "@/components/admin/image-upload-input";
import { Sparkles } from "lucide-react";

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
};

const EMPTY: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  category: "",
  tags: "",
  metaTitle: "",
  metaDescription: "",
  isPublished: false,
};

export function BlogForm({ blogId, initial }: { blogId?: string; initial?: Partial<FormState> }) {
  const [form, setForm] = useState<FormState>({ ...EMPTY, ...initial });
  const [aiTopic, setAiTopic] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isGenerating, startGenerating] = useTransition();
  const router = useRouter();

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleGenerate = () => {
    if (!aiTopic.trim()) {
      toast.error("Enter a topic first, e.g. 'benefits of wearing a Rudraksha mala'");
      return;
    }
    startGenerating(async () => {
      const res = await generateBlogDraft({ topic: aiTopic });
      if (!res.success) {
        toast.error(res.error ?? "Could not generate draft");
        return;
      }
      setForm((f) => ({
        ...f,
        title: res.title!,
        excerpt: res.excerpt!,
        content: res.content!,
        slug: f.slug || res.title!.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      }));
      toast.success("Draft generated — review and edit before publishing");
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt || undefined,
        content: form.content,
        featuredImage: form.featuredImage || undefined,
        category: form.category || undefined,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        isPublished: form.isPublished,
      };

      const result = blogId ? await updateBlog(blogId, payload) : await createBlog(payload);
      if (!result.success) {
        toast.error("Something went wrong");
        return;
      }
      toast.success(blogId ? "Post updated" : "Post created");
      router.push("/admin/blog");
    });
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      {!blogId && (
        <div className="bg-muted/50 border rounded-lg p-4">
          <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Sparkles size={14} /> Generate a draft with AI
          </p>
          <div className="flex gap-2">
            <input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="Topic, e.g. 'how to care for a Sphatik mala'"
              className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
            />
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="text-sm border rounded-md px-4 disabled:opacity-50"
            >
              {isGenerating ? "Writing..." : "Generate"}
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Title</label>
        <input required value={form.title} onChange={set("title")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Slug</label>
          <input required value={form.slug} onChange={set("slug")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <input value={form.category} onChange={set("category")} placeholder="e.g. Festivals" className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Excerpt</label>
        <input value={form.excerpt} onChange={set("excerpt")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
      </div>

      <div>
        <label className="text-sm font-medium">Content</label>
        <textarea required value={form.content} onChange={set("content")} rows={12} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
        <p className="text-xs text-muted-foreground mt-1">Separate paragraphs with a blank line.</p>
      </div>

      <ImageUploadInput
        label="Featured Image"
        value={form.featuredImage}
        onChange={(url) => setForm((f) => ({ ...f, featuredImage: url }))}
        folder="blog"
      />

      <div>
        <label className="text-sm font-medium">Tags (comma separated)</label>
        <input value={form.tags} onChange={set("tags")} placeholder="diwali, puja, home" className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Meta Title</label>
          <input value={form.metaTitle} onChange={set("metaTitle")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Meta Description</label>
          <input value={form.metaDescription} onChange={set("metaDescription")} className="w-full border rounded-md px-3 py-2 text-sm bg-background mt-1" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} />
        Published
      </label>

      <button disabled={isPending} className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium disabled:opacity-50">
        {isPending ? "Saving..." : blogId ? "Save Changes" : "Create Post"}
      </button>
    </form>
  );
}
