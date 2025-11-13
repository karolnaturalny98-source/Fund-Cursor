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

const formSchema = z.object({
  title: z.string().min(2, "Tytuł jest wymagany (min 2 znaki)."),
  description: z.string().max(1000, "Opis może mieć maksymalnie 1000 znaków.").optional(),
  date: z.string().min(1, "Data jest wymagana."),
  type: z.enum(["milestone", "achievement", "update", "award"]).optional(),
  icon: z.string().max(50).optional(),
  order: z.string().regex(/^\d+$/).refine((val) => Number.parseInt(val, 10) >= 0, "Kolejność >= 0"),
});

type FormValues = z.infer<typeof formSchema>;

interface TimelineItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  type: string | null;
  icon: string | null;
  order: number;
}

interface CompanyTimelineFormProps {
  companySlug: string;
}

export function CompanyTimelineForm({ companySlug }: CompanyTimelineFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<TimelineItem[]>([]);
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
      description: "",
      date: "",
      type: undefined,
      icon: "",
      order: "0",
    },
  });

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/companies/${companySlug}/timeline`);
      if (!response.ok) throw new Error("Nie udało się pobrać wydarzeń.");
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
      description: values.description?.trim() || null,
      date: new Date(values.date).toISOString(),
      type: values.type || null,
      icon: values.icon?.trim() || null,
      order: Number.parseInt(values.order, 10),
    };

    try {
      const url = editingId
        ? `/api/admin/companies/${companySlug}/timeline/${editingId}`
        : `/api/admin/companies/${companySlug}/timeline`;
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Nie udało się zapisać wydarzenia.");

      reset();
      setEditingId(null);
      await loadItems();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Nie udało się zapisać wydarzenia.");
    }
  };

  const handleEdit = (item: TimelineItem) => {
    setEditingId(item.id);
    const dateValue = new Date(item.date).toISOString().split("T")[0];
    setValue("title", item.title);
    setValue("description", item.description || "");
    setValue("date", dateValue);
    setValue("type", (item.type as "update" | "milestone" | "achievement" | "award" | undefined) || undefined);
    setValue("icon", item.icon || "");
    setValue("order", item.order.toString());
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    try {
      const response = await fetch(
        `/api/admin/companies/${companySlug}/timeline/${deleteDialog.id}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Nie udało się usunąć wydarzenia.");
      await loadItems();
      setDeleteDialog(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Nie udało się usunąć wydarzenia.");
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Ładowanie...</p>;

  return (
    <div className="flex flex-col fluid-stack-md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col fluid-stack-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col fluid-stack-xs">
            <label className="text-sm font-medium">Tytuł *</label>
            <Input {...register("title")} placeholder="Nazwa wydarzenia" />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col fluid-stack-xs">
            <label className="text-sm font-medium">Data *</label>
            <Input type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
          </div>
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <label className="text-sm font-medium">Opis</label>
          <Textarea {...register("description")} placeholder="Opis wydarzenia (opcjonalnie)" rows={3} />
          {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col fluid-stack-xs">
            <label className="text-sm font-medium">Typ</label>
            <Select
              value={watch("type") || ""}
              onValueChange={(value) => setValue("type", value as "update" | "milestone" | "achievement" | "award" | undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="milestone">Kamień milowy</SelectItem>
                <SelectItem value="achievement">Osiągnięcie</SelectItem>
                <SelectItem value="update">Aktualizacja</SelectItem>
                <SelectItem value="award">Nagroda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col fluid-stack-xs">
            <label className="text-sm font-medium">Ikona</label>
            <Input {...register("icon")} placeholder="Nazwa ikony (lucide-react)" />
          </div>

          <div className="flex flex-col fluid-stack-xs">
            <label className="text-sm font-medium">Kolejność</label>
            <Input type="number" {...register("order")} placeholder="0" />
            {errors.order && <p className="text-xs text-red-500">{errors.order.message}</p>}
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {editingId ? "Zaktualizuj" : "Dodaj"} wydarzenie
        </Button>
        {editingId && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setEditingId(null);
            }}
          >
            Anuluj edycję
          </Button>
        )}
      </form>

      <Separator />

      <div className="flex flex-col fluid-stack-sm">
        <h3 className="text-base font-semibold">Istniejące wydarzenia</h3>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak wydarzeń.</p>
        ) : (
          <div className="flex flex-col fluid-stack-xs">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("pl-PL")}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
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
            <DialogTitle>Usuń wydarzenie</DialogTitle>
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


