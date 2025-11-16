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
      <section
        ref={sectionAnim.ref}
        className={`space-y-[clamp(1.5rem,2.2vw,2.1rem)] ${sectionAnim.className}`}
      >
        <div className="space-y-[clamp(0.35rem,0.55vw,0.5rem)]">
          <h2 className="fluid-h2 font-semibold text-foreground">Ostatnie transakcje</h2>
          <p className="fluid-caption text-muted-foreground">
            Ostatnie transakcje cashback.
          </p>
        </div>
        <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
          <CardContent className="p-[clamp(1.5rem,2.3vw,2.15rem)]">
            <p className="fluid-copy text-center text-muted-foreground">
              Brak transakcji. Zacznij od dodania pierwszej transakcji cashback.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section
      ref={sectionAnim.ref}
      className={`space-y-[clamp(1.5rem,2.2vw,2.1rem)] ${sectionAnim.className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-[clamp(0.85rem,1.2vw,1.1rem)] sm:items-center">
        <div className="space-y-[clamp(0.35rem,0.55vw,0.5rem)]">
          <h2 className="fluid-h2 font-semibold text-foreground">Ostatnie transakcje</h2>
          <p className="fluid-caption text-muted-foreground">
            Ostatnie 5 transakcji cashback.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={openWallet} className="rounded-full">
          Zobacz wszystkie
        </Button>
      </div>
      <Card className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs">
        <CardContent className="p-[clamp(1.25rem,1.8vw,1.6rem)]">
          <div className="space-y-[clamp(0.85rem,1.2vw,1.1rem)]">
            {recentTransactions.map((transaction) => {
              const pointsClass =
                transaction.points >= 0 ? "text-emerald-600" : "text-rose-600";

              return (
                <Card
                  key={transaction.id}
                  className="rounded-2xl border border-border/60 bg-background/60/80 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45),0_14px_34px_-30px_rgba(15,23,42,0.28)]"
                >
                  <CardContent className="p-[clamp(1rem,1.5vw,1.35rem)]">
                    <div className="flex items-start justify-between gap-[clamp(0.55rem,0.85vw,0.8rem)]">
                      <div className="flex-1 space-y-[clamp(0.3rem,0.45vw,0.4rem)]">
                        <p className="text-[clamp(0.95rem,0.45vw+0.85rem,1.05rem)] font-medium text-foreground">
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
                            className="px-[clamp(0.63rem,1.26vw,0.84rem)] py-[clamp(0.294rem,0.84vw,0.42rem)] text-[clamp(0.588rem,0.336vw+0.504rem,0.63rem)] rounded-full font-medium"
                          >
                            {statusLabels[transaction.status]}
                          </Badge>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-[clamp(0.9rem,0.4vw+0.8rem,1rem)] font-semibold",
                          pointsClass,
                        )}
                      >
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
