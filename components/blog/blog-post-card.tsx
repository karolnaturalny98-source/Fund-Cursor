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
      <Card className="group h-full overflow-hidden rounded-2xl border border-border/40 bg-background/60 shadow-xs transition-all hover:border-primary/30 hover:shadow-md backdrop-blur-[36px]!">
        {post.featuredImageUrl && (
          <div className="relative h-[clamp(9rem,13vw,11rem)] w-full overflow-hidden">
            <Image
              src={post.featuredImageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardContent className="space-y-[clamp(0.65rem,0.95vw,0.85rem)] p-[clamp(1rem,1.4vw,1.2rem)]">
          <div className="flex flex-wrap gap-[clamp(0.35rem,0.5vw,0.45rem)]">
            {post.categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="rounded-full font-normal fluid-caption"
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

