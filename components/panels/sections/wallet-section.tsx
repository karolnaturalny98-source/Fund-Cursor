import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CashbackSummary } from "@/lib/types";

interface WalletSectionProps {
  summary: CashbackSummary;
  activeView?: "overview" | "history";
  onShowHistory?: () => void;
}

export function WalletSection({
  summary,
  activeView: _activeView,
  onShowHistory: _onShowHistory,
}: WalletSectionProps) {
  const items = useMemo(
    () => [
      { label: "Dostępne", value: summary.available, highlight: true },
      { label: "Oczekujące", value: summary.pending },
      { label: "Zatwierdzone", value: summary.approved },
      { label: "Zrealizowane", value: summary.redeemed },
    ],
    [summary.available, summary.pending, summary.approved, summary.redeemed],
  );

  return (
    <Card className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
      <CardHeader className="space-y-[clamp(0.35rem,0.55vw,0.5rem)]">
        <CardTitle className="text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          SALDO PUNKTÓW
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/45">
          {items.map((item, _index) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center justify-between px-[clamp(1.4rem,2vw,1.8rem)] py-[clamp(0.9rem,1.3vw,1.15rem)] transition-all hover:bg-muted/15",
                item.highlight && "bg-primary/5",
              )}
            >
              <div className="flex flex-col">
                <span className="fluid-caption uppercase tracking-[0.28em] text-muted-foreground">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "mt-[clamp(0.25rem,0.4vw,0.35rem)] text-[clamp(1.45rem,0.75vw+1.25rem,1.85rem)] font-semibold",
                    item.value < 0
                      ? "text-destructive"
                      : item.highlight
                        ? "text-primary"
                        : "text-foreground",
                  )}
                >
                  {item.value.toLocaleString("pl-PL")}
                </span>
              </div>
              {item.highlight && (
                <div className="ml-[clamp(0.75rem,1.1vw,1rem)] h-[clamp(0.65rem,0.9vw,0.85rem)] w-[clamp(0.65rem,0.9vw,0.85rem)] rounded-full bg-primary shadow-glass" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

