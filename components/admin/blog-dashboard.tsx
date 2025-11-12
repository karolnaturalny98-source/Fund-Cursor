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
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Blog</h1>
        <p className="text-muted-foreground">
          Zarządzaj artykułami blogowymi, kategoriami i publikacjami.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Przegląd</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="queues"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Kolejki</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="operations"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Operacje</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className={cn(
              "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
              "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
            )}
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Historia</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BlogOverviewTab
            stats={stats}
            timeSeries={timeSeries}
            statusDistribution={statusDistribution}
            topCategories={topCategories}
            topAuthors={topAuthors}
          />
        </TabsContent>

        <TabsContent value="queues" className="space-y-6">
          <BlogQueuesTab initialPosts={initialPosts} />
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <BlogOperationsTab categories={categories} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <BlogHistoryTab initialPosts={initialPosts} initialCategories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

