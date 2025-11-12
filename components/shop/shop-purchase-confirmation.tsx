"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

export function ShopPurchaseConfirmation() {
  const searchParams = useSearchParams();
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<boolean | null>(null);

  useEffect(() => {
    // Sprawdź czy jest parametr transaction w URL lub sessionStorage
    const urlTransactionId = searchParams.get("transaction");
    const sessionTransactionId = sessionStorage.getItem('pendingShopTransaction');
    const finalTransactionId = urlTransactionId || sessionTransactionId;
    
    // Jeśli znaleziono transactionId i nie było już potwierdzenia
    if (finalTransactionId && !localStorage.getItem(`shop-confirmed-${finalTransactionId}`)) {
      setTransactionId(finalTransactionId);
      setOpen(true);
      // Usuń z sessionStorage po sprawdzeniu
      if (sessionTransactionId) {
        sessionStorage.removeItem('pendingShopTransaction');
      }
    }
  }, [searchParams]);

  const handleConfirm = async (userConfirmed: boolean) => {
    if (!transactionId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/shop/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          userConfirmed,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Nie udało się zapisać potwierdzenia");
      }

      // Zapisz w localStorage, żeby nie pokazywać ponownie
      localStorage.setItem(`shop-confirmed-${transactionId}`, "true");
      setConfirmed(userConfirmed);
      
      // Zamknij dialog po 2 sekundach
      setTimeout(() => {
        setOpen(false);
        // Usuń parametr z URL
        const url = new URL(window.location.href);
        url.searchParams.delete("transaction");
        window.history.replaceState({}, "", url.toString());
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!transactionId || !open) return null;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && setOpen(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Potwierdzenie zakupu</DialogTitle>
          <DialogDescription>
            Czy dokonałeś zakupu na stronie partnera?
          </DialogDescription>
        </DialogHeader>

        {confirmed !== null ? (
          <div className="space-y-4">
            <Alert variant={confirmed ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {confirmed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {confirmed
                    ? "Dziękujemy za potwierdzenie! Twoja transakcja została zarejestrowana."
                    : "Dziękujemy za informację. Transakcja została zarejestrowana jako niepotwierdzona."}
                </AlertDescription>
              </div>
            </Alert>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Abyśmy mogli przyznać Ci cashback, potwierdź czy dokonałeś zakupu na stronie partnera.
              </p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => handleConfirm(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Nie
              </Button>
              <Button
                onClick={() => handleConfirm(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Zapisywanie..." : "Tak, dokonałem zakupu"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

