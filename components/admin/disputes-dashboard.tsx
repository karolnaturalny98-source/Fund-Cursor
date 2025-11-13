"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { DisputeCase, DisputeStatus } from "@/lib/types";

type DisputeStatusFilter = DisputeStatus | "ALL";

const STATUS_OPTIONS: DisputeStatusFilter[] = [
  "ALL",
  "OPEN",
  "IN_REVIEW",
  "WAITING_USER",
  "RESOLVED",
  "REJECTED",
];

const STATUS_LABELS: Record<DisputeStatusFilter, string> = {
  ALL: "Wszystkie",
  OPEN: "Otwarte",
  IN_REVIEW: "W trakcie analizy",
  WAITING_USER: "Czekamy na uzytkownika",
  RESOLVED: "Zamkniete",
  REJECTED: "Odrzucone",
};

const STATUS_BADGES: Record<DisputeStatus, string> = {
  OPEN: "border-primary/40 text-primary",
  IN_REVIEW: "border-amber-500/40 text-amber-500",
  WAITING_USER: "border-sky-500/40 text-sky-500",
  RESOLVED: "border-emerald-600/40 text-emerald-600",
  REJECTED: "border-rose-600/40 text-rose-600",
};

interface AdminDisputesDashboardProps {
  initialItems: DisputeCase[];
  initialTotals: Record<DisputeStatus, number>;
  initialNextCursor: string | null;
  initialStatus: DisputeStatusFilter;
  initialQuery: string;
}

interface FetchResult {
  items: DisputeCase[];
  totals: Record<DisputeStatus, number>;
  nextCursor: string | null;
}

