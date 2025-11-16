"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { TransactionStatus } from "@/lib/queries/transactions";

export interface RedeemQueueItem {
  id: string;
  status: TransactionStatus;
  points: number;
  notes: string | null;
  createdAt: string;
  approvedAt: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
  } | null;
  user: {
    clerkId: string;
    displayName: string | null;
    email: string | null;
  } | null;
}

interface RedeemQueueTableProps {
  transactions: RedeemQueueItem[];
}

const STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: "Oczekujące",
  APPROVED: "Zatwierdzone",
  REDEEMED: "Zrealizowane",
  REJECTED: "Odrzucone",
};

const STATUS_STYLES: Record<TransactionStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  REDEEMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  REJECTED: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
};

export function RedeemQueueTable({ transactions }: RedeemQueueTableProps) {
  const router = useRouter();
  const [currentActionId, setCurrentActionId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingTransactions = useMemo(
    () => transactions.filter((t) => t.status === "PENDING"),
    [transactions],
  );

  const approvedTransactions = useMemo(
    () => transactions.filter((t) => t.status === "APPROVED"),
    [transactions],
  );

  const pendingCount = pendingTransactions.length;
  const approvedCount = approvedTransactions.length;

  const handleAction = (
    id: string,
    payload: { status: TransactionStatus },
  ) => {
    setError(null);
    setCurrentActionId(id);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/cashback/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const message = data?.error ?? "Nie udało się zaktualizować wniosku.";
          setError(message);
          setCurrentActionId(null);
          return;
        }

        router.refresh();
        setCurrentActionId(null);
      } catch (err) {
        console.error(err);
        setError("Nie udało się nawiązać połączenia z API.");
        setCurrentActionId(null);
      }
    });
  };

  const handleDelete = (id: string) => {
    setError(null);
    setCurrentActionId(id);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/cashback/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setError(data?.error ?? "Nie udało się usunąć transakcji.");
          setCurrentActionId(null);
          return;
        }

        setDeleteDialog(null);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError("Wystąpił błąd podczas usuwania transakcji.");
      } finally {
        setCurrentActionId(null);
      }
    });
  };

  if (pendingCount === 0 && approvedCount === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Brak wniosków o konto.
      </div>
    );
  }

  return (
    <Tabs defaultValue="pending" className="flex flex-col fluid-stack-sm">
      <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
        <TabsTrigger
          value="pending"
          className={cn(
              "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-primary/40 data-[state=inactive]:hover:bg-primary/10 data-[state=inactive]:hover:shadow-[0_30px_65px_-40px_rgba(15,23,42,0.45)]",
            "data-[state=active]:border-primary/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_32px_70px_-38px_rgba(15,23,42,0.45)]"
          )}
        >
          <span>Oczekujące</span>
          {pendingCount > 0 && (
            <Badge variant="outline" className="ml-1 rounded-full">
              {pendingCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="approved"
          className={cn(
              "group inline-flex min-w-[clamp(8rem,12vw,9.5rem)] items-center justify-between gap-[clamp(0.45rem,0.7vw,0.6rem)] rounded-full border px-[clamp(1.1rem,1.7vw,1.4rem)] py-[clamp(0.45rem,0.7vw,0.6rem)] text-[clamp(0.82rem,0.4vw+0.72rem,0.95rem)] font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
            "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
          )}
        >
          <span>Zatwierdzone</span>
          {approvedCount > 0 && (
            <Badge variant="outline" className="ml-1 rounded-full">
              {approvedCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="flex flex-col fluid-stack-sm">
        {pendingCount === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Brak wniosków oczekujących na weryfikację.
          </div>
        ) : (
          <TransactionsTable
            transactions={pendingTransactions}
            handleAction={handleAction}
            handleDelete={handleDelete}
            setDeleteDialog={setDeleteDialog}
            deleteDialog={deleteDialog}
            isPending={isPending}
            currentActionId={currentActionId}
          />
        )}
      </TabsContent>

      <TabsContent value="approved" className="flex flex-col fluid-stack-sm">
        {approvedCount === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Brak zatwierdzonych wniosków.
          </div>
        ) : (
          <TransactionsTable
            transactions={approvedTransactions}
            handleAction={handleAction}
            handleDelete={handleDelete}
            setDeleteDialog={setDeleteDialog}
            deleteDialog={deleteDialog}
            isPending={isPending}
            currentActionId={currentActionId}
          />
        )}
      </TabsContent>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Dialog open={Boolean(deleteDialog)} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń transakcję cashback</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć tę transakcję cashback? Można usunąć tylko transakcje w statusie PENDING lub REJECTED. Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} disabled={isPending}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              disabled={isPending}
            >
              {isPending ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}

function TransactionsTable({
  transactions,
  handleAction,
  handleDelete: _handleDelete,
  setDeleteDialog: _setDeleteDialog,
  deleteDialog: _deleteDialog,
  isPending,
  currentActionId,
}: {
  transactions: RedeemQueueItem[];
  handleAction: (id: string, payload: { status: TransactionStatus }) => void;
  handleDelete: (id: string) => void;
  setDeleteDialog: React.Dispatch<React.SetStateAction<string | null>>;
  deleteDialog: string | null;
  isPending: boolean;
  currentActionId: string | null;
}) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap hidden md:table-cell">Utworzono</TableHead>
              <TableHead className="min-w-[150px]">Firma</TableHead>
              <TableHead className="min-w-[150px]">Użytkownik</TableHead>
              <TableHead className="text-right whitespace-nowrap">Punkty</TableHead>
              <TableHead className="whitespace-nowrap hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Notatka</TableHead>
              <TableHead className="text-right whitespace-nowrap min-w-[200px]">Akcje</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground hidden md:table-cell">
                {formatDate(transaction.createdAt)}
                {transaction.approvedAt ? (
                  <div className="text-xs">zatw. {formatDate(transaction.approvedAt)}</div>
                ) : null}
              </TableCell>
              <TableCell>
                {transaction.company ? (
                  <div className="flex flex-col min-w-[150px]">
                    <span className="font-medium text-foreground truncate">
                      {transaction.company.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      /{transaction.company.slug}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Firma usunięta</span>
                )}
              </TableCell>
              <TableCell>
                {transaction.user ? (
                  <div className="flex flex-col gap-1 min-w-[150px]">
                    <span className="font-medium text-foreground truncate">
                      {transaction.user.displayName ??
                        transaction.user.email ??
                        transaction.user.clerkId}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      ID: {transaction.user.clerkId}
                    </span>
                    {transaction.user.email ? (
                      <span className="text-xs text-muted-foreground truncate">
                        {transaction.user.email}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Brak użytkownika</span>
                )}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {transaction.points} pkt
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell whitespace-nowrap">
                <Badge className={STATUS_STYLES[transaction.status]}>
                  {STATUS_LABELS[transaction.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                <span className="truncate block max-w-[200px]">{transaction.notes ?? "—"}</span>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1 sm:gap-2 flex-wrap">
                  <Button
                    disabled={
                      isPending || currentActionId === transaction.id || transaction.status !== "PENDING"
                    }
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleAction(transaction.id, { status: "APPROVED" })
                    }
                    className="text-xs sm:text-sm"
                  >
                    Zatwierdź
                  </Button>
                  <Button
                    disabled={isPending || currentActionId === transaction.id}
                    size="sm"
                    variant="default"
                    onClick={() =>
                      handleAction(transaction.id, { status: "REDEEMED" })
                    }
                    className="text-xs sm:text-sm"
                  >
                    Zrealizuj
                  </Button>
                  <Button
                    disabled={isPending || currentActionId === transaction.id}
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      handleAction(transaction.id, { status: "REJECTED" })
                    }
                    className="text-xs sm:text-sm"
                  >
                    Odrzuć
                  </Button>
                  {(transaction.status === "PENDING" || transaction.status === "REJECTED") && (
                    <Button
                      disabled={isPending || currentActionId === transaction.id}
                      size="sm"
                      variant="destructive"
                      onClick={() => _setDeleteDialog(transaction.id)}
                      className="text-xs sm:text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}

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
