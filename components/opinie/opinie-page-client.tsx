"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, MessageSquare, TrendingUp, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFadeIn } from "@/lib/animations";

interface OpiniePageClientProps {
  totalReviews: number;
  newReviews30d: number;
  averageRating: string;
}

export function OpiniePageClient({ totalReviews, newReviews30d, averageRating }: OpiniePageClientProps) {
  const numberFormatter = new Intl.NumberFormat("pl-PL");
  const heroAnim = useFadeIn({ rootMargin: "-100px" });

  return (
    <>
      <div
        ref={heroAnim.ref}
        className={`flex flex-col gap-[clamp(1.25rem,1.8vw,1.6rem)] ${heroAnim.className}`}
      >
        <Badge variant="outline" className="fluid-badge w-fit uppercase tracking-[0.28em] text-muted-foreground">
          Opinie spolecznosci
        </Badge>
        <div className="max-w-3xl space-y-[clamp(0.45rem,0.7vw,0.65rem)]">
          <h1 className="fluid-h1 font-bold tracking-tight text-foreground">
            Ranking opinii prop firm od FundedRank
          </h1>
          <p className="fluid-copy text-muted-foreground">
            Zobacz, ktore firmy ciesza sie najwiekszym zaufaniem traderow.
            Laczymy liczbe recenzji, srednie oceny w kategoriach oraz trend
            wzrostu, aby przedstawic pelny obraz doswiadczen spolecznosci.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-[clamp(0.65rem,1vw,0.9rem)]">
          <Button asChild variant="primary" className="fluid-button rounded-full">
            <Link href="/firmy">
              Odkryj firmy
              <ArrowRight className="ml-[clamp(0.4rem,0.6vw,0.55rem)] h-[clamp(1rem,0.4vw+0.9rem,1.1rem)] w-[clamp(1rem,0.4vw+0.9rem,1.1rem)]" />
            </Link>
          </Button>
          <Button
            asChild
            variant="premium-outline"
            className="fluid-button rounded-full"
          >
            <Link href="#ranking">Jak liczymy ranking?</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[clamp(0.5rem,0.8vw,0.75rem)] sm:grid-cols-3">
        <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[32px]! p-[clamp(0.75rem,1.1vw,1rem)] shadow-xs transition-all duration-300 hover:border-primary/30 hover:bg-card/70">
          <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
            <MessageSquare className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] shrink-0 text-muted-foreground/70" />
            <div className="min-w-0 flex-1">
              <span className="fluid-caption font-medium text-muted-foreground">Lacznie opinii:</span>
              <span className="block text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold text-foreground">
                {numberFormatter.format(totalReviews)}
              </span>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[32px]! p-[clamp(0.75rem,1.1vw,1rem)] shadow-xs transition-all duration-300 hover:border-primary/30 hover:bg-card/70">
          <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
            <TrendingUp className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] shrink-0 text-muted-foreground/70" />
            <div className="min-w-0 flex-1">
              <span className="fluid-caption font-medium text-muted-foreground">Nowe 30 dni:</span>
              <span className="block text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold text-foreground">
                {numberFormatter.format(newReviews30d)}
              </span>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[32px]! p-[clamp(0.75rem,1.1vw,1rem)] shadow-xs transition-all duration-300 hover:border-primary/30 hover:bg-card/70">
          <div className="flex items-center gap-[clamp(0.45rem,0.7vw,0.65rem)]">
            <Star className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] shrink-0 text-muted-foreground/70" />
            <div className="min-w-0 flex-1">
              <span className="fluid-caption font-medium text-muted-foreground">Srednia ocena:</span>
              <span className="block text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold text-foreground">
                {averageRating} / 5.0
              </span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export function OpinieBadgeClient() {
  return (
    <Badge
      variant="outline"
      className="inline-flex items-center gap-[clamp(0.4rem,0.6vw,0.55rem)] fluid-badge rounded-full font-semibold"
    >
      <Sparkles className="h-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)] w-[clamp(0.95rem,0.35vw+0.85rem,1.1rem)]" />
      Dane weryfikowane recznie
    </Badge>
  );
}

