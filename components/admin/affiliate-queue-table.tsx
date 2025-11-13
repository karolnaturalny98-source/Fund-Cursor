"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type {
  AffiliateQueueItem,
  AffiliateVerificationItem,
} from "@/lib/queries/affiliates";
import type { ManualCashbackQueueItem } from "@/lib/queries/transactions";

interface AffiliateQueueTableProps {
  items: AffiliateQueueItem[];
  verificationItems?: AffiliateVerificationItem[];
  manualPendingItems?: ManualCashbackQueueItem[];
}

export function AffiliateQueueTable({
  items,
  verificationItems = [],
  manualPendingItems = [],
}: AffiliateQueueTableProps) {
  const router = useRouter();
  const [draftPoints, setDraftPoints] = useState<Record<string, string>>({});
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [currentActionId, setCurrentActionId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDraftPoints(
      items.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = acc[item.id] ?? item.points.toString();
        return acc;
      }, {}),
    );
  }, [items]);

  const pendingCount = useMemo(() => items.length, [items]);

  const handleApprove = (id: string) => {
    setActionMessage(null);
    setActionError(null);

    const parsed = Number.parseInt(draftPoints[id] ?? "", 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setActionError("Punkty muszą być dodatnią liczbą całkowitą.");
      return;
    }

    startTransition(async () => {
      setCurrentActionId(id);
      try {
        const response = await fetch(`/api/admin/affiliates/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "APPROVE",
            points: parsed,
            notes: draftNotes[id]?.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message =
            typeof body?.error === "string"
              ? body.error
              : "Nie udało się zatwierdzić transakcji.";
          setActionError(message);
          return;
        }

        setActionMessage("Transakcja zatwierdzona. Odśwież dane, aby zobaczyć aktualny stan.");
      } catch (error) {
        console.error(error);
        setActionError("Nie udało się skontaktować z serwerem.");
      } finally {
        setCurrentActionId(null);
      }
    });
  };

  const handleReject = (id: string) => {
    setActionMessage(null);
    setActionError(null);

    startTransition(async () => {
      setCurrentActionId(id);
      try {
        const response = await fetch(`/api/admin/affiliates/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "REJECT",
            notes: draftNotes[id]?.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message =
            typeof body?.error === "string"
              ? body.error
              : "Nie udało się odrzucić transakcji.";
          setActionError(message);
          return;
        }

        setActionMessage("Transakcja została oznaczona jako odrzucona.");
      } catch (error) {
        console.error(error);
        setActionError("Nie udało się skontaktować z serwerem.");
      } finally {
        setCurrentActionId(null);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteDialog) return;

    startTransition(async () => {
      setCurrentActionId(deleteDialog);
      try {
        const response = await fetch(`/api/admin/affiliates/${deleteDialog}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setActionError(data?.error ?? "Nie udało się usunąć transakcji afiliacyjnej.");
          setCurrentActionId(null);
          return;
        }

        setDeleteDialog(null);
        router.refresh();
      } catch (err) {
        console.error(err);
        setActionError("Wystąpił błąd podczas usuwania transakcji.");
      } finally {
        setCurrentActionId(null);
      }
    });
  };

  const handleApproveCashback = (cashbackTransactionId: string) => {
    setActionMessage(null);
    setActionError(null);

    startTransition(async () => {
      setCurrentActionId(cashbackTransactionId);
      try {
        const response = await fetch(`/api/admin/cashback/${cashbackTransactionId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "APPROVED",
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message =
            typeof body?.error === "string"
              ? body.error
              : "Nie udało się zatwierdzić transakcji cashback.";
          setActionError(message);
          return;
        }

        setActionMessage("Transakcja cashback została zatwierdzona.");
        router.refresh();
      } catch (error) {
        console.error(error);
        setActionError("Nie udało się skontaktować z serwerem.");
      } finally {
        setCurrentActionId(null);
      }
    });
  };

  const handleRejectCashback = (cashbackTransactionId: string) => {
    setActionMessage(null);
    setActionError(null);

    startTransition(async () => {
      setCurrentActionId(cashbackTransactionId);
      try {
        const response = await fetch(`/api/admin/cashback/${cashbackTransactionId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "REJECTED",
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message =
            typeof body?.error === "string"
              ? body.error
              : "Nie udało się odrzucić transakcji cashback.";
          setActionError(message);
          return;
        }

        setActionMessage("Transakcja cashback została odrzucona.");
        router.refresh();
      } catch (error) {
        console.error(error);
        setActionError("Nie udało się skontaktować z serwerem.");
      } finally {
        setCurrentActionId(null);
      }
    });
  };

  const handleDeleteCashback = () => {
    if (!deleteDialog) return;

    startTransition(async () => {
      setCurrentActionId(deleteDialog);
      try {
        const response = await fetch(`/api/admin/cashback/${deleteDialog}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setActionError(data?.error ?? "Nie udało się usunąć transakcji cashback.");
          setCurrentActionId(null);
          return;
        }

        setDeleteDialog(null);
        router.refresh();
      } catch (err) {
        console.error(err);
        setActionError("Wystąpił błąd podczas usuwania transakcji.");
      } finally {
        setCurrentActionId(null);
      }
    });
  };

  const verificationCount = verificationItems.length;
  const manualPendingCount = manualPendingItems.length;

  if (pendingCount === 0 && verificationCount === 0 && manualPendingCount === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Brak transakcji oczekujących na weryfikację.
      </div>
    );
  }

  return (
    <Tabs defaultValue="pending" className="space-y-4">
      <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
        <TabsTrigger
          value="pending"
          className={cn(
            "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
            "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
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
          value="verification"
          className={cn(
            "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
            "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
          )}
        >
          <span>Do weryfikacji</span>
          {verificationCount > 0 && (
            <Badge variant="outline" className="ml-1 rounded-full">
              {verificationCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="manual"
          className={cn(
            "group inline-flex min-w-[130px] items-center justify-between gap-3 rounded-full border px-5 py-2 text-sm font-semibold transition-all",
              "border-transparent bg-muted/30 text-muted-foreground",
              "data-[state=inactive]:hover:border-gradient data-[state=inactive]:hover:bg-gradient-card data-[state=inactive]:hover:shadow-premium",
            "data-[state=active]:border-gradient-premium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-premium"
          )}
        >
          <span>Ręczne przyznania</span>
          {manualPendingCount > 0 && (
            <Badge variant="outline" className="ml-1 rounded-full">
              {manualPendingCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="space-y-4">
        {pendingCount === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Brak transakcji oczekujących na weryfikację.
          </div>
        ) : (
          <PendingTransactionsTable
            items={items}
            draftPoints={draftPoints}
            setDraftPoints={setDraftPoints}
            draftNotes={draftNotes}
            setDraftNotes={setDraftNotes}
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleDelete={handleDelete}
            setDeleteDialog={setDeleteDialog}
            deleteDialog={deleteDialog}
            isPending={isPending}
            currentActionId={currentActionId}
          />
        )}
      </TabsContent>

      <TabsContent value="verification" className="space-y-4">
        {verificationCount === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Brak transakcji wymagających weryfikacji.
          </div>
        ) : (
          <VerificationTransactionsTable
            items={verificationItems}
            handleApproveCashback={handleApproveCashback}
            isPending={isPending}
            currentActionId={currentActionId}
          />
        )}
      </TabsContent>

      <TabsContent value="manual" className="space-y-4">
        {manualPendingCount === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Brak ręcznych przyznań oczekujących na weryfikację.
          </div>
        ) : (
          <ManualCashbackTable
            items={manualPendingItems}
            handleApprove={handleApproveCashback}
            handleReject={handleRejectCashback}
            handleDelete={handleDeleteCashback}
            setDeleteDialog={setDeleteDialog}
            deleteDialog={deleteDialog}
            isPending={isPending}
            currentActionId={currentActionId}
          />
        )}
      </TabsContent>

      {actionError ? (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      ) : null}
      {actionMessage ? (
        <Alert className="border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <AlertDescription>{actionMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Dialog open={Boolean(deleteDialog)} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń transakcję</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć tę transakcję? Można usunąć tylko transakcje w statusie PENDING lub REJECTED. Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} disabled={isPending}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDeleteCashback} disabled={isPending}>
              {isPending ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}

function PendingTransactionsTable({
  items,
  draftPoints,
  setDraftPoints,
  draftNotes,
  setDraftNotes,
  handleApprove,
  handleReject,
  handleDelete: _handleDelete,
  setDeleteDialog: _setDeleteDialog,
  deleteDialog: _deleteDialog,
  isPending,
  currentActionId,
}: {
  items: AffiliateQueueItem[];
  draftPoints: Record<string, string>;
  setDraftPoints: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  draftNotes: Record<string, string>;
  setDraftNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  handleDelete: () => void;
  setDeleteDialog: React.Dispatch<React.SetStateAction<string | null>>;
  deleteDialog: string | null;
  isPending: boolean;
  currentActionId: string | null;
}) {
  const [sourceFilter, setSourceFilter] = useState<"all" | "SHOP" | "import">("all");
  const [userConfirmedFilter, setUserConfirmedFilter] = useState<"all" | "yes" | "no" | "null">("all");

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filtr po źródle
    if (sourceFilter === "SHOP") {
      filtered = filtered.filter((item) => item.source === "SHOP");
    } else if (sourceFilter === "import") {
      filtered = filtered.filter((item) => item.source !== "SHOP");
    }

    // Filtr po potwierdzeniu klienta
    if (userConfirmedFilter === "yes") {
      filtered = filtered.filter((item) => item.userConfirmed === true);
    } else if (userConfirmedFilter === "no") {
      filtered = filtered.filter((item) => item.userConfirmed === false);
    } else if (userConfirmedFilter === "null") {
      filtered = filtered.filter((item) => item.userConfirmed === null);
    }

    return filtered;
  }, [items, sourceFilter, userConfirmedFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Label htmlFor="sourceFilter">Filtr źródła:</Label>
        <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as typeof sourceFilter)}>
          <SelectTrigger id="sourceFilter" className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="SHOP">Sklep</SelectItem>
            <SelectItem value="import">Import</SelectItem>
          </SelectContent>
        </Select>

        <Label htmlFor="userConfirmedFilter">Filtr potwierdzenia:</Label>
        <Select value={userConfirmedFilter} onValueChange={(value) => setUserConfirmedFilter(value as typeof userConfirmedFilter)}>
          <SelectTrigger id="userConfirmedFilter" className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="yes">Potwierdzone</SelectItem>
            <SelectItem value="no">Niepotwierdzone</SelectItem>
            <SelectItem value="null">Brak odpowiedzi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Firma</TableHead>
              <TableHead>Platforma</TableHead>
              <TableHead>Źródło</TableHead>
              <TableHead>External ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Potw. klienta</TableHead>
              <TableHead>Punkty</TableHead>
              <TableHead>Notatka</TableHead>
              <TableHead>Zakup</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  Brak transakcji spełniających kryteria filtrowania.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {item.company.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /{item.company.slug}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.platform ? (
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.platform}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.source === "SHOP" ? (
                        <Badge variant="default" className="bg-primary/10 text-primary">
                          Sklep
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Import</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {item.externalId}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.userEmail ? (
                        <span className="text-xs text-muted-foreground">
                          {item.userEmail}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          brak adresu
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.userConfirmed === null ? (
                        <Badge variant="outline">Brak</Badge>
                      ) : item.userConfirmed ? (
                        <Badge variant="default">Tak</Badge>
                      ) : (
                        <Badge variant="outline">Nie</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        inputMode="numeric"
                        className="h-9 w-24"
                        value={draftPoints[item.id] ?? ""}
                        onChange={(event) =>
                          setDraftPoints((prev) => ({
                            ...prev,
                            [item.id]: event.target.value,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        className="h-16 w-full resize-none"
                        value={draftNotes[item.id] ?? ""}
                        placeholder="Notatka (opcjonalnie)"
                        onChange={(event) =>
                          setDraftNotes((prev) => ({
                            ...prev,
                            [item.id]: event.target.value,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.purchaseAt ? formatDate(item.purchaseAt) : "brak daty"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending && currentActionId === item.id}
                          onClick={() => handleReject(item.id)}
                        >
                          Odrzuć
                        </Button>
                        <Button
                          size="sm"
                          disabled={isPending && currentActionId === item.id}
                          onClick={() => handleApprove(item.id)}
                        >
                          Zatwierdź
                        </Button>
                        {(item.status === "PENDING" || item.status === "REJECTED") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isPending && currentActionId === item.id}
                            onClick={() => _setDeleteDialog(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function VerificationTransactionsTable({
  items,
  handleApproveCashback,
  isPending,
  currentActionId,
}: {
  items: AffiliateVerificationItem[];
  handleApproveCashback: (id: string) => void;
  isPending: boolean;
  currentActionId: string | null;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
            Zatwierdzone
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            Oczekujące
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
            Odrzucone
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Firma</TableHead>
            <TableHead>Platforma</TableHead>
            <TableHead>External ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Punkty</TableHead>
            <TableHead>Status Cashback</TableHead>
            <TableHead>Weryfikacja</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {item.company.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    /{item.company.slug}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {item.platform ? (
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.platform}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-muted-foreground">
                  {item.externalId}
                </span>
              </TableCell>
              <TableCell>
                {item.userEmail ? (
                  <span className="text-xs text-muted-foreground">
                    {item.userEmail}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    brak adresu
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span className="font-medium">{item.points}</span>
                {item.cashbackTransaction && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({item.cashbackTransaction.points} pkt)
                  </span>
                )}
              </TableCell>
              <TableCell>
                {item.cashbackTransaction
                  ? getStatusBadge(item.cashbackTransaction.status)
                  : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {item.verifiedAt
                  ? formatDate(item.verifiedAt)
                  : "brak daty"}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {item.cashbackTransaction &&
                    item.cashbackTransaction.status === "PENDING" && (
                      <Button
                        size="sm"
                        disabled={
                          isPending &&
                          currentActionId === item.cashbackTransaction.id
                        }
                        onClick={() =>
                          handleApproveCashback(item.cashbackTransaction!.id)
                        }
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Zatwierdź
                      </Button>
                    )}
                  {item.cashbackTransaction &&
                    item.cashbackTransaction.status === "APPROVED" && (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        Zatwierdzone
                      </Badge>
                    )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ManualCashbackTable({
  items,
  handleApprove,
  handleReject,
  handleDelete: _handleDelete,
  setDeleteDialog: _setDeleteDialog,
  deleteDialog: _deleteDialog,
  isPending,
  currentActionId,
}: {
  items: ManualCashbackQueueItem[];
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  handleDelete: () => void;
  setDeleteDialog: React.Dispatch<React.SetStateAction<string | null>>;
  deleteDialog: string | null;
  isPending: boolean;
  currentActionId: string | null;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Firma</TableHead>
            <TableHead>Email użytkownika</TableHead>
            <TableHead>Punkty</TableHead>
            <TableHead>Notatka</TableHead>
            <TableHead>Data utworzenia</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.company ? (
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {item.company.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      /{item.company.slug}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {item.user?.email ? (
                  <span className="text-xs text-muted-foreground">
                    {item.user.email}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    brak adresu
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span className="font-medium">{item.points}</span>
              </TableCell>
              <TableCell>
                {item.notes ? (
                  <span className="text-xs text-muted-foreground">
                    {item.notes}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(item.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending && currentActionId === item.id}
                    onClick={() => handleReject(item.id)}
                  >
                    Odrzuć
                  </Button>
                  <Button
                    size="sm"
                    disabled={isPending && currentActionId === item.id}
                    onClick={() => handleApprove(item.id)}
                  >
                    Zatwierdź
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isPending && currentActionId === item.id}
                    onClick={() => _setDeleteDialog(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatDate(value: Date | string) {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return typeof value === "string" ? value : value.toISOString();
  }
}
