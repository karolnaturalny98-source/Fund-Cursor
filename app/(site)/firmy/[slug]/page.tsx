import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { auth } from "@clerk/nextjs/server";

import { CompareBar } from "@/components/companies/compare-bar";
import { CompareProvider } from "@/components/companies/compare-context";
import { FavoriteButton } from "@/components/companies/favorite-button";
import { PurchaseButton } from "@/components/companies/purchase-button";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { AnnouncementsTabClientWrapper } from "@/components/companies/announcements-tab-client-wrapper";
import { CompanyHeaderSection } from "@/components/companies/company-header-section";
import { CompanyMetaSection } from "@/components/companies/company-meta-section";
import { CompanyRulesSection } from "@/components/companies/company-rules-section";
import { CompanyFaqSection } from "@/components/companies/company-faq-section";
import { CompanyMediaSection } from "@/components/companies/company-media-section";
import { CompanyPlansSection } from "@/components/companies/company-plans-section";
import { CompanyOffersSection } from "@/components/companies/company-offers-section";
import { CompanyPayoutsSection } from "@/components/companies/company-payouts-section";
import { CompanyReviewsSection } from "@/components/companies/company-reviews-section";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { buildCompanyJsonLd } from "@/lib/seo";
import {
  getCompanyBySlug,
  getSimilarCompanies,
} from "@/lib/queries/companies";
import { cn } from "@/lib/utils";
import type { Company, CompanyPlan } from "@/lib/types";
import { parseCompareParam } from "@/lib/compare";
import type { CompanyChecklistItem, CompanyReviewCard, CompanyRiskAlert } from "@/components/companies/company-profile-types";

// Use the actual return type from getCompanyBySlug
type CompanyWithDetails = NonNullable<Awaited<ReturnType<typeof getCompanyBySlug>>>;

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// Cache company pages for 5 minutes for better performance
export const revalidate = 300;

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fundedrank.com";

  if (!company) {
    return {
      title: "FundedRank",
      description: "Porownaj firmy prop tradingowe i cashback.",
    };
  }

  const title = `${company.name} - FundedRank`;
  const description =
    company.shortDescription ??
    company.headline ??
    "Poznaj zasady, plany i cashback firm prop tradingowych.";
  const pageUrl = `${baseUrl}/firmy/${company.slug}`;

  const image = company.logoUrl
    ? { url: company.logoUrl, width: 1200, height: 630, alt: company.name }
    : undefined;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      url: pageUrl,
      title,
      description,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}
