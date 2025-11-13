"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, AlertCircle, Plus, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlogOverviewTab } from "./blog-overview-tab";
import { BlogQueuesTab } from "./blog-queues-tab";
import { BlogOperationsTab } from "./blog-operations-tab";
import { BlogHistoryTab } from "./blog-history-tab";
import type {
  BlogStats,
  BlogTimeSeriesPoint,
  StatusDistribution,
  TopBlogCategory,
  TopBlogAuthor,
} from "@/lib/queries/blog-stats";
import type { BlogPostWithRelations, BlogCategory } from "@/lib/types";

interface BlogDashboardProps {
  stats: BlogStats;
  timeSeries: BlogTimeSeriesPoint[];
  statusDistribution: StatusDistribution[];
  topCategories: TopBlogCategory[];
  topAuthors: TopBlogAuthor[];
  initialPosts: BlogPostWithRelations[];
  categories: BlogCategory[];
}

export function BlogDashboard({
  stats,
  timeSeries,
  statusDistribution,
  topCategories,
  topAuthors,
  initialPosts,
  categories,
}: BlogDashboardProps) {
  const triggerBaseClasses =
    "group inline-flex min-w-[clamp(7.75rem,11vw,10rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.15rem,1.65vw,1.45rem)] py-[clamp(0.55rem,0.8vw,0.7rem)] text-[clamp(0.82rem,0.3vw+0.75rem,0.95rem)] font-semibold transition-all";
  const triggerStateClasses =
    "border-transparent bg-muted/30 text-muted-foreground data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium";

  return (
    <div className="space-y-[clamp(1.5rem,2.3vw,2.1rem)]">
      <div className="space-y-[clamp(0.55rem,0.85vw,0.75rem)]">
        <h1 className="fluid-h2 font-semibold tracking-tight text-foreground">Dashboard Blog</h1>
        <p className="max-w-2xl fluid-copy text-muted-foreground">
          Zarządzaj artykułami blogowymi, kategoriami i publikacjami.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-[clamp(1.25rem,1.9vw,1.7rem)]">
        <TabsList className="flex flex-wrap gap-[clamp(0.55rem,0.85vw,0.75rem)] bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className={cn(
              triggerBaseClasses,
              triggerStateClasses
            )}
          >
            <div className="flex items-center gap-[clamp(0.4rem,0.6vw,0.5rem)]">
              <LayoutDashboard className="h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)]" />
              <span className="font-semibold">Przegląd</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="queues"
            className={cn(
              triggerBaseClasses,
              triggerStateClasses
            )}
          >
            <div className="flex items-center gap-[clamp(0.4rem,0.6vw,0.5rem)]">
              <AlertCircle className="h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)]" />
              <span className="font-semibold">Kolejki</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="operations"
            className={cn(
              triggerBaseClasses,
              triggerStateClasses
            )}
          >
            <div className="flex items-center gap-[clamp(0.4rem,0.6vw,0.5rem)]">
              <Plus className="h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)]" />
              <span className="font-semibold">Operacje</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className={cn(
              triggerBaseClasses,
              triggerStateClasses
            )}
          >
            <div className="flex items-center gap-[clamp(0.4rem,0.6vw,0.5rem)]">
              <History className="h-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)] w-[clamp(1.05rem,0.4vw+0.95rem,1.2rem)]" />
              <span className="font-semibold">Historia</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-[clamp(1.25rem,1.9vw,1.7rem)]">
          <BlogOverviewTab
            stats={stats}
            timeSeries={timeSeries}
            statusDistribution={statusDistribution}
            topCategories={topCategories}
            topAuthors={topAuthors}
          />
        </TabsContent>

        <TabsContent value="queues" className="space-y-[clamp(1.25rem,1.9vw,1.7rem)]">
          <BlogQueuesTab initialPosts={initialPosts} />
        </TabsContent>

        <TabsContent value="operations" className="space-y-[clamp(1.25rem,1.9vw,1.7rem)]">
          <BlogOperationsTab categories={categories} />
        </TabsContent>

        <TabsContent value="history" className="space-y-[clamp(1.25rem,1.9vw,1.7rem)]">
          <BlogHistoryTab initialPosts={initialPosts} initialCategories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

