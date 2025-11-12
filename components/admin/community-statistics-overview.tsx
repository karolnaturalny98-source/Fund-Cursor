"use client";

import { MetricCard } from "./metric-card";
import { SectionCard } from "./section-card";
import type { CommunityStats } from "@/lib/queries/community-stats";
import {
  AlertCircle,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from "lucide-react";

interface CommunityStatisticsOverviewProps {
  stats: CommunityStats;
}

export function CommunityStatisticsOverview({
  stats,
}: CommunityStatisticsOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Główne metryki */}
      <SectionCard
        title="Główne metryki"
        description="Przegląd kluczowych wskaźników kolejek i operacji społecznościowych."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Zgłoszenia influencerów"
            value={stats.pendingInfluencersCount}
            description="oczekujące na weryfikację"
            icon={Users}
            variant="warning"
          />
          <MetricCard
            title="Opinie do moderacji"
            value={stats.pendingReviewsCount}
            description="oczekujące na decyzję"
            icon={MessageSquare}
            variant="warning"
          />
          <MetricCard
            title="Błędy danych"
            value={stats.pendingIssuesCount}
            description="oczekujące na rozpatrzenie"
            icon={AlertTriangle}
            variant="warning"
          />
          <MetricCard
            title="Wszystkie oczekujące"
            value={stats.allPendingCount}
            description="operacje wymagające akcji"
            icon={AlertCircle}
            variant="danger"
          />
        </div>
      </SectionCard>

      {/* Metryki influencerów */}
      <SectionCard
        title="Metryki influencerów"
        description="Analiza zgłoszeń i statusów influencerów."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Wszystkich influencerów"
            value={stats.totalInfluencers}
            description="łącznie zgłoszeń"
            icon={Users}
            variant="default"
          />
          <MetricCard
            title="Zatwierdzonych"
            value={stats.approvedInfluencersCount}
            description="status: APPROVED"
            icon={CheckCircle}
            variant="success"
          />
          <MetricCard
            title="Odrzuconych"
            value={stats.rejectedInfluencersCount}
            description="status: REJECTED"
            icon={XCircle}
            variant="danger"
          />
          <MetricCard
            title="Średni zasięg"
            value={stats.averageAudienceSize.toLocaleString("pl-PL")}
            description="średnia liczba obserwujących"
            icon={BarChart3}
            variant="default"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 mt-4">
          <MetricCard
            title="Wskaźnik zatwierdzeń influencerów"
            value={`${stats.influencerApprovalRate.toFixed(2)}%`}
            description="procent zatwierdzonych zgłoszeń"
            icon={TrendingUp}
            variant="success"
          />
          <MetricCard
            title="Wskaźnik odrzuceń influencerów"
            value={`${stats.influencerRejectionRate.toFixed(2)}%`}
            description="procent odrzuconych zgłoszeń"
            icon={TrendingDown}
            variant="danger"
          />
        </div>
      </SectionCard>

      {/* Metryki opinii */}
      <SectionCard
        title="Metryki opinii"
        description="Statystyki moderacji opinii użytkowników."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Wszystkich opinii"
            value={stats.totalReviews}
            description="łącznie opinii w systemie"
            icon={MessageSquare}
            variant="default"
          />
          <MetricCard
            title="Zatwierdzonych opinii"
            value={stats.approvedReviewsCount}
            description="status: APPROVED"
            icon={CheckCircle}
            variant="success"
          />
          <MetricCard
            title="Odrzuconych opinii"
            value={stats.rejectedReviewsCount}
            description="status: REJECTED"
            icon={XCircle}
            variant="danger"
          />
          <MetricCard
            title="Średnia ocena"
            value={stats.averageRating.toFixed(2)}
            description="średnia ocena wszystkich opinii"
            icon={Star}
            variant="primary"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 mt-4">
          <MetricCard
            title="Wskaźnik zatwierdzeń opinii"
            value={`${stats.reviewApprovalRate.toFixed(2)}%`}
            description="procent zatwierdzonych opinii"
            icon={TrendingUp}
            variant="success"
          />
          <MetricCard
            title="Wskaźnik odrzuceń opinii"
            value={`${stats.reviewRejectionRate.toFixed(2)}%`}
            description="procent odrzuconych opinii"
            icon={TrendingDown}
            variant="danger"
          />
        </div>
      </SectionCard>

      {/* Metryki błędów danych */}
      <SectionCard
        title="Metryki błędów danych"
        description="Statystyki zgłoszeń błędów danych."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Wszystkich zgłoszeń"
            value={stats.totalIssues}
            description="łącznie zgłoszeń błędów"
            icon={AlertTriangle}
            variant="default"
          />
          <MetricCard
            title="Rozwiązanych"
            value={stats.resolvedIssuesCount}
            description="status: RESOLVED"
            icon={CheckCircle}
            variant="success"
          />
          <MetricCard
            title="Odrzuconych"
            value={stats.dismissedIssuesCount}
            description="status: DISMISSED"
            icon={XCircle}
            variant="danger"
          />
          <MetricCard
            title="Wskaźnik rozwiązania"
            value={`${stats.issueResolutionRate.toFixed(2)}%`}
            description="procent rozwiązanych zgłoszeń"
            icon={TrendingUp}
            variant="success"
          />
        </div>
      </SectionCard>

      {/* Trendy */}
      <SectionCard
        title="Trendy i aktywność"
        description="Zmiany w liczbie zgłoszeń w ostatnich okresach."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <MetricCard
            title="Influencerzy (7 dni)"
            value={stats.influencersLast7Days}
            description="nowe zgłoszenia w ostatnim tygodniu"
            icon={Clock}
            variant="default"
          />
          <MetricCard
            title="Influencerzy (30 dni)"
            value={stats.influencersLast30Days}
            description="nowe zgłoszenia w ostatnim miesiącu"
            icon={Clock}
            variant="default"
          />
          <MetricCard
            title="Opinie (7 dni)"
            value={stats.reviewsLast7Days}
            description="nowe opinie w ostatnim tygodniu"
            icon={Clock}
            variant="default"
          />
          <MetricCard
            title="Opinie (30 dni)"
            value={stats.reviewsLast30Days}
            description="nowe opinie w ostatnim miesiącu"
            icon={Clock}
            variant="default"
          />
          <MetricCard
            title="Błędy (7 dni)"
            value={stats.issuesLast7Days}
            description="nowe zgłoszenia w ostatnim tygodniu"
            icon={Clock}
            variant="default"
          />
          <MetricCard
            title="Błędy (30 dni)"
            value={stats.issuesLast30Days}
            description="nowe zgłoszenia w ostatnim miesiącu"
            icon={Clock}
            variant="default"
          />
        </div>
      </SectionCard>
    </div>
  );
}

