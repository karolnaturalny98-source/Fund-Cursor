"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Lazy loaded sections for better performance
const WalletSection = dynamic(() => import("./sections/wallet-section").then(mod => ({ default: mod.WalletSection })), {
  loading: () => (
    <div className="h-64 animate-pulse rounded-3xl border border-border/45 bg-background/75 backdrop-blur" />
  ),
});
const TransactionsSection = dynamic(() => import("./sections/transactions-section").then(mod => ({ default: mod.TransactionsSection })), {
  loading: () => (
    <div className="h-64 animate-pulse rounded-3xl border border-border/45 bg-background/75 backdrop-blur" />
  ),
});
const HistorySection = dynamic(() => import("./sections/history-section").then(mod => ({ default: mod.HistorySection })), {
  loading: () => (
    <div className="h-96 animate-pulse rounded-3xl border border-border/45 bg-background/75 backdrop-blur" />
  ),
});

import { useUserSummary } from "@/components/panels/hooks/use-user-summary";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui/surface";
import type {
  Company,
  DisputeCase,
  DisputeStatus,
  InfluencerProfile,
  InfluencerStatus,
  RedeemCompanyOffer,
  RedeemPlanOption,
  TransactionStatus,
  WalletTransaction,
} from "@/lib/types";
import type { CreateDisputePayload } from "@/components/panels/hooks/use-user-disputes";
import { useUserPanel } from "./user-panel-context";

interface DisputeCompanyOption {
  id: string;
  name: string;
  slug: string;
}


type HistoryStatusFilter = TransactionStatus | "ALL";

type DisputeStatusFilter = DisputeStatus | "ALL";

