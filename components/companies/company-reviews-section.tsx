import { ReviewForm } from "@/components/companies/review-form";
import { ReviewsPanel } from "@/components/companies/reviews-panel";
import type { CompanyReviewCard } from "@/components/companies/company-profile-types";

interface CompanyReviewsSectionProps {
  companySlug: string;
  reviews: CompanyReviewCard[];
}

export function CompanyReviewsSection({ companySlug, reviews }: CompanyReviewsSectionProps) {
  if (!reviews.length) {
    return (
      <section className="flex flex-col fluid-stack-sm">
        <div className="flex flex-col gap-[clamp(0.4rem,0.6vw,0.5rem)] md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="fluid-h2 font-semibold">Opinie społeczności</h2>
            <p className="fluid-caption text-muted-foreground">
              Bądź pierwszą osobą, która podzieli się doświadczeniem z tą firmą.
            </p>
          </div>
        </div>
        <ReviewForm companySlug={companySlug} />
      </section>
    );
  }

  return (
    <>
      <ReviewsPanel companySlug={companySlug} reviews={reviews} />
      {/* TODO: Rozważyć SSR paginację opinii po wdrożeniu API dla panelu (Etap 5). */}
    </>
  );
}
