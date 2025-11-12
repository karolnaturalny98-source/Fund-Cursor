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
      <div ref={heroAnim.ref} className={`flex flex-col gap-4 ${heroAnim.className}`}>
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs uppercase tracking-wide">
          Opinie spolecznosci
        </Badge>
        <div className="max-w-3xl space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Ranking opinii prop firm od FundedRank
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Zobacz, ktore firmy ciesza sie najwiekszym zaufaniem traderow.
            Laczymy liczbe recenzji, srednie oceny w kategoriach oraz trend
            wzrostu, aby przedstawic pelny obraz doswiadczen spolecznosci.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="primary" className="rounded-full px-6" size="lg">
            <Link href="/firmy">
              Odkryj firmy
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="premium-outline"
            className="rounded-full px-6"
            size="lg"
          >
            <Link href="#ranking">Jak liczymy ranking?</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
        <Card className="rounded-lg border border-border/40 bg-background/60 backdrop-blur-[36px]! p-2.5 shadow-xs transition-all hover:border-border/60 hover:bg-card/66">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Lacznie opinii:</span>
              <span className="text-xs font-semibold text-foreground">{numberFormatter.format(totalReviews)}</span>
            </div>
          </div>
        </Card>
        <Card className="rounded-lg border border-border/40 bg-background/60 backdrop-blur-[36px]! p-2.5 shadow-xs transition-all hover:border-border/60 hover:bg-card/66">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Nowe 30 dni:</span>
              <span className="text-xs font-semibold text-foreground">{numberFormatter.format(newReviews30d)}</span>
            </div>
          </div>
        </Card>
        <Card className="rounded-lg border border-border/40 bg-background/60 backdrop-blur-[36px]! p-2.5 shadow-xs transition-all hover:border-border/60 hover:bg-card/66">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Srednia ocena:</span>
              <span className="text-xs font-semibold text-foreground">{averageRating} / 5.0</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export function OpinieBadgeClient() {
  return (
    <Badge variant="outline" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
      <Sparkles className="h-3 w-3" />
      Dane weryfikowane recznie
    </Badge>
  );
}

