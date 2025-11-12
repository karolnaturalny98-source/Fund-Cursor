"use client";

import { SectionCard } from "./section-card";
import { BlogPostsPanel } from "./blog-posts-panel";
import { BlogCategoriesPanel } from "./blog-categories-panel";
import type { BlogPostWithRelations, BlogCategory } from "@/lib/types";

interface BlogHistoryTabProps {
  initialPosts: BlogPostWithRelations[];
  initialCategories: BlogCategory[];
}

export function BlogHistoryTab({ initialPosts, initialCategories }: BlogHistoryTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Wszystkie artykuły"
        description="Przeglądaj i zarządzaj wszystkimi artykułami blogowymi."
      >
        <BlogPostsPanel initialPosts={initialPosts} />
      </SectionCard>

      <SectionCard
        title="Kategorie"
        description="Zarządzaj kategoriami artykułów blogowych."
      >
        <BlogCategoriesPanel initialCategories={initialCategories} />
      </SectionCard>
    </div>
  );
}

