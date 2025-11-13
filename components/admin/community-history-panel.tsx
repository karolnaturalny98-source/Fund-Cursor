"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, X, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { InfluencerHistoryItem, InfluencerStatus } from "@/lib/queries/influencers";
import type { ReviewHistoryItem, ReviewStatus } from "@/lib/queries/reviews";
import type { DataIssueHistoryItem, DataIssueStatusType } from "@/lib/queries/data-issues";

interface CompanyOption {
  id: string;
  name: string;
  slug: string;
}

interface CommunityHistoryPanelProps {
  companies: CompanyOption[];
}

const INFLUENCER_STATUS_LABELS: Record<InfluencerStatus | "ALL", string> = {
  ALL: "Wszystkie",
  PENDING: "W trakcie weryfikacji",
  APPROVED: "Zatwierdzony",
  REJECTED: "Odrzucony",
};

const INFLUENCER_STATUS_STYLES: Record<InfluencerStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  REJECTED: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
};

const REVIEW_STATUS_LABELS: Record<ReviewStatus | "ALL", string> = {
  ALL: "Wszystkie",
  PENDING: "Oczekujące",
  APPROVED: "Zatwierdzone",
  REJECTED: "Odrzucone",
};

const REVIEW_STATUS_STYLES: Record<ReviewStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  REJECTED: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
};

const DATA_ISSUE_STATUS_LABELS: Record<DataIssueStatusType | "ALL", string> = {
  ALL: "Wszystkie",
  PENDING: "Oczekujące",
  RESOLVED: "Rozwiązane",
  DISMISSED: "Odrzucone",
};

const DATA_ISSUE_STATUS_STYLES: Record<DataIssueStatusType, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  RESOLVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  DISMISSED: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
};