export default async function CompanyPage({ params, searchParams }: CompanyPageProps) {
  const { slug } = await params;
  const search = searchParams ? await searchParams : undefined;
  const initialCompare = parseCompareParam(search?.compare);
  const { userId } = await auth();
  const company = await getCompanyBySlug(slug, userId);

  if (!company) {
    notFound();
  }

  const similarCompanies = await getSimilarCompanies(slug, 4, userId);

  const _bestProfitSplit = getBestProfitSplit(company.plans as unknown as CompanyPlan[]);
  const _bestLeverage = getBestLeverage(company.plans as unknown as CompanyPlan[]);

  const riskAlerts = deriveRiskAlerts(company);
  const announcements = buildAnnouncements(company);
  const checklist = buildChecklist(company);
  const reviewCards = mapReviewsForPanel(company.reviews);
  
  // Default plan - first plan or most popular
  const defaultPlan = company.plans.length > 0 ? (company.plans[0] as unknown as CompanyPlan) : null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fundedrank.com";
  const pageUrl = `${baseUrl}/firmy/${company.slug}`;
  const jsonLd = JSON.stringify(buildCompanyJsonLd(company as unknown as Company, pageUrl));

  const socialLinks = getSocialLinks(company.socials ?? null);
  const tosUrl = resolveTosUrl(company);

  const tabConfig = buildTabConfig({
    plansCount: company.plans.length,
    reviewsCount: company.reviews.length,
    offersCount: getOffersCount(company),
    announcementsCount: announcements.length,
  });

  return (
    <div className="relative">
    <CompareProvider initialSelection={initialCompare}>
      <div className="container flex flex-col fluid-stack-xl py-[clamp(2.5rem,3vw,3.5rem)]">
        <script
          dangerouslySetInnerHTML={{ __html: jsonLd }}
          suppressHydrationWarning
          type="application/ld+json"
        />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/firmy">Firmy</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{company.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Link
          href="/firmy"
          className="inline-flex items-center fluid-caption text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="mr-[clamp(0.4rem,0.6vw,0.5rem)] h-[clamp(0.9rem,0.5vw+0.8rem,1rem)] w-[clamp(0.9rem,0.5vw+0.8rem,1rem)]" /> Powrót do listy firm
        </Link>

        <CompanyHeaderSection
          company={company}
          defaultPlan={defaultPlan}
          socialLinks={socialLinks}
          tosUrl={tosUrl}
        />

        <Tabs defaultValue="overview" className="flex flex-col fluid-stack-lg">
          <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
            {tabConfig.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
                  "border-transparent bg-muted/30 text-muted-foreground",
                  "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                  "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium",
                )}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined ? (
                  <PremiumBadge variant="glow" className="rounded-full text-xs font-semibold text-amber-500">
                    {tab.count}
                  </PremiumBadge>
                ) : null}
                {tab.badge ? (
                  <PremiumBadge variant="gradient" className="rounded-full text-xs font-semibold text-white">
                    {tab.badge}
                  </PremiumBadge>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" data-tab-value="overview">
            <div className="flex flex-col fluid-stack-lg">
              <CompanyMetaSection company={company} checklist={checklist} />
              <CompanyRulesSection
                company={company}
                alerts={riskAlerts}
                bestProfitSplit={_bestProfitSplit}
                bestLeverage={_bestLeverage}
              />
              <CompanyFaqSection companySlug={company.slug} faqs={company.faqs} />
              <CompanyMediaSection company={company} educationLinks={company.educationLinks ?? []} />
            </div>
          </TabsContent>

          <TabsContent value="challenges" data-tab-value="challenges">
            <CompanyPlansSection company={company} bestProfitSplit={_bestProfitSplit} bestLeverage={_bestLeverage} />
          </TabsContent>

          <TabsContent value="reviews" data-tab-value="reviews">
            <CompanyReviewsSection companySlug={company.slug} reviews={reviewCards} />
          </TabsContent>

          <TabsContent value="offers" data-tab-value="offers">
            <CompanyOffersSection company={company} />
          </TabsContent>

          <TabsContent value="announcements" data-tab-value="announcements">
            <AnnouncementsTabClientWrapper company={company} announcements={announcements} tosUrl={tosUrl} />
          </TabsContent>

          <TabsContent value="payouts" data-tab-value="payouts">
            <CompanyPayoutsSection company={company} />
          </TabsContent>
        </Tabs>

        <SimilarCompaniesSection companies={similarCompanies} />
      </div>

      <CompareBar />
    </CompareProvider>
    </div>
  );
}
// Type for companies returned by getSimilarCompanies - includes plans and other computed fields
type SimilarCompany = Company & { 
  plans: Array<{ id: string; evaluationModel: string }>; 
  viewerHasFavorite: boolean;
  clickCount: number;
};

