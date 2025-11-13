"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PendingDataIssue } from "@/lib/queries/data-issues";

interface DataIssueModerationPanelProps {
  reports: PendingDataIssue[];
}

export function DataIssueModerationPanel({
  reports,
}: DataIssueModerationPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = (id: string, status: "RESOLVED" | "DISMISSED") => {
    startTransition(async () => {
      await fetch(`/api/admin/data-issues/${id}`, {
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
        const response = await fetch(`/api/admin/data-issues/${deleteDialog}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setError(data?.error ?? "Nie udało się usunąć zgłoszenia.");
          return;
        }

        setDeleteDialog(null);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError("Wystąpił błąd podczas usuwania zgłoszenia.");
      }
    });
  };

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/40 p-[clamp(1.25rem,1.8vw,1.6rem)] text-muted-foreground fluid-copy">
        Brak nowych zgłoszeń. Gdy użytkownicy zgłaszają błąd w danych, pojawi się tutaj.
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
        {reports.map((report) => (
        <article
          key={report.id}
          className="space-y-[clamp(0.75rem,1.1vw,1rem)] rounded-2xl border border-border/60 bg-card/72 p-[clamp(1rem,1.4vw,1.25rem)] shadow-xs backdrop-blur-[36px]!"
        >
          <header className="flex flex-wrap items-start justify-between gap-[clamp(0.85rem,1.2vw,1.1rem)]">
            <div className="space-y-[clamp(0.35rem,0.5vw,0.45rem)]">
              <p className="font-semibold text-foreground fluid-copy">
                {report.company
                  ? `${report.company.name} /${report.company.slug}`
                  : "Bez powiązanej firmy"}
              </p>
              <p className="text-muted-foreground fluid-eyebrow">
                Kategoria: {formatCategory(report.category)}
                {report.plan ? ` • Plan: ${report.plan.name}` : null}
              </p>
            </div>
            <span className="text-muted-foreground fluid-caption">
              {formatDateTime(report.createdAt)}
            </span>
          </header>

          <p className="whitespace-pre-wrap text-foreground fluid-copy">
            {report.description}
          </p>

          <div className="grid gap-[clamp(0.35rem,0.5vw,0.45rem)] text-muted-foreground fluid-caption">
            {report.email ? (
              <p>
                Kontakt: <strong>{report.email}</strong>
              </p>
            ) : null}
            {report.user ? (
              <p>
                Użytkownik:{" "}
                <strong>
                  {report.user.displayName ?? report.user.clerkId}
                </strong>{" "}
                ({report.user.email ?? "brak maila"})
              </p>
            ) : (
              <p>Użytkownik anonimowy.</p>
            )}
            {report.source ? (
              <p>Źródło: {report.source}</p>
            ) : null}
          </div>

          <div className="flex flex-col items-start justify-between gap-[clamp(0.75rem,1.1vw,1rem)] text-muted-foreground fluid-caption sm:flex-row sm:items-center">
            <span>ID zgłoszenia: {report.id}</span>
            <div className="flex flex-wrap gap-[clamp(0.45rem,0.7vw,0.6rem)]">
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => updateStatus(report.id, "DISMISSED")}
                className="fluid-button-sm"
              >
                Odrzuć
              </Button>
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => updateStatus(report.id, "RESOLVED")}
                className="fluid-button-sm"
              >
                Oznacz jako rozwiązane
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={() => setDeleteDialog(report.id)}
                className="fluid-button-sm"
              >
                <Trash2 className="h-[clamp(0.95rem,0.5vw+0.8rem,1.1rem)] w-[clamp(0.95rem,0.5vw+0.8rem,1.1rem)]" />
              </Button>
            </div>
          </div>
        </article>
      ))}
      </div>

      <Dialog open={Boolean(deleteDialog)} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń zgłoszenie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć to zgłoszenie? Ta operacja jest nieodwracalna.
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

function formatDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatCategory(category: string) {
  switch (category) {
    case "pricing":
      return "Cena / waluta planu";
    case "cashback":
      return "Cashback";
    case "rules":
      return "Zasady";
    case "links":
      return "Linki / kontakt";
    case "other":
      return "Inny problem";
    default:
      return category;
  }
}
