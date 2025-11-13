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
    <section
      ref={sectionVisible.ref}
      id="jak-to-dziala"
      className="container space-y-[clamp(1.5rem,2.4vw,2.75rem)] rounded-3xl bg-muted/10 py-[clamp(2.5rem,3vw,3.5rem)]"
    >
      <div ref={sectionAnim.ref} className={`space-y-[clamp(0.85rem,1.4vw,1.35rem)] ${sectionAnim.className}`}>
        <p className="fluid-eyebrow text-primary">
          Jak to działa
        </p>
        <h2 className="fluid-h2 font-semibold text-foreground">
          Cashback, który zamienisz na kolejne konto tradingowe
        </h2>
        <p className="fluid-copy max-w-3xl text-muted-foreground">
          FundedRank łączy rankingi firm z przejrzystym systemem cashback.
          Punkty są równoważne dolarom, a proces wymiany trwa tyle, co złożenie
          prostego wniosku.
        </p>
      </div>
      <div className="grid gap-[clamp(1rem,1.6vw,1.75rem)] md:grid-cols-3">
        {steps.map((step, index) => (
          <Card
            key={step.title}
            className={`border border-border/60 transition-all duration-700 hover:border-primary/50 hover:shadow-md delay-[var(--delay)] ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 150}ms` } as React.CSSProperties}
          >
            <CardContent className="flex h-full flex-col gap-[clamp(1rem,1.4vw,1.5rem)] p-[clamp(1.25rem,2vw,1.75rem)]">
              <div className="flex h-[clamp(2.5rem,2.4vw+2rem,3.25rem)] w-[clamp(2.5rem,2.4vw+2rem,3.25rem)] items-center justify-center rounded-full bg-white/10 text-primary transition-all hover:bg-white/15">
                <PremiumIcon icon={step.icon} variant="glow" size="lg" hoverGlow />
              </div>
              <div className="space-y-[clamp(0.5rem,0.8vw,0.75rem)]">
                <p className="fluid-eyebrow text-muted-foreground">
                  Krok {index + 1}
                </p>
                <h3 className="text-[clamp(1.1rem,0.6vw+0.95rem,1.3rem)] font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="fluid-copy text-muted-foreground">{step.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
