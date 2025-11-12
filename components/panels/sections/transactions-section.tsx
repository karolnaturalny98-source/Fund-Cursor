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
      <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Ostatnie zakupy
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onShowHistory} className="rounded-lg">
              Historia
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Brak zarejestrowanych transakcji cashback.
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
            Ostatnie zakupy
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onShowHistory} className="rounded-lg">
            Historia
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const points = transaction.points ?? 0;
            const pointsClass =
              points >= 0 ? "text-emerald-600" : "text-rose-600";

            return (
              <Card key={transaction.id} className="rounded-lg border border-border/40 bg-background/60 shadow-xs transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-foreground">
                        {transaction.company ? (
                          <Link
                            className="hover:underline hover:text-primary transition-colors"
                            href={`/firmy/${transaction.company.slug}`}
                          >
                            {transaction.company.name}
                          </Link>
                        ) : (
                          "Firma usunięta"
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(transaction.createdAt)}</span>
                      <Badge
                        variant="outline"
                        className="rounded-full text-xs"
                      >
                        {statusLabels[transaction.status]}
                      </Badge>
                      </div>
                      {transaction.company?.discountCode ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            Kod:{" "}
                            <span className="font-mono text-foreground">
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
                            className="rounded-lg"
                          >
                            {copiedTransactionId === transaction.id
                              ? "Skopiowano"
                              : "Kopiuj"}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                    <span className={cn("text-xs font-semibold", pointsClass)}>
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

