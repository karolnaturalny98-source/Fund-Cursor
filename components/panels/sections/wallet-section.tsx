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
    <Card className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          SALDO PUNKTÓW
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/40">
          {items.map((item, _index) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center justify-between px-6 py-4 transition-all hover:bg-muted/20",
                item.highlight && "bg-primary/5",
              )}
            >
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "mt-1 text-2xl font-semibold",
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
                <div className="ml-4 h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

