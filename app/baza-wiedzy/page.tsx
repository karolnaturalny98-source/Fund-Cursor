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
          colorStops={["#1e5a3d", "#34d399", "#a7f3d0"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <div className="container space-y-8 py-8 relative z-10">
      {/* Hero Section */}
      <div className="space-y-3">
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wide">
          Baza wiedzy
        </Badge>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Baza wiedzy
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
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
