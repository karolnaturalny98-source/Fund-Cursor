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
    <div className="space-y-4">
      <Card className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Historia transakcji
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <Label className="flex items-center gap-2">
              <span>Status</span>
              <Select value={status} onValueChange={(value) => onStatusChange(value as HistoryStatusFilter)}>
                <SelectTrigger className="h-9 w-[140px] rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)]">
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
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                checked={onlyRedeem}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                type="checkbox"
                onChange={(event) => onToggleRedeem(event.target.checked)}
              />
              <span>Tylko wnioski o konto</span>
            </Label>
          </div>

          {error ? (
            <Alert variant="destructive" className="rounded-lg border border-border/40">
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button
                    className="mt-2 rounded-lg"
                    size="sm"
                    variant="outline"
                    onClick={onRetry}
                  >
                    Spróbuj ponownie
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : null}

          {!error && !loading && initialized && transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nie znaleziono transakcji dla wybranych filtrów.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {transactions.map((transaction) => {
          const points = transaction.points ?? 0;
          const pointsClass =
            points >= 0 ? "text-emerald-600" : "text-rose-600";

          return (
            <Card key={transaction.id} className="rounded-lg border border-border/40 bg-[rgba(12,14,18,0.6)] shadow-xs transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
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
                    {transaction.notes ? (
                      <p className="text-xs text-muted-foreground">
                        Notatka: {transaction.notes}
                      </p>
                    ) : null}
                    {transaction.company?.discountCode ? (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      ) : null}

      {!error && hasMore ? (
        <Button
          className="w-full rounded-lg"
          size="sm"
          variant="outline"
          onClick={onLoadMore}
        >
          Wczytaj więcej
        </Button>
      ) : null}
    </div>
  );
}

export type { HistoryStatusFilter };

