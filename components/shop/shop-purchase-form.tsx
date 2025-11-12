"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import type { CompanyWithPlans } from "@/lib/queries/companies";
import type { CompanyPlan } from "@/lib/types";

interface ShopPurchaseFormProps {
  company: CompanyWithPlans;
  plan: CompanyPlan;
  userId: string | null;
}

export function ShopPurchaseForm({
  company,
  plan,
  userId,
}: ShopPurchaseFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [email, setEmail] = useState(user?.emailAddresses[0]?.emailAddress ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const finalEmail = userId ? user?.emailAddresses[0]?.emailAddress ?? email : email;

      if (!finalEmail || !finalEmail.includes("@")) {
        setError("Proszę podać prawidłowy adres email");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId: company.id,
          planId: plan.id,
          email: finalEmail,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Nie udało się utworzyć zamówienia");
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      
      // Otwórz affiliateUrl w nowej karcie, popup pozostanie na aktualnej
      if (data.affiliateUrl) {
        // Zapisz transactionId w sessionStorage, żeby popup się wyświetlił po powrocie
        sessionStorage.setItem('pendingShopTransaction', data.transactionId);
        
        // Dodaj parametr transaction do URL aktualnej strony (dla bezpośredniego dostępu)
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("transaction", data.transactionId);
        window.history.replaceState({}, "", currentUrl.toString());
        
        // Otwórz link partnera w nowej karcie
        window.open(data.affiliateUrl, '_blank', 'noopener,noreferrer');
        // Reset formularza po udanym zakupie
        setIsSubmitting(false);
      } else {
        setError("Zamówienie zostało utworzone, ale brak linku afiliacyjnego");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError("Wystąpił błąd podczas przetwarzania zamówienia");
      setIsSubmitting(false);
    }
  };

  const price = Number(plan.price);
  const cashbackRate = company.cashbackRate ?? 0;
  const cashbackAmount = Math.round((price * cashbackRate) / 100);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-xl border border-primary/30 bg-linear-to-br from-primary/10 to-primary/5 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Firma</div>
              <div className="mt-1 text-lg font-semibold">{company.name}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Plan</div>
              <div className="mt-1 text-lg font-semibold">{plan.name}</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/60 bg-card/72 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cena</div>
              <div className="mt-1 text-xl font-bold">${price.toLocaleString("pl-PL")}</div>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cashback</div>
              <div className="mt-1 text-xl font-bold text-primary">
                ${cashbackAmount.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        <SignedOut>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Jeśli utworzysz konto z tym emailem, zamówienie zostanie automatycznie powiązane.
            </p>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="rounded-xl border border-border/60 bg-card/72 p-4">
            <div className="text-sm font-medium text-muted-foreground">Zalogowany jako</div>
            <div className="mt-1 text-lg font-semibold">
              {user?.emailAddresses[0]?.emailAddress}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Zamówienie zostanie automatycznie powiązane z Twoim kontem.
            </p>
          </div>
        </SignedIn>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        variant="premium"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Przetwarzanie...
          </>
        ) : (
          "Kup teraz"
        )}
      </Button>
    </form>
  );
}
