"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  TransactionHistoryItem,
  TransactionStatus,
} from "@/lib/queries/transactions";
import type {
  AffiliateHistoryItem,
  AffiliateStatus,
} from "@/lib/queries/affiliates";
import type { Company } from "@/lib/types";

interface CashbackHistoryPanelProps {
  companies: Array<Pick<Company, "id" | "name" | "slug">>;
}

type HistoryTab = "all" | "redeem" | "manual" | "affiliate" | "imports";

const STATUS_LABELS_TRANSACTION: Record<TransactionStatus, string> = {
  PENDING: "Oczekujące",
  APPROVED: "Zatwierdzone",
  REDEEMED: "Zrealizowane",
  REJECTED: "Odrzucone",
};

const STATUS_STYLES_TRANSACTION: Record<TransactionStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-400",
  APPROVED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400",
  REDEEMED: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-400",
  REJECTED: "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-400",
};

const STATUS_LABELS_AFFILIATE: Record<AffiliateStatus, string> = {
  PENDING: "Oczekujące",
  APPROVED: "Zatwierdzone",
  REJECTED: "Odrzucone",
};

const STATUS_STYLES_AFFILIATE: Record<AffiliateStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-400",
  APPROVED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400",
  REJECTED: "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-400",
};

function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function CashbackHistoryPanel({ companies }: CashbackHistoryPanelProps) {
  const [activeTab, setActiveTab] = useState<HistoryTab>("all");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [affiliateTransactions, setAffiliateTransactions] = useState<AffiliateHistoryItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minPoints, setMinPoints] = useState<string>("");
  const [maxPoints, setMaxPoints] = useState<string>("");


  const fetchCashbackTransactions = useCallback(async (cursor?: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === "redeem") params.set("type", "redeem");
      else if (activeTab === "manual") params.set("type", "manual");
      else params.set("type", "all");

      if (statusFilter && statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (companyFilter && companyFilter !== "ALL") {
        params.set("companyId", companyFilter);
      }
      if (searchQuery) params.set("searchQuery", searchQuery);
      if (minPoints) params.set("minPoints", minPoints);
      if (maxPoints) params.set("maxPoints", maxPoints);
      if (cursor) params.set("cursor", cursor);
      params.set("take", "20");

      const response = await fetch(`/api/admin/transactions/history?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      if (cursor) {
        setTransactions((prev) => [...prev, ...data.transactions]);
      } else {
        setTransactions(data.transactions);
      }
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, startDate, endDate, companyFilter, searchQuery, minPoints, maxPoints]);

  const fetchAffiliateTransactions = useCallback(async (cursor?: string | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (companyFilter && companyFilter !== "ALL") {
        params.set("companyId", companyFilter);
      }
      if (platformFilter && platformFilter !== "ALL") {
        params.set("platform", platformFilter);
      }
      if (searchQuery) params.set("searchQuery", searchQuery);
      if (minPoints) params.set("minPoints", minPoints);
      if (maxPoints) params.set("maxPoints", maxPoints);
      if (cursor) params.set("cursor", cursor);
      params.set("take", "20");

      const response = await fetch(`/api/admin/affiliates/history?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      if (cursor) {
        setAffiliateTransactions((prev) => [...prev, ...data.transactions]);
      } else {
        setAffiliateTransactions(data.transactions);
      }
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Error fetching affiliate transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, startDate, endDate, companyFilter, platformFilter, searchQuery, minPoints, maxPoints]);

  useEffect(() => {
    setTransactions([]);
    setAffiliateTransactions([]);
    setNextCursor(null);
    if (activeTab === "affiliate" || activeTab === "imports") {
      fetchAffiliateTransactions();
    } else {
      fetchCashbackTransactions();
    }
  }, [activeTab, statusFilter, startDate, endDate, companyFilter, platformFilter, searchQuery, minPoints, maxPoints, fetchCashbackTransactions, fetchAffiliateTransactions]);

  const clearFilters = () => {
    setStatusFilter("ALL");
    setStartDate("");
    setEndDate("");
    setCompanyFilter("ALL");
    setPlatformFilter("ALL");
    setSearchQuery("");
    setMinPoints("");
    setMaxPoints("");
  };

  const loadMore = () => {
    if (nextCursor && !loading) {
      if (activeTab === "affiliate" || activeTab === "imports") {
        fetchAffiliateTransactions(nextCursor);
      } else {
        fetchCashbackTransactions(nextCursor);
      }
    }
  };

  const getStatusOptions = () => {
    if (activeTab === "affiliate" || activeTab === "imports") {
      return [
        { value: "ALL", label: "Wszystkie" },
        { value: "PENDING", label: "Oczekujące" },
        { value: "APPROVED", label: "Zatwierdzone" },
        { value: "REJECTED", label: "Odrzucone" },
      ];
    }
    return [
      { value: "ALL", label: "Wszystkie" },
      { value: "PENDING", label: "Oczekujące" },
      { value: "APPROVED", label: "Zatwierdzone" },
      { value: "REDEEMED", label: "Zrealizowane" },
      { value: "REJECTED", label: "Odrzucone" },
    ];
  };

  const platforms = Array.from(
    new Set(
      affiliateTransactions
        .map((t) => t.platform)
        .filter((p): p is string => p !== null),
    ),
  );

  const applyQuickFilter = (filter: "pending" | "approved" | "last7days" | "last30days") => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case "pending":
        setStatusFilter("PENDING");
        setStartDate("");
        setEndDate("");
        break;
      case "approved":
        setStatusFilter("APPROVED");
        setStartDate("");
        setEndDate("");
        break;
      case "last7days":
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        setStartDate(last7Days.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
      case "last30days":
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        setStartDate(last30Days.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
    }
  };

  return (
    <div className="flex flex-col fluid-stack-md">
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Button
          variant={statusFilter === "PENDING" ? "default" : "outline-solid"}
          size="sm"
          onClick={() => applyQuickFilter("pending")}
          className="rounded-lg"
        >
          Tylko oczekujące
        </Button>
        <Button
          variant={statusFilter === "APPROVED" ? "default" : "outline-solid"}
          size="sm"
          onClick={() => applyQuickFilter("approved")}
          className="rounded-lg"
        >
          Tylko zatwierdzone
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyQuickFilter("last7days")}
          className="rounded-lg"
        >
          Ostatnie 7 dni
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyQuickFilter("last30days")}
          className="rounded-lg"
        >
          Ostatnie 30 dni
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:gap-4 rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-3 sm:p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col fluid-stack-xs">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getStatusOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <label className="text-xs font-medium text-muted-foreground">Data od</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg"
          />
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <label className="text-xs font-medium text-muted-foreground">Data do</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg"
          />
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <label className="text-xs font-medium text-muted-foreground">Firma</label>
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Wszystkie</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(activeTab === "affiliate" || activeTab === "imports") && (
          <div className="flex flex-col fluid-stack-xs">
            <label className="text-xs font-medium text-muted-foreground">Platforma</label>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Wszystkie</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col fluid-stack-xs">
          <label className="text-xs font-medium text-muted-foreground">Wyszukiwanie</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ID, email, external ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <label className="text-xs font-medium text-muted-foreground">Min punkty</label>
          <Input
            type="number"
            placeholder="0"
            value={minPoints}
            onChange={(e) => setMinPoints(e.target.value)}
            className="rounded-lg"
          />
        </div>

        <div className="flex flex-col fluid-stack-xs">
          <label className="text-xs font-medium text-muted-foreground">Max punkty</label>
          <Input
            type="number"
            placeholder="∞"
            value={maxPoints}
            onChange={(e) => setMaxPoints(e.target.value)}
            className="rounded-lg"
          />
        </div>

        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="rounded-lg"
            disabled={loading}
          >
            <X className="mr-2 h-4 w-4" />
            Wyczyść
          </Button>
          <Button
            variant="outline"
            className="rounded-lg"
            disabled
            title="Eksport będzie dostępny wkrótce"
          >
            <Download className="mr-2 h-4 w-4" />
            Eksport
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as HistoryTab)} className="flex flex-col fluid-stack-sm">
        <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
          <TabsTrigger
            value="all"
            className={cn(
                "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            Wszystkie
          </TabsTrigger>
          <TabsTrigger
            value="redeem"
            className={cn(
                "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            Wnioski o wypłatę
          </TabsTrigger>
          <TabsTrigger
            value="manual"
            className={cn(
                "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            Ręczne przyznania
          </TabsTrigger>
          <TabsTrigger
            value="affiliate"
            className={cn(
                "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            Transakcje afiliacyjne
          </TabsTrigger>
          <TabsTrigger
            value="imports"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            Importy
          </TabsTrigger>
        </TabsList>

        {/* Cashback Transactions Tables */}
        {(activeTab === "all" || activeTab === "redeem" || activeTab === "manual") && (
          <TabsContent value={activeTab} className="flex flex-col fluid-stack-sm">
            {loading && transactions.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                Brak transakcji dla wybranych filtrów.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 hidden sm:table-cell">#</TableHead>
                        <TableHead className="min-w-[120px]">ID transakcji</TableHead>
                        <TableHead className="min-w-[150px]">Firma</TableHead>
                        <TableHead className="min-w-[150px]">Użytkownik</TableHead>
                        <TableHead className="hidden lg:table-cell">Typ</TableHead>
                        <TableHead className="text-right whitespace-nowrap">Punkty</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="hidden md:table-cell whitespace-nowrap">Data utworzenia</TableHead>
                        <TableHead className="hidden lg:table-cell whitespace-nowrap">Data zatwierdzenia</TableHead>
                        <TableHead className="hidden xl:table-cell whitespace-nowrap">Data realizacji</TableHead>
                        <TableHead className="hidden lg:table-cell">Notatka</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction, index) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-semibold text-muted-foreground hidden sm:table-cell">
                            #{index + 1}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            <span className="truncate block max-w-[120px]">{transaction.transactionRef}</span>
                          </TableCell>
                          <TableCell>
                            {transaction.company ? (
                              <div className="flex flex-col min-w-[150px]">
                                <span className="font-medium text-foreground truncate">
                                  {transaction.company.name}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {transaction.company.slug}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {transaction.user ? (
                              <div className="flex flex-col min-w-[150px]">
                                <span className="font-medium text-foreground truncate">
                                  {transaction.user.displayName ?? transaction.user.email ?? "Użytkownik"}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {transaction.user.email ?? transaction.user.clerkId}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Anonimowy</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge
                              variant="outline"
                              className={
                                transaction.points < 0
                                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                                  : activeTab === "manual"
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                              }
                            >
                              {transaction.points < 0
                                ? "Wniosek"
                                : activeTab === "manual"
                                  ? "Ręczne"
                                  : "Zakup"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold whitespace-nowrap">
                            {transaction.points > 0
                              ? `+${transaction.points.toLocaleString("pl-PL")} pkt`
                              : `${transaction.points.toLocaleString("pl-PL")} pkt`}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              className={
                                STATUS_STYLES_TRANSACTION[transaction.status] ??
                                "bg-muted text-foreground"
                              }
                            >
                              {STATUS_LABELS_TRANSACTION[transaction.status] ?? transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">
                            {formatDateTime(transaction.createdAt)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                            {transaction.approvedAt ? formatDateTime(transaction.approvedAt) : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden xl:table-cell whitespace-nowrap">
                            {transaction.fulfilledAt ? formatDateTime(transaction.fulfilledAt) : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                            <span className="truncate block max-w-[200px]">{transaction.notes ?? "—"}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {nextCursor && (
                  <div className="border-t border-border/40 p-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                      className="w-full rounded-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ładowanie...
                        </>
                      ) : (
                        "Załaduj więcej"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        )}

        {/* Affiliate Transactions Tables */}
        {(activeTab === "affiliate" || activeTab === "imports") && (
          <TabsContent value={activeTab} className="flex flex-col fluid-stack-sm">
            {loading && affiliateTransactions.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : affiliateTransactions.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                Brak transakcji afiliacyjnych dla wybranych filtrów.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 hidden sm:table-cell">#</TableHead>
                        <TableHead className="min-w-[120px]">External ID</TableHead>
                        <TableHead className="min-w-[150px]">Firma</TableHead>
                        <TableHead className="hidden md:table-cell">Platforma</TableHead>
                        <TableHead className="min-w-[150px]">Email użytkownika</TableHead>
                        <TableHead className="hidden lg:table-cell">Kwota</TableHead>
                        <TableHead className="text-right whitespace-nowrap">Punkty</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="hidden md:table-cell whitespace-nowrap">Data zakupu</TableHead>
                        <TableHead className="hidden lg:table-cell whitespace-nowrap">Data weryfikacji</TableHead>
                        <TableHead className="hidden lg:table-cell">Notatka</TableHead>
                        <TableHead className="hidden xl:table-cell">Powiązana transakcja</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affiliateTransactions.map((transaction, index) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-semibold text-muted-foreground hidden sm:table-cell">
                            #{index + 1}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            <span className="truncate block max-w-[120px]">{transaction.externalId}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col min-w-[150px]">
                              <span className="font-medium text-foreground truncate">
                                {transaction.company.name}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {transaction.company.slug}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {transaction.platform ? (
                              <Badge variant="outline" className="text-xs">
                                {transaction.platform}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {transaction.userEmail ? (
                              <span className="text-sm truncate block max-w-[150px]">{transaction.userEmail}</span>
                            ) : transaction.user ? (
                              <div className="flex flex-col min-w-[150px]">
                                <span className="text-sm font-medium text-foreground truncate">
                                  {transaction.user.displayName ?? transaction.user.email ?? "Użytkownik"}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {transaction.user.email ?? transaction.user.clerkId}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {transaction.amount !== null ? (
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">
                                  {transaction.amount.toLocaleString("pl-PL", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {transaction.currency ?? "USD"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold whitespace-nowrap">
                            {transaction.points > 0
                              ? `+${transaction.points.toLocaleString("pl-PL")} pkt`
                              : `${transaction.points.toLocaleString("pl-PL")} pkt`}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              className={
                                STATUS_STYLES_AFFILIATE[transaction.status] ??
                                "bg-muted text-foreground"
                              }
                            >
                              {STATUS_LABELS_AFFILIATE[transaction.status] ?? transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell whitespace-nowrap">
                            {transaction.purchaseAt ? formatDateTime(transaction.purchaseAt) : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                            {transaction.verifiedAt ? formatDateTime(transaction.verifiedAt) : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                            <span className="truncate block max-w-[200px]">{transaction.notes ?? "—"}</span>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {transaction.cashbackTransactionId ? (
                              <Badge variant="outline" className="text-xs">
                                {transaction.cashbackTransactionId.slice(0, 8)}...
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {nextCursor && (
                  <div className="border-t border-border/40 p-4">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loading}
                      className="w-full rounded-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ładowanie...
                        </>
                      ) : (
                        "Załaduj więcej"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
