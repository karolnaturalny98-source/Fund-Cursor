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

const urlField = z.string().url().or(z.literal("")).optional();

const formSchema = z.object({
  name: z.string().min(2, "Nazwa jest wymagana (min 2 znaki)."),
  issuer: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  url: urlField,
  imageUrl: urlField,
  issuedDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Certification {
  id: string;
  name: string;
  issuer: string | null;
  description: string | null;
  url: string | null;
  imageUrl: string | null;
  issuedDate: string | null;
  expiryDate: string | null;
}

interface CompanyCertificationsFormProps {
  companySlug: string;
}

export function CompanyCertificationsForm({ companySlug }: CompanyCertificationsFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; name: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      issuer: "",
      description: "",
      url: "",
      imageUrl: "",
      issuedDate: "",
      expiryDate: "",
    },
  });

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/companies/${companySlug}/certifications`);
      if (!response.ok) throw new Error("Nie udało się pobrać certyfikatów.");
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
      name: values.name.trim(),
      issuer: values.issuer?.trim() || null,
      description: values.description?.trim() || null,
      url: values.url?.trim() || null,
      imageUrl: values.imageUrl?.trim() || null,
      issuedDate: values.issuedDate ? new Date(values.issuedDate).toISOString() : null,
      expiryDate: values.expiryDate ? new Date(values.expiryDate).toISOString() : null,
    };

    try {
      const url = editingId
        ? `/api/admin/companies/${companySlug}/certifications/${editingId}`
        : `/api/admin/companies/${companySlug}/certifications`;
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Nie udało się zapisać certyfikatu.");

      reset();
      setEditingId(null);
      await loadItems();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Nie udało się zapisać certyfikatu.");
    }
  };

  const handleEdit = (item: Certification) => {
    setEditingId(item.id);
    setValue("name", item.name);
    setValue("issuer", item.issuer || "");
    setValue("description", item.description || "");
    setValue("url", item.url || "");
    setValue("imageUrl", item.imageUrl || "");
    setValue(
      "issuedDate",
      item.issuedDate ? new Date(item.issuedDate).toISOString().split("T")[0] : "",
    );
    setValue(
      "expiryDate",
      item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : "",
    );
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    try {
      const response = await fetch(
        `/api/admin/companies/${companySlug}/certifications/${deleteDialog.id}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Nie udało się usunąć certyfikatu.");
      await loadItems();
      setDeleteDialog(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Nie udało się usunąć certyfikatu.");
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Ładowanie...</p>;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nazwa certyfikatu *</label>
            <Input {...register("name")} placeholder="Nazwa certyfikatu" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Wydawca</label>
            <Input {...register("issuer")} placeholder="Organizacja wydająca" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Opis</label>
          <Textarea {...register("description")} placeholder="Opis certyfikatu" rows={3} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">URL certyfikatu</label>
            <Input {...register("url")} type="url" placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">URL obrazu</label>
            <Input {...register("imageUrl")} type="url" placeholder="https://..." />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data wydania</label>
            <Input type="date" {...register("issuedDate")} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data wygaśnięcia</label>
            <Input type="date" {...register("expiryDate")} />
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {editingId ? "Zaktualizuj" : "Dodaj"} certyfikat
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

      <div className="space-y-3">
        <h3 className="text-base font-semibold">Istniejące certyfikaty</h3>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak certyfikatów.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.issuer && <p className="text-sm text-muted-foreground">Wydawca: {item.issuer}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialog({ id: item.id, name: item.name })}
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
            <DialogTitle>Usuń certyfikat</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć &quot;{deleteDialog?.name}&quot;? Tej operacji nie można cofnąć.
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