export function CommunityHistoryPanel({ companies }: CommunityHistoryPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [influencers, setInfluencers] = useState<InfluencerHistoryItem[]>([]);
  const [reviews, setReviews] = useState<ReviewHistoryItem[]>([]);
  const [dataIssues, setDataIssues] = useState<DataIssueHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchInfluencers = useCallback(
    async (cursor?: string | null) => {
      const params = new URLSearchParams();
      params.set("take", "20");
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (searchQuery) params.set("searchQuery", searchQuery);
      if (cursor) params.set("cursor", cursor);

      const response = await fetch(`/api/admin/influencers/history?${params.toString()}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch influencers:", response.status, errorText);
        throw new Error(`Failed to fetch: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      return data;
    },
    [statusFilter, startDate, endDate, searchQuery],
  );

  const fetchReviews = useCallback(
    async (cursor?: string | null) => {
      const params = new URLSearchParams();
      params.set("take", "20");
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (companyFilter !== "ALL") params.set("companyId", companyFilter);
      if (searchQuery) params.set("searchQuery", searchQuery);
      if (cursor) params.set("cursor", cursor);

      const response = await fetch(`/api/admin/reviews/history?${params.toString()}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch reviews:", response.status, errorText);
        throw new Error(`Failed to fetch: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      return data;
    },
    [statusFilter, startDate, endDate, companyFilter, searchQuery],
  );

  const fetchDataIssues = useCallback(
    async (cursor?: string | null) => {
      const params = new URLSearchParams();
      params.set("take", "20");
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (companyFilter !== "ALL") params.set("companyId", companyFilter);
      if (searchQuery) params.set("searchQuery", searchQuery);
      if (cursor) params.set("cursor", cursor);

      const response = await fetch(`/api/admin/data-issues/history?${params.toString()}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch data issues:", response.status, errorText);
        throw new Error(`Failed to fetch: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      return data;
    },
    [statusFilter, startDate, endDate, companyFilter, searchQuery],
  );

  useEffect(() => {
    setLoading(true);
    setInfluencers([]);
    setReviews([]);
    setDataIssues([]);
    setNextCursor(null);

    const loadData = async () => {
      try {
        if (activeTab === "all" || activeTab === "influencers") {
          const infData = await fetchInfluencers();
          setInfluencers(infData.items);
          if (activeTab === "influencers") setNextCursor(infData.nextCursor);
        }
        if (activeTab === "all" || activeTab === "reviews") {
          const revData = await fetchReviews();
          setReviews(revData.items);
          if (activeTab === "reviews") setNextCursor(revData.nextCursor);
        }
        if (activeTab === "all" || activeTab === "data-issues") {
          const issueData = await fetchDataIssues();
          setDataIssues(issueData.items);
          if (activeTab === "data-issues") setNextCursor(issueData.nextCursor);
        }
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, statusFilter, startDate, endDate, companyFilter, searchQuery, fetchInfluencers, fetchReviews, fetchDataIssues]);

  const clearFilters = () => {
    setStatusFilter("ALL");
    setStartDate("");
    setEndDate("");
    setCompanyFilter("ALL");
    setSearchQuery("");
  };

  const loadMore = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      let data: { items: unknown[]; cursor: string | null } | undefined;
      if (activeTab === "influencers") {
        data = await fetchInfluencers(nextCursor);
        setInfluencers((prev) => [...prev, ...(data!.items as InfluencerHistoryItem[])]);
      } else if (activeTab === "reviews") {
        data = await fetchReviews(nextCursor);
        setReviews((prev) => [...prev, ...(data!.items as ReviewHistoryItem[])]);
      } else if (activeTab === "data-issues") {
        data = await fetchDataIssues(nextCursor);
        setDataIssues((prev) => [...prev, ...(data!.items as DataIssueHistoryItem[])]);
      }
      setNextCursor(data?.cursor ?? null);
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusOptions = () => {
    if (activeTab === "influencers") {
      return Object.entries(INFLUENCER_STATUS_LABELS).map(([value, label]) => ({ value, label }));
    } else if (activeTab === "reviews") {
      return Object.entries(REVIEW_STATUS_LABELS).map(([value, label]) => ({ value, label }));
    } else if (activeTab === "data-issues") {
      return Object.entries(DATA_ISSUE_STATUS_LABELS).map(([value, label]) => ({ value, label }));
    }
    return [];
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            value="influencers"
              className={cn(
                "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground",
                "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
          >
            Influencerzy
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
              className={cn(
                "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground",
                "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
          >
            Opinie
          </TabsTrigger>
          <TabsTrigger
            value="data-issues"
              className={cn(
                "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
                "border-transparent bg-muted/30 text-muted-foreground",
                "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
                "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
              )}
          >
            Błędy danych
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 sm:gap-4 rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-3 sm:p-4 shadow-xs">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {getStatusOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(activeTab === "reviews" || activeTab === "data-issues" || activeTab === "all") && (
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Firma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Wszystkie firmy</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate || endDate ? `${startDate || "..."} - ${endDate || "..."}` : "Zakres dat"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium">Od</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Do</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={clearFilters} size="icon" aria-label="Wyczyść filtry">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <TabsContent value="all" className="space-y-4">
          {/* Combined view - show summary counts */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs p-4">
              <p className="text-sm font-medium text-muted-foreground">Influencerzy</p>
              <p className="text-2xl font-bold">{influencers.length}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs p-4">
              <p className="text-sm font-medium text-muted-foreground">Opinie</p>
              <p className="text-2xl font-bold">{reviews.length}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs p-4">
              <p className="text-sm font-medium text-muted-foreground">Błędy danych</p>
              <p className="text-2xl font-bold">{dataIssues.length}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="influencers" className="space-y-4">
          {loading && influencers.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : influencers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              Brak danych do wyświetlenia.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platforma</TableHead>
                    <TableHead>Handle</TableHead>
                    <TableHead>Użytkownik</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {influencers.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.platform}</TableCell>
                      <TableCell>{item.handle}</TableCell>
                      <TableCell>{item.user?.email ?? item.user?.displayName ?? "-"}</TableCell>
                      <TableCell>
                        <Badge className={INFLUENCER_STATUS_STYLES[item.status]}>
                          {INFLUENCER_STATUS_LABELS[item.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(item.createdAt), "dd.MM.yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {nextCursor && (
                <Button onClick={loadMore} disabled={loading} variant="outline" className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Załaduj więcej
                </Button>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {loading && reviews.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              Brak danych do wyświetlenia.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Firma</TableHead>
                    <TableHead>Ocena</TableHead>
                    <TableHead>Użytkownik</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.company?.name ?? "-"}</TableCell>
                      <TableCell>{item.rating}/5</TableCell>
                      <TableCell>{item.user?.email ?? item.user?.displayName ?? "-"}</TableCell>
                      <TableCell>
                        <Badge className={REVIEW_STATUS_STYLES[item.status]}>
                          {REVIEW_STATUS_LABELS[item.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(item.createdAt), "dd.MM.yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {nextCursor && (
                <Button onClick={loadMore} disabled={loading} variant="outline" className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Załaduj więcej
                </Button>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="data-issues" className="space-y-4">
          {loading && dataIssues.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : dataIssues.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
              Brak danych do wyświetlenia.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategoria</TableHead>
                    <TableHead>Firma</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataIssues.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.company?.name ?? "-"}</TableCell>
                      <TableCell>{item.email ?? item.user?.email ?? "-"}</TableCell>
                      <TableCell>
                        <Badge className={DATA_ISSUE_STATUS_STYLES[item.status]}>
                          {DATA_ISSUE_STATUS_LABELS[item.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(item.createdAt), "dd.MM.yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {nextCursor && (
                <Button onClick={loadMore} disabled={loading} variant="outline" className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Załaduj więcej
                </Button>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
