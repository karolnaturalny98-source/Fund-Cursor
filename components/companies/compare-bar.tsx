"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        <Card className="glass-panel shadow-premium">
          <CardContent className="flex flex-col gap-[clamp(0.85rem,1.2vw,1.2rem)] p-[clamp(1.15rem,1.6vw,1.5rem)] sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-copy">
              <p className="font-semibold text-foreground">
                Wybrane do porownania ({selection.length}/{maxItems})
              </p>
              <p className="text-foreground/80">{selection.join(" | ")}</p>
              {hasEnoughItems ? (
                <p className="fluid-caption text-muted-foreground">
                  Udostepnij link:{" "}
                  <span className="break-all font-medium text-foreground">{compareUrl}</span>
                </p>
              ) : (
                <p className="fluid-caption">
                  Wybierz co najmniej dwie firmy, aby otworzyc widok porownania.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" size="sm" className="rounded-full px-5" onClick={clear}>
                Wyczysc
              </Button>
              <Link
                href={hasEnoughItems ? compareUrl : "#"}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-full px-5",
                  !hasEnoughItems && "pointer-events-none opacity-60",
                )}
                aria-disabled={!hasEnoughItems}
              >
                Porownaj
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
