"use client";

import { Star, Quote } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";
import type { ReviewHighlight } from "@/lib/types";
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

export function CommunityHighlights({ reviews }: { reviews: ReviewHighlight[] }) {
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });
  const sectionVisible = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(reviews.length, 100);
  const visibleStaggerItems = sectionVisible.isVisible ? staggerItems : new Array(reviews.length).fill(false);

  if (!reviews.length) {
    return null;
  }

  return (
    <section ref={sectionVisible.ref} className="container space-y-6" id="spolecznosc">
      <div ref={sectionAnim.ref} className={`flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between ${sectionAnim.className}`}>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            Społeczność FundedRank
          </p>
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Najnowsze doświadczenia traderów
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Zanim podejmiesz decyzję, sprawdź, jak inni traderzy oceniają swoje
            konta fundingowe. Każda opinia jest moderowana i wymaga realnego
            zakupu.
          </p>
        </div>
        <PremiumBadge variant="glow" className="rounded-full px-4 py-1 text-xs font-semibold">
          1 punkt = 1 USD cashback
        </PremiumBadge>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {reviews.map((review, index) => (
          <Card 
            key={review.id} 
            className={`group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-glass ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
            className="transition-all duration-700 delay-[var(--delay)]"
          >
            <Quote className="absolute -right-6 -top-6 h-20 w-20 text-primary/20" />
            <CardHeader className="space-y-4 pb-0">
              <div className="flex items-center gap-3">
                <RatingBadgeClient rating={review.rating} />
                {review.experienceLevel ? (
                  <PremiumBadge variant="outline" className="rounded-full border-primary/30 text-xs">
                    {EXPERIENCE_LABELS[review.experienceLevel] ?? review.experienceLevel}
                  </PremiumBadge>
                ) : null}
                {review.recommended !== null ? (
                  <PremiumBadge
                    variant={review.recommended ? "glow" : "outline-solid"}
                    className={`rounded-full text-xs ${review.recommended ? "border-primary/30" : "border-destructive/30 text-destructive"}`}
                  >
                    {review.recommended ? "Poleca" : "Nie poleca"}
                  </PremiumBadge>
                ) : null}
              </div>
              <CardTitle className="text-base font-semibold text-foreground">
                <Link href={`/firmy/${review.company.slug}`} className="hover:underline">
                  {review.company.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {review.body ? (
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">
                  {review.body}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {review.tradingStyle ? <span>Styl: {review.tradingStyle}</span> : null}
                {review.timeframe ? <span>Interwał: {review.timeframe}</span> : null}
                {typeof review.monthsWithCompany === "number" ? (
                  <span>{review.monthsWithCompany} mies. z firmą</span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground/80">
                {review.resourceLinks.slice(0, 2).map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-primary/30 px-2 py-1 text-primary transition-all hover:border-primary/50 hover:bg-primary/10 hover:shadow-xs"
                  >
                    Materiał dowodowy
                  </a>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground/80">
                <span>
                  {review.user?.displayName ?? `@${review.user?.clerkId ?? "anon"}`}
                </span>
                <span>{dateFormatter.format(new Date(review.publishedAt ?? review.createdAt))}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
