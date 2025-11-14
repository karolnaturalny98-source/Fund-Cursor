import Link from "next/link";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";

import { Section } from "@/components/layout/section";
import { Card, CardContent } from "@/components/ui/card";
import type { RecentCompanySummary, ReviewHighlight } from "@/lib/types";

interface HomeRecentSectionProps {
  companies: RecentCompanySummary[];
  reviews: ReviewHighlight[];
}

export function HomeRecentSection({ companies, reviews }: HomeRecentSectionProps) {
  const items = [...companies.map(mapCompany), ...reviews.map(mapReview)]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 9);

  if (!items.length) {
    return null;
  }

  return (
    <Section size="lg" className="space-y-6">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Niedawno dodane
        </p>
        <h2 className="fluid-h2 font-semibold text-foreground">Nowe firmy i świeże opinie społeczności</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="border border-border/40 bg-background/60">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {item.icon}
                {item.type}
              </div>
              <div className="space-y-1">
                <Link
                  href={item.href}
                  prefetch={false}
                  className="text-sm font-semibold text-foreground transition hover:text-primary"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
              </div>
              <p className="text-xs text-muted-foreground">{item.meta}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-center">
        <Link href="/baza-wiedzy" className="text-sm font-semibold text-primary" prefetch={false}>
          Zobacz więcej aktualizacji
          <ArrowRight className="ml-1 inline h-4 w-4 align-middle" />
        </Link>
      </div>
    </Section>
  );
}

function mapCompany(company: RecentCompanySummary) {
  return {
    id: `company-${company.id}`,
    type: "Nowa firma",
    title: company.name,
    description: company.shortDescription ?? "Sprawdź parametry kont i cashback",
    href: `/firmy/${company.slug}`,
    date: new Date(company.createdAt),
    meta: company.rating ? `Śr. ocena ${company.rating.toFixed(1)}` : "Nowo dodana",
    icon: <Sparkles className="h-4 w-4 text-primary" />,
  };
}

function mapReview(review: ReviewHighlight) {
  return {
    id: `review-${review.id}`,
    type: "Nowa opinia",
    title: review.company.name,
    description: review.body ? `${review.body.slice(0, 80)}...` : "Zobacz szczegóły w profilu firmy",
    href: `/firmy/${review.company.slug}#opinie`,
    date: new Date(review.createdAt),
    meta: `Ocena ${review.rating}/5`,
    icon: <MessageSquare className="h-4 w-4 text-primary" />,
  };
}
