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
  const _router = useRouter();
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
    <form onSubmit={handleSubmit} className="flex flex-col fluid-stack-lg">
      <div className="flex flex-col fluid-stack-md">
        <div className="rounded-2xl border border-primary/30 bg-linear-to-br from-primary/10 to-primary/5 fluid-card-pad-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium uppercase tracking-[0.2em] text-muted-foreground fluid-caption">Firma</div>
              <div className="mt-2 font-semibold text-foreground fluid-copy">{company.name}</div>
            </div>
            <div className="text-right">
              <div className="font-medium uppercase tracking-[0.2em] text-muted-foreground fluid-caption">Plan</div>
              <div className="mt-2 font-semibold text-foreground fluid-copy">{plan.name}</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border/60 bg-card/72 fluid-card-pad-sm shadow-xs">
              <div className="font-medium uppercase tracking-[0.2em] text-muted-foreground fluid-caption">Cena</div>
              <div className="mt-2 font-semibold text-foreground fluid-h2">
                ${price.toLocaleString("pl-PL")}
              </div>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-primary/10 fluid-card-pad-sm shadow-xs">
              <div className="font-medium uppercase tracking-[0.2em] text-muted-foreground fluid-caption">Cashback</div>
              <div className="mt-2 font-semibold text-primary fluid-h2">
                ${cashbackAmount.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        <SignedOut>
          <div className="flex flex-col fluid-stack-xs">
            <Label htmlFor="email" className="text-foreground fluid-copy">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              className="rounded-full fluid-input-icon"
            />
            <p className="text-muted-foreground fluid-caption">
              Jeśli utworzysz konto z tym emailem, zamówienie zostanie automatycznie powiązane.
            </p>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-col rounded-2xl border border-border/60 bg-card/72 fluid-card-pad-sm shadow-xs">
            <div className="font-medium text-muted-foreground fluid-caption">Zalogowany jako</div>
            <div className="mt-2 font-semibold text-foreground fluid-copy">
              {user?.emailAddresses[0]?.emailAddress}
            </div>
            <p className="mt-2 text-muted-foreground fluid-caption">
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

      <Button type="submit" variant="premium" className="w-full fluid-button" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 fluid-icon-md animate-spin" />
            Przetwarzanie...
          </>
        ) : (
          "Kup teraz"
        )}
      </Button>
    </form>
  );
}
