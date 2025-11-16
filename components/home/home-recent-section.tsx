import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { SurfaceCard } from "@/components/layout/surface-card";
import { Text } from "@/components/ui/text";
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
    <Section size="lg" stack="lg">
      <SectionHeader
        eyebrow="Ostatnie opinie"
        title="Świeże doświadczenia traderów"
        description="Najbardziej aktualne zgłoszenia payoutów, komentarze i średnie oceny zebrane w jednym widoku."
      />
      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        {items.map((item) => (
          <SurfaceCard key={item.id} variant="muted" padding="md" className="flex flex-col gap-4">
            <Text
              asChild
              variant="caption"
              tone="muted"
              weight="semibold"
              className="inline-flex items-center gap-2 uppercase tracking-wide"
            >
              <div>
                <MessageSquare className="h-4 w-4 text-primary" />
                Nowa opinia
              </div>
            </Text>
            <div className="flex flex-col gap-2">
              <Text
                asChild
                variant="body"
                weight="semibold"
                className="text-foreground transition hover:text-primary"
              >
                <Link href={item.href} prefetch={false}>
                  {item.title}
                </Link>
              </Text>
              <Text variant="caption" tone="muted" className="line-clamp-2">
                {item.description}
              </Text>
            </div>
            <Text variant="caption" tone="muted">
              {item.meta}
            </Text>
          </SurfaceCard>
        ))}
      </div>
      <div className="flex justify-center">
        <Text
          asChild
          variant="body"
          weight="semibold"
          className="inline-flex items-center gap-2 text-primary transition hover:text-primary/80"
        >
          <Link href="/opinie" prefetch={false}>
            Zobacz wszystkie opinie
            <MessageSquare className="h-4 w-4" />
          </Link>
        </Text>
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
