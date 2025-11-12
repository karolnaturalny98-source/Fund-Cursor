"use client";

import { useMemo, useState } from "react";
import { useFadeIn } from "@/lib/animations";
import { cn } from "@/lib/utils";

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
import type { CompanyPlan } from "@/lib/types";

interface ReportIssueFormProps {
  companyId: string;
  companySlug: string;
  plans: Array<Pick<CompanyPlan, "id" | "name">>;
}

type FormState = "idle" | "submitting" | "success" | "error";

const ISSUE_CATEGORIES: Array<{ value: string; label: string }> = [
  { value: "pricing", label: "Cena / waluta planu" },
  { value: "cashback", label: "Cashback lub punkty" },
  { value: "rules", label: "Zasady wyzwania" },
  { value: "links", label: "Linki lub dane kontaktowe" },
  { value: "other", label: "Inny problem" },
];

export function ReportIssueForm({
  companyId,
  companySlug,
  plans,
}: ReportIssueFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("");
  const [planId, setPlanId] = useState<string | undefined>(undefined);

  const hasPlans = plans.length > 0;

  const planOptions = useMemo(() => {
    return plans.map((plan) => ({
      value: plan.id,
      label: plan.name,
    }));
  }, [plans]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const categoryValue = category.trim();
    const planIdRaw = planId?.trim() || "";
    const email = (form.get("email") as string | null)?.trim() ?? "";
    const description = (form.get("description") as string | null)?.trim() ?? "";

    if (!categoryValue) {
      setState("error");
      setErrorMessage("Wybierz kategorie problemu.");
      return;
    }

    if (!description || description.length < 10) {
      setState("error");
      setErrorMessage("Opisz problem (minimum 10 znakow).");
      return;
    }

    setState("submitting");
    setErrorMessage(null);

    const payload = {
      companyId,
      planId: planIdRaw || null,
      category: categoryValue,
      description,
      email: email || null,
      source: "company_detail",
    };

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(
          data?.error ?? "Nie udalo sie zapisac zgloszenia. Sprobuj ponownie.",
        );
      }

      if (navigator.sendBeacon) {
        const beaconPayload = JSON.stringify({
          companySlug,
          source: `report_issue_submit:${categoryValue}`,
        });
        const blob = new Blob([beaconPayload], { type: "application/json" });
        navigator.sendBeacon("/api/clicks", blob);
      } else {
        fetch("/api/clicks", {
          method: "POST",
          body: JSON.stringify({
            companySlug,
            source: `report_issue_submit:${categoryValue}`,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          keepalive: true,
        }).catch(() => {
          // silently ignore telemetry errors
        });
      }

      event.currentTarget.reset();
      setCategory("");
      setPlanId(undefined);
      setState("success");
    } catch (error) {
      console.error("Failed to submit data issue report:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nie udalo sie zapisac zgloszenia. Sprobuj ponownie.",
      );
      setState("error");
    }
  }

  const formAnim = useFadeIn();

  return (
    <div ref={formAnim.ref} className={formAnim.className}>
    <form
      className={cn("space-y-4")}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="report-issue-title"
    >
      <div className="space-y-2">
        <h3 id="report-issue-title" className="text-lg font-semibold text-foreground">
          Zglos blad w danych
        </h3>
        <p className="text-sm text-muted-foreground">
          Znalezles nieaktualne informacje lub blad w opisach? Daj nam znac, a
          zweryfikujemy dane przed publikacja.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase text-muted-foreground">
          Kategoria
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger variant="premium">
              <SelectValue placeholder="Wybierz kategorie" />
            </SelectTrigger>
            <SelectContent variant="premium">
              {ISSUE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="category" value={category} />
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold uppercase text-muted-foreground">
          Plan (opcjonalnie)
          <Select value={planId || undefined} onValueChange={(value) => setPlanId(value || undefined)} disabled={!hasPlans}>
            <SelectTrigger variant="premium">
              <SelectValue placeholder={hasPlans ? "Zglos ogolny blad" : "Brak planow"} />
            </SelectTrigger>
            <SelectContent variant="premium">
              {planOptions.map((plan) => (
                <SelectItem key={plan.value} value={plan.value}>
                  {plan.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="planId" value={planId || ""} />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-xs font-semibold uppercase text-muted-foreground">
        Opis problemu
        <Textarea
          name="description"
          placeholder="Opisz, co Twoim zdaniem jest niezgodne z prawda. Mozesz dolaczyc link do zrodla."
          minLength={10}
          maxLength={2000}
          rows={4}
          required
          variant="premium"
        />
      </label>

      <label className="flex flex-col gap-2 text-xs font-semibold uppercase text-muted-foreground">
        Kontakt (opcjonalnie)
        <Input
          name="email"
          type="email"
          placeholder="Twoj email (tylko jezeli chcesz otrzymac odpowiedz)"
          inputMode="email"
          variant="premium"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className="text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {state === "success"
            ? "Dziekujemy! Moderacja zweryfikuje zgloszenie."
            : state === "error" && errorMessage
              ? errorMessage
              : "Moderatorzy sprawdza Twoje zgloszenie przed aktualizacja danych."}
        </p>
        <Button
          type="submit"
          disabled={state === "submitting"}
          variant="premium"
          className="w-full sm:w-auto"
        >
          {state === "submitting" ? "Wysylanie..." : "Zglos blad w danych"}
        </Button>
      </div>
    </form>
    </div>
  );
}
