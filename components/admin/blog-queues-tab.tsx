"use client";

import { SectionCard } from "./section-card";
import { BlogPostsPanel } from "./blog-posts-panel";
import type { BlogPostWithRelations } from "@/lib/types";

interface BlogQueuesTabProps {
  initialPosts: BlogPostWithRelations[];
}

export function BlogQueuesTab({ initialPosts }: BlogQueuesTabProps) {
  // Filter to show only DRAFT posts
  const draftPosts = initialPosts.filter((post) => post.status === "DRAFT");

  return (
    <div className="flex flex-col fluid-stack-md">
      <SectionCard
        title="Szkice artykułów"
        description="Artykuły w statusie DRAFT oczekujące na publikację."
      >
        <BlogPostsPanel initialPosts={draftPosts} />
      </SectionCard>
    </div>
  );
}


