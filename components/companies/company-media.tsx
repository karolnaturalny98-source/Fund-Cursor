"use client";

import Link from "next/link";
import Image from "next/image";
import { Newspaper, Calendar, ExternalLink, Mic, FileText, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { PremiumIcon } from "@/components/custom/premium-icon";
import type { CompanyMedia } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CompanyMediaProps {
  mediaItems: CompanyMedia[];
}

const TYPE_LABELS: Record<string, string> = {
  article: "Artykuł",
  interview: "Wywiad",
  "press-release": "Komunikat prasowy",
  review: "Recenzja",
};

const TYPE_ICONS: Record<string, typeof Newspaper> = {
  article: Newspaper,
  interview: Mic,
  "press-release": FileText,
  review: Star,
};

export function CompanyMedia({ mediaItems }: CompanyMediaProps) {
  if (mediaItems.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-semibold sm:text-2xl">
            Media i prasa
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Wzmianki o firmie w mediach, wywiady i artykuły prasowe.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mediaItems.map((item) => {
            const publishedDate = new Date(item.publishedAt).toLocaleDateString("pl-PL", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            const typeLabel = item.type ? TYPE_LABELS[item.type] ?? item.type : null;
            const TypeIcon = item.type ? TYPE_ICONS[item.type] ?? Newspaper : Newspaper;

            return (
              <Card
                key={item.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-4 shadow-xs transition-all",
                  "hover:border-primary/50 hover:shadow-md",
                )}
              >
                <div className="flex gap-4">
                  {item.imageUrl ? (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border/40 bg-muted/20">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-muted/20">
                      <Newspaper className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-foreground leading-tight">
                        {item.title}
                      </h3>
                      {item.type && (
                        <PremiumBadge
                          variant="outline"
                          className="shrink-0 text-xs font-semibold"
                        >
                          <TypeIcon className="mr-1 h-3 w-3" />
                          {typeLabel}
                        </PremiumBadge>
                      )}
                    </div>

                    {item.source && (
                      <p className="text-xs font-medium text-muted-foreground">
                        {item.source}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{publishedDate}</span>
                    </div>

                    {item.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <Link
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Czytaj więcej
                      <PremiumIcon icon={ExternalLink} variant="glow" size="sm" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

