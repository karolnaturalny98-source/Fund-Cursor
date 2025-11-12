import type { Company } from "@/lib/types";

export function buildCompanyJsonLd(company: Company, pageUrl: string) {
  const offers = (company.plans ?? []).map((plan) => ({
    "@type": "Offer",
    name: plan.name,
    price: plan.price,
    priceCurrency: plan.currency,
    url: plan.affiliateUrl ?? company.websiteUrl ?? pageUrl,
    availability: "https://schema.org/InStock",
  }));

  const aggregateRating =
    typeof company.rating === "number"
      ? {
          "@type": "AggregateRating",
          ratingValue: company.rating,
          reviewCount: company.reviews?.length || undefined,
        }
      : undefined;

  const reviews = (company.reviews ?? []).map((review) => ({
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
    },
    author:
      review.user?.displayName ??
      review.user?.clerkId ??
      "Uzytkownik FundedRank",
    datePublished: review.publishedAt ?? review.createdAt,
    reviewBody: review.body ?? undefined,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": pageUrl,
    name: company.name,
    description: company.shortDescription ?? company.headline ?? company.name,
    image: company.logoUrl ?? undefined,
    url: pageUrl,
    brand: {
      "@type": "Brand",
      name: company.name,
    },
    offers,
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(reviews.length ? { review: reviews } : {}),
  };
}
