import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Info,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

import { auth } from "@clerk/nextjs/server";

import { TooltipProvider } from "@/components/ui/tooltip";
import { CompareBar } from "@/components/companies/compare-bar";
import { CompareProvider } from "@/components/companies/compare-context";
import { CompareToggle } from "@/components/companies/compare-toggle";
import { DisclosureSection } from "@/components/companies/disclosure-section";
import { FavoriteButton } from "@/components/companies/favorite-button";
import { PurchaseButton } from "@/components/companies/purchase-button";
import { PurchaseCard } from "@/components/companies/purchase-card";
import { ReportIssueForm } from "@/components/companies/report-issue-form";
import { ReviewForm } from "@/components/companies/review-form";
import { CompanyFaqTabs } from "@/components/companies/company-faq-tabs";
import { ReviewsPanel } from "@/components/companies/reviews-panel";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { CompanyInfoClient, ResourceCardClient, RulesGridClient } from "@/components/companies/company-page-client";
import { ChallengesTabClientWrapper } from "@/components/companies/challenges-tab-client-wrapper";
import { CompanyHeroClient } from "@/components/companies/company-hero-client";
import { OverviewQuickStats } from "@/components/companies/overview-quick-stats";
import { ChecklistSection } from "@/components/companies/checklist-section";
import { PlansShopList } from "@/components/companies/offers-tab-client";
import { AnnouncementsTabClientWrapper } from "@/components/companies/announcements-tab-client-wrapper";
import { AnnouncementCard } from "@/components/companies/announcements-tab-client";
import { PayoutCalendar } from "@/components/companies/payout-calendar";
import { PayoutsQuickStats } from "@/components/companies/payouts-quick-stats";
import { PayoutsTable } from "@/components/companies/payouts-table";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/analysis/loading-skeleton";

