"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DisputeCase, DisputeStatus } from "@/lib/types";

type DisputeStatusFilter = DisputeStatus | "ALL";

const disputeStatusLabels: Record<DisputeStatusFilter, string> = {
  ALL: "Wszystkie",
  OPEN: "Otwarte",
  IN_REVIEW: "W trakcie analizy",
  WAITING_USER: "Czekamy na odpowiedź",
  RESOLVED: "Zamknięte",
  REJECTED: "Odrzucone",
};

const disputeStatusOptions: DisputeStatusFilter[] = [
  "ALL",
  "OPEN",
  "IN_REVIEW",
  "WAITING_USER",
  "RESOLVED",
  "REJECTED",
];

interface CreateDisputeFormPayload {
  companyId: string;
  planId?: string;
  title: string;
  category: string;
  description: string;
  requestedAmount?: number | null;
  requestedCurrency?: string | null;
  evidenceLinks?: string[];
}

interface DisputeCompanyOption {
  id: string;
  name: string;
  slug: string;
}

interface DisputesSectionProps {
  disputes: DisputeCase[];
  loading: boolean;
  error: string | null;
  status: DisputeStatusFilter;
  initialized: boolean;
  hasMore: boolean;
  submitting: boolean;
  message: string | null;
  companies: DisputeCompanyOption[];
  companiesLoading: boolean;
  companiesError: string | null;
  onReloadCompanies: () => void;
  onBack: () => void;
  onStatusChange: (value: DisputeStatusFilter) => void;
  onRetry: () => void;
  onLoadMore: () => void;
  onCreate: (payload: CreateDisputeFormPayload) => Promise<{ ok: boolean; error?: string }>;
}

