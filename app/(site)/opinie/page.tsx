import type { Metadata } from "next";

import { ReviewsRankingPage } from "@/components/reviews/reviews-ranking-page";
import { OpiniePageClient, OpinieBadgeClient } from "@/components/opinie/opinie-page-client";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { getReviewsRanking } from "@/lib/queries/reviews";

export const metadata: Metadata = {
  title: "Opinie prop firm | FundedRank",
  description:
    "Przegladaj ranking prop firm zbudowany na bazie zweryfikowanych opinii spolecznosci FundedRank. Sprawdz trend ocen, liczbe recenzji i kluczowe wskazniki satysfakcji.",
};

export const revalidate = 1800;

export default async function OpiniePage() {
  const ranking = await getReviewsRanking();
  const { summary } = ranking;
  const averageRating =
    summary.averageRating !== null ? summary.averageRating.toFixed(2) : "-";

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="container relative z-10 flex flex-col gap-[clamp(1.5rem,2.2vw,2.1rem)] py-[clamp(2.5rem,3.5vw,3.25rem)]">
          <OpiniePageClient
            totalReviews={summary.totalReviews}
            newReviews30d={summary.newReviews30d}
            averageRating={averageRating}
          />
        </div>
      </section>

      <section className="w-full space-y-[clamp(1.75rem,2.5vw,2.4rem)] px-[clamp(1rem,3vw,2.5rem)] py-[clamp(2.5rem,3.5vw,3.25rem)]">
        <div className="flex flex-wrap items-start justify-between gap-[clamp(0.85rem,1.3vw,1.2rem)]">
          <div className="space-y-[clamp(0.35rem,0.55vw,0.5rem)]">
            <Heading level={2} variant="section">
              Ranking opinii spolecznosci
            </Heading>
            <Text variant="body" tone="muted" className="max-w-2xl">
              Dane odswiezamy automatycznie, a uzytkownicy z rola admin moga moderowac recenzje z poziomu panelu.
            </Text>
          </div>
          <OpinieBadgeClient />
        </div>

        <div className="w-full">
          <ReviewsRankingPage initialData={ranking} />
        </div>
      </section>
    </>
  );
}
