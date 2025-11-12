"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { ArrowRight } from "lucide-react";
import { useFadeIn } from "@/lib/animations";

function splitMultiline(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function AffiliateRegistrationForm() {
  const [formState, setFormState] = useState({
    platform: "",
    handle: "",
    audienceSize: "",
    bio: "",
    socialLinks: "",
    preferredCompanies: "",
    contactEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const influencerFormValid =
    formState.platform.trim().length > 0 && formState.handle.trim().length > 0;

  const handleChange = (field: keyof typeof formState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setStatusMessage(null);

    const socialLinks = splitMultiline(formState.socialLinks).slice(0, 5);
    const preferredCompanies = splitMultiline(formState.preferredCompanies).slice(0, 10);
    const payload: Record<string, unknown> = {
      platform: formState.platform.trim(),
      handle: formState.handle.trim(),
      bio: formState.bio.trim(),
      socialLinks,
      preferredCompanies,
    };

    const audienceSize = formState.audienceSize.trim();
    if (audienceSize.length) {
      payload.audienceSize = audienceSize;
    }

    const contactEmail = formState.contactEmail.trim();
    if (contactEmail.length) {
      payload.contactEmail = contactEmail;
    }

    try {
      const response = await fetch("/api/influencers/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Musisz być zalogowany, aby wysłać zgłoszenie.");
        } else if (response.status === 400) {
          const body = await response.json().catch(() => null);
          const fieldError = body?.details?.fieldErrors;
          const firstError = fieldError
            ? (Object.values(fieldError)
                .flat()
                .find((item) => typeof item === "string") as string | undefined)
            : undefined;
          setError(firstError ?? "Sprawdź dane i spróbuj ponownie.");
        } else {
          setError("Nie udało się zapisać profilu affilacyjnego.");
        }
        return;
      }

      setStatusMessage(
        "Zgłoszenie zostało wysłane. Skontaktujemy się po weryfikacji.",
      );
      // Reset form after success
      setFormState({
        platform: "",
        handle: "",
        audienceSize: "",
        bio: "",
        socialLinks: "",
        preferredCompanies: "",
        contactEmail: "",
      });
    } catch (submitError) {
      console.error("affiliate profile submit error", submitError);
      setError("Wystąpił błąd sieci. Spróbuj ponownie później.");
    } finally {
      setSubmitting(false);
    }
  };

  const formAnim = useFadeIn({ rootMargin: "-100px" });

  return (
    <section id="affiliate-form" className="container space-y-6 py-12">
      <div ref={formAnim.ref} className={`space-y-3 mb-6 ${formAnim.className}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          Zgłoszenie
        </p>
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Zostań affilatem FundedRank
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Wypełnij formularz, aby dołączyć do programu partnerskiego. 
          Po weryfikacji otrzymasz dedykowany kod polecający i dostęp do materiałów marketingowych.
        </p>
      </div>

      <Card className="rounded-3xl border border-primary/50 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] shadow-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Formularz zgłoszeniowy</CardTitle>
            <PremiumBadge variant="glow" className="rounded-full text-xs font-semibold">
              Program Affilacyjny
            </PremiumBadge>
          </div>
          <CardDescription>
            Wypełnij wszystkie wymagane pola, aby zwiększyć szanse na szybką weryfikację.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignedOut>
            <Alert className="mb-6 border border-primary/30 bg-primary/10">
              <AlertDescription className="flex items-center justify-between">
                <span className="text-primary font-medium">
                  Musisz być zalogowany, aby wysłać zgłoszenie.
                </span>
                <SignInButton>
                  <Button variant="premium" size="sm" className="rounded-full">
                    Zaloguj się
                    <PremiumIcon icon={ArrowRight} variant="glow" size="sm" className="ml-2" hoverGlow />
                  </Button>
                </SignInButton>
              </AlertDescription>
            </Alert>
          </SignedOut>

          <SignedIn>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platforma *</Label>
                  <Input
                    id="platform"
                    placeholder="np. YouTube, TikTok, Discord, Instagram"
                    value={formState.platform}
                    onChange={handleChange("platform")}
                    required
                    className="border border-border/60"
                  />
                  <p className="text-xs text-muted-foreground">
                    Na jakiej platformie działasz?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handle">Nazwa profilu *</Label>
                  <Input
                    id="handle"
                    placeholder="np. FundedRankPL"
                    value={formState.handle}
                    onChange={handleChange("handle")}
                    required
                    className="border border-border/60"
                  />
                  <p className="text-xs text-muted-foreground">
                    Twoja nazwa użytkownika lub nazwa kanału
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audienceSize">Liczba obserwujących</Label>
                  <Input
                    id="audienceSize"
                    placeholder="np. 12000"
                    inputMode="numeric"
                    value={formState.audienceSize}
                    onChange={handleChange("audienceSize")}
                    className="border border-border/60"
                  />
                  <p className="text-xs text-muted-foreground">
                    Oszacowana liczba obserwujących (opcjonalnie)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email do współpracy</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="np. media@twojadomena.com"
                    value={formState.contactEmail}
                    onChange={handleChange("contactEmail")}
                    className="border border-border/60"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email, na który możemy się skontaktować (opcjonalnie)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Krótki opis / bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Opisz swoją społeczność, format treści i doświadczenie w promocji usług finansowych."
                  value={formState.bio}
                  onChange={handleChange("bio")}
                  className="border border-border/60"
                />
                <p className="text-xs text-muted-foreground">
                  Pomóż nam lepiej zrozumieć Twój profil i sposób działania
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialLinks">Linki społecznościowe (po jednym w wierszu)</Label>
                <Textarea
                  id="socialLinks"
                  rows={3}
                  placeholder="https://youtube.com/...&#10;https://instagram.com/..."
                  value={formState.socialLinks}
                  onChange={handleChange("socialLinks")}
                  className="border border-border/60"
                />
                <p className="text-xs text-muted-foreground">
                  Dodaj linki do swoich kanałów społecznościowych (max 5)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredCompanies">Firmy, które chcesz promować</Label>
                <Textarea
                  id="preferredCompanies"
                  rows={3}
                  placeholder="np. apex, fundingpips, ftmo"
                  value={formState.preferredCompanies}
                  onChange={handleChange("preferredCompanies")}
                  className="border border-border/60"
                />
                <p className="text-xs text-muted-foreground">
                  Wymień firmy, które chciałbyś promować (max 10, po jednej w wierszu)
                </p>
              </div>

              {error ? (
                <Alert variant="destructive" className="border border-border/60">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              {statusMessage ? (
                <Alert className="border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  <AlertDescription>{statusMessage}</AlertDescription>
                </Alert>
              ) : null}

              <div className="flex justify-end">
                <Button 
                  disabled={submitting || !influencerFormValid} 
                  type="submit" 
                  variant="premium" 
                  size="lg"
                  className="rounded-full px-8"
                >
                  {submitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
                  {!submitting && (
                    <PremiumIcon icon={ArrowRight} variant="glow" size="sm" className="ml-2" hoverGlow />
                  )}
                </Button>
              </div>
            </form>
          </SignedIn>
        </CardContent>
      </Card>
    </section>
  );
}