const disputeStatusLabels: Record<DisputeStatusFilter, string> = {
  ALL: "Wszystkie",
  OPEN: "Otwarte",
  IN_REVIEW: "W trakcie analizy",
  WAITING_USER: "Czekamy na odpowied\u017a",
  RESOLVED: "Zamkni\u0119te",
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

export function UserPanel() {
  const { isOpen, close } = useUserPanel();
  const {
    data: summaryData,
    status: summaryStatus,
    error: summaryError,
    summary,
    recentTransactions,
    refresh: refreshSummary,
  } = useUserSummary({ enabled: isOpen });
  const [view, setView] = useState<"overview" | "history">(
    "overview",
  );
  const [historyItems, setHistoryItems] = useState<WalletTransaction[]>([]);
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [historyStatus, setHistoryStatus] =
    useState<HistoryStatusFilter>("ALL");
  const [historyOnlyRedeem, setHistoryOnlyRedeem] = useState(false);
  const [historyInitialized, setHistoryInitialized] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [copiedTransactionId, setCopiedTransactionId] = useState<string | null>(null);
  const [copyAnnouncement, setCopyAnnouncement] = useState<string | null>(null);
  const [offersState, setOffersState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [offers, setOffers] = useState<RedeemCompanyOffer[] | null>(null);
  // TODO: Future feature - offers error handling
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [offersError, setOffersError] = useState<string | null>(null);
  
  // TODO: Future feature - disputes functionality (prepared but not yet activated)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [disputesCursor, setDisputesCursor] = useState<string | null>(null);
  const [disputesStatus, setDisputesStatus] =
    useState<DisputeStatusFilter>("ALL");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [disputesInitialized, setDisputesInitialized] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [disputesLoading, setDisputesLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [disputesError, setDisputesError] = useState<string | null>(null);
  const disputesLoadingRef = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [disputeMessage, setDisputeMessage] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [disputeCompanies, setDisputeCompanies] = useState<DisputeCompanyOption[]>([]);
  const [disputeCompaniesState, setDisputeCompaniesState] = useState<"idle" | "loading" | "success" | "error">("idle");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [disputeCompaniesError, setDisputeCompaniesError] = useState<string | null>(null);

  const openRef = useRef(isOpen);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    openRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // TODO: Future feature - dispute companies loader (prepared for disputes feature)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadDisputeCompanies = useCallback(
    async (forceReload = false) => {
      if (!isOpen) {
        return;
      }

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
    [disputeCompaniesState, isOpen],
  );

  // TODO: Future feature - offers loader (prepared for redeem offers feature)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadOffers = useCallback(
    async (forceReload = false) => {
      if (!isOpen) {
        return;
      }

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
    [isOpen, offersState, offers?.length],
  );

  const resetHistoryState = useCallback(() => {
    setHistoryItems([]);
    setHistoryCursor(null);
    setHistoryInitialized(false);
    setHistoryError(null);
  }, []);

  const resetDisputesState = useCallback(() => {
    setDisputes([]);
    setDisputesCursor(null);
    setDisputesInitialized(false);
    setDisputesError(null);
  }, []);

  const handleCopyCode = useCallback(
    async (transactionId: string, code: string) => {
      if (!code) {
        setCopyAnnouncement("Brak kodu do skopiowania.");
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(() => {
          setCopiedTransactionId(null);
          setCopyAnnouncement(null);
        }, 2000);
        logWalletEvent("wallet_copy_code_error", "missing");
        return;
      }

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(code);
        } else {
          const textarea = document.createElement("textarea");
          textarea.value = code;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "absolute";
          textarea.style.left = "-9999px";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }

        setCopiedTransactionId(transactionId);
        setCopyAnnouncement("Skopiowano kod do schowka.");
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(() => {
          setCopiedTransactionId(null);
          setCopyAnnouncement(null);
        }, 2000);
        logWalletEvent("wallet_copy_code");
      } catch (error) {
        console.warn("wallet copy failed", error);
        setCopyAnnouncement("Nie udalo sie skopiowac kodu.");
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(() => {
          setCopiedTransactionId(null);
          setCopyAnnouncement(null);
        }, 2000);
        logWalletEvent("wallet_copy_code_error", "clipboard");
      }
    },
    [],
  );

  const loadHistory = useCallback(
    async ({ reset = false }: { reset?: boolean } = {}) => {
      if (!isOpen) {
        return;
      }

      if (historyLoading) {
        return;
      }

      if (!reset && !historyCursor) {
        return;
      }

      if (reset) {
        setHistoryItems([]);
        setHistoryCursor(null);
      }

      setHistoryLoading(true);
      setHistoryError(null);

      const params = new URLSearchParams();

      if (historyStatus !== "ALL") {
        params.set("status", historyStatus);
      }

      if (historyOnlyRedeem) {
        params.set("redeemOnly", "true");
      }

      if (!reset && historyCursor) {
        params.set("cursor", historyCursor);
      }

      const query = params.toString();
      const url = query
        ? `/api/wallet/transactions?${query}`
        : "/api/wallet/transactions";

      try {
        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Nie udało się pobrać historii transakcji.");
        }

        const payload: {
          transactions: WalletTransaction[];
          nextCursor: string | null;
        } = await response.json();

        setHistoryItems((prev) =>
          reset ? payload.transactions : [...prev, ...payload.transactions],
        );
        setHistoryCursor(payload.nextCursor ?? null);
        setHistoryInitialized(true);
      } catch (err) {
        setHistoryError(
          err instanceof Error
            ? err.message
            : "Nie udało się pobrać historii transakcji.",
        );
      } finally {
        setHistoryLoading(false);
      }
    },
    [
      historyCursor,
      historyLoading,
      historyOnlyRedeem,
      historyStatus,
      isOpen,
    ],
  );

  // TODO: Future feature - disputes loader (prepared for disputes feature)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadDisputes = useCallback(
    async ({
      reset = false,
      status: statusOverride,
    }: { reset?: boolean; status?: DisputeStatusFilter } = {}) => {
      if (!isOpen) {
        return;
      }

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
          let message = "Nie uda\u0142o si\u0119 pobra\u0107 zg\u0142osze\u0144.";
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
            : "Nie uda\u0142o si\u0119 pobra\u0107 zg\u0142osze\u0144.",
        );
      } finally {
        setDisputesLoading(false);
        disputesLoadingRef.current = false;
      }
    },
    [disputesCursor, disputesStatus, isOpen],
  );

  useEffect(() => {
    if (!isOpen) {
      setView("overview");
      resetHistoryState();
      setHistoryStatus("ALL");
      setHistoryOnlyRedeem(false);
      resetDisputesState();
      setDisputesStatus("ALL");
      setDisputeMessage(null);
      return;
    }

    void refreshSummary();
  }, [
    isOpen,
    refreshSummary,
    resetDisputesState,
    resetHistoryState,
  ]);

  useEffect(() => {
    if (view !== "history") {
      return;
    }

    if (!historyInitialized && !historyLoading && !historyError) {
      void loadHistory({ reset: true });
    }
  }, [view, historyInitialized, historyLoading, historyError, loadHistory]);

  const hasHistoryMore = Boolean(historyCursor);

  const handleStatusFilterChange = useCallback(
    (value: HistoryStatusFilter) => {
      setHistoryStatus(value);
      resetHistoryState();
      logWalletEvent("wallet_history_filter", value.toLowerCase());
    },
    [resetHistoryState],
  );

  const handleRedeemFilterChange = useCallback(
    (value: boolean) => {
      setHistoryOnlyRedeem(value);
      resetHistoryState();
      logWalletEvent("wallet_history_filter", value ? "redeem_only:on" : "redeem_only:off");
    },
    [resetHistoryState],
  );

  const handleShowHistory = useCallback(() => {
    setView((current) => {
      const next = current === "history" ? "overview" : "history";
      if (next === "history") {
        logWalletEvent("wallet_history_open");
      }
      return next;
    });
  }, []);

  const hasSummary = Boolean(summaryData);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Portfel cashback
              </p>
              <SheetTitle>Portfel</SheetTitle>
            </div>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </SheetHeader>

        <SignedOut>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <h3 className="text-lg font-semibold">
              Zaloguj się, aby śledzić punkty
            </h3>
            <p className="text-sm text-muted-foreground">
              Twoje saldo cashbacku, historia zakupów i ulubione firmy będą
              dostępne po zalogowaniu.
            </p>
            <SignInButton>
              <Button variant="default" className="rounded-lg">Zaloguj się z Clerk</Button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="mt-6 space-y-6">
            <div aria-live="polite" className="sr-only">
              {copyAnnouncement ?? ""}
            </div>
            {summaryStatus === "loading" ? <LoadingState /> : null}
            {summaryStatus === "error" ? <ErrorState message={summaryError ?? "Nie udało się pobrać portfela."} /> : null}
            {hasSummary ? (
              <Tabs value={view} onValueChange={(value) => {
                if (value === "overview") setView("overview");
                else if (value === "history") handleShowHistory();
              }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-2xl border border-border/45 bg-background/80 p-1 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.4)] backdrop-blur">
                  <TabsTrigger 
                    value="overview"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Przegląd
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Historia
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <WalletSection
                    summary={summary}
                    activeView={view}
                    onShowHistory={handleShowHistory}
                  />
                  <TransactionsSection
                    transactions={recentTransactions}
                    onShowHistory={handleShowHistory}
                    onCopyCode={handleCopyCode}
                    copiedTransactionId={copiedTransactionId}
                  />
                  <Surface variant="panel" padding="md" className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">Pełne operacje cashback</p>
                      <p className="text-sm text-muted-foreground">
                        Wymiana punktów i zgłoszenia sporów są dostępne w pełnym panelu użytkownika.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href="/panel?view=redeem"
                        className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
                      >
                        Wymień punkty
                      </Link>
                      <Link
                        href="/panel?view=disputes"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "rounded-full",
                        )}
                      >
                        Zgłoszenia
                      </Link>
                      <Link
                        href="/panel"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "rounded-full",
                        )}
                      >
                        Otwórz panel
                      </Link>
                    </div>
                  </Surface>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <HistorySection
                    transactions={historyItems}
                    loading={historyLoading}
                    error={historyError}
                    status={historyStatus}
                    onlyRedeem={historyOnlyRedeem}
                    hasMore={hasHistoryMore}
                    initialized={historyInitialized}
                    onBack={() => setView("overview")}
                    onLoadMore={() => {
                      void loadHistory();
                    }}
                    onRetry={() => {
                      void loadHistory({ reset: true });
                    }}
                    onStatusChange={handleStatusFilterChange}
                    onToggleRedeem={handleRedeemFilterChange}
                    onCopyCode={handleCopyCode}
                    copiedTransactionId={copiedTransactionId}
                  />
                </TabsContent>
              </Tabs>
            ) : summaryStatus === "loading" ? null : (
              <EmptyState />
            )}
          </div>
        </SignedIn>
      </SheetContent>
    </Sheet>
  );
}

