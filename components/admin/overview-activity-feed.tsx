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
      <ScrollArea className="h-[clamp(18rem,45vh,23rem)] pr-[clamp(0.4rem,0.7vw,0.6rem)]">
        <div className="space-y-[clamp(0.85rem,1.2vw,1.05rem)]">
          {activities.length === 0 ? (
            <div className="py-[clamp(3rem,4.5vw,3.5rem)] text-center text-muted-foreground">
              Brak aktywności do wyświetlenia
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <Link
                  key={activity.id}
                  href={activity.href}
                  className="flex items-start gap-[clamp(0.7rem,1vw,0.9rem)] rounded-2xl border border-border/50 bg-card/72 px-[clamp(0.9rem,1.3vw,1.15rem)] py-[clamp(0.85rem,1.2vw,1.05rem)] transition-all hover:bg-accent/40 hover:shadow-sm"
                >
                  <div className="mt-[clamp(0.1rem,0.25vw,0.2rem)] rounded-2xl bg-primary/10 p-[clamp(0.55rem,0.8vw,0.7rem)]">
                    <Icon className="h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] text-primary" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-[clamp(0.35rem,0.5vw,0.45rem)]">
                    <div className="flex items-start justify-between gap-[clamp(0.6rem,0.9vw,0.75rem)]">
                      <p className="text-[clamp(0.95rem,0.45vw+0.85rem,1.08rem)] font-semibold leading-tight text-foreground">
                        {activity.title}
                      </p>
                      {activity.badge && (
                        <Badge
                          variant="outline"
                          className="fluid-badge shrink-0 rounded-full"
                        >
                          {activity.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="fluid-caption text-muted-foreground">
                      {activity.description}
                    </p>
                    {activity.time && !isNaN(activity.time.getTime()) && (
                      <p className="text-[clamp(0.78rem,0.32vw+0.72rem,0.88rem)] text-muted-foreground/70">
                        {formatDistanceToNow(activity.time, {
                          addSuffix: true,
                          locale: pl,
                        })}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="mt-[clamp(0.15rem,0.3vw,0.25rem)] h-[clamp(0.95rem,0.4vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.4vw+0.85rem,1.1rem)] shrink-0 text-muted-foreground" />
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
    </SectionCard>
  );
}

