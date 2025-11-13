"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { InfluencerProfile, InfluencerStatus } from "@/lib/types";

const INFLUENCER_STATUS_LABELS: Record<InfluencerStatus, string> = {
  PENDING: "W trakcie weryfikacji",
  APPROVED: "Zatwierdzony",
  REJECTED: "Odrzucony",
};

const INFLUENCER_STATUS_STYLES: Record<InfluencerStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  REJECTED: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
};

interface InfluencerSectionProps {
  profile: InfluencerProfile | null;
  onUpdated: () => void;
}

function splitMultiline(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function InfluencerSection({ profile, onUpdated }: InfluencerSectionProps) {
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

  useEffect(() => {
    if (!profile) {
      setFormState({
        platform: "",
        handle: "",
        audienceSize: "",
        bio: "",
        socialLinks: "",
        preferredCompanies: "",
        contactEmail: "",
      });
      return;
    }

    setFormState({
      platform: profile.platform,
      handle: profile.handle,
      audienceSize: profile.audienceSize ? String(profile.audienceSize) : "",
      bio: profile.bio ?? "",
      socialLinks: (profile.socialLinks ?? []).join("\n"),
      preferredCompanies: (profile.preferredCompanies ?? []).join("\n"),
      contactEmail: profile.contactEmail ?? "",
    });
  }, [profile]);

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
        method: profile ? "PATCH" : "POST",
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
          setError("Nie udało się zapisać profilu influencera.");
        }
        return;
      }

      setStatusMessage(
        profile ? "Zaktualizowano zgłoszenie."
          : "Zgłoszenie zostało wysłane. Skontaktujemy się po weryfikacji.",
      );
      onUpdated();
    } catch (submitError) {
      console.error("influencer profile submit error", submitError);
      setError("Wystąpił błąd sieci. Spróbuj ponownie później.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel = profile ? INFLUENCER_STATUS_LABELS[profile.status] : "Brak zgłoszenia";
  const statusClass = profile ? INFLUENCER_STATUS_STYLES[profile.status] : "bg-muted text-muted-foreground";

  return (
    <Card className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="influencer-program" className="border-none">
          <AccordionTrigger className="px-[clamp(1.4rem,2vw,1.8rem)] py-[clamp(1rem,1.4vw,1.2rem)] text-left hover:no-underline [&>svg]:h-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)] [&>svg]:w-[clamp(1.2rem,0.45vw+1.1rem,1.35rem)]">
            <div className="flex flex-1 items-center justify-between gap-[clamp(0.65rem,0.95vw,0.9rem)] pr-[clamp(0.65rem,0.95vw,0.9rem)]">
              <div className="flex flex-col items-start gap-[clamp(0.35rem,0.55vw,0.5rem)]">
                <CardTitle className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Program influencerów
                </CardTitle>
                <CardDescription className="fluid-caption text-muted-foreground">
                  Zgłoś swój profil, aby otrzymać dedykowane materiały i kody polecające
                </CardDescription>
              </div>
              <Badge variant="outline" className={cn("fluid-badge rounded-full font-semibold", statusClass)}>
                {statusLabel}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="space-y-[clamp(0.85rem,1.2vw,1.1rem)] px-[clamp(1.4rem,2vw,1.8rem)] pb-[clamp(1.6rem,2.3vw,2.1rem)] pt-[clamp(0.4rem,0.6vw,0.55rem)]">
              {profile?.referralCode ? (
                <Alert className="rounded-2xl border border-primary/40 border-dashed bg-primary/5">
                  <AlertDescription className="flex items-center gap-[clamp(0.35rem,0.55vw,0.5rem)] text-primary fluid-caption">
                    Kod polecający:
                    <span className="font-semibold text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)]">
                      {profile.referralCode}
                    </span>
                  </AlertDescription>
                </Alert>
              ) : null}

              <form className="grid gap-[clamp(0.85rem,1.2vw,1.1rem)]" onSubmit={handleSubmit}>
                <div className="grid gap-[clamp(0.75rem,1.1vw,1rem)] md:grid-cols-2">
                  <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
                    <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                      Platforma
                    </Label>
                    <Input
                      placeholder="np. YouTube, TikTok, Discord"
                      value={formState.platform}
                      onChange={handleChange("platform")}
                      required
                      className="h-[clamp(2.75rem,2vw+2.25rem,3.1rem)] rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                    />
                  </div>

                  <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
                    <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                      Nazwa profilu
                    </Label>
                    <Input
                      placeholder="np. FundedRankPL"
                      value={formState.handle}
                      onChange={handleChange("handle")}
                      required
                      className="h-[clamp(2.75rem,2vw+2.25rem,3.1rem)] rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                    />
                  </div>

                  <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
                    <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                      Liczba obserwujących
                    </Label>
                    <Input
                      placeholder="np. 12000"
                      inputMode="numeric"
                      value={formState.audienceSize}
                      onChange={handleChange("audienceSize")}
                      className="h-[clamp(2.75rem,2vw+2.25rem,3.1rem)] rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                    />
                  </div>

                  <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
                    <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                      Email do współpracy
                    </Label>
                    <Input
                      placeholder="np. media@twojadomena.com"
                      value={formState.contactEmail}
                      onChange={handleChange("contactEmail")}
                      className="h-[clamp(2.75rem,2vw+2.25rem,3.1rem)] rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
                  <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                    Krótki opis / bio
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder="Opisz swoją społeczność, format treści i doświadczenie."
                    value={formState.bio}
                    onChange={handleChange("bio")}
                    className="rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] py-[clamp(0.85rem,1.2vw,1.1rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                </div>

                <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
                  <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                    Linki społecznościowe (po jednym w wierszu)
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder="https://youtube.com/..."
                    value={formState.socialLinks}
                    onChange={handleChange("socialLinks")}
                    className="rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] py-[clamp(0.85rem,1.2vw,1.1rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                </div>

                <div className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
                  <Label className="text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-medium text-muted-foreground">
                    Firmy, które chcesz promować
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder="np. apex, fundingpips"
                    value={formState.preferredCompanies}
                    onChange={handleChange("preferredCompanies")}
                    className="rounded-2xl border border-border/60 bg-background/60 px-[clamp(1rem,1.6vw,1.35rem)] py-[clamp(0.85rem,1.2vw,1.1rem)] text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                </div>

                {error ? (
                  <Alert variant="destructive" className="rounded-2xl border border-border/60">
                    <AlertDescription className="fluid-caption text-destructive-foreground">
                      {error}
                    </AlertDescription>
                  </Alert>
                ) : null}

                {statusMessage ? (
                  <Alert className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    <AlertDescription className="fluid-caption">{statusMessage}</AlertDescription>
                  </Alert>
                ) : null}

                <CardFooter className="flex justify-end gap-[clamp(0.65rem,1vw,0.9rem)] px-0 pb-0">
                  <Button
                    disabled={submitting || !influencerFormValid}
                    type="submit"
                    variant="default"
                    className="fluid-button rounded-full"
                  >
                    {submitting ? "Zapisywanie..." : profile ? "Aktualizuj profil" : "Wyślij zgłoszenie"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