export function AdminDisputesDashboard({
  initialItems,
  initialTotals,
  initialNextCursor,
  initialStatus,
  initialQuery,
}: AdminDisputesDashboardProps) {
  const [items, setItems] = useState<DisputeCase[]>(initialItems);
  const [totals, setTotals] = useState<Record<DisputeStatus, number>>(initialTotals);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [status, setStatus] = useState<DisputeStatusFilter>(initialStatus);
  const [query, setQuery] = useState(initialQuery);
  const [searchValue, setSearchValue] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const _router = useRouter();
  const [isPendingDelete, startTransitionDelete] = useTransition();

  const hasMore = Boolean(nextCursor);

  const summaryCards = useMemo(() => {
    return STATUS_OPTIONS.filter((option) => option !== "ALL").map((option) => {
      const key = option as DisputeStatus;
      const count = totals[key] ?? 0;
      return {
        key,
        label: STATUS_LABELS[option],
        value: count,
      };
    });
  }, [totals]);

  const fetchDisputes = useCallback(
    async ({
      reset = false,
      cursor,
      statusOverride,
      queryOverride,
    }: {
      reset?: boolean;
      cursor?: string | null;
      statusOverride?: DisputeStatusFilter;
      queryOverride?: string;
    } = {}): Promise<FetchResult> => {
      const activeStatus = statusOverride ?? status;
      const activeQuery = queryOverride ?? query;

      const params = new URLSearchParams();
      params.set("limit", "20");

      if (activeStatus && activeStatus !== "ALL") {
        params.set("status", activeStatus);
      }

      if (activeQuery) {
        params.set("q", activeQuery);
      }

      if (!reset && cursor) {
        params.set("cursor", cursor);
      }

      const url = `/api/admin/disputes?${params.toString()}`;
      const response = await fetch(url, { cache: "no-store" });

      if (!response.ok) {
        let message = "Nie udalo sie pobrac zgloszen.";
        try {
          const body = (await response.clone().json()) as { error?: string };
          if (body?.error) {
            message = body.error;
          }
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      const body = (await response.json()) as FetchResult;
      return body;
    },
    [query, status],
  );

  const reload = useCallback(
    async (statusOverride?: DisputeStatusFilter, queryOverride?: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchDisputes({
          reset: true,
          statusOverride,
          queryOverride,
        });
        setItems(result.items);
        setTotals(result.totals);
        setNextCursor(result.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nie udalo sie pobrac zgloszen.");
      } finally {
        setLoading(false);
      }
    },
    [fetchDisputes],
  );

  const handleStatusChange = useCallback(
    async (value: DisputeStatusFilter) => {
      setStatus(value);
      await reload(value, query);
    },
    [query, reload],
  );

  const handleSearch = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setQuery(searchValue);
      await reload(status, searchValue);
    },
    [reload, searchValue, status],
  );

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor) {
      return;
    }

    setLoadingMore(true);
    setError(null);
    try {
      const result = await fetchDisputes({ cursor: nextCursor });
      setItems((prev) => [...prev, ...result.items]);
      setTotals(result.totals);
      setNextCursor(result.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udalo sie pobrac kolejnej strony.");
    } finally {
      setLoadingMore(false);
    }
  }, [fetchDisputes, nextCursor]);

  const handleAssign = useCallback(
    async (id: string) => {
      setSavingId(id);
      setError(null);
      try {
        const response = await fetch(`/api/admin/disputes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignToSelf: true }),
        });

        if (!response.ok) {
          let message = "Nie udalo sie przypisac sprawy.";
          try {
            const body = (await response.clone().json()) as { error?: string };
            if (body?.error) {
              message = body.error;
            }
          } catch {
            // ignore
          }
          throw new Error(message);
        }

        setBanner("Sprawa zostala przypisana do Twojego konta.");
        await reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nie udalo sie przypisac sprawy.");
      } finally {
        setSavingId(null);
      }
    },
    [reload],
  );

  const handleSave = useCallback(
    async (id: string, nextStatus: DisputeStatus, notes: string) => {
      setSavingId(id);
      setError(null);
      try {
        const response = await fetch(`/api/admin/disputes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: nextStatus,
            resolutionNotes: notes.trim() ? notes.trim() : null,
          }),
        });

        if (!response.ok) {
          let message = "Nie udalo sie zaktualizowac sprawy.";
          try {
            const body = (await response.clone().json()) as { error?: string };
            if (body?.error) {
              message = body.error;
            }
          } catch {
            // ignore
          }
          throw new Error(message);
        }

        setBanner("Sprawa zostala zaktualizowana.");
        await reload(status, query);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nie udalo sie zapisac zmian.");
      } finally {
        setSavingId(null);
      }
    },
    [query, reload, status],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      startTransitionDelete(async () => {
        try {
          const response = await fetch(`/api/admin/disputes/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const data = await response.json().catch(() => null);
            setError(data?.error ?? "Nie udało się usunąć sporu.");
            return;
          }

          setDeleteDialog(null);
          await reload();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Nie udało się usunąć sporu.");
        }
      });
    },
    [reload],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.key} className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-4 shadow-xs">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <form className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" onSubmit={handleSearch}>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option}
              type="button"
              variant={status === option ? "default" : "outline-solid"}
              size="sm"
              onClick={() => void handleStatusChange(option)}
            >
              {STATUS_LABELS[option]}
            </Button>
          ))}
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Input
            placeholder="Szukaj po firmie, uzytkowniku, tytule..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <Button type="submit">Filtruj</Button>
        </div>
      </form>

      {banner ? (
        <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400" role="status">
          {banner}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-2">
          <div className="h-4 animate-pulse rounded bg-muted/70" />
          <div className="h-4 animate-pulse rounded bg-muted/60" />
          <div className="h-4 animate-pulse rounded bg-muted/50" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Brak zgloszen dla wybranych filtrów.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((dispute) => (
            <AdminDisputeRow
              key={dispute.id}
              dispute={dispute}
              onAssign={handleAssign}
              onSave={handleSave}
              onDelete={() => setDeleteDialog(dispute.id)}
              saving={savingId === dispute.id}
            />
          ))}
        </div>
      )}

      {hasMore ? (
        <Button disabled={loadingMore} onClick={() => void handleLoadMore()} variant="outline">
          {loadingMore ? "Wczytywanie..." : "Wczytaj wiecej"}
        </Button>
      ) : null}

      <Dialog open={Boolean(deleteDialog)} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń spór</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć ten spór? Można usunąć tylko zamknięte spory (RESOLVED lub REJECTED). Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} disabled={isPendingDelete}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              disabled={isPendingDelete}
            >
              {isPendingDelete ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface AdminDisputeRowProps {
  dispute: DisputeCase;
  saving: boolean;
  onSave: (id: string, status: DisputeStatus, notes: string) => Promise<void>;
  onAssign: (id: string) => Promise<void>;
  onDelete: () => void;
}

function AdminDisputeRow({ dispute, saving, onSave, onAssign, onDelete }: AdminDisputeRowProps) {
  const [statusDraft, setStatusDraft] = useState<DisputeStatus>(dispute.status);
  const [notesDraft, setNotesDraft] = useState(dispute.resolutionNotes ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSaveClick = async () => {
    setLocalError(null);
    try {
      await onSave(dispute.id, statusDraft, notesDraft);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Nie udalo sie zapisac zmian.");
    }
  };

  const handleAssignClick = async () => {
    setLocalError(null);
    try {
      await onAssign(dispute.id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Nie udalo sie przypisac sprawy.");
    }
  };

  return (
    <article className="space-y-3 rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-4 shadow-xs">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{dispute.title}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDateTime(dispute.createdAt)}</span>
            {dispute.company ? (
              <Link className="font-medium text-foreground hover:underline" href={`/firmy/${dispute.company.slug}`}>
                {dispute.company.name}
              </Link>
            ) : null}
            {dispute.plan ? <span>Plan: {dispute.plan.name}</span> : null}
            {dispute.user ? (
              <span>
                Uzytkownik: {dispute.user.displayName ?? dispute.user.email ?? dispute.user.clerkId}
              </span>
            ) : (
              <span>Anonimowy uzytkownik</span>
            )}
          </div>
        </div>
        <Badge variant="outline" className={cn("text-xs", STATUS_BADGES[dispute.status])}>
          {STATUS_LABELS[dispute.status]}
        </Badge>
      </header>

      <p className="whitespace-pre-wrap text-sm text-foreground">{dispute.description}</p>

      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        {dispute.requestedAmount !== null && dispute.requestedAmount !== undefined ? (
          <span>
            Roszczenie:{" "}
            <strong>{formatAmount(dispute.requestedAmount, dispute.requestedCurrency ?? "USD")}</strong>
          </span>
        ) : null}
        {dispute.assignedAdmin ? (
          <span>
            Opiekun:{" "}
            <strong>
              {dispute.assignedAdmin.displayName ??
                dispute.assignedAdmin.email ??
                dispute.assignedAdmin.clerkId}
            </strong>
          </span>
        ) : (
          <span>Brak przypisanego opiekuna</span>
        )}
      </div>

      {dispute.evidenceLinks.length ? (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {dispute.evidenceLinks.map((link) => (
            <Link key={link} className="underline" href={link} rel="noreferrer" target="_blank">
              Dowod
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[200px_1fr]">
        <label className="space-y-1 text-xs font-medium">
          <span>Status sprawy</span>
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            value={statusDraft}
            onChange={(event) => setStatusDraft(event.target.value as DisputeStatus)}
          >
            {STATUS_OPTIONS.filter((option) => option !== "ALL").map((option) => (
              <option key={option} value={option}>
                {STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium">
          <span>Notatka dla zespolu (opcjonalnie)</span>
          <Textarea
            rows={3}
            placeholder="Opcjonalna notatka lub podsumowanie kontaktu."
            value={notesDraft}
            onChange={(event) => setNotesDraft(event.target.value)}
          />
        </label>
      </div>

      {localError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive" role="alert">
          {localError}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={saving} onClick={handleAssignClick}>
          Przejmij
        </Button>
        <Button type="button" disabled={saving} onClick={handleSaveClick}>
          {saving ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
        {(dispute.status === "RESOLVED" || dispute.status === "REJECTED") && (
          <Button type="button" variant="destructive" disabled={saving} onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Usuń
          </Button>
        )}
      </div>
    </article>
  );
}

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}