const PayoutsCharts = dynamic(
  () => import("@/components/companies/payouts-charts").then((mod) => ({ default: mod.PayoutsCharts })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
import { PayoutsTimeline } from "@/components/companies/payouts-timeline";
import { PayoutsComparison } from "@/components/companies/payouts-comparison";
import { CompanyMedia } from "@/components/companies/company-media";
import { CompanyPopularityChart } from "@/components/companies/company-popularity-chart";
import { VerificationAccordionCard } from "@/components/companies/verification-accordion-card";
import { TeamHistoryTabsCard } from "@/components/companies/team-history-tabs-card";
import { TechnicalDetailsTabsCard } from "@/components/companies/technical-details-tabs-card";
import { SocialLinksClient } from "@/components/companies/social-links-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import Aurora from "@/components/Aurora";

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
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 h-[150vh]">
        <Aurora
          colorStops={["#1e5a3d", "#34d399", "#a7f3d0"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
    <CompareProvider initialSelection={initialCompare}>
      <div className="container space-y-10 py-10">
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
          className="inline-flex items-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Powrót do listy firm
        </Link>

        <CompanyHeroClient>
          <div className="relative space-y-6">
            <div className="flex items-start gap-4">
              {company.logoUrl ? (
                <Avatar className="h-20 w-20 rounded-2xl border-2 border-primary/20 shadow-md ring-2 ring-primary/10">
                  <AvatarImage src={company.logoUrl} alt={company.name} className="object-cover" />
                  <AvatarFallback className="rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 text-xl font-semibold">
                    {company.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : null}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{company.name}</h1>
                  <FavoriteButton
                    companyId={company.id}
                    companySlug={company.slug}
                    initialFavorite={company.viewerHasFavorite}
                    size="icon"
                  />
                  <CompareToggle slug={company.slug} size="sm" />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {company.rating ? (
                    <PremiumBadge variant="glow" className="gap-1 bg-amber-500/10 px-2 py-1 ring-1 ring-amber-500/20">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-xs" />
                      {company.rating.toFixed(1)}
                    </PremiumBadge>
                  ) : null}
                  {company.country ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-base">{getCountryFlag(company.country)}</span>
                      <span>{company.country}</span>
                    </span>
            ) : null}
                  {company.foundedYear ? (
                    <span>Rok założenia: {company.foundedYear}</span>
                  ) : null}
                    </div>
                    </div>
                </div>

            {/* Informacje o firmie - zamiast headline, description, stats */}
            {(company.legalName || company.ceo || company.headquartersAddress || company.foundersInfo) && (
              <div className="space-y-3 rounded-xl border border-border/40 bg-muted/20 p-4">
                {company.legalName && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground">Nazwa prawna:</span>
                    <span className="font-medium text-foreground">{company.legalName}</span>
              </div>
                )}
                {company.ceo && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground">CEO:</span>
                    <span className="font-medium text-foreground">{company.ceo}</span>
                      </div>
                )}
                {company.headquartersAddress && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground">Adres siedziby:</span>
                    <span className="font-medium text-foreground">{company.headquartersAddress}</span>
                    </div>
                )}
                {company.foundersInfo && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground">Założyciele:</span>
                    <span className="font-medium text-foreground">{company.foundersInfo}</span>
              </div>
                )}
              </div>
            )}

            <CompanyInfoClient
              paymentMethods={company.paymentMethods}
              platforms={company.platforms}
              instruments={company.instruments}
            />

            <SocialLinksClient socialLinks={socialLinks} tosUrl={tosUrl} />
          </div>

          <PurchaseCard
            companySlug={company.slug}
            discountCode={company.discountCode}
            websiteUrl={company.websiteUrl}
            cashbackRate={company.cashbackRate}
            defaultPlan={defaultPlan}
            copyMetrics={company.copyMetrics}
          />
        </CompanyHeroClient>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
            {tabConfig.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
                  "border-transparent bg-muted/30 text-muted-foreground hover:border-gradient hover:bg-gradient-card hover:shadow-premium",
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
            <OverviewTab
              company={company}
              alerts={riskAlerts}
              checklist={checklist}
              defaultPlan={defaultPlan}
            />
          </TabsContent>

          <TabsContent value="challenges" data-tab-value="challenges">
            <ChallengesTab company={company} bestProfitSplit={_bestProfitSplit} bestLeverage={_bestLeverage} />
          </TabsContent>

          <TabsContent value="reviews" data-tab-value="reviews">
            <ReviewsTab companySlug={company.slug} reviews={reviewCards} />
          </TabsContent>

          <TabsContent value="offers" data-tab-value="offers">
            <OffersTab company={company} defaultPlan={defaultPlan} />
          </TabsContent>

          <TabsContent value="announcements" data-tab-value="announcements">
            <AnnouncementsTabClientWrapper company={company} announcements={announcements} tosUrl={tosUrl} />
          </TabsContent>

          <TabsContent value="payouts" data-tab-value="payouts">
            <PayoutsTab company={company} />
          </TabsContent>
        </Tabs>

        <SimilarCompaniesSection companies={similarCompanies} />
      </div>

      <CompareBar />
    </CompareProvider>
    </div>
  );
}
interface OverviewTabProps {
  company: CompanyWithDetails;
  alerts: RiskAlert[];
  checklist: ChecklistItem[];
  defaultPlan: CompanyPlan | null;
}

function OverviewTab({ company, alerts, checklist, defaultPlan: _defaultPlan }: OverviewTabProps) {
  const educationLinks = company.educationLinks ?? [];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <OverviewQuickStats company={company} />

      {/* Weryfikacja i bezpieczeństwo - z alertami ryzyka */}
      <VerificationAccordionCard company={company} alerts={alerts} />

      {/* Szczegóły techniczne */}
      <TechnicalDetailsTabsCard company={company} />

      {/* Zespół i historia */}
      <TeamHistoryTabsCard company={company} />

      <Separator className="bg-border/40" />

      {/* Lista kontrolna przed startem */}
        <ChecklistSection checklist={checklist} />

      {/* FAQ */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold sm:text-2xl">FAQ w kontekście</h2>
          </div>
          <CompanyFaqTabs faqs={company.faqs} companySlug={company.slug} />
        </section>

      {/* Media i prasa */}
      {company.mediaItems && company.mediaItems.length > 0 ? (
        <>
          <Separator className="bg-border/40" />
          <CompanyMedia mediaItems={company.mediaItems} />
        </>
      ) : null}

      {/* Wykres popularności */}
      {company.rankingHistory && company.rankingHistory.length > 0 ? (
        <>
          <Separator className="bg-border/40" />
          <CompanyPopularityChart rankingHistory={company.rankingHistory} companyName={company.name} />
        </>
      ) : null}

      {/* Materiały edukacyjne */}
        {educationLinks.length ? (
        <>
          <Separator className="bg-border/40" />
          <section className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold sm:text-2xl">Materiały edukacyjne</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Oficjalne zasoby i materiały szkoleniowe udostępnione przez firmę.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {educationLinks.map((link, index) => {
                const getResourceType = (url: string): { iconName: string; label: string } => {
                  const lowerUrl = url.toLowerCase();
                  if (lowerUrl.includes("youtube") || lowerUrl.includes("youtu.be") || lowerUrl.includes("vimeo")) {
                    return { iconName: "BookOpen", label: "Wideo" };
                  }
                  if (lowerUrl.includes("pdf") || lowerUrl.includes("doc") || lowerUrl.includes("docx")) {
                    return { iconName: "FileText", label: "Dokument" };
                  }
                  return { iconName: "ExternalLink", label: "Strona" };
                };

                const resourceType = getResourceType(link);

                return (
                  <ResourceCardClient
                    key={link}
                    link={link}
                    resourceType={resourceType}
                    index={index}
                  />
                );
              })}
            </div>
          </section>
        </>
        ) : null}
    </div>
  );
}

