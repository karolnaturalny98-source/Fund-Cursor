"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BlogPostWithRelations, BlogCategory } from "@/lib/types";
import { BlogPostCard } from "./blog-post-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen } from "lucide-react";

interface BlogCategoriesTabsProps {
  posts: BlogPostWithRelations[];
  categories: BlogCategory[];
}

export function BlogCategoriesTabs({
  posts,
  categories,
}: BlogCategoriesTabsProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") {
      return posts;
    }
    return posts.filter((post) =>
      post.categories.some((cat) => cat.id === activeCategory),
    );
  }, [posts, activeCategory]);

  return (
    <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
      <TabsList className="flex w-full flex-wrap gap-2 rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] backdrop-blur-[36px]! p-1 shadow-xs">
        <TabsTrigger
          value="all"
          className="rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:hover:bg-accent"
        >
          Wszystkie
        </TabsTrigger>
        {categories.map((category) => (
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
              Brak artykułów do wyświetlenia.
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

      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id} className="space-y-6">
          {filteredPosts.length === 0 ? (
            <Alert className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] backdrop-blur-[36px]! shadow-xs">
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                Brak artykułów w kategorii &quot;{category.name}&quot;.
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
  );
}

