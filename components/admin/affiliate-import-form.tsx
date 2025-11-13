"use client";

import { useState, useTransition } from "react";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

interface CompanyOption {
  id: string;
  name: string;
  slug: string;
}

interface AffiliateImportFormProps {
  companies: CompanyOption[];
}

export function AffiliateImportForm({ companies }: AffiliateImportFormProps) {
  const [formState, setFormState] = useState({
    companySlug: companies[0]?.slug ?? "",
    platform: "",
    externalId: "",
    userEmail: "",
    amount: "",
    currency: "USD",
    points: "",
    purchaseAt: "",
    notes: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!formState.companySlug) {
      setError("Wybierz firmę.");
      return;
    }
    if (!formState.externalId.trim()) {
      setError("Podaj identyfikator transakcji (externalId).");
      return;
    }
    const parsedPoints = Number.parseInt(formState.points, 10);
    if (!Number.isInteger(parsedPoints) || parsedPoints <= 0) {
      setError("Liczba punktów musi być dodatnią liczbą całkowitą.");
      return;
    }

    let amountValue: number | undefined;
    if (formState.amount) {
      amountValue = Number.parseFloat(formState.amount);
      if (Number.isNaN(amountValue) || amountValue < 0) {
        setError("Kwota zakupu musi być wartością dodatnią.");
        return;
      }
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/affiliates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companySlug: formState.companySlug,
            externalId: formState.externalId.trim(),
            platform: formState.platform.trim() || undefined,
            userEmail: formState.userEmail.trim() || undefined,
            amount: amountValue,
            currency: formState.currency.trim() || undefined,
            points: parsedPoints,
            purchaseAt: formState.purchaseAt
              ? new Date(formState.purchaseAt)
              : undefined,
            notes: formState.notes.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const message =
            typeof data?.error === "string"
              ? data.error
              : "Nie udało się zaimportować transakcji.";
          setError(message);
          return;
        }

        setMessage("Transakcja afiliacyjna została dodana do weryfikacji.");
        setFormState((state) => ({
          ...state,
          externalId: "",
          notes: "",
          points: "",
          amount: "",
        }));
      } catch (err) {
        console.error(err);
        setError("Nie udało się nawiązać połączenia z serwerem.");
      }
    });
  };

  return (
    <form className="flex flex-col fluid-stack-sm" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="company-slug">Firma</Label>
          <Select
            disabled={isPending || companies.length === 0}
            value={formState.companySlug}
            onValueChange={(value) =>
              setFormState((state) => ({
                ...state,
                companySlug: value,
              }))
            }
          >
            <SelectTrigger id="company-slug">
              <SelectValue placeholder={companies.length === 0 ? "Brak dostępnych firm" : "Wybierz firmę"} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.slug}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="external-id">
            Identyfikator transakcji
          </Label>
          <Input
            id="external-id"
            required
            placeholder="ID z sieci afiliacyjnej"
            value={formState.externalId}
            onChange={(event) =>
              setFormState((state) => ({
                ...state,
                externalId: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="platform">Platforma</Label>
          <Input
            id="platform"
            placeholder="np. Impact, Partnerize"
            value={formState.platform}
            onChange={(event) =>
              setFormState((state) => ({
                ...state,
                platform: event.target.value,
              }))
            }
          />
        </div>
        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="user-email">Email użytkownika</Label>
          <Input
            id="user-email"
            type="email"
            placeholder="uzytkownik@example.com"
            value={formState.userEmail}
            onChange={(event) =>
              setFormState((state) => ({
                ...state,
                userEmail: event.target.value,
              }))
            }
          />
        </div>
        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="purchase-at">
            Data zakupu (opcjonalnie)
          </Label>
          <Input
            id="purchase-at"
            type="date"
            value={formState.purchaseAt}
            onChange={(event) =>
              setFormState((state) => ({
                ...state,
                purchaseAt: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="amount">Kwota zakupu</Label>
          <Input
            id="amount"
            inputMode="decimal"
            placeholder="np. 199.00"
            value={formState.amount}
            onChange={(event) =>
              setFormState((state) => ({
                ...state,
                amount: event.target.value,
              }))
            }
          />
        </div>
        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="currency">Waluta</Label>
          <Input
            id="currency"
            maxLength={6}
            value={formState.currency}
            onChange={(event) =>
              setFormState((state) => ({
                ...state,
                currency: event.target.value.toUpperCase(),
              }))
            }
          />
        </div>
        <div className="flex flex-col fluid-stack-xs">
          <Label htmlFor="points">Punkty cashback</Label>
          <Input
            id="points"
            required
            inputMode="numeric"
            placeholder="np. 25"
            value={formState.points}
            onChange={(event) =>
              setFormState((state) => ({
                ...state,
                points: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="flex flex-col fluid-stack-xs">
        <Label htmlFor="notes">
          Notatka (opcjonalnie)
        </Label>
        <Textarea
          id="notes"
          maxLength={260}
          placeholder="Wewnętrzna notatka dla zespołu"
          rows={3}
          value={formState.notes}
          onChange={(event) =>
            setFormState((state) => ({
              ...state,
              notes: event.target.value,
            }))
          }
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert className="border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <Button disabled={isPending || companies.length === 0} type="submit">
        {isPending ? "Importowanie..." : "Dodaj transakcję"}
      </Button>
    </form>
  );
}

