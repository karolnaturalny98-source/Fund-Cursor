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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="flex flex-col fluid-stack-lg">
      <div className="grid gap-[clamp(0.85rem,1.3vw,1.1rem)] sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border border-border/60 bg-card/72 p-[clamp(1rem,1.4vw,1.25rem)] shadow-xs backdrop-blur-[36px]!"
          >
            <p className="fluid-eyebrow text-muted-foreground">{card.label}</p>
            <p className="mt-[clamp(0.5rem,0.75vw,0.7rem)] text-[clamp(1.6rem,1.8vw+1.1rem,2.15rem)] font-semibold text-foreground">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <form
        className="flex flex-col gap-[clamp(0.65rem,1vw,0.9rem)] sm:flex-row sm:items-center sm:justify-between"
        onSubmit={handleSearch}
      >
        <div className="flex flex-wrap gap-[clamp(0.45rem,0.8vw,0.65rem)]">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option}
              type="button"
              variant={status === option ? "default" : "outline-solid"}
              size="sm"
              className="h-auto rounded-full px-[clamp(0.9rem,1.4vw,1.25rem)] py-[clamp(0.4rem,0.6vw,0.5rem)] fluid-caption font-medium"
              onClick={() => void handleStatusChange(option)}
            >
              {STATUS_LABELS[option]}
            </Button>
          ))}
        </div>
        <div className="flex w-full gap-[clamp(0.5rem,0.8vw,0.7rem)] sm:w-auto">
          <Input
            placeholder="Szukaj po firmie, uzytkowniku, tytule..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="h-auto min-h-[2.75rem] rounded-full border border-border/60 bg-card/72 px-[clamp(1rem,1.4vw,1.25rem)] py-[clamp(0.5rem,0.8vw,0.65rem)] shadow-xs backdrop-blur-[36px]! fluid-caption"
          />
          <Button type="submit" className="h-auto rounded-full">
            Filtruj
          </Button>
        </div>
      </form>

      {banner ? (
        <div
          className="rounded-2xl border border-emerald-500/50 bg-emerald-500/10 p-[clamp(0.75rem,1.1vw,1rem)] text-emerald-600 fluid-caption dark:text-emerald-400"
          role="status"
        >
          {banner}
        </div>
      ) : null}

      {error ? (
        <div
          className="rounded-2xl border border-destructive/50 bg-destructive/10 p-[clamp(0.75rem,1.1vw,1rem)] text-destructive fluid-caption"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-col fluid-stack-xs">
          <div className="h-4 animate-pulse rounded bg-muted/70" />
          <div className="h-4 animate-pulse rounded bg-muted/60" />
          <div className="h-4 animate-pulse rounded bg-muted/50" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/40 p-[clamp(1.25rem,1.8vw,1.6rem)] text-center text-muted-foreground fluid-copy">
          Brak zgloszen dla wybranych filtrów.
        </div>
      ) : (
        <div className="flex flex-col fluid-stack-md">
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
        <Button
          disabled={loadingMore}
          onClick={() => void handleLoadMore()}
          variant="outline"
          className="rounded-full"
        >
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
    <article className="flex flex-col fluid-stack-md rounded-2xl border border-border/60 bg-card/72 p-[clamp(1rem,1.5vw,1.35rem)] shadow-xs backdrop-blur-[36px]!">
      <header className="flex flex-wrap items-start justify-between gap-[clamp(0.65rem,1vw,0.9rem)]">
        <div className="flex flex-col fluid-stack-xs">
          <p className="font-semibold text-foreground fluid-copy">{dispute.title}</p>
          <div className="flex flex-wrap items-center gap-[clamp(0.35rem,0.6vw,0.5rem)] text-muted-foreground fluid-caption">
            <span>{formatDateTime(dispute.createdAt)}</span>
            {dispute.company ? (
              <Link
                className="font-medium text-foreground transition-colors hover:text-primary hover:underline"
                href={`/firmy/${dispute.company.slug}`}
              >
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
        <Badge variant="outline" className={cn("px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] rounded-full", STATUS_BADGES[dispute.status])}>
          {STATUS_LABELS[dispute.status]}
        </Badge>
      </header>

      <p className="whitespace-pre-wrap text-foreground fluid-copy">{dispute.description}</p>

      <div className="grid gap-[clamp(0.35rem,0.6vw,0.5rem)] text-muted-foreground fluid-caption sm:grid-cols-2">
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
        <div className="flex flex-wrap gap-[clamp(0.35rem,0.6vw,0.5rem)] text-muted-foreground fluid-caption">
          {dispute.evidenceLinks.map((link) => (
            <Link key={link} className="underline" href={link} rel="noreferrer" target="_blank">
              Dowod
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid gap-[clamp(0.75rem,1.1vw,1rem)] lg:grid-cols-[200px_1fr]">
        <label className="flex flex-col fluid-stack-xs text-xs font-medium text-foreground">
          <span>Status sprawy</span>
          <Select value={statusDraft} onValueChange={(value) => setStatusDraft(value as DisputeStatus)}>
            <SelectTrigger className="h-11 w-full rounded-2xl border border-input bg-background px-[clamp(0.75rem,1.1vw,1rem)] text-foreground text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.filter((option) => option !== "ALL").map((option) => (
                <SelectItem key={option} value={option}>
                  {STATUS_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="flex flex-col fluid-stack-xs text-xs font-medium text-foreground">
          <span>Notatka dla zespolu (opcjonalnie)</span>
          <Textarea
            rows={3}
            placeholder="Opcjonalna notatka lub podsumowanie kontaktu."
            value={notesDraft}
            onChange={(event) => setNotesDraft(event.target.value)}
            className="min-h-[clamp(6rem,8vw,8rem)] rounded-2xl border-border/60 bg-card/80 px-[clamp(0.85rem,1.2vw,1.05rem)] py-[clamp(0.6rem,0.9vw,0.8rem)] fluid-copy shadow-xs"
          />
        </label>
      </div>

      {localError ? (
        <div
          className="rounded-2xl border border-destructive/50 bg-destructive/10 p-[clamp(0.5rem,0.75vw,0.65rem)] text-destructive fluid-caption"
          role="alert"
        >
          {localError}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-[clamp(0.5rem,0.8vw,0.7rem)]">
        <Button type="button" variant="outline" disabled={saving} onClick={handleAssignClick} className="rounded-full">
          Przejmij
        </Button>
        <Button type="button" disabled={saving} onClick={handleSaveClick} className="rounded-full">
          {saving ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
        {(dispute.status === "RESOLVED" || dispute.status === "REJECTED") && (
          <Button type="button" variant="destructive" disabled={saving} onClick={onDelete} className="rounded-full">
            <Trash2 className="mr-2 h-[clamp(0.9rem,0.5vw+0.75rem,1.05rem)] w-[clamp(0.9rem,0.5vw+0.75rem,1.05rem)]" />
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
