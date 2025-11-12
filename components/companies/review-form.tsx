"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";
import { useState } from "react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "beginner", label: "Początkujący" },
  { value: "intermediate", label: "Średniozaawansowany" },
  { value: "advanced", label: "Zaawansowany" },
  { value: "professional", label: "Profesjonalny" },
] as const;

interface ReviewFormProps {
  companySlug: string;
}

export function ReviewForm({ companySlug }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<string>(
    EXPERIENCE_LEVEL_OPTIONS[1]?.value ?? "intermediate",
  );
  const [tradingStyle, setTradingStyle] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [monthsWithCompany, setMonthsWithCompany] = useState("");
  const [accountSize, setAccountSize] = useState("");
  const [recommended, setRecommended] = useState(true);
  const [influencerDisclosure, setInfluencerDisclosure] = useState("");
  const [resourceLinks, setResourceLinks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError(null);
    setStatus(null);

    const prosArray = splitByLines(pros);
    const consArray = splitByLines(cons);
    const linksArray = splitByLines(resourceLinks).filter((value) => value.startsWith("http"));

    if (body.trim().length < 40) {
      setError("Opinia powinna mieć przynajmniej 40 znaków.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/companies/${companySlug}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          body,
          pros: prosArray,
          cons: consArray,
          experienceLevel,
          tradingStyle,
          timeframe,
          monthsWithCompany: parseMonths(monthsWithCompany),
          accountSize,
          recommended,
          influencerDisclosure,
          resourceLinks: linksArray.slice(0, 3),
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Zaloguj się, aby dodać opinię.");
        } else if (response.status === 409) {
          const payload = await response.json().catch(() => null);
          if (payload?.error === "REVIEW_EXISTS") {
            setError(
              payload.status === "APPROVED"
                ? "Twoja opinia jest już opublikowana."
                : "Twoja opinia oczekuje na moderację.",
            );
          } else {
            setError("Opinia została już wysłana.");
          }
        } else if (response.status === 400) {
          setError("Sprawdź dane i spróbuj ponownie.");
        } else {
          setError("Nie udało się zapisać opinii. Spróbuj później.");
        }
        return;
      }

      setStatus("Opinia została przesłana i trafi do moderacji.");
      setBody("");
      setPros("");
      setCons("");
      setTradingStyle("");
      setTimeframe("");
      setMonthsWithCompany("");
      setAccountSize("");
      setInfluencerDisclosure("");
      setResourceLinks("");
      setRecommended(true);
      setRating(5);
    } catch (submitError) {
      console.error("review submit error", submitError);
      setError("Wystąpił błąd sieci. Spróbuj ponownie później.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-muted/40 p-5 shadow-sm">
      <SignedOut>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>Zaloguj się, aby podzielić się doświadczeniem z tą firmą.</p>
          <SignInButton>
            <Button size="sm">Zaloguj się</Button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">Ocena</label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition",
                    rating === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground hover:border-primary/60 hover:text-foreground",
                  )}
                  aria-pressed={rating === value}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-foreground">Poziom doświadczenia</span>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger variant="premium">
                  <SelectValue placeholder="Wybierz poziom doświadczenia" />
                </SelectTrigger>
                <SelectContent variant="premium">
                  {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-semibold text-foreground">Styl handlu</span>
              <Input
                placeholder="np. swing, scalping"
                value={tradingStyle}
                onChange={(event) => setTradingStyle(event.target.value)}
                variant="premium"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-semibold text-foreground">Interwał</span>
              <Input
                placeholder="np. H4, intraday"
                value={timeframe}
                onChange={(event) => setTimeframe(event.target.value)}
                variant="premium"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-semibold text-foreground">Ile miesięcy z firmą</span>
              <Input
                inputMode="numeric"
                min={0}
                max={240}
                placeholder="np. 6"
                value={monthsWithCompany}
                onChange={(event) => setMonthsWithCompany(event.target.value.replace(/[^0-9]/g, ""))}
                variant="premium"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-semibold text-foreground">Konto / wielkość</span>
              <Input
                placeholder="np. Challenge 100K"
                variant="premium"
                value={accountSize}
                onChange={(event) => setAccountSize(event.target.value)}
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Checkbox
                checked={recommended}
                onCheckedChange={(checked) => setRecommended(checked === true)}
              />
              Polecam tę firmę innym traderom
            </label>
          </div>

          <div className="space-y-2 text-sm">
            <span className="font-semibold text-foreground">Co się sprawdziło?</span>
            <Textarea
              placeholder="Wypisz zalety (każda w nowej linii)"
              rows={3}
              value={pros}
              onChange={(event) => setPros(event.target.value)}
            />
          </div>

          <div className="space-y-2 text-sm">
            <span className="font-semibold text-foreground">Co było problemem?</span>
            <Textarea
              placeholder="Wypisz wady (każda w nowej linii)"
              rows={3}
              value={cons}
              onChange={(event) => setCons(event.target.value)}
            />
          </div>

          <div className="space-y-2 text-sm">
            <span className="font-semibold text-foreground">Szczegóły opinii</span>
            <Textarea
              placeholder="Podziel się doświadczeniem (min. 40 znaków)"
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </div>

          <div className="space-y-2 text-sm">
            <span className="font-semibold text-foreground">Materiały do wglądu (URL)</span>
            <Textarea
              placeholder="Link do nagrania, raportu payout itd. (po jednym w linii)"
              rows={2}
              value={resourceLinks}
              onChange={(event) => setResourceLinks(event.target.value)}
            />
          </div>

          <div className="space-y-2 text-sm">
            <span className="font-semibold text-foreground">Ujawnienie (np. współpraca, kod)</span>
            <Textarea
              placeholder="Jeśli współpracujesz z firmą lub masz kod partnerski, opisz to tutaj."
              rows={2}
              value={influencerDisclosure}
              onChange={(event) => setInfluencerDisclosure(event.target.value)}
            />
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {status ? (
            <Alert className="border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex justify-end">
            <Button disabled={submitting} type="submit">
              {submitting ? "Wysyłanie..." : "Wyślij opinię"}
            </Button>
          </div>
        </form>
      </SignedIn>
    </div>
  );
}

function splitByLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function parseMonths(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return Math.max(0, Math.min(parsed, 240));
}
