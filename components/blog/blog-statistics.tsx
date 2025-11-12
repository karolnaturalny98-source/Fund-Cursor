"use client";

import { Card } from "@/components/ui/card";
import { BookOpen, FolderTree, FileText } from "lucide-react";

interface BlogStatisticsProps {
  totalPosts: number;
  publishedPosts: number;
  categoriesCount: number;
}

export function BlogStatistics({
  totalPosts,
  publishedPosts,
  categoriesCount,
}: BlogStatisticsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] !backdrop-blur-[36px] p-3 shadow-sm transition-all hover:border-border/60 hover:bg-[rgba(11,13,16,0.66)]">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground/70" />
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Wszystkie artykuły:</span>
            <span className="text-sm font-semibold text-foreground">{totalPosts}</span>
          </div>
        </div>
      </Card>

      <Card className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] !backdrop-blur-[36px] p-3 shadow-sm transition-all hover:border-border/60 hover:bg-[rgba(11,13,16,0.66)]">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground/70" />
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Opublikowane:</span>
            <span className="text-sm font-semibold text-foreground">{publishedPosts}</span>
          </div>
        </div>
      </Card>

      <Card className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] !backdrop-blur-[36px] p-3 shadow-sm transition-all hover:border-border/60 hover:bg-[rgba(11,13,16,0.66)]">
        <div className="flex items-center gap-2">
          <FolderTree className="h-4 w-4 shrink-0 text-muted-foreground/70" />
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Kategorie:</span>
            <span className="text-sm font-semibold text-foreground">{categoriesCount}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

