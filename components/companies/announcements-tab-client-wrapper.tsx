"use client";

import { useMemo, useState } from "react";
import { BarChart3, Search, XCircle, Filter, ArrowUpDown, Clock, Receipt, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnnouncementCard } from "./announcements-tab-client";
import { AnnouncementsActivityChart } from "./announcements-activity-chart";
import { ReportIssueForm } from "./report-issue-form";
import { DisclosureSection } from "./disclosure-section";
import { useFadeIn } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { getCompanyBySlug } from "@/lib/queries/companies";

type CompanyWithDetails = NonNullable<Awaited<ReturnType<typeof getCompanyBySlug>>>;

interface Announcement {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  tag?: string;
}

// Export the interface for use in AnnouncementCard
export type { Announcement };

interface AnnouncementsTabClientWrapperProps {
  company: CompanyWithDetails;
  announcements: Announcement[];
  tosUrl: string | null;
}

export function AnnouncementsTabClientWrapper({
  company,
  announcements,
  tosUrl,
}: AnnouncementsTabClientWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "tag">("date-desc");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Group announcements by date
  const groupedAnnouncements = useMemo(() => {
    return announcements.reduce(
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
  }, [announcements]);

  // Filter and sort announcements
  const filteredAndSortedAnnouncements = useMemo(() => {
    let items: Announcement[] = [];

    // Flatten grouped announcements
    Object.values(groupedAnnouncements).forEach((group) => {
      items.push(...group);
    });

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tag?.toLowerCase().includes(query),
      );
    }

    // Apply tag filter
    if (tagFilter) {
      items = items.filter((item) => item.tag === tagFilter);
    }

    // Apply sorting
    return [...items].sort((a, b) => {
      if (sortBy === "date-desc") {
        // Sort by date label (Aktualne first, then by date string)
        if (a.dateLabel === "Aktualne") return -1;
        if (b.dateLabel === "Aktualne") return 1;
        return b.dateLabel.localeCompare(a.dateLabel);
      } else if (sortBy === "date-asc") {
        if (a.dateLabel === "Aktualne") return 1;
        if (b.dateLabel === "Aktualne") return -1;
        return a.dateLabel.localeCompare(b.dateLabel);
      } else if (sortBy === "tag") {
        return (a.tag || "").localeCompare(b.tag || "");
      }
      return 0;
    });
  }, [groupedAnnouncements, searchQuery, tagFilter, sortBy]);

  // Regroup filtered announcements
  const filteredGroupedAnnouncements = useMemo(() => {
    const groups: Record<string, Announcement[]> = {};
    filteredAndSortedAnnouncements.forEach((item) => {
      const date = item.dateLabel;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    return groups;
  }, [filteredAndSortedAnnouncements]);

  const sortedGroups = useMemo(() => {
    return Object.entries(filteredGroupedAnnouncements).sort((a, b) => {
      if (a[0] === "Aktualne") return -1;
      if (b[0] === "Aktualne") return 1;
      return b[0].localeCompare(a[0]);
    });
  }, [filteredGroupedAnnouncements]);

  // Get unique tags
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    announcements.forEach((item) => {
      if (item.tag) {
        tags.add(item.tag);
      }
    });
    return Array.from(tags).sort();
  }, [announcements]);

  // Animation hooks - only for sections that are below the fold
  const reportFormAnim = useFadeIn();
  const disclosureAnim = useFadeIn();

  return (
    <div className="space-y-10">
      {/* Quick Stats Section */}
      <section className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardContent className="space-y-2 pb-2 pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>Wszystkie ogłoszenia</span>
              </div>
              <div className="text-xl font-semibold">{announcements.length}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardContent className="space-y-2 pb-2 pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>Aktualne</span>
              </div>
              <div className="text-xl font-semibold">
                {groupedAnnouncements["Aktualne"]?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardContent className="space-y-2 pb-2 pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>Kategorie</span>
              </div>
              <div className="text-xl font-semibold">{uniqueTags.length}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardContent className="space-y-2 pb-2 pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>Po filtrowaniu</span>
              </div>
              <div className="text-xl font-semibold">
                {filteredAndSortedAnnouncements.length}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Announcements Section */}
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

        {/* Filters and Search */}
        {announcements.length > 0 && (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Szukaj ogłoszeń..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-full border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! pl-9 shadow-xs"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(searchQuery.trim() || tagFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setTagFilter(null);
                  }}
                  className="rounded-full"
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  Wyczyść
                </Button>
              )}
              {/* Tag Filter */}
              {uniqueTags.length > 0 && (
                <Select
                  value={tagFilter || "all"}
                  onValueChange={(value) => setTagFilter(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-[160px] rounded-full border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie tagi</SelectItem>
                    {uniqueTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-[160px] rounded-full border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Najnowsze</SelectItem>
                  <SelectItem value="date-asc">Najstarsze</SelectItem>
                  {uniqueTags.length > 0 && <SelectItem value="tag">Po tagu</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Quick Filter Buttons */}
        {announcements.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Szybkie filtry:</span>
            <Button
              variant={tagFilter === null && !searchQuery.trim() ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setTagFilter(null);
                setSearchQuery("");
              }}
              className="h-7 rounded-full px-2.5 text-[11px] font-normal"
            >
              Wszystkie
            </Button>
            <Button
              variant={tagFilter === null && searchQuery.trim() === "" && groupedAnnouncements["Aktualne"]?.length ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setTagFilter(null);
                setSearchQuery("");
                // Filter to show only "Aktualne" - we'll handle this in the filter logic
              }}
              className="h-7 rounded-full px-2.5 text-[11px] font-normal"
            >
              <Clock className="mr-1 h-2.5 w-2.5" />
              Aktualne
            </Button>
            {uniqueTags.includes("Cena") && (
              <Button
                variant={tagFilter === "Cena" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTagFilter(tagFilter === "Cena" ? null : "Cena")}
                className="h-7 rounded-full px-2.5 text-[11px] font-normal"
              >
                <Receipt className="mr-1 h-2.5 w-2.5" />
                Cena
              </Button>
            )}
            {uniqueTags.includes("Payout") && (
              <Button
                variant={tagFilter === "Payout" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTagFilter(tagFilter === "Payout" ? null : "Payout")}
                className="h-7 rounded-full px-2.5 text-[11px] font-normal"
              >
                <Clock className="mr-1 h-2.5 w-2.5" />
                Wypłaty
              </Button>
            )}
            {uniqueTags.includes("Highlight") && (
              <Button
                variant={tagFilter === "Highlight" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTagFilter(tagFilter === "Highlight" ? null : "Highlight")}
                className="h-7 rounded-full px-2.5 text-[11px] font-normal"
              >
                <Sparkles className="mr-1 h-2.5 w-2.5" />
                Highlight
              </Button>
            )}
          </div>
        )}

        {/* Announcements List */}
        {announcements.length > 0 ? (
          <div className="space-y-4">
            {sortedGroups.map(([date, items], groupIndex) => {
              const isCollapsed = collapsedGroups.has(date);
              const isRecent = date === "Aktualne" || groupIndex < 2; // First 2 groups are recent
              const shouldShowCollapse = !isRecent && items.length > 3; // Show collapse for older groups with many items

              return (
                <div key={date} className="space-y-2">
                  <button
                    onClick={() => {
                      if (shouldShowCollapse) {
                        setCollapsedGroups((prev) => {
                          const next = new Set(prev);
                          if (next.has(date)) {
                            next.delete(date);
                          } else {
                            next.add(date);
                          }
                          return next;
                        });
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-1.5 transition-colors",
                      shouldShowCollapse && "hover:text-foreground/80 cursor-pointer",
                      !shouldShowCollapse && "cursor-default",
                    )}
                  >
                    <div className="h-[0.5px] flex-1 bg-border/50" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                        {date}
                      </span>
                      {shouldShowCollapse && (
                        <span className="text-[10px] text-muted-foreground/50">
                          ({items.length})
                        </span>
                      )}
                      {shouldShowCollapse && (
                        isCollapsed ? (
                          <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
                        ) : (
                          <ChevronUp className="h-3 w-3 text-muted-foreground/60" />
                        )
                      )}
                    </div>
                    <div className="h-[0.5px] flex-1 bg-border/50" />
                  </button>
                  {!isCollapsed && (
                    <div className="space-y-2">
                      {items.map((item) => (
                        <AnnouncementCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : filteredAndSortedAnnouncements.length === 0 && (searchQuery.trim() || tagFilter) ? (
          <Card className="rounded-2xl border border-border/60 border-dashed bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-muted/30 p-4">
                <Search className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <CardTitle className="mb-2 text-xl font-semibold">Nie znaleziono ogłoszeń</CardTitle>
              <CardDescription className="max-w-md text-sm">
                Nie znaleziono ogłoszeń spełniających wybrane kryteria. Spróbuj zmienić filtry.
              </CardDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 rounded-full"
                onClick={() => {
                  setSearchQuery("");
                  setTagFilter(null);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Wyczyść filtry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border border-border/60 border-dashed bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-muted/30 p-4">
                <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <CardTitle className="mb-2 text-xl font-semibold">Brak aktualizacji</CardTitle>
              <CardDescription className="max-w-md text-sm">
                Brak zarejestrowanych aktualizacji dla tej firmy – sprawdź ponownie później.
              </CardDescription>
            </CardContent>
          </Card>
        )}

        {/* Activity Charts */}
        {announcements.length > 0 && (
          <AnnouncementsActivityChart announcements={announcements} />
        )}
      </section>

      {/* Report Issue Form Section */}
      <section
        ref={reportFormAnim.ref}
        className={cn(
          "group relative overflow-hidden rounded-3xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! p-6 shadow-xs transition-all hover:border-primary/50 hover:shadow-md",
          reportFormAnim.className,
        )}
      >
        <ReportIssueForm
          companyId={company.id}
          companySlug={company.slug}
          plans={company.plans.map((plan) => ({ id: plan.id, name: plan.name }))}
        />
      </section>

      {/* Disclosure Section */}
      <div ref={disclosureAnim.ref} className={disclosureAnim.className}>
        <DisclosureSection companyName={company.name} tosUrl={tosUrl} />
      </div>
    </div>
  );
}

