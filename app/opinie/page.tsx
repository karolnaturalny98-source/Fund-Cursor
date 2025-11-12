import type { Metadata } from "next";

import { ReviewsRankingPage } from "@/components/reviews/reviews-ranking-page";
import { OpiniePageClient, OpinieBadgeClient } from "@/components/opinie/opinie-page-client";
import { getReviewsRanking } from "@/lib/queries/reviews";
import Aurora from "@/components/Aurora";

export const metadata: Metadata = {
  title: "Opinie prop firm | FundedRank",
  description:
    "Przegladaj ranking prop firm zbudowany na bazie zweryfikowanych opinii spolecznosci FundedRank. Sprawdz trend ocen, liczbe recenzji i kluczowe wskazniki satysfakcji.",
};

export const revalidate = 1800;

export default async function OpiniePage() {
  const ranking = await getReviewsRanking();
  const { summary } = ranking;
  const numberFormatter = new Intl.NumberFormat("pl-PL");
  const averageRating =
    summary.averageRating !== null ? summary.averageRating.toFixed(2) : "-";

  return (
    <div className="relative">
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 h-[150vh]">
        <Aurora
          colorStops={["#1e5a3d", "#34d399", "#a7f3d0"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="container relative z-10 flex flex-col gap-10 py-16">
          <OpiniePageClient
            totalReviews={summary.totalReviews}
            newReviews30d={summary.newReviews30d}
            averageRating={averageRating}
          />
        </div>
      </section>

      <section className="w-full space-y-12 px-4 py-12 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Ranking opinii spolecznosci
            </h2>
            <p className="text-sm text-muted-foreground">
              Dane odswiezamy automatycznie, a uzytkownicy z rola admin moga
              moderowac recenzje z poziomu panelu.
            </p>
          </div>
          <OpinieBadgeClient />
        </div>

        <div className="w-full">
          <ReviewsRankingPage initialData={ranking} />
        </div>
      </section>
    </div>
  );
}
