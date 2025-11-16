"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useCompare } from "@/components/companies/compare-context";
import { cn } from "@/lib/utils";

export function CompareBar() {
  const { selection, clear, maxItems } = useCompare();

  if (selection.length === 0) {
    return null;
  }

  const compareUrl = `/firmy/compare?compare=${selection.join(",")}`;
  const hasEnoughItems = selection.length >= 2;

  return (
    <div className="safe-area-bottom fixed inset-x-0 bottom-0 z-40 px-4">
      <div className="mx-auto w-full max-w-[min(90vw,520px)]">
        <Card variant="elevated" className="backdrop-blur">
          <CardContent className="flex flex-col gap-[clamp(0.85rem,1.2vw,1.2rem)] p-[clamp(1.15rem,1.6vw,1.5rem)] sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-muted-foreground">
            <Text variant="body" weight="semibold" className="text-foreground">
              Wybrane do porownania ({selection.length}/{maxItems})
            </Text>
            <Text variant="body" tone="muted">
              {selection.join(" | ")}
            </Text>
            {hasEnoughItems ? (
              <Text variant="caption" tone="muted" className="break-all font-medium text-foreground">
                Udostepnij link: {compareUrl}
              </Text>
            ) : (
              <Text variant="caption" tone="muted">
                Wybierz co najmniej dwie firmy, aby otworzyc widok porownania.
              </Text>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" size="sm" className="rounded-full px-5" onClick={clear}>
              Wyczysc
            </Button>
            <Button
              asChild
              variant="primary"
              size="sm"
              className="rounded-full px-5"
            >
              <Link
                href={hasEnoughItems ? compareUrl : "#"}
                aria-disabled={!hasEnoughItems}
                className={cn(!hasEnoughItems && "pointer-events-none opacity-60")}
              >
                Porownaj
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