function formatDisputeAmount(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function DisputesSection({
  disputes,
  loading,
  error,
  status,
  initialized,
  hasMore,
  submitting,
  message,
  companies,
  companiesLoading,
  companiesError,
  onReloadCompanies,
  onBack: _onBack,
  onStatusChange,
  onRetry,
  onLoadMore,
  onCreate,
}: DisputesSectionProps) {
  const [form, setForm] = useState({
    companyId: "",
    planId: "",
    title: "",
    category: "",
    description: "",
    requestedAmount: "",
    requestedCurrency: "USD",
    evidenceLinks: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (companiesLoading) {
      return;
    }

    setForm((previous) => {
      const firstCompanyId = companies[0]?.id ?? "";

      if (!firstCompanyId) {
        if (!previous.companyId) {
          return previous;
        }
        return { ...previous, companyId: "" };
      }

      const hasCurrent = companies.some((company) => company.id === previous.companyId);
      if (!hasCurrent) {
        return { ...previous, companyId: firstCompanyId };
      }

      return previous;
    });
  }, [companies, companiesLoading]);

  const handleChange = useCallback(
    (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
      setFormError(null);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);

      const trimmedTitle = form.title.trim();
      const trimmedCategory = form.category.trim();
      const trimmedDescription = form.description.trim();
      const trimmedCurrency = form.requestedCurrency.trim().toUpperCase();

      if (!form.companyId) {
        setFormError("Wybierz firmę z listy.");
        return;
      }

      if (trimmedTitle.length < 5) {
        setFormError("Tytuł powinien mieć co najmniej 5 znaków.");
        return;
      }

      if (trimmedCategory.length < 2) {
        setFormError("Kategoria jest wymagana.");
        return;
      }

      if (trimmedDescription.length < 20) {
        setFormError("Opis powinien mieć co najmniej 20 znaków.");
        return;
      }

      let amount: number | undefined;
      const normalizedAmount = form.requestedAmount.trim().replace(",", ".");
      if (normalizedAmount.length > 0) {
        const parsed = Number.parseFloat(normalizedAmount);
        if (Number.isNaN(parsed) || parsed < 0) {
          setFormError("Kwota roszczenia musi być liczbą dodatnią.");
          return;
        }
        amount = parsed;
      }

      const evidenceLinks = form.evidenceLinks
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
        .slice(0, 10);

      const result = await onCreate({
        companyId: form.companyId,
        planId: form.planId.trim() || undefined,
        title: trimmedTitle,
        category: trimmedCategory,
        description: trimmedDescription,
        requestedAmount: amount ?? undefined,
        requestedCurrency: trimmedCurrency || undefined,
        evidenceLinks: evidenceLinks.length ? evidenceLinks : undefined,
      });

      if (!result.ok) {
        setFormError(result.error ?? "Nie udało się wysłać zgłoszenia.");
        return;
      }

      setForm({
        companyId: companies[0]?.id ?? "",
        planId: "",
        title: "",
        category: "",
        description: "",
        requestedAmount: "",
        requestedCurrency: "USD",
        evidenceLinks: "",
      });
    },
    [companies, form, onCreate],
  );

  const noCompaniesAvailable =
    !companiesLoading && !companiesError && companies.length === 0;

  const canSubmit =
    !submitting &&
    !!form.companyId &&
    form.title.trim().length >= 5 &&
    form.category.trim().length >= 2 &&
    form.description.trim().length >= 20 &&
    !companiesLoading &&
    companies.length > 0;

  return (
    <div className="space-y-4">
      <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Zgłoszenia i pomoc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <Label className="flex items-center gap-2">
              <span>Status</span>
              <Select value={status} onValueChange={(value) => onStatusChange(value as DisputeStatusFilter)}>
                <SelectTrigger className="h-9 w-[160px] rounded-lg border border-border/40 bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {disputeStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {disputeStatusLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>

            {companiesLoading ? (
              <span className="text-xs text-muted-foreground">Ładowanie firm…</span>
            ) : companiesError ? (
              <Alert variant="destructive" className="py-2 rounded-lg border border-border/40">
                <AlertDescription className="flex items-center gap-2">
                  <span>{companiesError}</span>
                  <Button size="sm" variant="outline" onClick={onReloadCompanies} disabled={companiesLoading} className="rounded-lg">
                    Spróbuj ponownie
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

          {error ? (
            <Alert variant="destructive" className="mt-4 rounded-lg border border-border/40">
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button size="sm" variant="outline" onClick={onRetry} className="rounded-lg">
                    Spróbuj ponownie
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {disputes.map((item) => (
          <Card key={item.id} className="rounded-lg border border-border/40 bg-background/60 shadow-xs transition-all hover:shadow-md">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(item.createdAt)}</span>
                      <Badge variant="outline" className="rounded-full text-xs">
                        {disputeStatusLabels[item.status]}
                      </Badge>
                      {item.company ? (
                        <Link className="hover:underline hover:text-primary transition-colors" href={`/firmy/${item.company.slug}`}>
                          {item.company.name}
                        </Link>
                      ) : null}
                      {item.plan ? <span>Plan: {item.plan.name}</span> : null}
                    </div>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{item.description}</p>
                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  {item.requestedAmount !== null && item.requestedCurrency ? (
                    <span>
                      Roszczenie: <strong>{formatDisputeAmount(item.requestedAmount, item.requestedCurrency)}</strong>
                    </span>
                  ) : null}
                  {item.assignedAdmin ? (
                    <span>
                      Opiekun: <strong>{item.assignedAdmin.displayName ?? item.assignedAdmin.email ?? item.assignedAdmin.clerkId}</strong>
                    </span>
                  ) : null}
                </div>
                {item.evidenceLinks?.length ? (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {item.evidenceLinks.map((link) => (
                      <Link key={link} className="underline hover:text-primary transition-colors" href={link} target="_blank" rel="noreferrer">
                        Dowód
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}

        {!error && !loading && initialized && disputes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak zgłoszeń dla wybranych filtrów.</p>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        ) : null}

        {!error && hasMore ? (
          <Button className="w-full rounded-lg" size="sm" variant="outline" onClick={onLoadMore}>
            Wczytaj więcej
          </Button>
        ) : null}
      </div>

      {/* Create form */}
      <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Zgłoś problem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message ? (
            <Alert className="border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg border border-border/40">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}

          {formError ? (
            <Alert variant="destructive" className="rounded-lg border border-border/40">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <form className="grid gap-3" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label>Firma</Label>
              <Select
                value={form.companyId || undefined}
                onValueChange={(value) => {
                  setForm((prev) => ({ ...prev, companyId: value }));
                  setFormError(null);
                }}
                disabled={submitting || companiesLoading || noCompaniesAvailable}
                required
              >
                <SelectTrigger className="rounded-lg border border-border/40 bg-background/60">
                  <SelectValue placeholder="Wybierz firmę" />
                </SelectTrigger>
                <SelectContent>
                  {(companies ?? []).map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tytuł</Label>
                <Input value={form.title} onChange={handleChange("title")} required className="rounded-lg border border-border/40 bg-background/60" />
              </div>
              <div className="space-y-2">
                <Label>Kategoria</Label>
                <Input value={form.category} onChange={handleChange("category")} required className="rounded-lg border border-border/40 bg-background/60" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea rows={4} value={form.description} onChange={handleChange("description")} required className="rounded-lg border border-border/40 bg-background/60" />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Kwota roszczenia (opcjonalnie)</Label>
                <Input inputMode="decimal" placeholder="np. 99.99" value={form.requestedAmount} onChange={handleChange("requestedAmount")} className="rounded-lg border border-border/40 bg-background/60" />
              </div>
              <div className="space-y-2">
                <Label>Waluta</Label>
                <Input maxLength={3} value={form.requestedCurrency} onChange={handleChange("requestedCurrency")} className="rounded-lg border border-border/40 bg-background/60" />
              </div>
              <div className="space-y-2">
                <Label>ID planu (opcjonalnie)</Label>
                <Input value={form.planId} onChange={handleChange("planId")} placeholder="cuid planu" className="rounded-lg border border-border/40 bg-background/60" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Linki dowodów (po jednym w wierszu)</Label>
              <Textarea rows={3} value={form.evidenceLinks} onChange={handleChange("evidenceLinks")} className="rounded-lg border border-border/40 bg-background/60" />
            </div>

            <CardFooter className="px-0 pb-0 flex justify-end gap-2">
              <Button type="submit" disabled={!canSubmit} variant="default" className="rounded-lg">
                {submitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

