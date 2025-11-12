"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import type { PendingReview } from "@/lib/queries/reviews";

interface ReviewModerationPanelProps {
  reviews: PendingReview[];
}

export function ReviewModerationPanel({ reviews }: ReviewModerationPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = (id: string, status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!deleteDialog) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/reviews/${deleteDialog}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setError(data?.error ?? "Nie udało się usunąć recenzji.");
          return;
        }

        setDeleteDialog(null);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError("Wystąpił błąd podczas usuwania recenzji.");
      }
    });
  };

  if (!reviews.length) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Brak recenzji do moderacji. Nowe opinie pojawia się tutaj automatycznie.
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
        <Card key={review.id} className="rounded-xl border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {review.company.name}
                </p>
                <p className="text-xs text-muted-foreground">/{review.company.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-medium">
                  Ocena: {review.rating}/5
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("pl-PL", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(review.createdAt)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {review.body ? (
              <>
                <p className="text-sm text-foreground">{review.body}</p>
                <Separator />
              </>
            ) : null}

            <div className="grid gap-3 text-xs">
              {review.pros.length > 0 ? (
                <div>
                  <p className="font-semibold text-foreground mb-2">Plusy</p>
                  <div className="flex flex-wrap gap-2">
                    {review.pros.map((item) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              {review.cons.length > 0 ? (
                <div>
                  <p className="font-semibold text-foreground mb-2">Minusy</p>
                  <div className="flex flex-wrap gap-2">
                    {review.cons.map((item) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Autor: {review.user?.displayName ?? review.user?.clerkId ?? "Anonimowy"}
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => updateStatus(review.id, "REJECTED")}
                >
                  Odrzuć
                </Button>
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => updateStatus(review.id, "APPROVED")}
                >
                  Zatwierdź
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => setDeleteDialog(review.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      </div>

      <Dialog open={Boolean(deleteDialog)} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń recenzję</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć tę recenzję? Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} disabled={isPending}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
