"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BlogCategory } from "@/lib/types";

interface BlogCategoriesPanelProps {
  initialCategories: BlogCategory[];
}

export function BlogCategoriesPanel({
  initialCategories,
}: BlogCategoriesPanelProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<BlogCategory | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDialog = (category?: BlogCategory) => {
    if (category) {
      setEditCategory(category);
      setName(category.name);
      setDescription(category.description || "");
    } else {
      setEditCategory(null);
      setName("");
      setDescription("");
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const url = editCategory
        ? `/api/admin/blog/categories/${editCategory.id}`
        : "/api/admin/blog/categories";
      const method = editCategory ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        alert("Nie udało się zapisać kategorii.");
        return;
      }

      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Category submit error", error);
      alert("Wystąpił błąd podczas zapisu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę kategorię?")) return;

    try {
      const response = await fetch(`/api/admin/blog/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Nie udało się usunąć kategorii.");
        return;
      }

      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      router.refresh();
    } catch (error) {
      console.error("Delete error", error);
      alert("Wystąpił błąd podczas usuwania.");
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj kategorię
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Brak kategorii.
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs p-4"
            >
              <div>
                <p className="font-medium text-foreground">{category.name}</p>
                {category.description && (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editCategory ? "Edytuj kategorię" : "Nowa kategoria"}
            </DialogTitle>
            <DialogDescription>
              {editCategory
                ? "Zaktualizuj informacje o kategorii."
                : "Dodaj nową kategorię artykułów."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nazwa *</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nazwa kategorii"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Opis</Label>
              <Input
                id="category-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Krótki opis kategorii"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