function SimilarCompaniesSection({ companies }: { companies: SimilarCompany[] }) {
  if (!companies.length) {
    return null;
  }

  return (
    <section className="flex flex-col fluid-stack-md">
      <div className="flex flex-col fluid-stack-xs">
        <h2 className="fluid-h2 font-semibold">Podobne firmy</h2>
        <p className="fluid-copy text-muted-foreground">
          Rekomendacje na podstawie modelu finansowania, instrumentów i ocen społeczności.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {companies.map((company) => {
          const models = Array.from(new Set(company.plans.map((plan) => plan.evaluationModel))).slice(0, 3);

          return (
            <article
              key={company.id}
              className="group flex h-full flex-col justify-between rounded-3xl border-gradient bg-gradient-card p-4 shadow-premium transition-all hover:border-gradient-premium hover:shadow-premium-lg"
            >
              <div className="flex flex-col fluid-stack-sm">
                <div className="flex items-start justify-between gap-[clamp(0.6rem,0.8vw,0.75rem)]">
                  <div>
                    <Link className="fluid-copy font-semibold text-foreground hover:text-primary transition-colors" href={`/firmy/${company.slug}`}>
                      {company.name}
                    </Link>
                    <div className="mt-[clamp(0.2rem,0.3vw,0.25rem)]">
                      <PremiumBadge variant="glow" className="fluid-badge font-semibold">
                        Cashback do {company.cashbackRate ?? 0} pkt
                      </PremiumBadge>
                    </div>
                  </div>
                  <FavoriteButton
                    companyId={company.id}
                    companySlug={company.slug}
                    initialFavorite={company.viewerHasFavorite}
                    size="icon"
                  />
                </div>
                {models.length ? (
                  <div className="flex flex-wrap gap-[clamp(0.4rem,0.6vw,0.5rem)]">
                    {models.map((model) => (
                      <PremiumBadge key={model} variant="outline" className="fluid-badge font-semibold">
                        {renderModelLabel(model)}
                      </PremiumBadge>
                    ))}
                  </div>
                ) : null}
                <p className="fluid-caption text-muted-foreground">
                  {company.shortDescription ?? "Sprawdź zasady, wypłaty i cashback partnera."}
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/firmy/${company.slug}`}
                  className={cn(buttonVariants({ variant: "premium-outline" }), "w-full sm:w-auto rounded-full")}
                >
                  Szczegóły
                </Link>
                {company.websiteUrl ? (
                  <PurchaseButton companySlug={company.slug} href={company.websiteUrl}>
                    Strona partnera
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </PurchaseButton>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

type Announcement = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  tag?: string;
};

// TODO: Future feature - buildPersonas function removed (unused, had broken reference to 'company' variable)

function deriveRiskAlerts(company: CompanyWithDetails): CompanyRiskAlert[] {
  const alerts: CompanyRiskAlert[] = [];

  if (company.rating && company.rating < 3.5) {
    alerts.push({
      id: "rating",
      title: "Niski rating społeczności",
      description: "Ocena użytkowników poniżej 3.5 – sprawdź opinie i najnowsze wypłaty, zanim wybierzesz tę firmę.",
      severity: "high",
      iconName: "AlertTriangle",
    });
  }

  if (!company.regulation) {
    alerts.push({
      id: "regulation",
      title: "Brak informacji o regulacji",
      description: "Firma nie deklaruje formalnej regulacji – zweryfikuj warunki prawne i zabezpieczenia środków.",
      severity: "medium",
      iconName: "Shield",
    });
  }

  if (!company.supportContact) {
    alerts.push({
      id: "support",
      title: "Brak kanału wsparcia",
      description: "Nie znaleziono dedykowanego kontaktu supportu. Sprawdź społeczności lub Discorda.",
      severity: "medium",
      iconName: "LifeBuoy",
    });
  }

  const cryptoOnly =
    company.paymentMethods.length > 0 &&
    company.paymentMethods.every((method) => method.toLowerCase().includes("crypto") || method.toLowerCase().includes("usdt"));
  if (cryptoOnly) {
    alerts.push({
      id: "payments",
      title: "Wyłącznie płatności krypto",
      description: "Jeśli wolisz tradycyjne metody płatności, zweryfikuj czy firma planuje wdrożyć karty lub przelewy.",
      severity: "low",
      iconName: "Zap",
    });
  }

  return alerts;
}

function buildAnnouncements(company: CompanyWithDetails): Announcement[] {
  const entries: Announcement[] = [];

  if (Array.isArray(company.highlights)) {
    company.highlights.forEach((highlight, index) => {
      entries.push({
        id: `highlight-${index}`,
      title: "Highlight produktu",
        description: highlight,
        dateLabel: "Aktualne",
        tag: "Highlight",
      });
    });
  }

  company.plans.forEach((plan) => {
    if (!plan.priceHistory.length) {
      return;
    }

    const [latest, previous] = plan.priceHistory;
    if (previous && latest.price !== previous.price) {
      entries.push({
        id: `price-${plan.id}-${latest.recordedAt}`,
        title: `Zmiana ceny planu ${plan.name}`,
        description: `Aktualna cena: ${formatPrice(latest.price, latest.currency)} (wcześniej ${formatPrice(previous.price, previous.currency)}).`,
        dateLabel: new Date(latest.recordedAt).toLocaleDateString("pl-PL"),
        tag: "Cena",
      });
    }

    const payoutChange = plan.payoutCycleDays && plan.payoutCycleDays <= 14;
    if (payoutChange) {
      entries.push({
        id: `payout-${plan.id}`,
        title: `Szybsze wypłaty w planie ${plan.name}`,
        description: `Cykl wypłat: co ${plan.payoutCycleDays} dni (pierwsza wypłata po ${formatDays(plan.payoutFirstAfterDays)}).`,
        dateLabel: "Aktualne",
        tag: "Payout",
      });
    }
  });

  return entries.sort((a, b) => b.dateLabel.localeCompare(a.dateLabel));
}

function buildChecklist(company: CompanyWithDetails): CompanyChecklistItem[] {
  return [
    {
      id: "kyc",
      title: company.kycRequired ? "Przygotuj dokumenty KYC" : "Sprawdź politykę KYC",
      description: company.kycRequired
        ? "Potrzebne będzie potwierdzenie tożsamości przed pierwszą wypłatą."
        : "Firma deklaruje brak formalnego KYC – zweryfikuj, czy to nadal aktualne.",
      recommended: company.kycRequired,
      iconName: "Shield",
    },
    {
      id: "plan",
      title: "Dobierz plan pod styl handlu",
      description: "Porównaj modele evaluation (1 etap, 2 etapy, instant) i wymagania minimalne.",
      recommended: true,
      iconName: "Layers",
    },
    {
      id: "risk",
      title: "Zweryfikuj regulamin i ToS",
      description: "Przeczytaj zasady wypłat, politykę zwrotów oraz limity dzienne.",
      recommended: Boolean(resolveTosUrl(company)),
      iconName: "FileText",
    },
    {
      id: "payout",
      title: "Zaplanuj pierwszy payout",
      description: "Ustaw przypomnienie na pierwszy dostępny termin wypłaty i przygotuj kanał płatności.",
      recommended: Boolean(company.payoutFrequency),
      iconName: "Clock",
    },
    {
      id: "education",
      title: "Odwiedź materiały edukacyjne",
      description: company.educationLinks.length
        ? "Firma udostępnia dodatkowe materiały, które warto poznać przed startem."
        : "Brak oficjalnych materiałów – zasięgnij opinii społeczności.",
      recommended: company.educationLinks.length > 0,
      iconName: "BookOpen",
    },
    {
      id: "support",
      title: "Dodaj kontakt do supportu",
      description: company.supportContact
        ? `Wsparcie: ${company.supportContact}`
        : "Zidentyfikuj kanał wsparcia (Discord, e-mail) i dodaj do kontaktów.",
      recommended: Boolean(company.supportContact),
      iconName: "LifeBuoy",
    },
  ];
}

// TODO: Future feature - buildQuickStats function removed (unused, had broken reference to 'company' variable)

function buildTabConfig({
  plansCount,
  reviewsCount,
  offersCount,
  announcementsCount,
}: {
  plansCount: number;
  reviewsCount: number;
  offersCount: number;
  announcementsCount: number;
}) {
  return [
    { value: "overview", label: "Przegląd" },
    { value: "challenges", label: "Wyzwania", count: plansCount },
    { value: "reviews", label: "Opinie", count: reviewsCount },
    { value: "offers", label: "Oferty", count: offersCount },
    { value: "announcements", label: "Ogłoszenia", count: announcementsCount || undefined },
    { value: "payouts", label: "Wypłaty", badge: "Nowe" },
  ];
}

function getOffersCount(company: CompanyWithDetails) {
  return company.plans.length;
}

// TODO: Future feature - collectOffers function removed (unused, had broken reference to 'company' variable)

function mapReviewsForPanel(
  reviews: NonNullable<Awaited<ReturnType<typeof getCompanyBySlug>>>["reviews"],
): CompanyReviewCard[] {
  return reviews.map((review) => {
    const experienceLevel = review.experienceLevel ?? null;
    const tradingStyle = review.tradingStyle ?? null;
    const timeframe = review.timeframe ?? null;
    const monthsWithCompany = review.monthsWithCompany ?? null;
    const accountSize = review.accountSize ?? null;
    const recommended = review.recommended ?? null;
    const influencerDisclosure = review.influencerDisclosure ?? null;
    const resourceLinks = review.resourceLinks ?? [];

    const verified =
      Boolean(recommended) ||
      Boolean(resourceLinks.length) ||
      (monthsWithCompany !== null && monthsWithCompany >= 1);

    return {
      id: review.id,
      rating: review.rating,
      pros: review.pros ?? [],
      cons: review.cons ?? [],
      body: review.body,
      publishedAt: review.publishedAt
        ? new Date(review.publishedAt).toLocaleDateString("pl-PL")
        : new Date(review.createdAt).toLocaleDateString("pl-PL"),
      experienceLevel,
      tradingStyle,
      timeframe,
      monthsWithCompany,
      accountSize,
      recommended,
      influencerDisclosure,
      resourceLinks,
      userDisplayName: review.user?.displayName ?? review.user?.clerkId ?? null,
      verified,
    };
  });
}

function getBestProfitSplit(plans: CompanyPlan[]) {
  const entries = plans
    .map((plan) => plan.profitSplit)
    .filter(Boolean)
    .map((split) => {
      if (!split) return null;
      const match = /^(\d+)/.exec(split);
      return match ? Number(match[1]) : null;
    })
    .filter((value): value is number => value !== null);

  if (!entries.length) {
    return null;
  }

  const best = Math.max(...entries);
  const plan = plans.find((p) => p.profitSplit?.startsWith(best.toString()));
  return plan?.profitSplit ?? null;
}

function getBestLeverage(plans: CompanyPlan[]) {
  const leverageValues = plans.map((plan) => plan.leverage ?? 0);
  const best = Math.max(...leverageValues);
  return best > 0 ? best : null;
}

function formatDays(days: number | null | undefined) {
  if (!days || days <= 0) {
    return "Brak danych";
  }
  if (days === 1) {
    return "po 1 dniu";
  }
  return `po ${days} dniach`;
}

function formatPrice(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString("pl-PL")} ${currency.toUpperCase()}`;
  }
}

// TODO: Future feature - formatLinkLabel function removed (unused, had broken reference to 'link' variable)

function getSocialLinks(
  socials: Record<string, unknown> | null,
): { key: string; label: string; url: string }[] {
  if (!socials || typeof socials !== "object") {
    return [];
  }

  const labels: Record<string, string> = {
    website: "Strona",
    twitter: "Twitter",
    discord: "Discord",
    youtube: "YouTube",
    telegram: "Telegram",
  };

  return Object.entries(socials)
    .map(([key, value]) => ({
      key,
      url: typeof value === "string" ? value : null,
    }))
    .filter((entry): entry is { key: string; url: string } => Boolean(entry.url))
    .map((entry) => ({
      key: entry.key,
      url: entry.url,
      label: labels[entry.key] ?? entry.key,
    }));
}

function resolveTosUrl(company: CompanyWithDetails) {
  const direct = company.educationLinks.find((link) => {
    const value = link.toLowerCase();
    return value.includes("terms") || value.includes("regulamin") || value.includes("tos");
  });

  if (direct) {
    return direct;
  }

  if (!company.websiteUrl) {
    return null;
  }

  return `${company.websiteUrl.replace(/\/$/, "")}/terms`;
}

function renderModelLabel(model: string) {
  switch (model) {
    case "one-step":
      return "1-etapowe";
    case "two-step":
      return "2-etapowe";
    case "instant-funding":
      return "Instant funding";
    default:
      return model;
  }
}
