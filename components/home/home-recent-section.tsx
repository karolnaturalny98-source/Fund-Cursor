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
    <Section size="lg" className="flex flex-col fluid-stack-lg">
      <div className="flex flex-col text-center fluid-stack-xs">
        <p className="font-semibold uppercase tracking-[0.35em] text-muted-foreground fluid-caption">
          Ostatnie opinie
        </p>
        <h2 className="fluid-h2 font-semibold text-foreground">Świeże doświadczenia traderów</h2>
      </div>
      <div className="grid fluid-stack-md md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="border border-border/40 bg-background/60">
            <CardContent className="flex flex-col fluid-stack-sm p-5">
              <div className="flex items-center font-semibold uppercase tracking-wide text-muted-foreground fluid-stack-xs fluid-caption">
                <MessageSquare className="h-4 w-4 text-primary" />
                Nowa opinia
              </div>
              <div className="flex flex-col fluid-stack-2xs">
                <Link
                  href={item.href}
                  prefetch={false}
                  className="font-semibold text-foreground transition hover:text-primary fluid-copy"
                >
                  {item.title}
                </Link>
                <p className="text-muted-foreground fluid-caption line-clamp-2">{item.description}</p>
              </div>
              <p className="text-muted-foreground fluid-caption">{item.meta}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-center">
        <Link href="/opinie" prefetch={false} className="inline-flex items-center fluid-stack-2xs font-semibold text-primary fluid-copy">
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
