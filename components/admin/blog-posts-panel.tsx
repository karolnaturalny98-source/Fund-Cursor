"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BlogPostWithRelations } from "@/lib/types";

interface BlogPostsPanelProps {
  initialPosts: BlogPostWithRelations[];
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Szkic",
  PUBLISHED: "Opublikowany",
  ARCHIVED: "Zarchiwizowany",
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export function BlogPostsPanel({ initialPosts }: BlogPostsPanelProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Nie udało się usunąć artykułu.");
        return;
      }

      setPosts((prev) => prev.filter((post) => post.id !== id));
      setDeleteDialog(null);
      router.refresh();
    } catch (error) {
      console.error("Delete error", error);
      alert("Wystąpił błąd podczas usuwania.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Brak artykułów.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Tytuł</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Autor</th>
              <th className="px-4 py-3">Kategorie</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Wyświetlenia</th>
              <th className="px-4 py-3">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {posts.map((post) => (
              <tr key={post.id} className="align-top">
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{post.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                      STATUS_BADGE[post.status] || STATUS_BADGE.DRAFT
                    )}
                  >
                    {STATUS_LABELS[post.status] || post.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {post.author.displayName || post.author.email || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {post.categories.map((cat) => (
                      <Badge key={cat.id} variant="outline" className="text-xs">
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {post.publishedAt
                    ? format(new Date(post.publishedAt), "dd.MM.yyyy")
                    : format(new Date(post.createdAt), "dd.MM.yyyy")}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {post.views}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {post.status === "PUBLISHED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <a
                          href={`/baza-wiedzy/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Zobacz"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        // TODO: Otwórz formularz edycji
                        router.push(`/admin/blog?edit=${post.id}`);
                      }}
                      title="Edytuj"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => setDeleteDialog(post.id)}
                      title="Usuń"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(deleteDialog)} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń artykuł</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć ten artykuł? Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(null)}
              disabled={isDeleting}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              disabled={isDeleting}
            >
              {isDeleting ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

