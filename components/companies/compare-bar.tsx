"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCompare } from "@/components/companies/compare-context";

export function CompareBar() {
  const { selection, clear, maxItems } = useCompare();

  if (selection.length === 0) {
    return null;
  }

  const compareUrl = `/firmy/compare?compare=${selection.join(",")}`;
  const hasEnoughItems = selection.length >= 2;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 w-full max-w-xl -translate-x-1/2 px-4 sm:px-0">
      <Card className="glass-panel shadow-premium">
        <CardContent className="flex flex-col gap-[clamp(0.85rem,1.2vw,1.2rem)] p-[clamp(1.15rem,1.6vw,1.5rem)] sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-copy">
            <p className="font-semibold text-foreground">
              Wybrane do porownania ({selection.length}/{maxItems})
            </p>
            <p>{selection.join(" | ")}</p>
            {hasEnoughItems ? (
              <p className="fluid-caption text-muted-foreground">
                Udostepnij link: <span className="font-medium text-foreground">{compareUrl}</span>
              </p>
            ) : (
              <p className="fluid-caption">
                Wybierz co najmniej dwie firmy, aby otworzyc widok porownania.
              </p>
            )}
          </div>
          <div className="flex gap-[clamp(0.65rem,1vw,1rem)]">
            <Button variant="ghost" size="sm" className="fluid-button-sm rounded-full" onClick={clear}>
              Wyczysc
            </Button>
            <Button asChild disabled={!hasEnoughItems} size="sm" className="fluid-button-sm rounded-full">
              <Link href={hasEnoughItems ? compareUrl : "#"}>Porownaj</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
