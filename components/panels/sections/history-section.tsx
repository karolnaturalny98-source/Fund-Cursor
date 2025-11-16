import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TransactionStatus, WalletTransaction } from "@/lib/types";

const statusLabels: Record<TransactionStatus, string> = {
  PENDING: "Oczekujace",
  APPROVED: "Zatwierdzone",
  REDEEMED: "Zrealizowane",
  REJECTED: "Odrzucone",
};

type HistoryStatusFilter = TransactionStatus | "ALL";

const historyStatusLabels: Record<HistoryStatusFilter, string> = {
  ALL: "Wszystkie",
  PENDING: statusLabels.PENDING,
  APPROVED: statusLabels.APPROVED,
  REDEEMED: statusLabels.REDEEMED,
  REJECTED: statusLabels.REJECTED,
};

const historyStatusOptions: HistoryStatusFilter[] = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REDEEMED",
  "REJECTED",
];

interface HistorySectionProps {
  transactions: WalletTransaction[];
  loading: boolean;
  error: string | null;
  status: HistoryStatusFilter;
  onlyRedeem: boolean;
  hasMore: boolean;
  initialized: boolean;
  onBack: () => void;
  onLoadMore: () => void;
  onRetry: () => void;
  onStatusChange: (value: HistoryStatusFilter) => void;
  onToggleRedeem: (value: boolean) => void;
  onCopyCode: (id: string, code: string) => void;
  copiedTransactionId: string | null;
}

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

export function HistorySection({
  transactions,
  loading,
  error,
  status,
  onlyRedeem,
  hasMore,
  initialized,
  onBack: _onBack,
  onLoadMore,
  onRetry,
  onStatusChange,
  onToggleRedeem,
  onCopyCode,
  copiedTransactionId,
}: HistorySectionProps) {
  return (
    <div className="space-y-[clamp(1.5rem,2.2vw,2.1rem)]">
      <Card className="rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardHeader className="space-y-[clamp(0.4rem,0.6vw,0.55rem)]">
          <div className="flex flex-wrap items-center justify-between gap-[clamp(0.55rem,0.85vw,0.8rem)]">
            <CardTitle className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Historia transakcji
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
          <div className="flex flex-wrap items-center gap-[clamp(0.55rem,0.85vw,0.8rem)] text-muted-foreground fluid-caption">
            <Label className="flex items-center gap-[clamp(0.4rem,0.6vw,0.55rem)] text-foreground">
              <span className="font-medium">Status</span>
              <Select value={status} onValueChange={(value) => onStatusChange(value as HistoryStatusFilter)}>
                <SelectTrigger className="h-[clamp(2.55rem,1.8vw+2rem,2.9rem)] w-[clamp(9.5rem,16vw,11rem)] rounded-2xl border border-border/60 bg-background/60 px-[clamp(0.85rem,1.3vw,1.15rem)] text-[clamp(0.88rem,0.35vw+0.78rem,0.98rem)] font-medium text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {historyStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {historyStatusLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>
            <Label className="flex items-center gap-[clamp(0.4rem,0.6vw,0.55rem)] cursor-pointer text-foreground">
              <input
                checked={onlyRedeem}
                className="h-[clamp(1rem,0.45vw+0.9rem,1.15rem)] w-[clamp(1rem,0.45vw+0.9rem,1.15rem)] rounded border-input text-primary focus:ring-primary"
                type="checkbox"
                onChange={(event) => onToggleRedeem(event.target.checked)}
              />
              <span className="font-medium">Tylko wnioski o konto</span>
            </Label>
          </div>

          {error ? (
            <Alert variant="destructive" className="rounded-2xl border border-border/60">
              <AlertDescription className="flex flex-wrap items-center justify-between gap-[clamp(0.55rem,0.85vw,0.8rem)] fluid-caption text-destructive-foreground">
                <div className="space-y-[clamp(0.25rem,0.4vw,0.35rem)]">
                  <span>{error}</span>
                </div>
                <Button className="rounded-full" size="sm" variant="outline" onClick={onRetry}>
                  Spróbuj ponownie
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          {!error && !loading && initialized && transactions.length === 0 ? (
            <p className="fluid-copy text-muted-foreground">
              Nie znaleziono transakcji dla wybranych filtrów.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
        {transactions.map((transaction) => {
          const points = transaction.points ?? 0;
          const pointsClass =
            points >= 0 ? "text-emerald-600" : "text-rose-600";

          return (
            <Card
              key={transaction.id}
              className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[32px]! shadow-xs transition-all duration-300 hover:border-primary/35 hover:shadow-premium"
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
                      <Badge
                        variant="outline"
                        className="fluid-badge rounded-full font-medium"
                      >
                        {statusLabels[transaction.status]}
                      </Badge>
                    </div>
                    {transaction.notes ? (
                      <p className="fluid-caption text-muted-foreground">
                        Notatka: {transaction.notes}
                      </p>
                    ) : null}
                    {transaction.company?.discountCode ? (
                      <div className="flex flex-wrap items-center gap-[clamp(0.45rem,0.7vw,0.65rem)] text-muted-foreground fluid-caption">
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

      {loading ? (
        <div className="space-y-[clamp(0.65rem,1vw,0.9rem)]">
          <Skeleton className="h-[clamp(7rem,10vw,8.5rem)] rounded-2xl" />
          <Skeleton className="h-[clamp(7rem,10vw,8.5rem)] rounded-2xl" />
        </div>
      ) : null}

      {!error && hasMore ? (
        <Button className="w-full rounded-full" size="sm" variant="outline" onClick={onLoadMore}>
          Wczytaj więcej
        </Button>
      ) : null}
    </div>
  );
}

export type { HistoryStatusFilter };
