"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFadeIn } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useUserPanel } from "@/components/panels/user-panel-context";

type TransactionStatus = "PENDING" | "APPROVED" | "REDEEMED" | "REJECTED";

interface WalletTransaction {
  id: string;
  status: TransactionStatus;
  points: number;
  createdAt: string;
  notes?: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    discountCode: string | null;
    cashbackRate: number | null;
  } | null;
}

interface UserDashboardRecentProps {
  transactions: WalletTransaction[];
  onShowHistory: () => void;
}

const statusLabels: Record<TransactionStatus, string> = {
  PENDING: "Oczekujące",
  APPROVED: "Zatwierdzone",
  REDEEMED: "Zrealizowane",
  REJECTED: "Odrzucone",
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatPoints(points: number) {
  const sign = points > 0 ? "+" : points < 0 ? "-" : "";
  const formatted = Math.abs(points).toLocaleString("pl-PL");
  return `${sign}${formatted} pkt`;
}

export function UserDashboardRecent({ transactions, onShowHistory: _onShowHistory }: UserDashboardRecentProps) {
  const sectionAnim = useFadeIn({ rootMargin: "-50px" });
  const { open: openWallet } = useUserPanel();

  const recentTransactions = transactions.slice(0, 5);

  if (recentTransactions.length === 0) {
    return (
      <section ref={sectionAnim.ref} className={`space-y-4 ${sectionAnim.className}`}>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold sm:text-xl">Ostatnie transakcje</h2>
          <p className="text-xs text-muted-foreground">
            Ostatnie transakcje cashback.
          </p>
        </div>
        <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              Brak transakcji. Zacznij od dodania pierwszej transakcji cashback.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section ref={sectionAnim.ref} className={`space-y-4 ${sectionAnim.className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold sm:text-xl">Ostatnie transakcje</h2>
          <p className="text-xs text-muted-foreground">
            Ostatnie 5 transakcji cashback.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={openWallet} className="rounded-lg">
          Zobacz wszystkie
        </Button>
      </div>
      <Card className="rounded-lg border border-border/40 bg-background/60 shadow-xs">
        <CardContent className="p-4">
          <div className="space-y-3">
            {recentTransactions.map((transaction) => {
              const pointsClass =
                transaction.points >= 0 ? "text-emerald-600" : "text-rose-600";

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
                      </div>
                      <span className={cn("text-xs font-semibold", pointsClass)}>
                        {formatPoints(transaction.points)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

