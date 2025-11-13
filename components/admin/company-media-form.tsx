"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Edit2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const urlField = z.string().url().or(z.literal("")).optional();

const formSchema = z.object({
  title: z.string().min(2, "Tytuł jest wymagany (min 2 znaki)."),
  source: z.string().max(200).optional(),
  url: z.string().url("Podaj poprawny URL."),
  publishedAt: z.string().min(1, "Data publikacji jest wymagana."),
  description: z.string().max(1000).optional(),
  imageUrl: urlField,
  type: z.enum(["article", "interview", "press-release", "review"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MediaItem {
  id: string;
  title: string;
  source: string | null;
  url: string;
  publishedAt: string;
  description: string | null;
  imageUrl: string | null;
  type: string | null;
}

interface CompanyMediaFormProps {
  companySlug: string;
}

export function CompanyMediaForm({ companySlug }: CompanyMediaFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; title: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      source: "",
      url: "",
      publishedAt: "",
      description: "",
      imageUrl: "",
      type: undefined,
    },
  });

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/companies/${companySlug}/media`);
      if (!response.ok) throw new Error("Nie udało się pobrać wpisów medialnych.");
      const data = await response.json();
      setItems(data.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [companySlug]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      title: values.title.trim(),
      source: values.source?.trim() || null,
      url: values.url.trim(),
      publishedAt: new Date(values.publishedAt).toISOString(),
      description: values.description?.trim() || null,
      imageUrl: values.imageUrl?.trim() || null,
      type: values.type || null,
    };

    try {
      const url = editingId
        ? `/api/admin/companies/${companySlug}/media/${editingId}`
        : `/api/admin/companies/${companySlug}/media`;
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Nie udało się zapisać wpisu medialnego.");

      reset();
      setEditingId(null);
      await loadItems();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Nie udało się zapisać wpisu medialnego.");
    }
  };

  const handleEdit = (item: MediaItem) => {
    setEditingId(item.id);
    setValue("title", item.title);
    setValue("source", item.source || "");
    setValue("url", item.url);
    setValue(
      "publishedAt",
      new Date(item.publishedAt).toISOString().split("T")[0] + "T" + new Date(item.publishedAt).toTimeString().split(" ")[0],
    );
    setValue("description", item.description || "");
    setValue("imageUrl", item.imageUrl || "");
    setValue("type", (item.type as "review" | "article" | "interview" | "press-release" | undefined) || undefined);
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    try {
      const response = await fetch(
        `/api/admin/companies/${companySlug}/media/${deleteDialog.id}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Nie udało się usunąć wpisu medialnego.");
      await loadItems();
      setDeleteDialog(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Nie udało się usunąć wpisu medialnego.");
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Ładowanie...</p>;

  return (
    <div className="flex flex-col fluid-stack-md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col fluid-stack-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col fluid-stack-xs">
            <label className="text-sm font-medium">Tytuł *</label>
            <Input {...register("title")} placeholder="Tytuł artykułu/wywiadu" />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col fluid-stack-xs">
            <label className="text-sm font-medium">Źródło</label>
            <Input {...register("source")} placeholder="Nazwa portalu/media" />
          </div>
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <label className="text-sm font-medium">URL *</label>
          <Input {...register("url")} type="url" placeholder="https://..." />
          {errors.url && <p className="text-xs text-red-500">{errors.url.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col fluid-stack-xs">
            <label className="text-sm font-medium">Data publikacji *</label>
            <Input type="datetime-local" {...register("publishedAt")} />
            {errors.publishedAt && <p className="text-xs text-red-500">{errors.publishedAt.message}</p>}
          </div>

          <div className="flex flex-col fluid-stack-xs">
            <label className="text-sm font-medium">Typ</label>
            <Select
              value={watch("type") || ""}
              onValueChange={(value) => setValue("type", value as "review" | "article" | "interview" | "press-release" | undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">Artykuł</SelectItem>
                <SelectItem value="interview">Wywiad</SelectItem>
                <SelectItem value="press-release">Komunikat prasowy</SelectItem>
                <SelectItem value="review">Recenzja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <label className="text-sm font-medium">Opis</label>
          <Textarea {...register("description")} placeholder="Krótki opis (opcjonalnie)" rows={3} />
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <label className="text-sm font-medium">URL obrazu</label>
          <Input {...register("imageUrl")} type="url" placeholder="https://..." />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {editingId ? "Zaktualizuj" : "Dodaj"} wpis medialny
        </Button>
        {editingId && (
          <Button type="button" variant="outline" onClick={() => {
            reset();
            setEditingId(null);
          }}>
            Anuluj edycję
          </Button>
        )}
      </form>

      <Separator />

      <div className="flex flex-col fluid-stack-sm">
        <h3 className="text-base font-semibold">Istniejące wpisy medialne</h3>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak wpisów medialnych.</p>
        ) : (
          <div className="flex flex-col fluid-stack-xs">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.title}</h4>
                    {item.source && <p className="text-sm text-muted-foreground">{item.source}</p>}
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.publishedAt).toLocaleDateString("pl-PL")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialog({ id: item.id, title: item.title })}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń wpis medialny</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć &quot;{deleteDialog?.title}&quot;? Tej operacji nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


