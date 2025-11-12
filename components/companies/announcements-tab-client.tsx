"use client";

import { useState } from "react";
import { Info, Receipt, Clock, Sparkles, BarChart3, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  tag?: string;
}

interface AnnouncementCardProps {
  item: Announcement;
}

function formatRelativeDate(dateLabel: string): string {
  if (dateLabel === "Aktualne") {
    return "Aktualne";
  }

  try {
    // Try to parse date from dateLabel (format: "DD.MM.YYYY")
    const [day, month, year] = dateLabel.split(".");
    if (day && month && year) {
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return "Dzisiaj";
      } else if (diffDays === 1) {
        return "Wczoraj";
      } else if (diffDays < 7) {
        return `${diffDays} dni temu`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? "1 tydzień temu" : `${weeks} tygodnie temu`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? "1 miesiąc temu" : `${months} miesiące temu`;
      } else {
        return dateLabel; // Return original format for old dates
      }
    }
  } catch {
    // Ignore parsing errors
  }

  return dateLabel;
}

const MAX_DESCRIPTION_LENGTH = 200;

export function AnnouncementCard({ item }: AnnouncementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = item.description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription = shouldTruncate && !isExpanded
    ? `${item.description.substring(0, MAX_DESCRIPTION_LENGTH)}...`
    : item.description;

  const getTagIcon = (tag?: string) => {
    if (!tag) return Info;
    if (tag.toLowerCase().includes("cena") || tag.toLowerCase().includes("price")) return Receipt;
    if (tag.toLowerCase().includes("payout") || tag.toLowerCase().includes("wypłat")) return Clock;
    if (tag.toLowerCase().includes("highlight")) return Sparkles;
    return BarChart3;
  };

  const Icon = getTagIcon(item.tag);
  const relativeDate = formatRelativeDate(item.dateLabel);

  return (
    <Card className="group relative overflow-hidden rounded-xl border border-border/40 bg-[rgba(12,14,18,0.6)] backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/30 hover:shadow-xs">
      <CardHeader className="space-y-2 pb-2.5 pt-3 px-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="mt-0.5 rounded-md bg-primary/5 p-1.5 text-primary transition-colors group-hover:bg-primary/10 shrink-0">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <CardTitle className="text-sm font-medium leading-snug text-foreground">
                  {item.title}
                </CardTitle>
                {item.tag && (
                  <PremiumBadge variant="outline" className="rounded-full font-normal shrink-0 border-primary/20 text-[10px] px-1.5 py-0">
                    {item.tag}
                  </PremiumBadge>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 mb-1.5">
                <Calendar className="h-3 w-3" />
                <span>{relativeDate}</span>
                {item.dateLabel !== "Aktualne" && relativeDate !== item.dateLabel && (
                  <span className="text-muted-foreground/50">({item.dateLabel})</span>
                )}
              </div>
              <CardDescription className="text-xs leading-relaxed text-muted-foreground/80">
                {displayDescription}
              </CardDescription>
              {shouldTruncate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1.5 h-auto p-0 text-[10px] text-primary/70 hover:text-primary/90"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="mr-0.5 h-2.5 w-2.5" />
                      Zwiń
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-0.5 h-2.5 w-2.5" />
                      Rozwiń
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

