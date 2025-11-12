"use client";

import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReviewForm } from "@/components/companies/review-form";
import { ReviewsStatisticsChart } from "@/components/companies/reviews-statistics-chart";
import { cn } from "@/lib/utils";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";
import { Check, Filter, Star, X, MessageSquare, ShieldCheck, ThumbsUp, Search, XCircle, ArrowUpDown, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ReviewCardData {
  id: string;
  rating: number;
  pros: string[];
  cons: string[];
  body: string | null;
  publishedAt: string;
  experienceLevel: string | null;
  tradingStyle: string | null;
  timeframe: string | null;
  monthsWithCompany: number | null;
  accountSize: string | null;
  recommended: boolean | null;
  influencerDisclosure: string | null;
  resourceLinks: string[];
  userDisplayName: string | null;
  verified: boolean;
}

interface ReviewsPanelProps {
  companySlug: string;
  reviews: ReviewCardData[];
}

type FilterId = "all" | "verified" | "recommended";

type SortOption = "rating-desc" | "rating-asc" | "date-desc" | "date-asc";

const REVIEWS_PER_PAGE = 10;

export function ReviewsPanel({ companySlug, reviews }: ReviewsPanelProps) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<SortOption>("rating-desc");
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [experienceFilter, setExperienceFilter] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const filteredReviews = useMemo(() => {
    let data = reviews;
    
    // Apply filter tabs
    if (filter === "verified") {
      data = data.filter((review) => review.verified);
    } else if (filter === "recommended") {
      data = data.filter((review) => review.recommended === true);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter((review) => {
        const bodyMatch = review.body?.toLowerCase().includes(query);
        const prosMatch = review.pros.some((pro) => pro.toLowerCase().includes(query));
        const consMatch = review.cons.some((con) => con.toLowerCase().includes(query));
        const userMatch = review.userDisplayName?.toLowerCase().includes(query);
        return bodyMatch || prosMatch || consMatch || userMatch;
      });
    }

    // Apply rating filter
    if (ratingFilter !== null) {
      data = data.filter((review) => Math.round(review.rating) === ratingFilter);
    }

    // Apply experience filter
    if (experienceFilter) {
      data = data.filter((review) => review.experienceLevel === experienceFilter);
    }

    // Apply sorting
    return [...data].sort((a, b) => {
      if (sort === "rating-desc") {
        return b.rating - a.rating;
      } else if (sort === "rating-asc") {
        return a.rating - b.rating;
      } else if (sort === "date-desc") {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      } else if (sort === "date-asc") {
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      }
      return 0;
    });
  }, [filter, sort, reviews, searchQuery, ratingFilter, experienceFilter]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (ratingFilter !== null) count++;
    if (experienceFilter) count++;
    return count;
  }, [searchQuery, ratingFilter, experienceFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setRatingFilter(null);
    setExperienceFilter(null);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE,
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, sort, searchQuery, ratingFilter, experienceFilter]);

  const verifiedCount = reviews.filter((review) => review.verified).length;
  const recommendedCount = reviews.filter((review) => review.recommended === true).length;

  // Calculate statistics
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const verifiedPercentage = reviews.length > 0
    ? Math.round((verifiedCount / reviews.length) * 100)
    : 0;
  const recommendedPercentage = reviews.length > 0
    ? Math.round((recommendedCount / reviews.length) * 100)
    : 0;

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    };
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              i < Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/30",
            )}
          />
        ))}
      </div>
    );
  };

  const sectionAnim = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(filteredReviews.length, 100);
  const visibleStaggerItems = sectionAnim.isVisible ? staggerItems : new Array(filteredReviews.length).fill(false);

  const statsAnim = useFadeIn({ rootMargin: "-50px" });

  return (
    <section ref={sectionAnim.ref} className="space-y-6">
      {/* Quick Stats */}
      {reviews.length > 0 && (
        <div ref={statsAnim.ref} className={`grid gap-4 sm:grid-cols-2 md:grid-cols-4 ${statsAnim.className}`}>
          <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardContent className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
              <div className="text-3xl font-bold text-foreground">
                {averageRating.toFixed(1)}
              </div>
              {renderStars(averageRating, "sm")}
              <CardDescription className="text-xs font-medium">Średnia ocena</CardDescription>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardContent className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
              <div className="text-3xl font-bold text-foreground">
                {reviews.length}
              </div>
              <CardDescription className="text-xs font-medium">Wszystkich opinii</CardDescription>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardContent className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
              <div className="text-3xl font-bold text-foreground">
                {verifiedPercentage}%
              </div>
              <CardDescription className="text-xs font-medium">Zweryfikowanych</CardDescription>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardContent className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
              <div className="text-3xl font-bold text-foreground">
                {recommendedPercentage}%
              </div>
              <CardDescription className="text-xs font-medium">Polecających</CardDescription>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">Opinie społeczności</h2>
          <p className="text-sm text-muted-foreground">
            Zebrane wśród traderów FundedRank. Opinie są moderowane przed publikacją.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Szukaj w opiniach..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! pl-9 shadow-xs"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(searchQuery.trim() || ratingFilter !== null || experienceFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="rounded-full"
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                Wyczyść ({activeFiltersCount})
              </Button>
            )}
            {/* Sort Dropdown */}
            <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
              <SelectTrigger className="w-[180px] rounded-full border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating-desc">Najwyżej oceniane</SelectItem>
                <SelectItem value="rating-asc">Najniżej oceniane</SelectItem>
                <SelectItem value="date-desc">Najnowsze</SelectItem>
                <SelectItem value="date-asc">Najstarsze</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button variant="premium" size="sm" className="rounded-full">
                  <PremiumIcon icon={MessageSquare} variant="glow" size="sm" className="mr-2" />
                  Dodaj opinię
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Dodaj opinię</DialogTitle>
                  <DialogDescription>
                    Podziel się swoim doświadczeniem z tą firmą prop tradingową.
                  </DialogDescription>
                </DialogHeader>
                <ReviewForm companySlug={companySlug} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Szybkie filtry:</span>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterId)}>
            <TabsList className="gap-1 rounded-full border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-1 shadow-xs">
              <TabsTrigger value="all" className="rounded-full px-4 py-1.5 text-xs font-semibold data-[state=active]:border-primary/50">
                Wszystkie ({reviews.length})
              </TabsTrigger>
              <TabsTrigger value="verified" className="rounded-full px-4 py-1.5 text-xs font-semibold data-[state=active]:border-primary/50">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                Zweryfikowane ({verifiedCount})
              </TabsTrigger>
              <TabsTrigger value="recommended" className="rounded-full px-4 py-1.5 text-xs font-semibold data-[state=active]:border-primary/50">
                <ThumbsUp className="mr-1.5 h-3.5 w-3.5" />
                Polecają ({recommendedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              type="button"
              variant={ratingFilter === rating ? "default" : "ghost"}
              size="sm"
              onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
              className="h-7 rounded-full px-2.5 text-[11px] font-normal"
            >
              {rating} ⭐
            </Button>
          ))}
        </div>
      </div>

      {/* Statistics Charts */}
      {reviews.length > 0 && (
        <ReviewsStatisticsChart reviews={reviews} />
      )}

      {filteredReviews.length === 0 ? (
        <Card className="rounded-2xl border border-border/60 border-dashed bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted/30 p-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <CardTitle className="mb-2 text-xl font-semibold">Brak opinii</CardTitle>
            <CardDescription className="max-w-md text-sm">
              {activeFiltersCount > 0
                ? "Nie znaleziono opinii spełniających wybrane kryteria. Spróbuj zmienić filtry."
                : filter === "verified"
                  ? "Brak zweryfikowanych opinii dla tej firmy."
                  : filter === "recommended"
                    ? "Brak opinii z rekomendacją dla tej firmy."
                    : "Brak opinii dla tej firmy. Bądź pierwszą osobą, która podzieli się doświadczeniem."}
            </CardDescription>
            {activeFiltersCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 rounded-full"
                onClick={clearFilters}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Wyczyść filtry
              </Button>
            ) : filter === "all" ? (
              <Button
                variant="premium"
                size="sm"
                className="mt-4 rounded-full"
                onClick={() => setShowForm(true)}
              >
                <PremiumIcon icon={MessageSquare} variant="glow" size="sm" className="mr-2" />
                Dodaj pierwszą opinię
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedReviews.map((review, index) => (
            <div
              key={review.id}
              className={
                visibleStaggerItems[index]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }
              style={{
                transitionDelay: visibleStaggerItems[index] ? `${index * 100}ms` : "0ms",
              }}
            >
              <Card
                data-testid="review-card"
                className="group h-full rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
              >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {renderStars(review.rating, "md")}
                    <span className="text-sm font-semibold text-foreground">{review.rating}/5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.verified ? (
                      <PremiumBadge variant="glow" className="rounded-full text-xs font-semibold text-emerald-700">
                        <PremiumIcon icon={ShieldCheck} variant="glow" size="sm" className="mr-1" />
                        Zweryfikowana
                      </PremiumBadge>
                    ) : null}
                    {review.recommended !== null && (
                      <PremiumBadge
                        variant={review.recommended ? "gradient" : "outline-solid"}
                        className={cn(
                          "rounded-full text-xs font-semibold",
                          review.recommended
                            ? "text-emerald-700"
                            : "text-rose-700",
                        )}
                      >
                        {review.recommended ? (
                          <>
                            <PremiumIcon icon={ThumbsUp} variant="glow" size="sm" className="mr-1" />
                            Poleca
                          </>
                        ) : (
                          <>
                            <PremiumIcon icon={X} variant="default" size="sm" className="mr-1" />
                            Nie poleca
                          </>
                        )}
                      </PremiumBadge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <CardDescription className="flex items-center gap-2 text-xs font-medium">
                    <span>{review.userDisplayName ?? "Anonimowy trader"}</span>
                    <span className="text-muted-foreground/60">&middot;</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatRelativeDate(review.publishedAt)}
                    </span>
                  </CardDescription>
                  <div className="flex flex-wrap gap-2">
                    {review.experienceLevel ? (
                      <PremiumBadge variant="outline" className="text-xs">
                        {review.experienceLevel}
                      </PremiumBadge>
                    ) : null}
                    {review.tradingStyle ? (
                      <PremiumBadge variant="outline" className="text-xs">
                        Styl: {review.tradingStyle}
                      </PremiumBadge>
                    ) : null}
                    {review.timeframe ? (
                      <PremiumBadge variant="outline" className="text-xs">
                        Interwał: {review.timeframe}
                      </PremiumBadge>
                    ) : null}
                    {typeof review.monthsWithCompany === "number" ? (
                      <PremiumBadge variant="outline" className="text-xs">
                        {formatMonths(review.monthsWithCompany)}
                      </PremiumBadge>
                    ) : null}
                    {review.accountSize ? (
                      <PremiumBadge variant="outline" className="text-xs">
                        Konto: {review.accountSize}
                      </PremiumBadge>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {review.body ? (
                  <div className="space-y-2">
                    <p
                      className={cn(
                        "text-sm leading-relaxed text-muted-foreground",
                        !expandedReviews.has(review.id) && review.body.length > 200 && "line-clamp-3",
                      )}
                    >
                      {review.body}
                    </p>
                    {review.body.length > 200 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newExpanded = new Set(expandedReviews);
                          if (newExpanded.has(review.id)) {
                            newExpanded.delete(review.id);
                          } else {
                            newExpanded.add(review.id);
                          }
                          setExpandedReviews(newExpanded);
                        }}
                        className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                      >
                        {expandedReviews.has(review.id) ? (
                          <>
                            <ChevronUp className="mr-1 h-3 w-3" />
                            Zwiń
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-1 h-3 w-3" />
                            Rozwiń
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : null}
                {review.pros.length > 0 ? (
                  <Alert className="border-emerald-500/20 bg-emerald-500/5">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <AlertTitle className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Plusy
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <ul className="space-y-1.5 text-sm text-emerald-700">
                        {review.pros.map((pro) => (
                          <li key={pro} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : null}
                {review.cons.length > 0 ? (
                  <Alert className="border-rose-500/20 bg-rose-500/5">
                    <X className="h-4 w-4 text-rose-600" />
                    <AlertTitle className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                      Minusy
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <ul className="space-y-1.5 text-sm text-rose-700">
                        {review.cons.map((con) => (
                          <li key={con} className="flex items-start gap-2">
                            <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : null}
                {review.resourceLinks.length > 0 ? (
                  <div className="space-y-2 rounded-lg border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-3 shadow-xs">
                    <p className="text-xs font-semibold text-foreground">Materiały:</p>
                    <ul className="space-y-1 text-xs">
                      {review.resourceLinks.map((link) => (
                        <li key={link}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            {formatLinkLabel(link)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {review.influencerDisclosure ? (
                  <p className="text-xs italic text-muted-foreground">Ujawnienie: {review.influencerDisclosure}</p>
                ) : null}
              </CardContent>
            </Card>
            </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-full"
              >
                Poprzednia
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline-solid"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="rounded-full"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full"
              >
                Następna
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function formatMonths(months: number) {
  if (months <= 0) return "0 mies.";
  if (months === 1) return "1 miesiac";
  if (months < 5) return `${months} miesiace`;
  return `${months} miesiecy`;
}

function formatLinkLabel(link: string) {
  try {
    const url = new URL(link);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "przed chwilą";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minutę" : minutes < 5 ? "minuty" : "minut"} temu`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "godzinę" : hours < 5 ? "godziny" : "godzin"} temu`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "dzień" : "dni"} temu`;
  }
  
  return date.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
}
