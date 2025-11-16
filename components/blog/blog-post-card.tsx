import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import type { BlogPostWithRelations } from "@/lib/types";

interface BlogPostCardProps {
  post: BlogPostWithRelations;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link href={`/baza-wiedzy/${post.slug}`}>
      <Card className="group h-full overflow-hidden rounded-2xl border border-border/40 bg-background/60 shadow-xs transition-all hover:border-primary/30 hover:shadow-md backdrop-blur-xl">
        {post.featuredImageUrl && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={post.featuredImageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <Badge key={category.id} variant="pill-outline" className="text-xs font-medium">
                {category.name}
              </Badge>
            ))}
          </div>
          <Heading
            asChild
            level={3}
            variant="subsectionStrong"
            className="line-clamp-2 text-foreground transition-colors group-hover:text-primary"
          >
            <span>{post.title}</span>
          </Heading>
          {post.excerpt && (
            <Text variant="caption" tone="muted" className="line-clamp-2">
              {post.excerpt}
            </Text>
          )}
          <Text asChild variant="caption" tone="muted" className="flex items-center justify-between">
            <span>
              {post.publishedAt &&
                format(new Date(post.publishedAt), "d MMMM yyyy")}
            </span>
            {post.readingTime && <span>{post.readingTime} min czytania</span>}
          </Text>
        </CardContent>
      </Card>
    </Link>
  );
}
