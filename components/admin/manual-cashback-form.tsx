"use client";

import { useRouter } from "next/navigation";
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
import type { Company } from "@/lib/types";

interface ManualCashbackFormProps {
  companies: Array<Pick<Company, "id" | "name" | "slug">>;
}

const STATUS_OPTIONS: Array<{ value: "PENDING" | "APPROVED" | "REDEEMED"; label: string }> =
  [
    { value: "APPROVED", label: "Zatwierdzone (dostępne od razu)" },
    { value: "PENDING", label: "Oczekujące (do ręcznej weryfikacji)" },
    { value: "REDEEMED", label: "Zrealizowane (od razu wydane)" },
  ];

export function ManualCashbackForm({ companies }: ManualCashbackFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState({
    companySlug: companies[0]?.slug ?? "",
    clerkId: "",
    email: "",
    points: "",
    status: "APPROVED" as (typeof STATUS_OPTIONS)[number]["value"],
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formState.companySlug) {
      setError("Wybierz firmę, dla której chcesz dodać punkty.");
      return;
    }

    const parsedPoints = Number.parseInt(formState.points, 10);

    if (!Number.isInteger(parsedPoints) || parsedPoints <= 0) {
      setError("Podaj dodatnią liczbę punktów.");
      return;
    }

    if (!formState.clerkId && !formState.email) {
      setError("Podaj Clerk ID lub email użytkownika.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/cashback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companySlug: formState.companySlug,
            points: parsedPoints,
            status: formState.status,
            notes: formState.notes.trim() || undefined,
            clerkId: formState.clerkId.trim() || undefined,
            email: formState.email.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const message =
            payload?.error ?? "Nie udało się utworzyć transakcji cashback.";
          setError(message);
          return;
        }

        setSuccess("Transakcja została dodana.");
        setFormState((state) => ({
          ...state,
          points: "",
          notes: "",
        }));
        router.refresh();
      } catch (err) {
        console.error(err);
        setError("Wystąpił błąd sieci podczas zapisu transakcji.");
      }
    });
  };

  return (
    <form className="flex flex-col fluid-stack-sm" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col fluid-stack-xs text-sm">
          <span className="font-medium text-foreground">Firma</span>
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
            <SelectTrigger>
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
        </label>

        <label className="flex flex-col fluid-stack-xs text-sm">
          <span className="font-medium text-foreground">Punkty</span>
          <Input
            inputMode="numeric"
            min={1}
            placeholder="np. 50"
            required
            type="number"
            value={formState.points}
            onChange={(event) =>
              setFormState((state) => ({
                ...state,
                points: event.target.value,
              }))
            }
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col fluid-stack-xs text-sm">
          <span className="font-medium text-foreground">Clerk ID</span>
          <Input
            placeholder="clerk_usr_123..."
            value={formState.clerkId}
            onChange={(event) =>
              setFormState((state) => ({
                ...state,
                clerkId: event.target.value,
              }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Opcjonalne, ale zalecane. Użyj gdy znasz Clerk ID użytkownika.
          </p>
        </label>

        <label className="flex flex-col fluid-stack-xs text-sm">
          <span className="font-medium text-foreground">Email użytkownika</span>
          <Input
            placeholder="uzytkownik@example.com"
            type="email"
            value={formState.email}
            onChange={(event) =>
              setFormState((state) => ({
                ...state,
                email: event.target.value,
              }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Jeśli użytkownik istnieje w bazie, możemy go odszukać po adresie e-mail.
          </p>
        </label>
      </div>

      <label className="flex flex-col fluid-stack-xs text-sm">
        <span className="font-medium text-foreground">Status transakcji</span>
        <Select
          disabled={isPending}
          value={formState.status}
          onValueChange={(value) =>
            setFormState((state) => ({
              ...state,
              status: value as (typeof STATUS_OPTIONS)[number]["value"],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="flex flex-col fluid-stack-xs text-sm">
        <span className="font-medium text-foreground">Notatka (opcjonalnie)</span>
        <Textarea
          maxLength={260}
          placeholder="Krótka notatka widoczna w panelu admina."
          rows={3}
          value={formState.notes}
          onChange={(event) =>
            setFormState((state) => ({
              ...state,
              notes: event.target.value,
            }))
          }
        />
      </label>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {success ? (
        <Alert className="border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      ) : null}

      <Button disabled={isPending || companies.length === 0} type="submit">
        {isPending ? "Dodawanie..." : "Dodaj punkty"}
      </Button>
    </form>
  );
}

