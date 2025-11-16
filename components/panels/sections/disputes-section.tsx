"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { DisputeCase } from "@/lib/types";
import type { CreateDisputePayload, DisputeStatusFilter } from "@/components/panels/hooks/use-user-disputes";

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
  onCreate: (payload: CreateDisputePayload) => Promise<{ ok: boolean; error?: string }>;
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
    <div className="space-y-[clamp(1.5rem,2.2vw,2.1rem)]">
      <Card className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
          <CardTitle className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Zgłoszenia i pomoc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-[clamp(0.65rem,1vw,0.9rem)]">
          <div className="flex flex-wrap items-center gap-[clamp(0.55rem,0.85vw,0.8rem)] text-muted-foreground fluid-caption">
            <Label className="flex items-center gap-[clamp(0.4rem,0.6vw,0.55rem)] text-foreground">
              <span className="font-medium">Status</span>
              <Select value={status} onValueChange={(value) => onStatusChange(value as DisputeStatusFilter)}>
                <SelectTrigger className="h-[clamp(2.55rem,1.8vw+2rem,2.9rem)] w-[clamp(10rem,18vw,11.5rem)] rounded-2xl border border-border/60 bg-background/60 px-[clamp(0.85rem,1.3vw,1.15rem)] text-[clamp(0.88rem,0.35vw+0.78rem,0.98rem)] font-medium text-foreground shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/40">
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
              <span className="fluid-caption text-muted-foreground">Ładowanie firm…</span>
            ) : companiesError ? (
              <Alert variant="destructive" className="rounded-2xl border border-border/60 bg-destructive/10 py-[clamp(0.85rem,1.2vw,1.1rem)]">
                <AlertDescription className="flex flex-wrap items-center gap-[clamp(0.55rem,0.85vw,0.8rem)] fluid-caption text-destructive-foreground">
                  <span>{companiesError}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onReloadCompanies}
                    disabled={companiesLoading}
                    className="rounded-full"
                  >
                    Spróbuj ponownie
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

          {error ? (
            <Alert variant="destructive" className="mt-[clamp(0.75rem,1.1vw,1rem)] rounded-2xl border border-border/60">
              <AlertDescription className="flex flex-wrap items-center justify-between gap-[clamp(0.55rem,0.85vw,0.8rem)] fluid-caption text-destructive-foreground">
                <div className="space-y-[clamp(0.25rem,0.4vw,0.35rem)]">
                  <span>{error}</span>
                </div>
                <Button size="sm" variant="outline" onClick={onRetry} className="rounded-full">
                  Spróbuj ponownie
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
        {disputes.map((item) => (
          <Card
            key={item.id}
            className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[32px]! shadow-xs transition-all duration-300 hover:border-primary/35 hover:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]"
          >
            <CardContent className="p-[clamp(1.1rem,1.6vw,1.4rem)]">
              <div className="space-y-[clamp(0.55rem,0.85vw,0.8rem)]">
                <div className="flex items-start justify-between gap-[clamp(0.55rem,0.85vw,0.8rem)]">
                  <div className="flex-1 space-y-[clamp(0.3rem,0.45vw,0.4rem)]">
                    <p className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold text-foreground">
                      {item.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                      <span>{formatDate(item.createdAt)}</span>
                      <Badge variant="outline" className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] rounded-full font-medium">
                        {disputeStatusLabels[item.status]}
                      </Badge>
                      {item.company ? (
                        <Link
                          className="transition-colors hover:text-primary hover:underline"
                          href={`/firmy/${item.company.slug}`}
                        >
                          {item.company.name}
                        </Link>
                      ) : null}
                      {item.plan ? <span>Plan: {item.plan.name}</span> : null}
                    </div>
                  </div>
                </div>
                <p className="whitespace-pre-wrap fluid-copy text-muted-foreground">{item.description}</p>
                <div className="grid gap-[clamp(0.35rem,0.5vw,0.45rem)] text-muted-foreground/90 fluid-caption sm:grid-cols-2">
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
                  <div className="flex flex-wrap gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                    {item.evidenceLinks.map((link) => (
                      <Link
                        key={link}
                        className="underline transition-colors hover:text-primary"
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                      >
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
          <p className="fluid-copy text-muted-foreground">Brak zgłoszeń dla wybranych filtrów.</p>
        ) : null}

        {loading ? (
          <div className="space-y-[clamp(0.65rem,1vw,0.9rem)]">
            <Skeleton className="h-[clamp(8rem,12vw,10rem)] rounded-2xl" />
            <Skeleton className="h-[clamp(8rem,12vw,10rem)] rounded-2xl" />
          </div>
        ) : null}

        {!error && hasMore ? (
          <Button className="w-full rounded-full" size="sm" variant="outline" onClick={onLoadMore}>
            Wczytaj więcej
          </Button>
        ) : null}
      </div>

      {/* Create form */}
      <Card className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
          <CardTitle className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Zgłoś problem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
          {message ? (
            <Alert className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <AlertDescription className="fluid-caption">{message}</AlertDescription>
            </Alert>
          ) : null}

          {formError ? (
            <Alert variant="destructive" className="rounded-2xl border border-border/60">
              <AlertDescription className="fluid-caption text-destructive-foreground">
                {formError}
              </AlertDescription>
            </Alert>
          ) : null}

          <form className="grid gap-[clamp(0.85rem,1.2vw,1.1rem)]" onSubmit={handleSubmit} noValidate>
            <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
              <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                Firma
              </Label>
              <Select
                value={form.companyId || undefined}
                onValueChange={(value) => {
                  setForm((prev) => ({ ...prev, companyId: value }));
                  setFormError(null);
                }}
                disabled={submitting || companiesLoading || noCompaniesAvailable}
                required
              >
                <SelectTrigger className="h-[clamp(2.75rem,2vw+2.25rem,3.1rem)] rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40">
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

            <div className="grid gap-[clamp(0.75rem,1.1vw,1rem)] md:grid-cols-2">
              <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
                <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                  Tytuł
                </Label>
                <Input
                  value={form.title}
                  onChange={handleChange("title")}
                  required
                  className="h-[clamp(2.75rem,2vw+2.25rem,3.1rem)] rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
              <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
                <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                  Kategoria
                </Label>
                <Input
                  value={form.category}
                  onChange={handleChange("category")}
                  required
                  className="h-[clamp(2.75rem,2vw+2.25rem,3.1rem)] rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
            </div>

            <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
              <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                Opis
              </Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={handleChange("description")}
                required
                className="rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] py-[clamp(0.85rem,1.2vw,1.1rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>

            <div className="grid gap-[clamp(0.75rem,1.1vw,1rem)] md:grid-cols-3">
              <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
                <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                  Kwota roszczenia (opcjonalnie)
                </Label>
                <Input
                  inputMode="decimal"
                  placeholder="np. 99.99"
                  value={form.requestedAmount}
                  onChange={handleChange("requestedAmount")}
                  className="h-[clamp(2.75rem,2vw+2.25rem,3.1rem)] rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
              <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
                <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                  Waluta
                </Label>
                <Input
                  maxLength={3}
                  value={form.requestedCurrency}
                  onChange={handleChange("requestedCurrency")}
                  className="h-[clamp(2.75rem,2vw+2.25rem,3.1rem)] rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
              <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
                <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                  ID planu (opcjonalnie)
                </Label>
                <Input
                  value={form.planId}
                  onChange={handleChange("planId")}
                  placeholder="cuid planu"
                  className="h-[clamp(2.75rem,2vw+2.25rem,3.1rem)] rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
            </div>

            <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
              <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                Linki dowodów (po jednym w wierszu)
              </Label>
              <Textarea
                rows={3}
                value={form.evidenceLinks}
                onChange={handleChange("evidenceLinks")}
                className="rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] py-[clamp(0.85rem,1.2vw,1.1rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>

            <CardFooter className="flex justify-end gap-[clamp(0.65rem,1vw,0.9rem)] px-0 pb-0">
              <Button type="submit" disabled={!canSubmit} variant="default" className="rounded-full">
                {submitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