function ChallengesTab({
  company,
  bestProfitSplit,
  bestLeverage,
}: {
  company: CompanyWithDetails;
  bestProfitSplit: string | null;
  bestLeverage: number | null;
}) {
  // TODO: Future feature - planGroups and plan segmentation removed (unused)

  const highlights = buildChallengeHighlights(company, bestProfitSplit, bestLeverage);

  return (
    <ChallengesTabClientWrapper
      company={company}
      bestProfitSplit={bestProfitSplit}
      bestLeverage={bestLeverage}
      highlights={highlights}
    />
  );
}

function buildChallengeHighlights(
  company: CompanyWithDetails,
  bestProfitSplit: string | null,
  bestLeverage: number | null,
) {
  const lowestPricePlan = [...company.plans].sort((a, b) => a.price - b.price)[0] ?? null;
  const fastestPayoutPlan = [...company.plans]
    .filter((plan) => (plan.payoutFirstAfterDays ?? Infinity) !== Infinity)
    .sort((a, b) => (a.payoutFirstAfterDays ?? Infinity) - (b.payoutFirstAfterDays ?? Infinity))[0] ?? null;

  return [
    {
      id: "cashback",
      label: "Cashback",
      value: company.cashbackRate ? `${company.cashbackRate} pkt` : "brak programu",
      description: "Punkty FundedRank naliczane przy zakupie kwalifikowanych planów.",
      iconName: "Award" as const,
    },
    {
      id: "profit-split",
      label: "Najlepszy profit split",
      value: bestProfitSplit ?? "n/d",
      description: "Najwyższy udział w zyskach dostępny w planach challenge.",
      iconName: "TrendingUp" as const,
    },
    {
      id: "leverage",
      label: "Maksymalna dźwignia",
      value: typeof bestLeverage === "number" ? `1:${bestLeverage}` : "n/d",
      description: "Deklarowany limit dźwigni na najwyższym segmencie konta.",
      iconName: "Gauge" as const,
    },
    {
      id: "entry-price",
      label: "Najniższy koszt wejścia",
      value: lowestPricePlan ? formatCurrency(lowestPricePlan.price, lowestPricePlan.currency) : "n/d",
      description: lowestPricePlan ? `Plan ${lowestPricePlan.name}` : "Brak planów w ofercie.",
      iconName: "Receipt" as const,
    },
    {
      id: "payout",
      label: "Najszybszy pierwszy payout",
      value:
        typeof fastestPayoutPlan?.payoutFirstAfterDays === "number"
          ? `${fastestPayoutPlan.payoutFirstAfterDays} dni`
          : "n/d",
      description: fastestPayoutPlan ? `Plan ${fastestPayoutPlan.name}` : "Brak informacji o harmonogramie wypłat.",
      iconName: "Clock" as const,
    },
  ];
}

function ReviewsTab({
  companySlug,
  reviews,
}: {
  companySlug: string;
  reviews: ReviewCardData[];
}) {
  if (!reviews.length) {
    return (
      <section className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Opinie społeczności</h2>
            <p className="text-sm text-muted-foreground">
              Bądź pierwszą osobą, która podzieli się doświadczeniem z tą firmą.
            </p>
          </div>
        </div>
        <ReviewForm companySlug={companySlug} />
      </section>
    );
  }

  return <ReviewsPanel companySlug={companySlug} reviews={reviews} />;
}

function OffersTab({
  company,
  defaultPlan: _defaultPlan,
}: {
  company: CompanyWithDetails;
  defaultPlan?: CompanyPlan | null;
}) {
  return (
    <div id="offers" className="space-y-8">
      <PlansShopList company={company} />
    </div>
  );
}

