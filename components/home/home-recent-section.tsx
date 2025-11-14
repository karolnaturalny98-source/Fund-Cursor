import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { Section } from "@/components/layout/section";
import { Card, CardContent } from "@/components/ui/card";
import type { ReviewHighlight } from "@/lib/types";

interface HomeRecentSectionProps {
  reviews: ReviewHighlight[];
}

export function HomeRecentSection({ reviews }: HomeRecentSectionProps) {
  if (!reviews.length) {
    return null;
  }

  const items = reviews
    .map(mapReview)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);

  return (
    <Section size="lg" className="space-y-6">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Ostatnie opinie
        </p>
        <h2 className="fluid-h2 font-semibold text-foreground">Świeże doświadczenia traderów</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="border border-border/40 bg-background/60">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <MessageSquare className="h-4 w-4 text-primary" />
                Nowa opinia
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
        <Link href="/opinie" prefetch={false} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Zobacz wszystkie opinie
          <MessageSquare className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}

function mapReview(review: ReviewHighlight) {
  return {
    id: `review-${review.id}`,
    title: review.company.name,
    description: review.body ? `${review.body.slice(0, 90)}…` : "Zobacz pełną opinię w profilu firmy",
    href: `/firmy/${review.company.slug}#opinie`,
    date: new Date(review.createdAt),
    meta: `Ocena ${review.rating}/5 · ${review.company.name}`,
  };
}
