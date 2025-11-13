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
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/40 p-[clamp(1.25rem,1.8vw,1.6rem)] text-center text-muted-foreground fluid-copy">
        Brak recenzji do moderacji. Nowe opinie pojawia się tutaj automatycznie.
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-[clamp(0.75rem,1.1vw,1rem)] rounded-2xl border border-destructive/50 bg-destructive/10 px-[clamp(0.75rem,1vw,0.9rem)] py-[clamp(0.6rem,0.8vw,0.7rem)] text-destructive fluid-caption">
          {error}
        </div>
      )}

      <div className="space-y-[clamp(1rem,1.5vw,1.35rem)]">
        {reviews.map((review) => (
        <Card key={review.id} className="rounded-2xl border border-border/60 bg-card/72 shadow-xs backdrop-blur-[36px]!">
          <CardHeader className="space-y-[clamp(0.5rem,0.75vw,0.7rem)]">
            <div className="flex flex-wrap items-center justify-between gap-[clamp(0.85rem,1.2vw,1.1rem)]">
              <div className="space-y-[clamp(0.35rem,0.5vw,0.45rem)]">
                <p className="font-semibold text-foreground fluid-copy">
                  {review.company.name}
                </p>
                <p className="text-muted-foreground fluid-caption">/{review.company.slug}</p>
              </div>
              <div className="flex items-center gap-[clamp(0.5rem,0.75vw,0.7rem)]">
                <Badge variant="outline" className="font-medium fluid-caption rounded-full px-[clamp(0.6rem,0.9vw,0.8rem)] py-[clamp(0.3rem,0.45vw,0.4rem)]">
                  Ocena: {review.rating}/5
                </Badge>
                <span className="text-muted-foreground fluid-caption">
                  {new Intl.DateTimeFormat("pl-PL", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(review.createdAt)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-[clamp(1rem,1.4vw,1.25rem)]">
            {review.body ? (
              <>
                <p className="text-foreground fluid-copy">{review.body}</p>
                <Separator />
              </>
            ) : null}

            <div className="grid gap-[clamp(0.75rem,1.1vw,1rem)] text-muted-foreground fluid-caption">
              {review.pros.length > 0 ? (
                <div className="space-y-[clamp(0.35rem,0.5vw,0.45rem)]">
                  <p className="font-semibold text-foreground fluid-caption">Plusy</p>
                  <div className="flex flex-wrap gap-[clamp(0.35rem,0.6vw,0.5rem)]">
                    {review.pros.map((item) => (
                      <Badge key={item} variant="outline" className="fluid-badge rounded-full">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              {review.cons.length > 0 ? (
                <div className="space-y-[clamp(0.35rem,0.5vw,0.45rem)]">
                  <p className="font-semibold text-foreground fluid-caption">Minusy</p>
                  <div className="flex flex-wrap gap-[clamp(0.35rem,0.6vw,0.5rem)]">
                    {review.cons.map((item) => (
                      <Badge key={item} variant="outline" className="fluid-badge rounded-full">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <Separator />

            <div className="flex flex-col items-start justify-between gap-[clamp(0.75rem,1.1vw,1rem)] sm:flex-row sm:items-center">
              <span className="text-muted-foreground fluid-caption">
                Autor: {review.user?.displayName ?? review.user?.clerkId ?? "Anonimowy"}
              </span>
              <div className="flex flex-wrap gap-[clamp(0.45rem,0.7vw,0.6rem)]">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => updateStatus(review.id, "REJECTED")}
                  className="fluid-button-sm"
                >
                  Odrzuć
                </Button>
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => updateStatus(review.id, "APPROVED")}
                  className="fluid-button-sm"
                >
                  Zatwierdź
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => setDeleteDialog(review.id)}
                  className="fluid-button-sm"
                >
                  <Trash2 className="h-[clamp(0.95rem,0.5vw+0.8rem,1.1rem)] w-[clamp(0.95rem,0.5vw+0.8rem,1.1rem)]" />
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
            <Button variant="outline" onClick={() => setDeleteDialog(null)} disabled={isPending} className="fluid-button-sm">
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="fluid-button-sm">
              {isPending ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
