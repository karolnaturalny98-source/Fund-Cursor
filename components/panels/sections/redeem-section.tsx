"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RedeemCompanyOffer, RedeemPlanOption } from "@/lib/types";

interface RedeemSectionProps {
  available: number;
  offers: RedeemCompanyOffer[] | null;
  offersState: "idle" | "loading" | "success" | "error";
  offersError: string | null;
  onReloadOffers: () => void;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (code?: string) => void;
}

export function RedeemSection({
  available,
  offers,
  offersState,
  offersError,
  onReloadOffers,
  onCancel: _onCancel,
  onSuccess,
  onError,
}: RedeemSectionProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [points, setPoints] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const pointsInputId = "wallet-redeem-points";
  const companySelectId = "wallet-redeem-company";
  const planSelectId = "wallet-redeem-plan";
  const notesInputId = "wallet-redeem-notes";

  const selectedCompany = useMemo(() => {
    return offers?.find((company) => company.id === selectedCompanyId) ?? null;
  }, [offers, selectedCompanyId]);

  const availablePlans: RedeemPlanOption[] = useMemo(() => {
    if (!selectedCompany) {
      return [];
    }
    return selectedCompany.plans.filter((plan: RedeemPlanOption) => plan.currency === "USD");
  }, [selectedCompany]);

  const selectedPlan: RedeemPlanOption | null = useMemo(() => {
    if (!availablePlans.length) {
      return null;
    }
    return (
      availablePlans.find((plan) => plan.id === selectedPlanId) ??
      availablePlans[0] ??
      null
    );
  }, [availablePlans, selectedPlanId]);

  useEffect(() => {
    setSelectedPlanId("");
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedPlan) {
      setPoints(selectedPlan.price.toString());
    } else {
      setPoints("");
    }
  }, [selectedPlan]);

  const planCost = selectedPlan ? Math.round(selectedPlan.price) : null;
  const insufficientPoints = planCost !== null && planCost > available;

  const clearForm = useCallback(() => {
    setSelectedCompanyId("");
    setSelectedPlanId("");
    setPoints("");
    setNotes("");
    setFormError(null);
    setStatusMessage(null);
  }, []);

  const handleCompanyChange = useCallback((companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedPlanId("");
    setPoints("");
    setFormError(null);
    setStatusMessage(null);
  }, []);

  const handlePlanChange = useCallback((planId: string) => {
    setSelectedPlanId(planId);
    setFormError(null);
    setStatusMessage(null);
  }, []);

  const canRedeemSubmit =
    !submitting &&
    Boolean(selectedCompany) &&
    Boolean(selectedPlan) &&
    planCost !== null &&
    !insufficientPoints &&
    offersState !== "loading";

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setFormError(null);
      setStatusMessage(null);

      if (!selectedCompany) {
        setFormError("Wybierz firmę z listy.");
        onError("validation_company");
        return;
      }

      if (!selectedPlan) {
        setFormError("Wybierz plan lub konto do zakupu.");
        onError("validation_plan");
        return;
      }

      if (planCost === null) {
        setFormError("Plan ma niepoprawną cenę, skontaktuj się z obsługą.");
        onError("invalid_plan_price");
        return;
      }

      if (!Number.isFinite(planCost) || planCost <= 0) {
        setFormError("Plan ma niepoprawną cenę, skontaktuj się z obsługą.");
        onError("invalid_plan_price");
        return;
      }

      if (planCost > available) {
        setFormError(
          `Masz dostępne ${available.toLocaleString(
            "pl-PL",
          )} punktów. Plan kosztuje ${planCost.toLocaleString(
            "pl-PL",
          )} punktów.`,
        );
        onError("insufficient_points");
        return;
      }

      setSubmitting(true);

      const payload = {
        points: planCost,
        companySlug: selectedCompany.slug,
        companyId: selectedCompany.id,
        planLabel: selectedPlan.name,
        notes: notes.trim() || undefined,
      };

      try {
        const response = await fetch("/api/wallet/redeem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let message = "Nie udało się wysłać wniosku.";
          let errorCode = "request_failed";

          try {
            const body = await response.json();

            if (body?.error === "INSUFFICIENT_POINTS" && body?.available) {
              message = `Masz dostępne ${body.available} punktów. Zmień kwotę i spróbuj ponownie.`;
              errorCode = "insufficient_points";
            } else if (body?.error === "VALIDATION_ERROR") {
              message = "Sprawdź dane i spróbuj ponownie.";
              errorCode = "validation_api";
            } else if (typeof body?.error === "string") {
              message = body.error;
              errorCode = body.error;
            }
          } catch {
            // ignore parse issues
          }

          setFormError(message);
          onError(errorCode);
          return;
        }

        setStatusMessage("Wniosek wysłany. Sprawdź status w zakładce Historia.");
        clearForm();
        onSuccess();
      } catch (error) {
        console.error("wallet redeem network error", error);
        setFormError("Nie udało się wysłać wniosku. Spróbuj ponownie później.");
        onError("network");
      } finally {
        setSubmitting(false);
      }
    },
    [
      available,
      clearForm,
      notes,
      planCost,
      onError,
      onSuccess,
      selectedCompany,
      selectedPlan,
    ],
  );

  const lowerError = formError?.toLowerCase() ?? "";
  const companyFieldError = lowerError.includes("firm");

  return (
    <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Wniosek o konto
          </CardTitle>
        </div>
        <CardDescription>
          Dostępne punkty: <span className="font-semibold">{available.toLocaleString("pl-PL")}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formError ? (
          <Alert variant="destructive" id="wallet-redeem-error" className="rounded-lg border border-border/40">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}
        {statusMessage ? (
          <Alert className="border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg border border-border/40" id="wallet-redeem-status">
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        ) : null}

        {offersState === "loading" ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : null}
        {offersState === "error" ? (
          <Alert variant="destructive" className="rounded-lg border border-border/40">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{offersError ?? "Nie udało się pobrać listy ofert."}</span>
                <Button className="mt-2 rounded-lg" size="sm" variant="outline" type="button" onClick={onReloadOffers}>
                  Spróbuj ponownie
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}
        {offersState === "success" && (offers?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            Obecnie brak ofert wymiany. Skontaktuj się z obsługą, aby dodać nowe konta.
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={companySelectId}>Firma</Label>
              <Select
                value={selectedCompanyId || undefined}
                onValueChange={handleCompanyChange}
                disabled={submitting || offersState === "loading" || offersState === "error" || !offers?.length}
              >
                <SelectTrigger id={companySelectId} aria-invalid={companyFieldError || undefined} aria-describedby={companyFieldError ? "wallet-redeem-error" : undefined} className="rounded-lg border border-border/40 bg-background/60">
                  <SelectValue placeholder="Wybierz firmę" />
                </SelectTrigger>
                <SelectContent>
                  {(offers ?? []).map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={planSelectId}>Plan lub konto</Label>
              <Select
                value={selectedPlanId || undefined}
                onValueChange={handlePlanChange}
                disabled={submitting || !availablePlans.length}
              >
                <SelectTrigger id={planSelectId} aria-invalid={lowerError.includes("plan") || undefined} aria-describedby={lowerError.includes("plan") ? "wallet-redeem-error" : undefined} className="rounded-lg border border-border/40 bg-background/60">
                  <SelectValue placeholder={selectedCompany ? "Wybierz plan" : "Najpierw wybierz firmę"} />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} – {plan.price.toLocaleString("pl-PL")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedCompany && offersState === "success" ? (
                <p className="text-xs text-muted-foreground">Wybierz firmę, aby zobaczyć dostępne konta.</p>
              ) : null}
              {selectedCompany && !availablePlans.length ? (
                <p className="text-xs text-muted-foreground">
                  Brak planów w walucie USD dla wybranej firmy.
                </p>
              ) : null}
            </div>
          </div>

          {selectedPlan ? (
            <p className="text-xs text-muted-foreground">
              Wybrany plan kosztuje {planCost?.toLocaleString("pl-PL")} punktów (1 punkt = 1 USD).
            </p>
          ) : null}
          {insufficientPoints ? (
            <Alert variant="destructive" className="rounded-lg border border-border/40">
              <AlertDescription>
                Masz {available.toLocaleString("pl-PL")} punktów, potrzebujesz {planCost?.toLocaleString("pl-PL")} punktów.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={pointsInputId}>Liczba punktów</Label>
              <Input
                id={pointsInputId}
                inputMode="numeric"
                min={1}
                readOnly
                value={points}
                aria-readonly
                aria-invalid={lowerError.includes("punkt") || undefined}
                aria-describedby={lowerError.includes("punkt") ? "wallet-redeem-error" : undefined}
                className="rounded-lg border border-border/40 bg-background/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={notesInputId}>Notatka (opcjonalnie)</Label>
              <Textarea
                id={notesInputId}
                placeholder="Informacje dla zespołu"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={submitting}
                className="rounded-lg border border-border/40 bg-background/60"
              />
            </div>
          </div>

          <CardFooter className="px-0 pb-0 flex flex-wrap gap-2">
            <Button
              disabled={!canRedeemSubmit}
              type="submit"
              variant="default"
              className="rounded-lg"
            >
              {submitting ? "Wysyłanie..." : "Wyślij wniosek"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={clearForm}
              disabled={submitting}
              className="rounded-lg"
            >
              Wyczyść
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}

