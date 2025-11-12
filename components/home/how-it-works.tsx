"use client";

import { CheckCircle2, Sparkles, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";

const steps = [
  {
    title: "Wybierz sprawdzoną firmę",
    description:
      "Przeglądaj ranking, filtry i opinie społeczności. Każda firma ma aktualne zasady, plany i wskaźniki cashback.",
    icon: Sparkles,
  },
  {
    title: "Kup z kodem FundedRank",
    description:
      "Kod przypisany do firmy daje punkty cashback 1:1 do USD. Rejestrujemy transakcję i śledzimy status płatności.",
    icon: CheckCircle2,
  },
  {
    title: "Wymień punkty na nowe konto",
    description:
      "Z poziomu panelu składzasz wniosek. My opłacamy kolejne konto lub pakiet, wykorzystując zebrane punkty.",
    icon: Wallet,
  },
];

export function HowItWorksSection() {
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });
  const sectionVisible = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(steps.length, 150);
  const visibleStaggerItems = sectionVisible.isVisible ? staggerItems : new Array(steps.length).fill(false);

  return (
    <section ref={sectionVisible.ref} id="jak-to-dziala" className="container space-y-6 bg-muted/10 py-10 rounded-3xl">
      <div ref={sectionAnim.ref} className={`space-y-3 ${sectionAnim.className}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          Jak to działa
        </p>
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Cashback, który zamienisz na kolejne konto tradingowe
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          FundedRank łączy rankingi firm z przejrzystym systemem cashback.
          Punkty są równoważne dolarom, a proces wymiany trwa tyle, co złożenie
          prostego wniosku.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <Card
            key={step.title}
            className={`border border-border/60 transition-all hover:border-primary/50 hover:shadow-md ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 150}ms` } as React.CSSProperties}
            className="transition-all duration-700 delay-[var(--delay)]"
          >
            <CardContent className="flex h-full flex-col gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-primary transition-all hover:bg-white/15">
                <PremiumIcon icon={step.icon} variant="glow" size="lg" hoverGlow />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Krok {index + 1}
                </p>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
