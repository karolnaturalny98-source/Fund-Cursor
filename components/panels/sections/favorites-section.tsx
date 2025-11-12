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
      <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Ulubione firmy
            </CardTitle>
            <Button asChild size="sm" variant="outline" className="rounded-lg">
              <Link href="/firmy">Otwórz ranking</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Dodaj firmy do ulubionych, aby mieć szybki dostęp do ich cashbacku.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Ulubione firmy
          </CardTitle>
          <Button asChild size="sm" variant="outline" className="rounded-lg">
            <Link href="/firmy">Otwórz ranking</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {favorites.map((company) => (
            <Card key={company.id} className="rounded-lg border border-border/40 bg-background/60 shadow-xs transition-all hover:shadow-md">
              <CardContent className="p-4">
                <Link
                  className="font-medium hover:underline hover:text-primary transition-colors"
                  href={`/firmy/${company.slug}`}
                >
                  {company.name}
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                  Cashback do <Badge variant="outline" className="rounded-full text-xs">{company.cashbackRate ?? 0} pkt</Badge>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

