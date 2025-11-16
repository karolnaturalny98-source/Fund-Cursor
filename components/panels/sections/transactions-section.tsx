import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WalletTransaction } from "@/lib/types";

interface TransactionsSectionProps {
  transactions: WalletTransaction[];
  onShowHistory: () => void;
  onCopyCode: (id: string, code: string) => void;
  copiedTransactionId: string | null;
}

const statusLabels: Record<string, string> = {
  PENDING: "Oczekujące",
  APPROVED: "Zatwierdzone",
  REDEEMED: "Zrealizowane",
  REJECTED: "Odrzucone",
  CANCELLED: "Anulowane",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatPoints(points: number): string {
  const sign = points >= 0 ? "+" : "";
  return `${sign}${points.toLocaleString("pl-PL")} pkt`;
}

export function TransactionsSection({
  transactions,
  onShowHistory,
  onCopyCode,
  copiedTransactionId,
}: TransactionsSectionProps) {
  if (!transactions.length) {
    return (
      <Card className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader className="space-y-[clamp(0.45rem,0.7vw,0.65rem)]">
          <div className="flex flex-wrap items-center justify-between gap-[clamp(0.55rem,0.85vw,0.8rem)]">
            <CardTitle className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Ostatnie zakupy
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onShowHistory} className="rounded-full">
              Historia
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-[clamp(0.55rem,0.85vw,0.8rem)]">
          <p className="fluid-copy text-muted-foreground">
            Brak zarejestrowanych transakcji cashback.
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
            Ostatnie zakupy
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onShowHistory} className="rounded-full">
            Historia
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
        <div className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
          {transactions.map((transaction) => {
            const points = transaction.points ?? 0;
            const pointsClass =
              points >= 0 ? "text-emerald-600" : "text-rose-600";

            return (
              <Card
                key={transaction.id}
                className="rounded-2xl border border-border/60 bg-background/60/85 shadow-xs transition-all duration-300 hover:border-primary/35 hover:shadow-premium"
              >
                <CardContent className="p-[clamp(1.1rem,1.6vw,1.4rem)]">
                  <div className="flex items-start justify-between gap-[clamp(0.55rem,0.85vw,0.8rem)]">
                    <div className="flex-1 space-y-[clamp(0.3rem,0.45vw,0.4rem)]">
                      <p className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold text-foreground">
                        {transaction.company ? (
                          <Link
                            className="transition-colors hover:text-primary hover:underline"
                            href={`/firmy/${transaction.company.slug}`}
                          >
                            {transaction.company.name}
                          </Link>
                        ) : (
                          "Firma usunięta"
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                        <span>{formatDate(transaction.createdAt)}</span>
                        <Badge variant="outline" className="fluid-badge rounded-full font-medium">
                          {statusLabels[transaction.status]}
                        </Badge>
                      </div>
                      {transaction.company?.discountCode ? (
                        <div className="mt-[clamp(0.35rem,0.5vw,0.45rem)] flex flex-wrap items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
                          <span>
                            Kod:{" "}
                            <span className="font-mono text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-semibold text-foreground">
                              {transaction.company.discountCode}
                            </span>
                          </span>
                          <Button
                            type="button"
                            disabled={copiedTransactionId === transaction.id}
                            size="sm"
                            variant="outline"
                            aria-label={`Skopiuj kod ${transaction.company?.discountCode ?? ""}`}
                            onClick={() =>
                              onCopyCode(
                                transaction.id,
                                transaction.company?.discountCode ?? "",
                              )
                            }
                            className="rounded-full"
                          >
                            {copiedTransactionId === transaction.id
                              ? "Skopiowano"
                              : "Kopiuj"}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        "text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-semibold",
                        pointsClass,
                      )}
                    >
                      {formatPoints(points)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
