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
    <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-[clamp(1rem,1.5vw,1.35rem)]">
      <TabsList className="flex w-full flex-wrap gap-[clamp(0.5rem,0.75vw,0.65rem)] rounded-2xl border border-border/40 bg-background/60 p-[clamp(0.5rem,0.75vw,0.65rem)] shadow-xs backdrop-blur-[36px]!">
        <TabsTrigger
          value="all"
          className="rounded-full px-[clamp(1rem,1.4vw,1.2rem)] py-[clamp(0.4rem,0.6vw,0.5rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:hover:bg-foreground/5"
        >
          Wszystkie
        </TabsTrigger>
        {categories.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="rounded-full px-[clamp(1rem,1.4vw,1.2rem)] py-[clamp(0.4rem,0.6vw,0.5rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:hover:bg-foreground/5"
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="all" className="space-y-[clamp(1rem,1.5vw,1.35rem)]">
        {filteredPosts.length === 0 ? (
          <Alert className="rounded-2xl border border-border/40 bg-background/60 p-[clamp(0.75rem,1.1vw,1rem)] shadow-xs backdrop-blur-[36px]! fluid-caption">
            <BookOpen className="h-[clamp(1rem,0.55vw+0.85rem,1.2rem)] w-[clamp(1rem,0.55vw+0.85rem,1.2rem)]" />
            <AlertDescription>
              Brak artykułów do wyświetlenia.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-[clamp(0.75rem,1.1vw,1rem)] md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </TabsContent>

      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id} className="space-y-[clamp(1rem,1.5vw,1.35rem)]">
          {filteredPosts.length === 0 ? (
            <Alert className="rounded-2xl border border-border/40 bg-background/60 p-[clamp(0.75rem,1.1vw,1rem)] shadow-xs backdrop-blur-[36px]! fluid-caption">
              <BookOpen className="h-[clamp(1rem,0.55vw+0.85rem,1.2rem)] w-[clamp(1rem,0.55vw+0.85rem,1.2rem)]" />
              <AlertDescription>
                Brak artykułów w kategorii &quot;{category.name}&quot;.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-[clamp(0.75rem,1.1vw,1rem)] md:grid-cols-2 lg:grid-cols-3">
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

