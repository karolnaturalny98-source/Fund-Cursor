"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { generateSlug } from "@/lib/utils/blog";

const RichTextEditor = dynamic(
  () =>
    import("@/components/editor/rich-text-editor")
      .then((mod) => ({ default: mod.RichTextEditor }))
      .catch((error) => {
        console.error("Failed to load RichTextEditor:", error);
        // Return a fallback component
        return {
          default: function RichTextEditorFallback({
            content,
            onChange,
          }: {
            content: string;
            onChange: (content: string) => void;
          }) {
            return (
              <div className="h-[300px] rounded-lg border border-border bg-background p-4">
                <p className="fluid-caption text-muted-foreground">
                  Nie można załadować edytora. Odśwież stronę lub użyj zwykłego pola tekstowego.
                </p>
                <textarea
                  className="mt-2 h-full w-full rounded border border-border bg-background p-2"
                  value={content}
                  onChange={(e) => onChange(e.target.value)}
                />
              </div>
            );
          },
        };
      }),
  {
    ssr: false,
    loading: () => <div className="h-[300px] animate-pulse rounded-lg bg-muted" />,
  }
);
import type { BlogCategory } from "@/lib/types";

const optionalUrl = z
  .string()
  .url({ message: "Podaj poprawny URL." })
  .or(z.literal(""))
  .optional();

const formSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany").max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki"),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Treść jest wymagana"),
  featuredImageUrl: optionalUrl,
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  ogImageUrl: optionalUrl,
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  categoryIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BlogPostFormProps {
  postId?: string;
  initialData?: {
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    featuredImageUrl?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImageUrl?: string | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    categories?: BlogCategory[];
    tags?: string[];
  };
  categories: BlogCategory[];
  onSuccess?: () => void;
}

export function BlogPostForm({
  postId,
  initialData,
  categories,
  onSuccess,
}: BlogPostFormProps) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [tagInput, setTagInput] = useState("");

  const isEditMode = Boolean(postId);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      featuredImageUrl: initialData?.featuredImageUrl || "",
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
      ogImageUrl: initialData?.ogImageUrl || "",
      status: initialData?.status || "DRAFT",
      categoryIds: initialData?.categories?.map((c) => c.id) || [],
      tags: initialData?.tags || [],
    },
  });

  const title = watch("title");
  const currentTags = watch("tags") || [];
  const currentCategoryIds = watch("categoryIds") || [];

  // Auto-generuj slug z tytułu
  useEffect(() => {
    if (!isEditMode && title) {
      const autoSlug = generateSlug(title);
      setValue("slug", autoSlug);
    }
  }, [title, isEditMode, setValue]);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !currentTags.includes(trimmed)) {
      setValue("tags", [...currentTags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue("tags", currentTags.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (data: FormValues) => {
    setServerMessage(null);

    try {
      const url = postId
        ? `/api/admin/blog/posts/${postId}`
        : "/api/admin/blog/posts";
      const method = postId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          categoryIds: data.categoryIds || [],
          tags: data.tags || [],
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        setServerMessage({
          type: "error",
          text: body.error || "Wystąpił błąd podczas zapisu.",
        });
        return;
      }

      setServerMessage({
        type: "success",
        text: postId
          ? "Artykuł został zaktualizowany."
          : "Artykuł został utworzony.",
      });

      router.refresh();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Blog post submit error", error);
      setServerMessage({
        type: "error",
        text: "Wystąpił błąd podczas zapisu.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col fluid-stack-xl">
      {serverMessage && (
        <Alert
          variant={serverMessage.type === "error" ? "destructive" : "default"}
        >
          <AlertDescription>{serverMessage.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid fluid-stack-md md:grid-cols-2">
        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="title">Tytuł *</Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Tytuł artykułu"
          />
          {errors.title && (
            <p className="fluid-caption text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            {...register("slug")}
            placeholder="url-slug-artykulu"
            disabled={isEditMode}
          />
          {errors.slug && (
            <p className="fluid-caption text-destructive">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col fluid-stack-xs">
        <Label htmlFor="excerpt">Krótki opis (excerpt)</Label>
        <Textarea
          id="excerpt"
          {...register("excerpt")}
          placeholder="Krótki opis artykułu (max 500 znaków)"
          rows={3}
        />
        {errors.excerpt && (
          <p className="fluid-caption text-destructive">{errors.excerpt.message}</p>
        )}
      </div>

      <div className="flex flex-col fluid-stack-xs">
        <Label htmlFor="content">Treść *</Label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              content={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.content && (
          <p className="fluid-caption text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="grid fluid-stack-md md:grid-cols-2">
        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="featuredImageUrl">URL obrazka głównego</Label>
          <Input
            id="featuredImageUrl"
            {...register("featuredImageUrl")}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="ogImageUrl">URL obrazka Open Graph</Label>
          <Input
            id="ogImageUrl"
            {...register("ogImageUrl")}
            placeholder="https://example.com/og-image.jpg"
          />
        </div>
      </div>

      <div className="grid fluid-stack-md md:grid-cols-2">
        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
          <Input
            id="metaTitle"
            {...register("metaTitle")}
            placeholder="Meta title dla SEO (max 60 znaków)"
          />
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
          <Textarea
            id="metaDescription"
            {...register("metaDescription")}
            placeholder="Meta description dla SEO (max 160 znaków)"
            rows={2}
          />
        </div>
      </div>

      <div className="grid fluid-stack-md md:grid-cols-2">
        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Szkic</SelectItem>
                  <SelectItem value="PUBLISHED">Opublikowany</SelectItem>
                  <SelectItem value="ARCHIVED">Zarchiwizowany</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <Label>Kategorie</Label>
          <Controller
            name="categoryIds"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col fluid-stack-xs">
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !field.value?.includes(value)) {
                      field.onChange([...(field.value || []), value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentCategoryIds.length > 0 && (
                  <div className="flex flex-wrap fluid-stack-xs">
                    {currentCategoryIds.map((categoryId) => {
                      const category = categories.find((c) => c.id === categoryId);
                      if (!category) return null;
                      return (
                        <Badge
                          key={categoryId}
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          {category.name}
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange(
                                field.value?.filter((id) => id !== categoryId)
                              );
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <div className="flex flex-col fluid-stack-xs">
        <Label htmlFor="tags">Tagi</Label>
        <div className="flex fluid-stack-xs">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Wpisz tag i naciśnij Enter"
          />
          <Button type="button" onClick={addTag} variant="outline">
            Dodaj
          </Button>
        </div>
        {currentTags.length > 0 && (
          <div className="flex flex-wrap fluid-stack-xs">
            {currentTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end fluid-stack-xs">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Anuluj
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Zapisywanie..."
            : isEditMode
              ? "Zaktualizuj"
              : "Utwórz"}
        </Button>
      </div>
    </form>
  );
}