// TODO: Future feature - AnnouncementsTab component (prepared for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AnnouncementsTab({
  company,
  announcements,
  tosUrl,
}: {
  company: CompanyWithDetails;
  announcements: Announcement[];
  tosUrl: string | null;
}) {
  // Helper component for announcements tab

  // Group announcements by date
  const groupedAnnouncements = announcements.reduce(
    (acc, item) => {
      const date = item.dateLabel;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    },
    {} as Record<string, Announcement[]>,
  );

  const sortedGroups = Object.entries(groupedAnnouncements).sort((a, b) => {
    // Sort by date (most recent first)
    if (a[0] === "Aktualne") return -1;
    if (b[0] === "Aktualne") return 1;
    return b[0].localeCompare(a[0]);
  });

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold sm:text-2xl">Ostatnie aktualizacje</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Śledź zmiany w cenach, zasadach wypłat i innych ważnych informacjach dotyczących firmy.
          </p>
        </div>
        {announcements.length > 0 ? (
          <div className="space-y-6">
            {sortedGroups.map(([date, items]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{date}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <AnnouncementCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
        <Card className="border border-dashed border-border/40">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="glass-panel mb-4 rounded-full p-4">
                <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <CardTitle className="mb-2 text-xl font-semibold">Brak aktualizacji</CardTitle>
              <CardDescription className="max-w-md text-sm">
                Brak zarejestrowanych aktualizacji dla tej firmy – sprawdź ponownie później.
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="glass-card group relative overflow-hidden p-6 transition-all hover:border-primary/50 hover:shadow-glass">
        <ReportIssueForm
          companyId={company.id}
          companySlug={company.slug}
          plans={company.plans.map((plan) => ({ id: plan.id, name: plan.name }))}
        />
      </section>

      <DisclosureSection companyName={company.name} tosUrl={tosUrl} />
    </div>
  );
}

function PayoutsTab({ company }: { company: CompanyWithDetails }) {
  const summary = buildPayoutSummary(company);

  // Find fastest payout
  const fastestPayout = summary.rows.reduce((fastest, row) => {
    const daysMatch = row.firstPayout.match(/(\d+)/);
    const currentDays = daysMatch ? parseInt(daysMatch[1], 10) : Infinity;
    const fastestDays = fastest?.firstPayout.match(/(\d+)/)
      ? parseInt(fastest.firstPayout.match(/(\d+)/)![1], 10)
      : Infinity;
    return currentDays < fastestDays ? row : fastest;
  }, summary.rows[0]);

  // Prepare table rows with isFastest flag
  const tableRows = summary.rows.map((row) => ({
    ...row,
    isFastest: fastestPayout && row.id === fastestPayout.id,
  }));

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <PayoutsQuickStats company={company} />

        <section className="space-y-4">
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold sm:text-xl">Harmonogram wypłat</h2>
            <p className="text-xs text-muted-foreground">
              Szczegółowe informacje o terminach wypłat dla każdego planu.
            </p>
          </div>
          <Card className="border border-border/40">
            <CardContent className="p-4">
              <PayoutsTable rows={tableRows} />
            </CardContent>
          </Card>
        </section>

        <PayoutsCharts company={company} />

        <PayoutsTimeline company={company} />

        <PayoutsComparison company={company} />

        <section className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-semibold sm:text-xl">Kalendarz wypłat</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Sprawdź dostępne terminy wypłat i zaplanuj swoje transakcje.
            </p>
          </div>
          <Card className="border border-border/40">
            <CardContent className="p-4">
              <PayoutCalendar company={company} />
            </CardContent>
          </Card>
        </section>

        {summary.slaNotice ? (
          <Card className="border-primary/30 bg-primary/10">
            <CardContent className="flex items-start gap-3 p-4">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-primary">Ważna informacja</CardTitle>
                <CardDescription className="text-xs text-primary/90">{summary.slaNotice}</CardDescription>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </TooltipProvider>
  );
}

// TODO: Future feature - RulesGrid component (prepared for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RulesGrid({
  company,
  bestProfitSplit: _bestProfitSplit,
  bestLeverage: _bestLeverage,
}: {
  company: CompanyWithDetails;
  bestProfitSplit: string | null;
  bestLeverage: number | null;
}) {
  const rows = [
    {
      iconName: "Shield",
      label: "Regulacja",
      value: company.regulation ?? "Brak informacji",
    },
    {
      iconName: "LifeBuoy",
      label: "Wsparcie",
      value: company.supportContact ?? "Brak danych",
    },
    {
      iconName: "TrendingUp",
      label: "Najlepszy profit split",
      value: _bestProfitSplit ?? "Brak danych",
    },
    {
      iconName: "BookOpen",
      label: "Materiały edukacyjne",
      value: company.educationLinks.length ? `${company.educationLinks.length} linków` : "Brak",
    },
    {
      iconName: "Receipt",
      label: "Płatności",
      value: company.paymentMethods.length ? company.paymentMethods.join(", ") : "Brak danych",
    },
    {
      iconName: "Gauge",
      label: "Dźwignia",
      value: _bestLeverage ? `${_bestLeverage}x` : "Brak danych",
    },
  ];

  return <RulesGridClient rows={rows} />;
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
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold sm:text-2xl">Podobne firmy</h2>
        <p className="text-sm text-muted-foreground">
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
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link className="text-base font-semibold text-foreground hover:text-primary transition-colors" href={`/firmy/${company.slug}`}>
                      {company.name}
                    </Link>
                    <div className="mt-1">
                      <PremiumBadge variant="glow" className="text-xs font-semibold">
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
                  <div className="flex flex-wrap gap-2">
                    {models.map((model) => (
                      <PremiumBadge key={model} variant="outline" className="text-xs font-semibold">
                        {renderModelLabel(model)}
                      </PremiumBadge>
                    ))}
                  </div>
                ) : null}
                <p className="text-sm text-muted-foreground">
                  {company.shortDescription ?? "Sprawdź zasady, wypłaty i cashback partnera."}
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button asChild variant="premium-outline" className="w-full sm:w-auto rounded-full">
                  <Link href={`/firmy/${company.slug}`}>Szczegóły</Link>
                </Button>
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
type PersonaCard = {
  id: string;
  title: string;
  description: string;
  recommendations: string[];
  planName?: string | null;
  iconName: "Zap" | "TrendingUp" | "Layers" | "Award" | "Gauge" | "Users";
  color: "emerald" | "blue" | "purple" | "amber" | "rose" | "sky";
};

type RiskAlert = {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  iconName: "AlertTriangle" | "Shield" | "LifeBuoy" | "Zap";
};

type Announcement = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  tag?: string;
};

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  recommended: boolean;
  iconName: "Shield" | "Layers" | "FileText" | "Clock" | "BookOpen" | "LifeBuoy";
};

