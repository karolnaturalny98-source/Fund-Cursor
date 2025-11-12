import { notFound } from "next/navigation";
import { getBlogPostBySlug, getRelatedPosts } from "@/lib/queries/blog";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BlogPostHeader } from "@/components/blog/blog-post-header";
import { RelatedPostsTabs } from "@/components/blog/related-posts-tabs";
import { sanitizeHtml } from "@/lib/utils/blog";
import type { Metadata } from "next";

// Cache blog posts for 1 hour - content is static once published
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || post.status !== "PUBLISHED") {
    return {
      title: "Artykuł nie znaleziony",
    };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      images: post.ogImageUrl || post.featuredImageUrl
        ? [post.ogImageUrl || post.featuredImageUrl!]
        : [],
      type: "article",
      publishedTime: post.publishedAt || undefined,
      authors: post.author.displayName ? [post.author.displayName] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const related = await getRelatedPosts(post.id, 10);

  const firstCategory = post.categories[0];

  return (
    <div className="relative min-h-screen">
      {/* Gradient background */}
      <div 
        className="fixed inset-0 -z-10 pointer-events-none" 
        style={{
          background: 'linear-gradient(135deg, #0f1726 0%, #1f2a3c 50%, #2446a6 100%)',
          height: '150vh',
          width: '100%'
        }}
      />
      <div className="container space-y-8 py-8 relative z-10">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Strona główna</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/baza-wiedzy">Baza wiedzy</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {firstCategory && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{firstCategory.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{post.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <article className="space-y-8">
        {/* Header with Avatar */}
        <BlogPostHeader post={post} />

        {/* Featured Image */}
        {post.featuredImageUrl && (
          <div className="relative h-64 w-full overflow-hidden rounded-lg border border-border/40 md:h-80">
            <Image
              src={post.featuredImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}

        {/* Content */}
        <Card className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] backdrop-blur-[36px]! shadow-xs">
          <CardContent className="p-6 md:p-8">
            <div
              className="prose prose-invert max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(post.content),
              }}
            />
          </CardContent>
        </Card>

        <Separator className="bg-border/40" />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-full text-xs font-normal"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </article>

      {/* Related Posts with Tabs */}
      {related.length > 0 && (
        <RelatedPostsTabs
          relatedPosts={related}
          currentPostCategories={post.categories}
        />
      )}
      </div>
    </div>
  );
}
