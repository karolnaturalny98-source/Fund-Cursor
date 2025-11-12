import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogPostWithRelations } from "@/lib/types";

interface BlogPostCardProps {
  post: BlogPostWithRelations;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link href={`/baza-wiedzy/${post.slug}`}>
      <Card className="group h-full overflow-hidden rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/30 hover:shadow-md">
        {post.featuredImageUrl && (
          <div className="relative h-40 w-full overflow-hidden">
            <Image
              src={post.featuredImageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {post.categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="rounded-full text-xs font-normal"
              >
                {category.name}
              </Badge>
            ))}
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {post.publishedAt &&
                format(new Date(post.publishedAt), "d MMMM yyyy")}
            </span>
            {post.readingTime && <span>{post.readingTime} min czytania</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

