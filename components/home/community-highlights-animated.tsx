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
      className="flex flex-col fluid-stack-xl"
    >
      <div
        ref={sectionAnim.ref}
        className={cn(
          "flex flex-wrap gap-[clamp(0.85rem,1.6vw,1.5rem)] lg:flex-nowrap lg:items-end lg:justify-between",
          sectionAnim.className,
        )}
      >
        <div className="flex w-full flex-col fluid-stack-sm lg:w-auto">
          <p className="fluid-eyebrow text-primary">
            Społeczność FundedRank
          </p>
          <h2 className="fluid-h2 font-semibold text-foreground">
            Najnowsze doświadczenia traderów
          </h2>
          <p className="fluid-copy max-w-2xl text-muted-foreground">
            Zanim podejmiesz decyzję, sprawdź, jak inni traderzy oceniają swoje
            konta fundingowe. Każda opinia jest moderowana i wymaga realnego
            zakupu.
          </p>
        </div>
        <PremiumBadge variant="glow" className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] rounded-full font-semibold">
          1 punkt = 1 USD cashback
        </PremiumBadge>
      </div>

      <div className="grid fluid-stack-lg lg:grid-cols-3">
        {reviews.map((review, index) => (
          <Card 
            key={review.id} 
            className={`group relative overflow-hidden transition-all duration-700 hover:border-primary/50 hover:shadow-glass delay-[var(--delay)] ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
          >
            <Quote className="absolute -right-6 -top-6 h-20 w-20 text-primary/20" />
            <CardHeader className="flex flex-col fluid-stack-sm pb-0">
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
                <Link href={`/firmy/${review.company.slug}`} className="hover:underline">
                  {review.company.name}
                </Link>
              </CardTitle>
            </CardHeader>
        <CardContent className="flex flex-col fluid-stack-md">
              {review.body ? (
            <p className="fluid-copy leading-relaxed text-muted-foreground line-clamp-4">
                  {review.body}
                </p>
              ) : null}
          <div className="flex flex-wrap gap-[clamp(0.5rem,0.8vw,0.75rem)] text-muted-foreground fluid-caption">
                {review.tradingStyle ? <span>Styl: {review.tradingStyle}</span> : null}
                {review.timeframe ? <span>Interwał: {review.timeframe}</span> : null}
                {typeof review.monthsWithCompany === "number" ? (
                  <span>{review.monthsWithCompany} mies. z firmą</span>
                ) : null}
              </div>
          <div className="flex flex-wrap gap-[clamp(0.5rem,0.8vw,0.75rem)] text-muted-foreground/80 fluid-caption">
                {review.resourceLinks.slice(0, 2).map((link) => (
                  <Badge asChild key={link} variant="chip" className="text-primary">
                    <a href={link} target="_blank" rel="noreferrer">
                      Materiał dowodowy
                    </a>
                  </Badge>
                ))}
              </div>
          <div className="flex items-center justify-between text-muted-foreground/80 fluid-caption">
            <span className="font-semibold text-foreground">
                  {review.user?.displayName ?? `@${review.user?.clerkId ?? "anon"}`}
                </span>
                <span>{dateFormatter.format(new Date(review.publishedAt ?? review.createdAt))}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
