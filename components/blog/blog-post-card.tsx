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
        <CardContent className="flex flex-col fluid-stack-sm p-5">
          <div className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="fluid-pill border-border/60 text-xs font-medium"
              >
                {category.name}
              </Badge>
            ))}
          </div>
          <h2 className="text-foreground transition-colors group-hover:text-primary line-clamp-2 fluid-copy font-semibold">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="line-clamp-2 text-muted-foreground fluid-caption">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between text-muted-foreground fluid-caption">
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
