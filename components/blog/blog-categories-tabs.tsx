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
    <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex flex-col fluid-stack-md">
      <TabsList className="flex w-full flex-wrap fluid-stack-xs rounded-2xl border border-border/40 bg-background/60 p-3 shadow-xs backdrop-blur-xl">
        <TabsTrigger
          value="all"
          className="inline-flex items-center gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full text-sm font-semibold text-muted-foreground transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-muted/50"
        >
          Wszystkie
        </TabsTrigger>
        {categories.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="inline-flex items-center gap-[clamp(0.35rem,0.6vw,0.5rem)] px-[clamp(0.6rem,1vw,0.85rem)] py-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full text-sm font-semibold text-muted-foreground transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-muted/50"
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="all" className="flex flex-col fluid-stack-md">
        {filteredPosts.length === 0 ? (
          <Alert className="rounded-2xl border border-border/40 bg-background/60 p-4 shadow-xs backdrop-blur-xl fluid-stack-xs">
            <BookOpen className="fluid-icon-sm" />
            <AlertDescription>
              Brak artykułów do wyświetlenia.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid fluid-stack-sm md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </TabsContent>

      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id} className="flex flex-col fluid-stack-md">
          {filteredPosts.length === 0 ? (
            <Alert className="rounded-2xl border border-border/40 bg-background/60 p-4 shadow-xs backdrop-blur-xl fluid-stack-xs">
              <BookOpen className="fluid-icon-sm" />
              <AlertDescription>
                Brak artykułów w kategorii &quot;{category.name}&quot;.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid fluid-stack-sm md:grid-cols-2 lg:grid-cols-3">
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
