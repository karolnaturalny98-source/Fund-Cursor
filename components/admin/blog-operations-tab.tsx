"use client";

import { SectionCard } from "./section-card";
import { BlogPostForm } from "@/components/forms/blog-post-form";
import type { BlogCategory } from "@/lib/types";

interface BlogOperationsTabProps {
  categories: BlogCategory[];
}

export function BlogOperationsTab({ categories }: BlogOperationsTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Dodaj nowy artykuł"
        description="Utwórz nowy artykuł blogowy z pełnym edytorem tekstu."
      >
        <BlogPostForm categories={categories} />
      </SectionCard>
    </div>
  );
}

