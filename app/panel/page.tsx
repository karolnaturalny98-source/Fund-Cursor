"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPanel } from "@/components/panels/user-panel-context";
import { UserDashboardQuickStats } from "@/components/panels/user-dashboard-quick-stats";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/analysis/loading-skeleton";
import { UserDashboardRecent } from "@/components/panels/user-dashboard-recent";
import { useUserSummary } from "@/components/panels/hooks/use-user-summary";
import { useWalletOffers } from "@/components/panels/hooks/use-wallet-offers";
import {
  useUserDisputes,
  type CreateDisputePayload,
  type DisputeStatusFilter,
} from "@/components/panels/hooks/use-user-disputes";
import { RedeemSection } from "@/components/panels/sections/redeem-section";
import { DisputesSection } from "@/components/panels/sections/disputes-section";
import { FavoritesSection } from "@/components/panels/sections/favorites-section";
import { InfluencerSection } from "@/components/panels/sections/influencer-section";

// UserDashboardCharts requires ssr: false because it uses Recharts
const UserDashboardCharts = dynamic(
  () => import("@/components/panels/user-dashboard-charts").then((mod) => ({ default: mod.UserDashboardCharts })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const PANEL_VIEWS = ["overview", "redeem", "disputes", "favorites", "influencer"] as const;
type PanelView = (typeof PANEL_VIEWS)[number];

function isPanelView(value: string | null): value is PanelView {
  if (!value) {
    return false;
  }
  return (PANEL_VIEWS as readonly string[]).includes(value);
}

interface DisputeCompanyOption {
  id: string;
  name: string;
  slug: string;
}

export default function UserPanelPage() {
  const { open: openWallet } = useUserPanel();
  const searchParams = useSearchParams();
  const [view, setView] = useState<PanelView>(() => {
    const requested = searchParams.get("view");
    return isPanelView(requested) ? requested : "overview";
  });
  useEffect(() => {
    const requested = searchParams.get("view");
    if (isPanelView(requested) && requested !== view) {
      setView(requested);
    }
  }, [searchParams, view]);

  const {
    data: summaryData,
    status: summaryStatus,
    error: summaryError,
    summary,
    favorites,
    recentTransactions,
    influencerProfile,
    refresh: refreshSummary,
  } = useUserSummary();

  const {
    offers,
    status: offersStatus,
    error: offersError,
    load: loadOffers,
  } = useWalletOffers({ enabled: view === "redeem" });

  const {
    disputes,
    status: disputesStatus,
    initialized: disputesInitialized,
    loading: disputesLoading,
    error: disputesError,
    hasMore: disputesHasMore,
    loadMore: loadDisputesMore,
    reload: reloadDisputes,
    setStatusFilter: setDisputesStatus,
    reset: resetDisputes,
    createDispute,
    submitting: disputeSubmitting,
  } = useUserDisputes({ enabled: view === "disputes" });

  const [disputeMessage, setDisputeMessage] = useState<string | null>(null);
  const [disputeCompanies, setDisputeCompanies] = useState<DisputeCompanyOption[]>([]);
  const [disputeCompaniesState, setDisputeCompaniesState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [disputeCompaniesError, setDisputeCompaniesError] = useState<string | null>(null);

  const loadDisputeCompanies = useCallback(
    async (forceReload = false) => {
      if (disputeCompaniesState === "loading") {
        return;
      }

      if (!forceReload && disputeCompaniesState === "success") {
        return;
      }

      setDisputeCompaniesState("loading");
      setDisputeCompaniesError(null);

      try {
        const response = await fetch("/api/companies/options", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Nie udało się pobrać listy firm.");
        }

        const payload: { data?: DisputeCompanyOption[] } = await response.json();
        setDisputeCompanies(payload.data ?? []);
        setDisputeCompaniesState("success");
      } catch (err) {
        setDisputeCompaniesState("error");
        setDisputeCompaniesError(
          err instanceof Error ? err.message : "Nie udało się pobrać listy firm.",
        );
      }
    },
    [disputeCompaniesState],
  );

  const handleDisputeStatusChange = useCallback(
    (value: DisputeStatusFilter) => {
      setDisputeMessage(null);
      void setDisputesStatus(value);
    },
    [setDisputesStatus],
  );

  const handleDisputeRetry = useCallback(() => {
    setDisputeMessage(null);
    void reloadDisputes();
  }, [reloadDisputes]);

  const handleDisputeLoadMore = useCallback(() => {
    void loadDisputesMore();
  }, [loadDisputesMore]);

  const handleDisputeCreate = useCallback(
    async (payload: CreateDisputePayload) => {
      setDisputeMessage(null);
      const result = await createDispute(payload);
      if (result.ok) {
        setDisputeMessage("Zgłoszenie zostało przesłane. Wrócimy z odpowiedzią e-mailem.");
        await refreshSummary(true);
      }
      return result;
    },
    [createDispute, refreshSummary],
  );

  const handleRedeemSuccess = useCallback(() => {
    void refreshSummary(true);
  }, [refreshSummary]);

  const handleRedeemError = useCallback((code?: string) => {
    console.error("Redeem error:", code);
  }, []);

  useEffect(() => {
    if (view === "redeem" && offersStatus === "error") {
      void loadOffers(true);
    }
  }, [view, offersStatus, loadOffers]);

  useEffect(() => {
    if (view === "disputes") {
      if (disputeCompaniesState !== "loading" && disputeCompaniesState !== "success") {
        void loadDisputeCompanies();
      }
    } else {
      setDisputeMessage(null);
      resetDisputes();
    }
  }, [view, disputeCompaniesState, loadDisputeCompanies, resetDisputes]);

  const hasSummary = Boolean(summaryData);

  return (
    <div className="relative min-h-screen">
      {/* Gradient background */}
      <div className="fixed inset-0 -z-10 h-[150vh] bg-gradient-dark" />
      <div className="container relative z-10 space-y-[clamp(2rem,3vw,3.5rem)] py-[clamp(2.25rem,3.5vw,3.75rem)]">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Strona główna</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Panel użytkownika</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-[clamp(1.5rem,2.2vw,2.25rem)]">
          <div className="flex flex-wrap items-start justify-between gap-[clamp(0.85rem,1.2vw,1.1rem)] sm:items-center">
            <div className="space-y-[clamp(0.35rem,0.5vw,0.45rem)]">
              <h1 className="fluid-h1 font-bold tracking-tight text-foreground">
                Panel użytkownika
              </h1>
              <p className="fluid-copy text-muted-foreground">
                Zarządzaj swoimi punktami, wymianą i zgłoszeniami
              </p>
            </div>
            <Button variant="outline" onClick={openWallet} className="fluid-button-sm rounded-full">
              Otwórz portfel
            </Button>
          </div>

          <SignedOut>
            <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
              <CardContent className="flex flex-col items-center justify-center gap-[clamp(0.85rem,1.2vw,1.1rem)] px-[clamp(1.5rem,2.3vw,2.15rem)] py-[clamp(2.5rem,3.5vw,3.25rem)] text-center">
                <h3 className="text-[clamp(1.05rem,0.5vw+0.95rem,1.25rem)] font-semibold text-foreground">
                  Zaloguj się, aby uzyskać dostęp do panelu
                </h3>
                <p className="fluid-copy text-muted-foreground">
                  Zaloguj się, aby zarządzać swoimi punktami cashback, wymianą i zgłoszeniami.
                </p>
                <SignInButton>
                  <Button variant="default" className="fluid-button rounded-full">
                    Zaloguj się z Clerk
                  </Button>
                </SignInButton>
              </CardContent>
            </Card>
          </SignedOut>

          <SignedIn>
            {summaryStatus === "loading" || summaryStatus === "idle" ? (
              <div className="space-y-[clamp(1.25rem,2vw,1.75rem)]">
                <Skeleton className="h-[clamp(8rem,12vw,10rem)] w-full rounded-2xl" />
                <Skeleton className="h-[clamp(12rem,18vw,16rem)] w-full rounded-2xl" />
              </div>
            ) : summaryStatus === "error" ? (
              <Card className="rounded-2xl border border-destructive/40 bg-destructive/10 shadow-xs">
                <CardContent className="space-y-[clamp(0.85rem,1.2vw,1.1rem)] p-[clamp(1.5rem,2.3vw,2.15rem)]">
                  <p className="fluid-copy text-destructive">{summaryError}</p>
                  <Button
                    onClick={() => void refreshSummary(true)}
                    variant="outline"
                    className="fluid-button-sm rounded-full"
                  >
                    Spróbuj ponownie
                  </Button>
                </CardContent>
              </Card>
            ) : hasSummary ? (
              <Tabs
                value={view}
                onValueChange={(value) => {
                  if (isPanelView(value)) {
                    setView(value);
                  }
                }}
                className="w-full space-y-[clamp(1.25rem,2vw,1.75rem)]"
              >
                <TabsList className="flex w-full flex-wrap justify-start gap-[clamp(0.45rem,0.7vw,0.65rem)] rounded-2xl border border-border/40 bg-background/60 p-[clamp(0.4rem,0.6vw,0.55rem)] shadow-xs">
                  <TabsTrigger
                    value="overview"
                    className="min-w-[clamp(7.5rem,16vw,9.5rem)] flex-1 rounded-full px-[clamp(0.95rem,1.5vw,1.25rem)] py-[clamp(0.45rem,0.65vw,0.6rem)] text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-semibold transition-all data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-accent/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Przegląd
                  </TabsTrigger>
                  <TabsTrigger
                    value="redeem"
                    className="min-w-[clamp(7.5rem,16vw,9.5rem)] flex-1 rounded-full px-[clamp(0.95rem,1.5vw,1.25rem)] py-[clamp(0.45rem,0.65vw,0.6rem)] text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-semibold transition-all data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-accent/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Wymiana
                  </TabsTrigger>
                  <TabsTrigger
                    value="disputes"
                    className="min-w-[clamp(7.5rem,16vw,9.5rem)] flex-1 rounded-full px-[clamp(0.95rem,1.5vw,1.25rem)] py-[clamp(0.45rem,0.65vw,0.6rem)] text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-semibold transition-all data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-accent/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Zgłoszenia
                  </TabsTrigger>
                  <TabsTrigger
                    value="favorites"
                    className="min-w-[clamp(7.5rem,16vw,9.5rem)] flex-1 rounded-full px-[clamp(0.95rem,1.5vw,1.25rem)] py-[clamp(0.45rem,0.65vw,0.6rem)] text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-semibold transition-all data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-accent/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Ulubione
                  </TabsTrigger>
                  <TabsTrigger
                    value="influencer"
                    className="min-w-[clamp(7.5rem,16vw,9.5rem)] flex-1 rounded-full px-[clamp(0.95rem,1.5vw,1.25rem)] py-[clamp(0.45rem,0.65vw,0.6rem)] text-[clamp(0.85rem,0.35vw+0.75rem,0.95rem)] font-semibold transition-all data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-accent/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Influencer
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-[clamp(1.5rem,2.3vw,2.1rem)]">
                  <UserDashboardQuickStats
                    summary={summary}
                    recentTransactionsCount={recentTransactions.length}
                  />
                  <UserDashboardCharts summary={summary} />
                  <UserDashboardRecent
                    transactions={recentTransactions}
                    onShowHistory={openWallet}
                  />
                </TabsContent>

                <TabsContent value="redeem">
                  <RedeemSection
                    available={summary.available}
                    offers={offers}
                    offersState={offersStatus}
                    offersError={offersError}
                    onReloadOffers={() => {
                      void loadOffers(true);
                    }}
                    onCancel={() => setView("overview")}
                    onSuccess={handleRedeemSuccess}
                    onError={handleRedeemError}
                  />
                </TabsContent>

                <TabsContent value="disputes">
                  <DisputesSection
                    disputes={disputes}
                    loading={disputesLoading}
                    error={disputesError}
                    status={disputesStatus}
                    initialized={disputesInitialized}
                    hasMore={disputesHasMore}
                    submitting={disputeSubmitting}
                    message={disputeMessage}
                    companies={disputeCompanies}
                    companiesLoading={disputeCompaniesState === "loading"}
                    companiesError={disputeCompaniesError}
                    onReloadCompanies={() => loadDisputeCompanies(true)}
                    onBack={() => setView("overview")}
                    onStatusChange={handleDisputeStatusChange}
                    onRetry={handleDisputeRetry}
                    onLoadMore={handleDisputeLoadMore}
                    onCreate={handleDisputeCreate}
                  />
                </TabsContent>

                <TabsContent value="favorites">
                  <FavoritesSection favorites={favorites} />
                </TabsContent>

                <TabsContent value="influencer">
                  <InfluencerSection
                    profile={influencerProfile}
                    onUpdated={() => {
                      void refreshSummary(true);
                    }}
                  />
                </TabsContent>
              </Tabs>
            ) : null}
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