type ReviewCardData = ReturnType<typeof mapReviewsForPanel>[number];

// TODO: Future feature - buildPersonas function removed (unused, had broken reference to 'company' variable)

function deriveRiskAlerts(company: CompanyWithDetails): RiskAlert[] {
  const alerts: RiskAlert[] = [];

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

function buildChecklist(company: CompanyWithDetails): ChecklistItem[] {
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

function buildPayoutSummary(company: CompanyWithDetails) {
  const highlights: Array<{ id: string; label: string; value: string }> = [];
  highlights.push({
    id: "frequency",
    label: "Deklarowana częstotliwość",
    value: company.payoutFrequency ?? "Brak danych",
  });
  highlights.push({
    id: "cashback",
    label: "Cashback",
    value: company.cashbackRate ? `${company.cashbackRate} pkt` : "Brak programu",
  });
  highlights.push({
    id: "plans",
    label: "Liczba plan?w",
    value: company.plans.length.toString(),
  });

  const rows = company.plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    evaluationModel: plan.evaluationModel,
    firstPayout: formatDays(plan.payoutFirstAfterDays),
    cycle: plan.payoutCycleDays ? `co ${plan.payoutCycleDays} dni` : "Brak danych",
    profitSplit: plan.profitSplit,
    notes: plan.notes,
  }));

  const slowestCycle = company.plans
    .map((plan) => plan.payoutCycleDays ?? null)
    .filter((value): value is number => value !== null)
    .sort((a, b) => b - a)[0];

  return {
    highlights,
    rows,
    slaNotice: slowestCycle
      ? `Najdłuższy cykl wypłat wynosi ${slowestCycle} dni – upewnij się, że mieści się w Twoim planie cashflow.`
      : null,
  };
}
function mapReviewsForPanel(
  reviews: NonNullable<Awaited<ReturnType<typeof getCompanyBySlug>>>["reviews"],
) {
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

function getCountryFlag(country: string): string {
  if (!country) return "🌍";
  
  const countryToFlag: Record<string, string> = {
    "Polska": "🇵🇱",
    "Poland": "🇵🇱",
    "poland": "🇵🇱",
    "Stany Zjednoczone": "🇺🇸",
    "United States": "🇺🇸",
    "USA": "🇺🇸",
    "US": "🇺🇸",
    "us": "🇺🇸",
    "United States of America": "🇺🇸",
    "Wielka Brytania": "🇬🇧",
    "United Kingdom": "🇬🇧",
    "UK": "🇬🇧",
    "uk": "🇬🇧",
    "Niemcy": "🇩🇪",
    "Germany": "🇩🇪",
    "Francja": "🇫🇷",
    "France": "🇫🇷",
    "Włochy": "🇮🇹",
    "Italy": "🇮🇹",
    "Hiszpania": "🇪🇸",
    "Spain": "🇪🇸",
    "Holandia": "🇳🇱",
    "Netherlands": "🇳🇱",
    "Belgia": "🇧🇪",
    "Belgium": "🇧🇪",
    "Szwajcaria": "🇨🇭",
    "Switzerland": "🇨🇭",
    "Austria": "🇦🇹",
    "Czechy": "🇨🇿",
    "Czech Republic": "🇨🇿",
    "Szwecja": "🇸🇪",
    "Sweden": "🇸🇪",
    "Norwegia": "🇳🇴",
    "Norway": "🇳🇴",
    "Dania": "🇩🇰",
    "Denmark": "🇩🇰",
    "Finlandia": "🇫🇮",
    "Finland": "🇫🇮",
    "Grecja": "🇬🇷",
    "Greece": "🇬🇷",
    "Portugalia": "🇵🇹",
    "Portugal": "🇵🇹",
    "Irlandia": "🇮🇪",
    "Ireland": "🇮🇪",
    "Kanada": "🇨🇦",
    "Canada": "🇨🇦",
    "Australia": "🇦🇺",
    "Nowa Zelandia": "🇳🇿",
    "New Zealand": "🇳🇿",
    "Japonia": "🇯🇵",
    "Japan": "🇯🇵",
    "Chiny": "🇨🇳",
    "China": "🇨🇳",
    "Indie": "🇮🇳",
    "India": "🇮🇳",
    "Brazylia": "🇧🇷",
    "Brazil": "🇧🇷",
    "Meksyk": "🇲🇽",
    "Mexico": "🇲🇽",
    "Argentyna": "🇦🇷",
    "Argentina": "🇦🇷",
    "Chile": "🇨🇱",
    "Kolumbia": "🇨🇴",
    "Colombia": "🇨🇴",
    "Południowa Afryka": "🇿🇦",
    "South Africa": "🇿🇦",
    "Izrael": "🇮🇱",
    "Israel": "🇮🇱",
    "Turcja": "🇹🇷",
    "Turkey": "🇹🇷",
    "Zjednoczone Emiraty Arabskie": "🇦🇪",
    "United Arab Emirates": "🇦🇪",
    "UAE": "🇦🇪",
    "Singapur": "🇸🇬",
    "Singapore": "🇸🇬",
    "Hong Kong": "🇭🇰",
    "Tajlandia": "🇹🇭",
    "Thailand": "🇹🇭",
    "Indonezja": "🇮🇩",
    "Indonesia": "🇮🇩",
    "Malezja": "🇲🇾",
    "Malaysia": "🇲🇾",
    "Filipiny": "🇵🇭",
    "Philippines": "🇵🇭",
    "Wietnam": "🇻🇳",
    "Vietnam": "🇻🇳",
    "Korea Południowa": "🇰🇷",
    "South Korea": "🇰🇷",
    "Taiwan": "🇹🇼",
    "Rosja": "🇷🇺",
    "Russia": "🇷🇺",
    "Ukraina": "🇺🇦",
    "Ukraine": "🇺🇦",
  };
  
  // Normalize and try exact match first
  const normalized = country.trim();
  if (countryToFlag[normalized]) {
    return countryToFlag[normalized];
  }
  
  // Try case-insensitive match
  const lower = normalized.toLowerCase();
  for (const [key, flag] of Object.entries(countryToFlag)) {
    if (key.toLowerCase() === lower) {
      return flag;
    }
  }
  
  return "🌍";
}

function formatCurrency(value: number, currency: string) {
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











