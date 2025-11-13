"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Company } from "@/lib/types";

interface FavoritesSectionProps {
  favorites: Company[];
}

export function FavoritesSection({ favorites }: FavoritesSectionProps) {
  if (!favorites.length) {
    return (
      <Card className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader className="space-y-[clamp(0.45rem,0.7vw,0.65rem)]">
          <div className="flex flex-wrap items-center justify-between gap-[clamp(0.55rem,0.85vw,0.8rem)]">
            <CardTitle className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Ulubione firmy
            </CardTitle>
            <Button asChild size="sm" variant="outline" className="fluid-button-sm rounded-full">
              <Link href="/firmy">Otwórz ranking</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-[clamp(0.55rem,0.85vw,0.8rem)]">
          <p className="fluid-copy text-muted-foreground">
            Dodaj firmy do ulubionych, aby mieć szybki dostęp do ich cashbacku.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
      <CardHeader className="space-y-[clamp(0.45rem,0.7vw,0.65rem)]">
        <div className="flex flex-wrap items-center justify-between gap-[clamp(0.55rem,0.85vw,0.8rem)]">
          <CardTitle className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Ulubione firmy
          </CardTitle>
          <Button asChild size="sm" variant="outline" className="fluid-button-sm rounded-full">
            <Link href="/firmy">Otwórz ranking</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
        {favorites.map((company) => (
          <Card
            key={company.id}
            className="rounded-2xl border border-border/60 bg-background/60/85 shadow-xs transition-all duration-300 hover:border-primary/35 hover:shadow-premium"
          >
            <CardContent className="p-[clamp(1.1rem,1.6vw,1.4rem)] space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
              <Link
                className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold text-foreground transition-colors hover:text-primary hover:underline"
                href={`/firmy/${company.slug}`}
              >
                {company.name}
              </Link>
              <p className="fluid-caption text-muted-foreground">
                Cashback do{" "}
                <Badge variant="outline" className="fluid-badge rounded-full font-semibold">
                  {company.cashbackRate ?? 0} pkt
                </Badge>
              </p>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

