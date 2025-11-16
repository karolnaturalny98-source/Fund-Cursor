"use client";

import { Quote } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/layout/section";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";
import type { ReviewHighlight } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { RatingBadgeClient } from "./community-highlights-client";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  dateStyle: "medium",
});

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Początkujący",
  intermediate: "Średnio-zaawansowany",
  advanced: "Zaawansowany",
  professional: "Profesjonalny",
};

export function CommunityHighlightsAnimated({ reviews }: { reviews: ReviewHighlight[] }) {
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });
  const sectionVisible = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(reviews.length, 100);
  const visibleStaggerItems = sectionVisible.isVisible ? staggerItems : new Array(reviews.length).fill(false);

  if (!reviews.length) {
    return null;
  }

  return (
    <Section
      ref={sectionVisible.ref}
      id="spolecznosc"
      size="lg"
      stack="xl"
    >
      <div
        ref={sectionAnim.ref}
        className={cn(
          "flex flex-wrap gap-[clamp(0.85rem,1.6vw,1.5rem)] lg:flex-nowrap lg:items-end lg:justify-between",
          sectionAnim.className,
        )}
      >
        <div className="flex w-full flex-col gap-4 lg:w-auto">
          <Text variant="eyebrow" tone="primary">
            Społeczność FundedRank
          </Text>
          <Heading level={2} variant="section">
            Najnowsze doświadczenia traderów
          </Heading>
          <Text variant="body" tone="muted" className="max-w-2xl">
            Zanim podejmiesz decyzję, sprawdź, jak inni traderzy oceniają swoje konta fundingowe. Każda opinia jest
            moderowana i wymaga realnego zakupu.
          </Text>
        </div>
        <PremiumBadge variant="glow" className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] rounded-full font-semibold">
          1 punkt = 1 USD cashback
        </PremiumBadge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {reviews.map((review, index) => (
          <Card 
            key={review.id} 
            className={`group relative overflow-hidden transition-all duration-700 hover:border-primary/50 hover:shadow-[0_20px_45px_-25px_rgba(15,23,42,0.4),inset_0_0_1px_rgba(148,163,184,0.35)] delay-[var(--delay)] ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
          >
            <Quote className="absolute -right-6 -top-6 h-20 w-20 text-primary/20" />
            <CardHeader className="flex flex-col gap-4 pb-0">
          <div className="flex items-center gap-[clamp(0.65rem,1vw,1rem)]">
                <RatingBadgeClient rating={review.rating} />
                {review.experienceLevel ? (
              <PremiumBadge variant="outline" className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] rounded-full border-primary/30 font-semibold">
                    {EXPERIENCE_LABELS[review.experienceLevel] ?? review.experienceLevel}
                  </PremiumBadge>
                ) : null}
                {review.recommended !== null ? (
                  <PremiumBadge
                    variant={review.recommended ? "glow" : "outline-solid"}
                className={`px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] rounded-full font-semibold ${review.recommended ? "border-primary/30" : "border-destructive/30 text-destructive"}`}
                  >
                    {review.recommended ? "Poleca" : "Nie poleca"}
                  </PremiumBadge>
                ) : null}
              </div>
          <CardTitle className="text-[clamp(1rem,0.6vw+0.9rem,1.3rem)] font-semibold text-foreground">
                <Link
                  href={`/firmy/${review.company.slug}`}
                  className="hover:underline focus-visible:outline-none focus-visible:text-primary focus-visible:underline"
                >
                  {review.company.name}
                </Link>
              </CardTitle>
            </CardHeader>
        <CardContent className="flex flex-col gap-4">
              {review.body ? (
            <Text variant="body" tone="muted" className="leading-relaxed line-clamp-4">
                  {review.body}
                </Text>
              ) : null}
          <Text
            asChild
            variant="caption"
            tone="muted"
            className="flex flex-wrap items-center gap-[clamp(0.5rem,0.8vw,0.75rem)] text-muted-foreground"
          >
                <div>
                  {review.tradingStyle ? <span>Styl: {review.tradingStyle}</span> : null}
                  {review.timeframe ? <span>Interwał: {review.timeframe}</span> : null}
                  {typeof review.monthsWithCompany === "number" ? (
                    <span>{review.monthsWithCompany} mies. z firmą</span>
                  ) : null}
                </div>
              </Text>
          <Text
            asChild
            variant="caption"
            tone="muted"
            className="flex flex-wrap gap-[clamp(0.5rem,0.8vw,0.75rem)] text-muted-foreground/80"
          >
                <div>
                  {review.resourceLinks.slice(0, 2).map((link) => (
                    <Badge asChild key={link} variant="chip" className="text-primary">
                      <a href={link} target="_blank" rel="noreferrer">
                        Materiał dowodowy
                      </a>
                    </Badge>
                  ))}
                </div>
              </Text>
          <Text
            asChild
            variant="caption"
            tone="muted"
            className="flex flex-col gap-1 text-muted-foreground/80 sm:flex-row sm:items-center sm:justify-between"
          >
                <div>
                  <span className="font-semibold text-foreground">
                    {review.user?.displayName ?? `@${review.user?.clerkId ?? "anon"}`}
                  </span>
                  <span className="text-muted-foreground/70">
                    {dateFormatter.format(new Date(review.publishedAt ?? review.createdAt))}
                  </span>
                </div>
              </Text>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
