"use client";

import { MetricCard } from "./metric-card";
import { SectionCard } from "./section-card";
import type { BlogStats } from "@/lib/queries/blog-stats";
import {
  FileText,
  CheckCircle,
  FileEdit,
  Archive,
  TrendingUp,
  Eye,
  BarChart3,
  Tag,
} from "lucide-react";

interface BlogStatisticsOverviewProps {
  stats: BlogStats;
}

export function BlogStatisticsOverview({ stats }: BlogStatisticsOverviewProps) {
  return (
    <div className="flex flex-col fluid-stack-md">
      <SectionCard
        title="Przegląd statusów artykułów"
        description="Kluczowe metryki dotyczące artykułów blogowych."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Wszystkich artykułów"
            value={stats.totalPosts}
            description="łącznie w systemie"
            icon={FileText}
            variant="default"
          />
          <MetricCard
            title="Opublikowanych"
            value={stats.publishedPosts}
            description="status: PUBLISHED"
            icon={CheckCircle}
            variant="success"
          />
          <MetricCard
            title="Szkiców"
            value={stats.draftPosts}
            description="status: DRAFT"
            icon={FileEdit}
            variant="warning"
          />
          <MetricCard
            title="Zarchiwizowanych"
            value={stats.archivedPosts}
            description="status: ARCHIVED"
            icon={Archive}
            variant="default"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Trendy i aktywność"
        description="Zmiany w liczbie artykułów i wyświetleniach w ostatnich 30 dniach."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Nowe artykuły (30 dni)"
            value={stats.postsLast30Days}
            description="artykuły utworzone w ostatnim miesiącu"
            icon={TrendingUp}
            variant="default"
          />
          <MetricCard
            title="Łączne wyświetlenia"
            value={stats.totalViews.toLocaleString("pl-PL")}
            description="suma wszystkich wyświetleń"
            icon={Eye}
            variant="primary"
          />
          <MetricCard
            title="Średnia wyświetleń"
            value={stats.averageViewsPerPost.toFixed(1)}
            description="średnia liczba wyświetleń na artykuł"
            icon={BarChart3}
            variant="default"
          />
          <MetricCard
            title="Kategorie"
            value={stats.totalCategories}
            description="łącznie kategorii"
            icon={Tag}
            variant="default"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Podsumowanie"
        description="Aktywne i nieaktywne artykuły w systemie."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Aktywne artykuły"
            value={stats.publishedPosts}
            description="opublikowane i widoczne"
            icon={CheckCircle}
            variant="success"
          />
          <MetricCard
            title="W przygotowaniu"
            value={stats.draftPosts}
            description="szkice oczekujące na publikację"
            icon={FileEdit}
            variant="warning"
          />
          <MetricCard
            title="Nieaktywne"
            value={stats.archivedPosts}
            description="zarchiwizowane artykuły"
            icon={Archive}
            variant="default"
          />
        </div>
      </SectionCard>
    </div>
  );
}