// WalletSection, TransactionsSection, and HistorySection are now lazy loaded from ./sections/

// DisputesSection, RedeemSection, InfluencerSection, FavoritesSection remain in this file 
// (they are too complex to split right now)

interface DisputesSectionProps {
  disputes: DisputeCase[];
  loading: boolean;
  error: string | null;
  status: DisputeStatusFilter;
  initialized: boolean;
  hasMore: boolean;
  submitting: boolean;
  message: string | null;
  companies: DisputeCompanyOption[];
  companiesLoading: boolean;
  companiesError: string | null;
  onReloadCompanies: () => void;
  onBack: () => void;
  onStatusChange: (value: DisputeStatusFilter) => void;
  onRetry: () => void;
  onLoadMore: () => void;
  onCreate: (payload: CreateDisputePayload) => Promise<{ ok: boolean; error?: string }>;
}

function formatDisputeAmount(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DisputesSection({
  disputes,
  loading,
  error,
  status,
  initialized,
  hasMore,
  submitting,
  message,
  companies,
  companiesLoading,
  companiesError,
  onReloadCompanies,
  onBack: _onBack,
  onStatusChange,
  onRetry,
  onLoadMore,
  onCreate,
}: DisputesSectionProps) {
  const [form, setForm] = useState({
    companyId: "",
    planId: "",
    title: "",
    category: "",
    description: "",
    requestedAmount: "",
    requestedCurrency: "USD",
    evidenceLinks: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (companiesLoading) {
      return;
    }

    setForm((previous) => {
      const firstCompanyId = companies[0]?.id ?? "";

      if (!firstCompanyId) {
        if (!previous.companyId) {
          return previous;
        }
        return { ...previous, companyId: "" };
      }

      const hasCurrent = companies.some((company) => company.id === previous.companyId);
      if (!hasCurrent) {
        return { ...previous, companyId: firstCompanyId };
      }

      return previous;
    });
  }, [companies, companiesLoading]);

  const handleChange = useCallback(
    (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
      setFormError(null);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);

      const trimmedTitle = form.title.trim();
      const trimmedCategory = form.category.trim();
      const trimmedDescription = form.description.trim();
      const trimmedCurrency = form.requestedCurrency.trim().toUpperCase();

      if (!form.companyId) {
        setFormError("Wybierz firme z listy.");
        return;
      }

      if (trimmedTitle.length < 5) {
        setFormError("Tytul powinien miec co najmniej 5 znakow.");
        return;
      }

      if (trimmedCategory.length < 2) {
        setFormError("Kategoria jest wymagana.");
        return;
      }

      if (trimmedDescription.length < 20) {
        setFormError("Opis powinien miec co najmniej 20 znakow.");
        return;
      }

      let amount: number | undefined;
      const normalizedAmount = form.requestedAmount.trim().replace(",", ".");
      if (normalizedAmount.length > 0) {
        const parsed = Number.parseFloat(normalizedAmount);
        if (Number.isNaN(parsed) || parsed < 0) {
          setFormError("Kwota roszczenia musi byc liczba dodatnia.");
          return;
        }
        amount = parsed;
      }

      const evidenceLinks = form.evidenceLinks
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
        .slice(0, 10);

      const result = await onCreate({
        companyId: form.companyId,
        planId: form.planId.trim() || undefined,
        title: trimmedTitle,
        category: trimmedCategory,
        description: trimmedDescription,
        requestedAmount: amount ?? undefined,
        requestedCurrency: trimmedCurrency || undefined,
        evidenceLinks: evidenceLinks.length ? evidenceLinks : undefined,
      });

      if (!result.ok) {
        setFormError(result.error ?? "Nie udalo sie wyslac zgloszenia.");
        return;
      }

      setForm({
        companyId: companies[0]?.id ?? "",
        planId: "",
        title: "",
        category: "",
        description: "",
        requestedAmount: "",
        requestedCurrency: "USD",
        evidenceLinks: "",
      });
    },
    [companies, form, onCreate],
  );

  const noCompaniesAvailable =
    !companiesLoading && !companiesError && companies.length === 0;

  const canSubmit =
    !submitting &&
    !!form.companyId &&
    form.title.trim().length >= 5 &&
    form.category.trim().length >= 2 &&
    form.description.trim().length >= 20 &&
    !companiesLoading &&
    companies.length > 0;

  return (
    <div className="space-y-4">
      <Card className="shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Zgłoszenia i pomoc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <Label className="flex items-center gap-2">
              <span>Status</span>
              <Select value={status} onValueChange={(value) => onStatusChange(value as DisputeStatusFilter)}>
                <SelectTrigger className="h-9 w-[160px] rounded-lg border border-transparent bg-gradient-card shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {disputeStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {disputeStatusLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>

            {companiesLoading ? (
              <span className="text-xs text-muted-foreground">Ładowanie firm…</span>
            ) : companiesError ? (
              <Alert variant="destructive" className="py-2 border border-border/40">
                <AlertDescription className="flex items-center gap-2">
                  <span>{companiesError}</span>
                  <Button size="sm" variant="premium-outline" onClick={onReloadCompanies} disabled={companiesLoading} className="rounded-full">
                    Spróbuj ponownie
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

          {error ? (
            <Alert variant="destructive" className="mt-4 border border-border/40">
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button size="sm" variant="premium-outline" onClick={onRetry} className="rounded-full">
                    Spróbuj ponownie
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {disputes.map((item) => (
          <Card key={item.id} className="border border-border/40 shadow-premium transition-all hover:border border-border/40-premium hover:shadow-premium-lg">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(item.createdAt)}</span>
                      <PremiumBadge variant="outline" className={cn("border-muted-foreground/40 text-muted-foreground text-xs font-semibold")}>
                        {disputeStatusLabels[item.status]}
                      </PremiumBadge>
                      {item.company ? (
                        <Link className="hover:underline hover:text-primary transition-colors" href={`/firmy/${item.company.slug}`}>
                          {item.company.name}
                        </Link>
                      ) : null}
                      {item.plan ? <span>Plan: {item.plan.name}</span> : null}
                    </div>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{item.description}</p>
                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  {item.requestedAmount !== null && item.requestedCurrency ? (
                    <span>
                      Roszczenie: <strong>{formatDisputeAmount(item.requestedAmount, item.requestedCurrency)}</strong>
                    </span>
                  ) : null}
                  {item.assignedAdmin ? (
                    <span>
                      Opiekun: <strong>{item.assignedAdmin.displayName ?? item.assignedAdmin.email ?? item.assignedAdmin.clerkId}</strong>
                    </span>
                  ) : null}
                </div>
                {item.evidenceLinks?.length ? (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {item.evidenceLinks.map((link) => (
                      <Link key={link} className="underline hover:text-primary transition-colors" href={link} target="_blank" rel="noreferrer">
                        Dowód
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}

        {!error && !loading && initialized && disputes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak zgłoszeń dla wybranych filtrów.</p>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        ) : null}

        {!error && hasMore ? (
          <Button className="w-full rounded-full" size="sm" variant="premium-outline" onClick={onLoadMore}>
            Wczytaj więcej
          </Button>
        ) : null}
      </div>

      {/* Create form */}
      <Card className="shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Zgłoś problem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message ? (
            <Alert className="border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-border/40">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}

          {formError ? (
            <Alert variant="destructive" className="border border-border/40">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <form className="grid gap-3" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label>Firma</Label>
              <Select
                value={form.companyId || undefined}
                onValueChange={(value) => {
                  setForm((prev) => ({ ...prev, companyId: value }));
                  setFormError(null);
                }}
                disabled={submitting || companiesLoading || noCompaniesAvailable}
                required
              >
                <SelectTrigger className="rounded-lg border border-transparent bg-gradient-card shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]">
                  <SelectValue placeholder="Wybierz firmę" />
                </SelectTrigger>
                <SelectContent>
                  {(companies ?? []).map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tytuł</Label>
                <Input value={form.title} onChange={handleChange("title")} required className="border border-border/40" />
              </div>
              <div className="space-y-2">
                <Label>Kategoria</Label>
                <Input value={form.category} onChange={handleChange("category")} required className="border border-border/40" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea rows={4} value={form.description} onChange={handleChange("description")} required className="border border-border/40" />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Kwota roszczenia (opcjonalnie)</Label>
                <Input inputMode="decimal" placeholder="np. 99.99" value={form.requestedAmount} onChange={handleChange("requestedAmount")} className="border border-border/40" />
              </div>
              <div className="space-y-2">
                <Label>Waluta</Label>
                <Input maxLength={3} value={form.requestedCurrency} onChange={handleChange("requestedCurrency")} className="border border-border/40" />
              </div>
              <div className="space-y-2">
                <Label>ID planu (opcjonalnie)</Label>
                <Input value={form.planId} onChange={handleChange("planId")} placeholder="cuid planu" className="border border-border/40" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Linki dowodów (po jednym w wierszu)</Label>
              <Textarea rows={3} value={form.evidenceLinks} onChange={handleChange("evidenceLinks")} className="border border-border/40" />
            </div>

            <CardFooter className="px-0 pb-0 flex justify-end gap-2">
              <Button type="submit" disabled={!canSubmit} variant="premium" className="rounded-full">
                {submitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface RedeemSectionProps {
  available: number;
  offers: RedeemCompanyOffer[] | null;
  offersState: "idle" | "loading" | "success" | "error";
  offersError: string | null;
  onReloadOffers: () => void;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (code?: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RedeemSection({
  available,
  offers,
  offersState,
  offersError,
  onReloadOffers,
  onCancel: _onCancel,
  onSuccess,
  onError,
}: RedeemSectionProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [points, setPoints] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const pointsInputId = "wallet-redeem-points";
  const companySelectId = "wallet-redeem-company";
  const planSelectId = "wallet-redeem-plan";
  const notesInputId = "wallet-redeem-notes";

  const selectedCompany = useMemo(() => {
    return offers?.find((company) => company.id === selectedCompanyId) ?? null;
  }, [offers, selectedCompanyId]);

  const availablePlans: RedeemPlanOption[] = useMemo(() => {
    if (!selectedCompany) {
      return [];
    }
    return selectedCompany.plans.filter((plan) => plan.currency === "USD");
  }, [selectedCompany]);

  const selectedPlan: RedeemPlanOption | null = useMemo(() => {
    if (!availablePlans.length) {
      return null;
    }
    return (
      availablePlans.find((plan) => plan.id === selectedPlanId) ??
      availablePlans[0] ??
      null
    );
  }, [availablePlans, selectedPlanId]);

  useEffect(() => {
    // Reset plan when company changes
    setSelectedPlanId("");
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedPlan) {
      setPoints(selectedPlan.price.toString());
    } else {
      setPoints("");
    }
  }, [selectedPlan]);

  const planCost = selectedPlan ? Math.round(selectedPlan.price) : null;
  const insufficientPoints = planCost !== null && planCost > available;

  const clearForm = useCallback(() => {
    setSelectedCompanyId("");
    setSelectedPlanId("");
    setPoints("");
    setNotes("");
    setFormError(null);
    setStatusMessage(null);
  }, []);

  const handleCompanyChange = useCallback((companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedPlanId("");
    setPoints("");
    setFormError(null);
    setStatusMessage(null);
  }, []);

  const handlePlanChange = useCallback((planId: string) => {
    setSelectedPlanId(planId);
    setFormError(null);
    setStatusMessage(null);
  }, []);

  const canRedeemSubmit =
    !submitting &&
    Boolean(selectedCompany) &&
    Boolean(selectedPlan) &&
    planCost !== null &&
    !insufficientPoints &&
    offersState !== "loading";

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setFormError(null);
      setStatusMessage(null);

      if (!selectedCompany) {
        setFormError("Wybierz firmę z listy.");
        onError("validation_company");
        return;
      }

      if (!selectedPlan) {
        setFormError("Wybierz plan lub konto do zakupu.");
        onError("validation_plan");
        return;
      }

      if (planCost === null) {
        setFormError("Plan ma niepoprawna cene, skontaktuj sie z obsluga.");
        onError("invalid_plan_price");
        return;
      }

      if (!Number.isFinite(planCost) || planCost <= 0) {
        setFormError("Plan ma niepoprawną cenę, skontaktuj się z obsługą.");
        onError("invalid_plan_price");
        return;
      }

      if (planCost > available) {
        setFormError(
          `Masz dostępne ${available.toLocaleString(
            "pl-PL",
          )} punktów. Plan kosztuje ${planCost.toLocaleString(
            "pl-PL",
          )} punktów.`,
        );
        onError("insufficient_points");
        return;
      }

      setSubmitting(true);

      const payload = {
        points: planCost,
        companySlug: selectedCompany.slug,
        companyId: selectedCompany.id,
        planLabel: selectedPlan.name,
        notes: notes.trim() || undefined,
      };

      try {
        const response = await fetch("/api/wallet/redeem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let message = "Nie udalo sie wyslac wniosku.";
          let errorCode = "request_failed";

          try {
            const body = await response.json();

            if (body?.error === "INSUFFICIENT_POINTS" && body?.available) {
              message = `Masz dostepne ${body.available} punktow. Zmien kwote i sprobuj ponownie.`;
              errorCode = "insufficient_points";
            } else if (body?.error === "VALIDATION_ERROR") {
              message = "Sprawdz dane i sprobuj ponownie.";
              errorCode = "validation_api";
            } else if (typeof body?.error === "string") {
              message = body.error;
              errorCode = body.error;
            }
          } catch {
            // ignore parse issues
          }

          setFormError(message);
          onError(errorCode);
          return;
        }

        setStatusMessage("Wniosek wyslany. Sprawdz status w zakladce Historia.");
        clearForm();
        onSuccess();
      } catch (error) {
        console.error("wallet redeem network error", error);
        setFormError("Nie udalo sie wyslac wniosku. Sprobuj ponownie pozniej.");
        onError("network");
      } finally {
        setSubmitting(false);
      }
    },
    [
      available,
      clearForm,
      notes,
      planCost,
      onError,
      onSuccess,
      selectedCompany,
      selectedPlan,
    ],
  );

  const lowerError = formError?.toLowerCase() ?? "";
  const companyFieldError = lowerError.includes("firm");

  return (
    <Card className="shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Wniosek o konto
          </CardTitle>
        </div>
        <CardDescription>
          Dostępne punkty: <span className="font-semibold">{available.toLocaleString("pl-PL")}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formError ? (
          <Alert variant="destructive" id="wallet-redeem-error" className="border border-border/40">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}
        {statusMessage ? (
          <Alert className="border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-border/40" id="wallet-redeem-status">
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        ) : null}

        {offersState === "loading" ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : null}
        {offersState === "error" ? (
          <Alert variant="destructive" className="border border-border/40">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{offersError ?? "Nie udało się pobrać listy ofert."}</span>
                <Button className="mt-2 rounded-full" size="sm" variant="premium-outline" type="button" onClick={onReloadOffers}>
                  Spróbuj ponownie
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}
        {offersState === "success" && (offers?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            Obecnie brak ofert wymiany. Skontaktuj się z obsługą, aby dodać nowe konta.
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={companySelectId}>Firma</Label>
              <Select
                value={selectedCompanyId || undefined}
                onValueChange={handleCompanyChange}
                disabled={submitting || offersState === "loading" || offersState === "error" || !offers?.length}
              >
                <SelectTrigger id={companySelectId} aria-invalid={companyFieldError || undefined} aria-describedby={companyFieldError ? "wallet-redeem-error" : undefined} className="rounded-lg border border-transparent bg-gradient-card shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]">
                  <SelectValue placeholder="Wybierz firmę" />
                </SelectTrigger>
                <SelectContent>
                  {(offers ?? []).map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={planSelectId}>Plan lub konto</Label>
              <Select
                value={selectedPlanId || undefined}
                onValueChange={handlePlanChange}
                disabled={submitting || !availablePlans.length}
              >
                <SelectTrigger id={planSelectId} aria-invalid={lowerError.includes("plan") || undefined} aria-describedby={lowerError.includes("plan") ? "wallet-redeem-error" : undefined} className="rounded-lg border border-transparent bg-gradient-card shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]">
                  <SelectValue placeholder={selectedCompany ? "Wybierz plan" : "Najpierw wybierz firmę"} />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} – {plan.price.toLocaleString("pl-PL")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedCompany && offersState === "success" ? (
                <p className="text-xs text-muted-foreground">Wybierz firmę, aby zobaczyć dostępne konta.</p>
              ) : null}
              {selectedCompany && !availablePlans.length ? (
                <p className="text-xs text-muted-foreground">
                  Brak planów w walucie USD dla wybranej firmy.
                </p>
              ) : null}
            </div>
          </div>

          {selectedPlan ? (
            <p className="text-xs text-muted-foreground">
              Wybrany plan kosztuje {planCost?.toLocaleString("pl-PL")} punktów (1 punkt = 1 USD).
            </p>
          ) : null}
          {insufficientPoints ? (
            <Alert variant="destructive" className="border border-border/40">
              <AlertDescription>
                Masz {available.toLocaleString("pl-PL")} punktów, potrzebujesz {planCost?.toLocaleString("pl-PL")} punktów.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={pointsInputId}>Liczba punktów</Label>
              <Input
                id={pointsInputId}
                inputMode="numeric"
                min={1}
                readOnly
                value={points}
                aria-readonly
                aria-invalid={lowerError.includes("punkt") || undefined}
                aria-describedby={lowerError.includes("punkt") ? "wallet-redeem-error" : undefined}
                className="border border-border/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={notesInputId}>Notatka (opcjonalnie)</Label>
              <Textarea
                id={notesInputId}
                placeholder="Informacje dla zespołu"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={submitting}
                className="border border-border/40"
              />
            </div>
          </div>

          <CardFooter className="px-0 pb-0 flex flex-wrap gap-2">
            <Button
              disabled={!canRedeemSubmit}
              type="submit"
              variant="premium"
              className="rounded-full"
            >
              {submitting ? "Wysyłanie..." : "Wyślij wniosek"}
            </Button>
            <Button
              type="button"
              variant="premium-outline"
              onClick={clearForm}
              disabled={submitting}
              className="rounded-full"
            >
              Wyczyść
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
const INFLUENCER_STATUS_LABELS: Record<InfluencerStatus, string> = {
  PENDING: "W trakcie weryfikacji",
  APPROVED: "Zatwierdzony",
  REJECTED: "Odrzucony",
};

const INFLUENCER_STATUS_STYLES: Record<InfluencerStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
};

interface InfluencerSectionProps {
  profile: InfluencerProfile | null;
  onUpdated: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function InfluencerSection({ profile, onUpdated }: InfluencerSectionProps) {
  const [formState, setFormState] = useState({
    platform: "",
    handle: "",
    audienceSize: "",
    bio: "",
    socialLinks: "",
    preferredCompanies: "",
    contactEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const influencerFormValid =
    formState.platform.trim().length > 0 && formState.handle.trim().length > 0;

  useEffect(() => {
    if (!profile) {
      setFormState({
        platform: "",
        handle: "",
        audienceSize: "",
        bio: "",
        socialLinks: "",
        preferredCompanies: "",
        contactEmail: "",
      });
      return;
    }

    setFormState({
      platform: profile.platform,
      handle: profile.handle,
      audienceSize: profile.audienceSize ? String(profile.audienceSize) : "",
      bio: profile.bio ?? "",
      socialLinks: (profile.socialLinks ?? []).join("\n"),
      preferredCompanies: (profile.preferredCompanies ?? []).join("\n"),
      contactEmail: profile.contactEmail ?? "",
    });
  }, [profile]);

  const handleChange = (field: keyof typeof formState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setStatusMessage(null);

    const socialLinks = splitMultiline(formState.socialLinks).slice(0, 5);
    const preferredCompanies = splitMultiline(formState.preferredCompanies).slice(0, 10);
    const payload: Record<string, unknown> = {
      platform: formState.platform.trim(),
      handle: formState.handle.trim(),
      bio: formState.bio.trim(),
      socialLinks,
      preferredCompanies,
    };

    const audienceSize = formState.audienceSize.trim();
    if (audienceSize.length) {
      payload.audienceSize = audienceSize;
    }

    const contactEmail = formState.contactEmail.trim();
    if (contactEmail.length) {
      payload.contactEmail = contactEmail;
    }

    try {
      const response = await fetch("/api/influencers/profile", {
        method: profile ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Musisz być zalogowany, aby wysłać zgłoszenie.");
        } else if (response.status === 400) {
          const body = await response.json().catch(() => null);
          const fieldError = body?.details?.fieldErrors;
          const firstError = fieldError
            ? (Object.values(fieldError)
                .flat()
                .find((item) => typeof item === "string") as string | undefined)
            : undefined;
          setError(firstError ?? "Sprawdź dane i spróbuj ponownie.");
        } else {
          setError("Nie udało się zapisać profilu influencera.");
        }
        return;
      }

      setStatusMessage(
        profile ? "Zaktualizowano zgłoszenie."
          : "Zgłoszenie zostało wysłane. Skontaktujemy się po weryfikacji.",
      );
      onUpdated();
    } catch (submitError) {
      console.error("influencer profile submit error", submitError);
      setError("Wystąpił błąd sieci. Spróbuj ponownie później.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel = profile ? INFLUENCER_STATUS_LABELS[profile.status] : "Brak zgłoszenia";
  const statusClass = profile ? INFLUENCER_STATUS_STYLES[profile.status] : "bg-muted text-muted-foreground";

  return (
    <Card className="shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="influencer-program" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex flex-1 items-center justify-between pr-4">
              <div className="flex flex-col items-start gap-1">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Program influencerów
                </CardTitle>
                <CardDescription className="text-xs">
                  Zgłoś swój profil, aby otrzymać dedykowane materiały i kody polecające
                </CardDescription>
              </div>
              <PremiumBadge variant={profile?.status === "APPROVED" ? "glow" : profile?.status === "REJECTED" ? "outline-solid" : "shimmer"} className={cn("rounded-full text-xs font-semibold", statusClass)}>
                {statusLabel}
              </PremiumBadge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="px-6 pb-6 pt-0">
              {profile?.referralCode ? (
                <Alert className="mb-4 border-dashed border-primary/40 bg-primary/5 border border-border/40">
                  <AlertDescription className="text-primary">
                    Kod polecający: <span className="font-semibold">{profile.referralCode}</span>
                  </AlertDescription>
                </Alert>
              ) : null}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Platforma</Label>
                    <Input
                      placeholder="np. YouTube, TikTok, Discord"
                      value={formState.platform}
                      onChange={handleChange("platform")}
                      required
                      className="border border-border/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nazwa profilu</Label>
                    <Input
                      placeholder="np. FundedRankPL"
                      value={formState.handle}
                      onChange={handleChange("handle")}
                      required
                      className="border border-border/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Liczba obserwujących</Label>
                    <Input
                      placeholder="np. 12000"
                      inputMode="numeric"
                      value={formState.audienceSize}
                      onChange={handleChange("audienceSize")}
                      className="border border-border/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email do współpracy</Label>
                    <Input
                      placeholder="np. media@twojadomena.com"
                      value={formState.contactEmail}
                      onChange={handleChange("contactEmail")}
                      className="border border-border/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Krótki opis / bio</Label>
                  <Textarea
                    rows={3}
                    placeholder="Opisz swoją społeczność, format treści i doświadczenie."
                    value={formState.bio}
                    onChange={handleChange("bio")}
                    className="border border-border/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Linki społecznościowe (po jednym w wierszu)</Label>
                  <Textarea
                    rows={3}
                    placeholder="https://youtube.com/..."
                    value={formState.socialLinks}
                    onChange={handleChange("socialLinks")}
                    className="border border-border/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Firmy, które chcesz promować</Label>
                  <Textarea
                    rows={3}
                    placeholder="np. apex, fundingpips"
                    value={formState.preferredCompanies}
                    onChange={handleChange("preferredCompanies")}
                    className="border border-border/40"
                  />
                </div>

                {error ? (
                  <Alert variant="destructive" className="border border-border/40">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                {statusMessage ? (
                  <Alert className="border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-border/40">
                    <AlertDescription>{statusMessage}</AlertDescription>
                  </Alert>
                ) : null}

                <CardFooter className="px-0 pb-0 flex justify-end">
                  <Button disabled={submitting || !influencerFormValid} type="submit" variant="premium" className="rounded-full">
                    {submitting ? "Zapisywanie..." : profile ? "Aktualizuj profil" : "Wyslij zgloszenie"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

function splitMultiline(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FavoritesSection({ favorites }: { favorites: Company[] }) {
  if (!favorites.length) {
    return (
      <Card className="shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Ulubione firmy
            </CardTitle>
            <Link
              href="/firmy"
              className={cn(
                buttonVariants({ variant: "premium-outline", size: "sm" }),
                "rounded-full",
              )}
            >
              Otwórz ranking
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Dodaj firmy do ulubionych, aby mieć szybki dostęp do ich cashbacku.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Ulubione firmy
          </CardTitle>
          <Link
            href="/firmy"
            className={cn(
              buttonVariants({ variant: "premium-outline", size: "sm" }),
              "rounded-full",
            )}
          >
            Otwórz ranking
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {favorites.map((company) => (
            <Card key={company.id} className="border border-border/40 shadow-premium transition-all hover:border border-border/40-premium hover:shadow-premium-lg">
              <CardContent className="p-4">
                <Link
                  className="font-medium hover:underline hover:text-primary transition-colors"
                  href={`/firmy/${company.slug}`}
                >
                  {company.name}
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                  Cashback do <PremiumBadge variant="glow" className="text-xs font-semibold">{company.cashbackRate ?? 0} pkt</PremiumBadge>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string | null }) {
  return (
    <div className="rounded-lg border border-border/40 border-destructive bg-destructive/10 p-4 text-sm text-destructive shadow-premium">
      {message ?? "Nie udało się pobrać danych użytkownika."}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-border/40 bg-gradient-card p-6 text-center text-sm text-muted-foreground shadow-premium">
      Nie znaleziono danych cashback. Zacznij od dodania pierwszej transakcji.
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function logWalletEvent(event: string, detail?: string) {
  try {
    const source = detail ? `${event}:${detail}` : event;
    const payload = JSON.stringify({
      companySlug: "wallet",
      source,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/clicks", blob);
    } else {
      fetch("/api/clicks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // telemetry is best-effort
      });
    }
  } catch (error) {
    console.warn("[wallet] telemetry error", error);
  }
}















































