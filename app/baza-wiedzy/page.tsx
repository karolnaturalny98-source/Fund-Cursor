import { getPublishedBlogPosts, getBlogCategories } from "@/lib/queries/blog";
import { prisma } from "@/lib/prisma";
import { BlogStatistics } from "@/components/blog/blog-statistics";
import { BlogCategoriesTabs } from "@/components/blog/blog-categories-tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuroraWrapper } from "@/components/aurora-wrapper";

// Cache blog index for 5 minutes - content changes infrequently
export const revalidate = 300;

export default async function BlogPage() {
  const [posts, categories, stats] = await Promise.all([
    getPublishedBlogPosts(100),
    getBlogCategories(),
    Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.blogCategory.count(),
    ]).catch(() => [0, 0, 0]),
  ]);

  const [totalPosts, publishedPosts, categoriesCount] = stats;

  return (
    <div className="relative">
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 h-[150vh]">
        <AuroraWrapper
          colorStops={["#34D399", "#a78bfa", "#3b82f6"]}
          blend={0.35}
          amplitude={0.7}
          speed={0.5}
        />
      </div>
      <div className="container relative z-10 space-y-[clamp(2rem,2.8vw,2.6rem)] py-[clamp(2.5rem,3.2vw,3.25rem)]">
      {/* Hero Section */}
      <div className="space-y-[clamp(1rem,1.4vw,1.25rem)]">
        <Badge variant="outline" className="w-fit rounded-full fluid-badge uppercase tracking-[0.2em]">
          Baza wiedzy
        </Badge>
        <div className="space-y-[clamp(0.5rem,0.75vw,0.7rem)]">
          <h1 className="font-bold tracking-tight text-foreground fluid-h1">
            Baza wiedzy
          </h1>
          <p className="max-w-2xl text-muted-foreground fluid-copy">
            Dowiedz się więcej o prop tradingu, najlepszych firmach i strategiach
            zarządzania kapitałem.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <BlogStatistics
        totalPosts={totalPosts}
        publishedPosts={publishedPosts}
        categoriesCount={categoriesCount}
      />

      <Separator className="bg-border/40" />

      {/* Categories Tabs */}
      <BlogCategoriesTabs posts={posts} categories={categories} />
      </div>
    </div>
  );
}
