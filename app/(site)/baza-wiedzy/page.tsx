import { getPublishedBlogPosts, getBlogCategories } from "@/lib/queries/blog";
import { prisma } from "@/lib/prisma";
import { BlogStatistics } from "@/components/blog/blog-statistics";
import { BlogCategoriesTabs } from "@/components/blog/blog-categories-tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Section } from "@/components/layout/section";

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
    <Section size="lg" className="relative z-10 flex flex-col fluid-stack-xl">
      {/* Hero Section */}
      <div className="flex flex-col fluid-stack-md">
        <Badge variant="outline" className="w-fit rounded-full fluid-badge uppercase tracking-[0.2em]">
          Baza wiedzy
        </Badge>
        <div className="flex flex-col fluid-stack-xs">
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
    </Section>
  );
}
