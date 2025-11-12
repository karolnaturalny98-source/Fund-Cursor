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
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground">
        Brak nowych zgłoszeń. Gdy użytkownicy zgłaszają błąd w danych, pojawi się tutaj.
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
        {reports.map((report) => (
        <article
          key={report.id}
          className="space-y-3 rounded-xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs p-4"
        >
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {report.company
                  ? `${report.company.name} /${report.company.slug}`
                  : "Bez powiązanej firmy"}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Kategoria: {formatCategory(report.category)}
                {report.plan ? ` • Plan: ${report.plan.name}` : null}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(report.createdAt)}
            </span>
          </header>

          <p className="whitespace-pre-wrap text-sm text-foreground">
            {report.description}
          </p>

          <div className="grid gap-2 text-xs text-muted-foreground">
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

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>ID zgłoszenia: {report.id}</span>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => updateStatus(report.id, "DISMISSED")}
              >
                Odrzuć
              </Button>
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => updateStatus(report.id, "RESOLVED")}
              >
                Oznacz jako rozwiązane
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={() => setDeleteDialog(report.id)}
              >
                <Trash2 className="h-4 w-4" />
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
