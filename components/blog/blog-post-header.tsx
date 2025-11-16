"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
import type { BlogPostWithRelations } from "@/lib/types";
import { Heading } from "@/components/ui/heading";

interface BlogPostHeaderProps {
  post: BlogPostWithRelations;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name[0].toUpperCase();
}

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  const authorName = post.author.displayName || post.author.email || "Autor";
  const initials = getInitials(post.author.displayName || post.author.email);

  return (
    <Card className="rounded-lg border border-border/40 bg-background/60 backdrop-blur-[36px]! shadow-xs">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 rounded-full border border-border/40">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {authorName}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                {post.publishedAt &&
                  format(new Date(post.publishedAt), "d MMMM yyyy")}
              </span>
              {post.readingTime && (
                <>
                  <span>•</span>
                  <span>{post.readingTime} min czytania</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Heading level={1} variant="page">
          {post.title}
        </Heading>
      </CardContent>
      <Separator className="bg-border/40" />
    </Card>
  );
}
