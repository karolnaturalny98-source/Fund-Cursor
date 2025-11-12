"use client";

import { SectionCard } from "./section-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import type { AffiliateQueueItem } from "@/lib/queries/affiliates";
import type { TransactionHistoryItem } from "@/lib/queries/transactions";
import type { InfluencerProfileWithUser } from "@/lib/types";
import type { PendingReview } from "@/lib/queries/reviews";
import type { PendingDataIssue } from "@/lib/queries/data-issues";
import Link from "next/link";
import {
  DollarSign,
  Users,
  FileText,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface OverviewActivityFeedProps {
  recentItems: {
    affiliateQueue: AffiliateQueueItem[];
    redeemQueue: TransactionHistoryItem[];
    influencerProfiles: InfluencerProfileWithUser[];
    pendingReviews: PendingReview[];
    pendingIssues: PendingDataIssue[];
  };
}

export function OverviewActivityFeed({ recentItems }: OverviewActivityFeedProps) {
  const activities: Array<{
    id: string;
    type: "affiliate" | "redeem" | "influencer" | "review" | "issue";
    title: string;
    description: string;
    time: Date;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    ...recentItems.affiliateQueue.map((item) => ({
      id: `affiliate-${item.id}`,
      type: "affiliate" as const,
      title: `Transakcja afiliacyjna: ${item.company.name}`,
      description: `${item.points} pkt • ${item.userEmail || "Brak email"}`,
      time: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
      href: "/admin/cashback",
      icon: DollarSign,
      badge: "PENDING",
    })),
    ...recentItems.redeemQueue.map((item) => ({
      id: `redeem-${item.id}`,
      type: "redeem" as const,
      title: `Wniosek o wypłatę`,
      description: `${Math.abs(item.points)} pkt • ${item.user?.email || "Brak email"}`,
      time: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
      href: "/admin/cashback",
      icon: DollarSign,
      badge: item.status,
    })),
    ...recentItems.influencerProfiles.map((item) => ({
      id: `influencer-${item.id}`,
      type: "influencer" as const,
      title: `Zgłoszenie influencera`,
      description: item.user?.displayName || item.user?.email || "Brak danych",
      time: typeof item.createdAt === "string" ? new Date(item.createdAt) : item.createdAt,
      href: "/admin/community",
      icon: Users,
      badge: item.status,
    })),
    ...recentItems.pendingReviews.map((item) => ({
      id: `review-${item.id}`,
      type: "review" as const,
      title: `Nowa opinia: ${item.company.name}`,
      description: `Ocena: ${item.rating}/5`,
      time: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
      href: "/admin/community",
      icon: FileText,
      badge: item.status,
    })),
    ...recentItems.pendingIssues.map((item) => ({
      id: `issue-${item.id}`,
      type: "issue" as const,
      title: `Błąd danych: ${item.company?.name || "Brak firmy"}`,
      description: item.category,
      time: typeof item.createdAt === "string" ? new Date(item.createdAt) : item.createdAt,
      href: "/admin/community",
      icon: AlertTriangle,
      badge: item.status,
    })),
  ]
    .filter((item) => item.time && !isNaN(item.time.getTime()))
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 10);

  return (
    <SectionCard
      title="Ostatnia aktywność"
      description="Najnowsze elementy wymagające uwagi"
    >
      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Brak aktywności do wyświetlenia
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <Link
                  key={activity.id}
                  href={activity.href}
                  className="flex items-start gap-3 rounded-lg border border-border/50 !bg-[rgba(10,12,15,0.72)] p-3 transition-all hover:bg-accent/50 hover:shadow-sm"
                >
                  <div className="mt-0.5 rounded-lg bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      {activity.badge && (
                        <Badge
                          variant="outline"
                          className="h-5 text-xs shrink-0"
                        >
                          {activity.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    {activity.time && !isNaN(activity.time.getTime()) && (
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {formatDistanceToNow(activity.time, {
                          addSuffix: true,
                          locale: pl,
                        })}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
    </SectionCard>
  );
}

