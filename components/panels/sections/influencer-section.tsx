"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] shadow-sm">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="influencer-program" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex flex-1 items-center justify-between pr-4">
              <div className="flex flex-col items-start gap-1">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Program influencerów
                </CardTitle>
                <CardDescription className="text-xs">
                  Zgłoś swój profil, aby otrzymać dedykowane materiały i kody polecające
                </CardDescription>
              </div>
              <Badge variant="outline" className={cn("rounded-full text-xs font-semibold", statusClass)}>
                {statusLabel}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="px-6 pb-6 pt-0">
              {profile?.referralCode ? (
                <Alert className="mb-4 border-dashed border-primary/40 bg-primary/5 rounded-lg border border-border/40">
                  <AlertDescription className="text-primary">
                    Kod polecający: <span className="font-semibold">{profile.referralCode}</span>
                  </AlertDescription>
                </Alert>
              ) : null}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Platforma</Label>
                    <Input
                      placeholder="np. YouTube, TikTok, Discord"
                      value={formState.platform}
                      onChange={handleChange("platform")}
                      required
                      className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nazwa profilu</Label>
                    <Input
                      placeholder="np. FundedRankPL"
                      value={formState.handle}
                      onChange={handleChange("handle")}
                      required
                      className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Liczba obserwujących</Label>
                    <Input
                      placeholder="np. 12000"
                      inputMode="numeric"
                      value={formState.audienceSize}
                      onChange={handleChange("audienceSize")}
                      className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email do współpracy</Label>
                    <Input
                      placeholder="np. media@twojadomena.com"
                      value={formState.contactEmail}
                      onChange={handleChange("contactEmail")}
                      className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Krótki opis / bio</Label>
                  <Textarea
                    rows={3}
                    placeholder="Opisz swoją społeczność, format treści i doświadczenie."
                    value={formState.bio}
                    onChange={handleChange("bio")}
                    className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Linki społecznościowe (po jednym w wierszu)</Label>
                  <Textarea
                    rows={3}
                    placeholder="https://youtube.com/..."
                    value={formState.socialLinks}
                    onChange={handleChange("socialLinks")}
                    className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Firmy, które chcesz promować</Label>
                  <Textarea
                    rows={3}
                    placeholder="np. apex, fundingpips"
                    value={formState.preferredCompanies}
                    onChange={handleChange("preferredCompanies")}
                    className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)]"
                  />
                </div>

                {error ? (
                  <Alert variant="destructive" className="rounded-lg border border-border/40">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                {statusMessage ? (
                  <Alert className="border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg border border-border/40">
                    <AlertDescription>{statusMessage}</AlertDescription>
                  </Alert>
                ) : null}

                <CardFooter className="px-0 pb-0 flex justify-end">
                  <Button disabled={submitting || !influencerFormValid} type="submit" variant="default" className="rounded-lg">
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

