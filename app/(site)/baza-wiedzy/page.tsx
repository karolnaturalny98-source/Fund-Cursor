import { getPublishedBlogPosts, getBlogCategories } from "@/lib/queries/blog";
import { prisma } from "@/lib/prisma";
import { BlogStatistics } from "@/components/blog/blog-statistics";
import { BlogCategoriesTabs } from "@/components/blog/blog-categories-tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Section } from "@/components/layout/section";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

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
        <Badge variant="outline" className="w-fit rounded-full px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] uppercase tracking-[0.2em]">
          Baza wiedzy
        </Badge>
        <div className="flex flex-col fluid-stack-xs">
          <Heading level={1} variant="hero">
            Baza wiedzy
          </Heading>
          <Text variant="body" tone="muted" className="max-w-2xl">
            Dowiedz się więcej o prop tradingu, najlepszych firmach i strategiach
            zarządzania kapitałem.
          </Text>
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
