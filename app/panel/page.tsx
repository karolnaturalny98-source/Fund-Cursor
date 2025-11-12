"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CashbackSummary,
  Company,
  DisputeCase,
  DisputeStatus,
  InfluencerProfile,
  RedeemCompanyOffer,
  RedeemPlanOption,
} from "@/lib/types";
import { useUserPanel } from "@/components/panels/user-panel-context";
import { UserDashboardQuickStats } from "@/components/panels/user-dashboard-quick-stats";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/analysis/loading-skeleton";
import { UserDashboardRecent } from "@/components/panels/user-dashboard-recent";

// UserDashboardCharts requires ssr: false because it uses Recharts
const UserDashboardCharts = dynamic(
  () => import("@/components/panels/user-dashboard-charts").then((mod) => ({ default: mod.UserDashboardCharts })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
import { RedeemSection } from "@/components/panels/sections/redeem-section";
import { DisputesSection } from "@/components/panels/sections/disputes-section";
import { FavoritesSection } from "@/components/panels/sections/favorites-section";
import { InfluencerSection } from "@/components/panels/sections/influencer-section";

type TransactionStatus = "PENDING" | "APPROVED" | "REDEEMED" | "REJECTED";

interface WalletTransaction {
  id: string;
  status: TransactionStatus;
  points: number;
  createdAt: string;
  notes?: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    discountCode: string | null;
    cashbackRate: number | null;
  } | null;
}

interface UserSummary {
  summary: CashbackSummary;
  favorites: Company[];
  recentTransactions: WalletTransaction[];
  influencerProfile: InfluencerProfile | null;
}

interface CreateDisputeFormPayload {
  companyId: string;
  planId?: string;
  title: string;
  category: string;
  description: string;
  requestedAmount?: number | null;
  requestedCurrency?: string | null;
  evidenceLinks?: string[];
}

interface DisputeCompanyOption {
  id: string;
  name: string;
  slug: string;
}

type DisputeStatusFilter = DisputeStatus | "ALL";

const disputeStatusLabels: Record<DisputeStatusFilter, string> = {
  ALL: "Wszystkie",
  OPEN: "Otwarte",
  IN_REVIEW: "W trakcie analizy",
  WAITING_USER: "Czekamy na odpowiedź",
  RESOLVED: "Zamknięte",
  REJECTED: "Odrzucone",
};

const disputeStatusOptions: DisputeStatusFilter[] = [
  "ALL",
  "OPEN",
  "IN_REVIEW",
  "WAITING_USER",
  "RESOLVED",
  "REJECTED",
];

export default function UserPanelPage() {
  const { open: openWallet } = useUserPanel();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [data, setData] = useState<UserSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"overview" | "redeem" | "disputes" | "favorites" | "influencer">("overview");
  const [offersState, setOffersState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [offers, setOffers] = useState<RedeemCompanyOffer[] | null>(null);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [disputesCursor, setDisputesCursor] = useState<string | null>(null);
  const [disputesStatus, setDisputesStatus] = useState<DisputeStatusFilter>("ALL");
  const [disputesInitialized, setDisputesInitialized] = useState(false);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [disputesError, setDisputesError] = useState<string | null>(null);
  const disputesLoadingRef = useRef(false);
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputeMessage, setDisputeMessage] = useState<string | null>(null);
  const [disputeCompanies, setDisputeCompanies] = useState<DisputeCompanyOption[]>([]);
  const [disputeCompaniesState, setDisputeCompaniesState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [disputeCompaniesError, setDisputeCompaniesError] = useState<string | null>(null);

  const refreshSummary = useCallback(async () => {
    setState("loading");
    setError(null);

    try {
      const response = await fetch("/api/user/summary", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Brak uprawnień. Zaloguj się ponownie."
            : "Nie udało się pobrać danych użytkownika.",
        );
      }

      const payload: UserSummary = await response.json();
      setData(payload);
      setState("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Wystąpił nieznany błąd.",
      );
      setState("error");
    }
  }, []);

  const loadOffers = useCallback(
    async (forceReload = false) => {
      if (offersState === "loading") {
        return;
      }

      if (!forceReload && offersState === "success" && (offers?.length ?? 0) > 0) {
        return;
      }

      setOffersState("loading");
      setOffersError(null);

      try {
        const response = await fetch("/api/wallet/offers", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Nie udało się pobrać listy ofert.");
        }

        const body: { data?: RedeemCompanyOffer[] } = await response.json();
        setOffers(body?.data ?? []);
        setOffersState("success");
      } catch (err) {
        setOffersState("error");
        setOffersError(
          err instanceof Error ? err.message : "Nie udało się pobrać listy ofert.",
        );
      }
    },
    [offersState, offers?.length],
  );

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

  const loadDisputes = useCallback(
    async ({
      reset = false,
      status: statusOverride,
    }: { reset?: boolean; status?: DisputeStatusFilter } = {}) => {
      if (disputesLoadingRef.current) {
        return;
      }

      const nextStatus = statusOverride ?? disputesStatus;

      if (!reset && !disputesCursor) {
        return;
      }

      if (statusOverride !== undefined) {
        setDisputesStatus(statusOverride);
      }

      disputesLoadingRef.current = true;
      setDisputesLoading(true);
      setDisputesError(null);

      if (reset) {
        setDisputes([]);
        setDisputesCursor(null);
      }

      const params = new URLSearchParams();
      params.set("limit", "20");

      if (nextStatus !== "ALL") {
        params.set("status", nextStatus);
      }

      if (!reset && disputesCursor) {
        params.set("cursor", disputesCursor);
      }

      const query = params.toString();
      const url = query
        ? `/api/user/disputes?${query}`
        : "/api/user/disputes";

      try {
        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
          let message = "Nie udało się pobrać zgłoszeń.";
          try {
            const body: { error?: string } = await response
              .clone()
              .json();
            if (body?.error) {
              message = body.error;
            }
          } catch {
            // ignore parse failure
          }
          throw new Error(message);
        }

        const payload: {
          items: DisputeCase[];
          nextCursor: string | null;
        } = await response.json();

        setDisputes((prev) =>
          reset ? payload.items : [...prev, ...payload.items],
        );
        setDisputesCursor(payload.nextCursor ?? null);
        setDisputesInitialized(true);
      } catch (err) {
        setDisputesError(
          err instanceof Error
            ? err.message
            : "Nie udało się pobrać zgłoszeń.",
        );
      } finally {
        setDisputesLoading(false);
        disputesLoadingRef.current = false;
      }
    },
    [disputesCursor, disputesStatus],
  );

  const handleDisputeStatusChange = useCallback(
    (value: DisputeStatusFilter) => {
      setDisputesStatus(value);
      setDisputes([]);
      setDisputesCursor(null);
      setDisputesInitialized(false);
      setDisputeMessage(null);
      void loadDisputes({ reset: true, status: value });
    },
    [loadDisputes],
  );

  const handleDisputeRetry = useCallback(() => {
    setDisputes([]);
    setDisputesCursor(null);
    setDisputesInitialized(false);
    setDisputeMessage(null);
    void loadDisputes({ reset: true });
  }, [loadDisputes]);

  const handleDisputeLoadMore = useCallback(() => {
    void loadDisputes();
  }, [loadDisputes]);

  const handleDisputeCreate = useCallback(
    async (payload: CreateDisputeFormPayload) => {
      setDisputeMessage(null);
      setDisputeSubmitting(true);
      try {
        const response = await fetch("/api/user/disputes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const body = (await response
          .json()
          .catch(() => null)) as DisputeCase | { error?: string } | null;

        if (!response.ok || !body || "error" in body) {
          const message =
            (body && "error" in body && body.error) ||
            "Nie udało się wysłać zgłoszenia.";
          throw new Error(message ?? undefined);
        }

        setDisputeMessage(
          "Zgłoszenie zostało przesłane. Wrócimy z odpowiedzią e-mailem.",
        );
        setDisputesStatus("OPEN");
        setDisputes([]);
        setDisputesCursor(null);
        setDisputesInitialized(false);
        await loadDisputes({ reset: true, status: "OPEN" });
        void refreshSummary();
        return { ok: true as const };
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Nie udało się wysłać zgłoszenia.";
        return { ok: false as const, error: message };
      } finally {
        setDisputeSubmitting(false);
      }
    },
    [loadDisputes, refreshSummary],
  );

  const handleRedeemSuccess = useCallback(() => {
    void refreshSummary();
  }, [refreshSummary]);

  const handleRedeemError = useCallback((code?: string) => {
    console.error("Redeem error:", code);
  }, []);

  useEffect(() => {
    void refreshSummary();
  }, [refreshSummary]);

  useEffect(() => {
    if (view === "redeem") {
      if (offersState === "idle" || offersState === "error") {
        void loadOffers(true);
      }
    }
  }, [view, offersState, loadOffers]);

  useEffect(() => {
    if (view === "disputes") {
      if (
        disputeCompaniesState !== "loading" &&
        disputeCompaniesState !== "success"
      ) {
        void loadDisputeCompanies();
      }

      if (!disputesInitialized && !disputesLoading && !disputesError) {
        void loadDisputes({ reset: true });
      }
    }
  }, [
    view,
    disputesInitialized,
    disputesLoading,
    disputesError,
    disputeCompaniesState,
    loadDisputes,
    loadDisputeCompanies,
  ]);

  const summary: CashbackSummary = data?.summary ?? {
    pending: 0,
    approved: 0,
    redeemed: 0,
    available: 0,
  };

  const favorites = data?.favorites ?? [];
  const recentTransactions = data?.recentTransactions ?? [];

  return (
    <div className="relative min-h-screen">
      {/* Gradient background */}
      <div className="fixed inset-0 -z-10 h-[150vh] bg-gradient-dark" />
      <div className="container space-y-8 py-8 relative z-10">
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

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel użytkownika</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Zarządzaj swoimi punktami, wymianą i zgłoszeniami
            </p>
          </div>
          <Button variant="outline" onClick={openWallet} className="rounded-lg">
            Otwórz portfel
          </Button>
        </div>

        <SignedOut>
          <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
            <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
              <h3 className="text-lg font-semibold">
                Zaloguj się, aby uzyskać dostęp do panelu
              </h3>
              <p className="text-sm text-muted-foreground">
                Zaloguj się, aby zarządzać swoimi punktami cashback, wymianą i zgłoszeniami.
              </p>
              <SignInButton>
                <Button variant="default" className="rounded-lg">Zaloguj się z Clerk</Button>
              </SignInButton>
            </CardContent>
          </Card>
        </SignedOut>

        <SignedIn>
          {state === "loading" || state === "idle" ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : state === "error" ? (
            <Card className="rounded-lg border border-destructive/40 bg-destructive/10">
              <CardContent className="p-6">
                <p className="text-sm text-destructive">{error}</p>
                <Button 
                  onClick={() => void refreshSummary()} 
                  variant="outline" 
                  className="mt-4 rounded-lg"
                >
                  Spróbuj ponownie
                </Button>
              </CardContent>
            </Card>
          ) : data ? (
            <Tabs value={view} onValueChange={(value) => setView(value as typeof view)} className="w-full">
              <TabsList className="grid w-full grid-cols-5 rounded-lg border border-border/40 bg-background/60 p-1 shadow-xs">
                <TabsTrigger value="overview" className="rounded-lg transition-all data-[state=inactive]:hover:bg-accent/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Przegląd
                </TabsTrigger>
                <TabsTrigger value="redeem" className="rounded-lg transition-all data-[state=inactive]:hover:bg-accent/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Wymiana
                </TabsTrigger>
                <TabsTrigger value="disputes" className="rounded-lg transition-all data-[state=inactive]:hover:bg-accent/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Zgłoszenia
                </TabsTrigger>
                <TabsTrigger value="favorites" className="rounded-lg transition-all data-[state=inactive]:hover:bg-accent/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Ulubione
                </TabsTrigger>
                <TabsTrigger value="influencer" className="rounded-lg transition-all data-[state=inactive]:hover:bg-accent/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Influencer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-8">
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

              <TabsContent value="redeem" className="mt-6">
                <RedeemSection
                  available={summary.available}
                  offers={offers}
                  offersState={offersState}
                  offersError={offersError}
                  onReloadOffers={() => loadOffers(true)}
                  onCancel={() => setView("overview")}
                  onSuccess={handleRedeemSuccess}
                  onError={handleRedeemError}
                />
              </TabsContent>

              <TabsContent value="disputes" className="mt-6">
                <DisputesSection
                  disputes={disputes}
                  loading={disputesLoading}
                  error={disputesError}
                  status={disputesStatus}
                  initialized={disputesInitialized}
                  hasMore={Boolean(disputesCursor)}
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

              <TabsContent value="favorites" className="mt-6">
                <FavoritesSection favorites={favorites} />
              </TabsContent>

              <TabsContent value="influencer" className="mt-6">
                <InfluencerSection
                  profile={data.influencerProfile}
                  onUpdated={() => {
                    void refreshSummary();
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

