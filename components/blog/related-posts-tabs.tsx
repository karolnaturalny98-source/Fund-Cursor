"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogPostCard } from "./blog-post-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen } from "lucide-react";
import type { BlogPostWithRelations, BlogCategory } from "@/lib/types";

interface RelatedPostsTabsProps {
  relatedPosts: BlogPostWithRelations[];
  currentPostCategories: BlogCategory[];
}

export function RelatedPostsTabs({
  relatedPosts,
  currentPostCategories,
}: RelatedPostsTabsProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") {
      return relatedPosts;
    }
    return relatedPosts.filter((post) =>
      post.categories.some((cat) => cat.id === activeCategory),
    );
  }, [relatedPosts, activeCategory]);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
        Powiązane artykuły
      </h2>
      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="space-y-6"
      >
        <TabsList className="flex w-full flex-wrap gap-2 rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] backdrop-blur-[36px]! p-1 shadow-xs">
          <TabsTrigger
            value="all"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:hover:bg-accent"
          >
            Wszystkie
          </TabsTrigger>
          {currentPostCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:hover:bg-accent"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {filteredPosts.length === 0 ? (
            <Alert className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] backdrop-blur-[36px]! shadow-xs">
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                Brak powiązanych artykułów do wyświetlenia.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>

        {currentPostCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            {filteredPosts.length === 0 ? (
              <Alert className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] backdrop-blur-[36px]! shadow-xs">
                <BookOpen className="h-4 w-4" />
                <AlertDescription>
                  Brak powiązanych artykułów w kategorii &quot;{category.name}&quot;.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

