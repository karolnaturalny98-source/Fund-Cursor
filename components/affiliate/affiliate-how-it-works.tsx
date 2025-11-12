"use client";

import { CheckCircle2, FileText, Sparkles, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { useFadeIn, useStaggerAnimation, useScrollAnimation } from "@/lib/animations";

const steps = [
  {
    title: "Złóż aplikację",
    description:
      "Wypełnij formularz zgłoszeniowy, podając informacje o swojej platformie, liczbie obserwujących i doświadczeniu w promocji usług finansowych.",
    icon: FileText,
  },
  {
    title: "Przejdź weryfikację",
    description:
      "Nasz zespół przejrzy Twoje zgłoszenie i skontaktuje się z Tobą w ciągu kilku dni roboczych. Weryfikujemy autentyczność profilu i dopasowanie do programu.",
    icon: CheckCircle2,
  },
  {
    title: "Otrzymaj zatwierdzenie",
    description:
      "Po pozytywnej weryfikacji otrzymujesz dostęp do panelu affilacyjnego, dedykowany kod polecający i materiały marketingowe.",
    icon: Sparkles,
  },
  {
    title: "Zarabiaj prowizje",
    description:
      "Promuj FundedRank i partnerujące firmy używając swojego kodu. Z każdą transakcją wykonaną przez Twoich użytkowników otrzymujesz część prowizji.",
    icon: TrendingUp,
  },
];

export function AffiliateHowItWorks() {
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });
  const cardsAnim = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(steps.length, 100);
  const visibleStaggerItems = cardsAnim.isVisible ? staggerItems : new Array(steps.length).fill(false);

  return (
    <section className="container space-y-6 py-12">
      <div ref={sectionAnim.ref} className={`rounded-3xl border border-border/60 bg-card/72 backdrop-blur-[36px]! p-8 shadow-xs ${sectionAnim.className}`}>
        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            Jak to działa
          </p>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Proces rejestracji w 4 krokach
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Dołączanie do programu affilacyjnego jest proste i szybkie. 
            Wystarczy wypełnić formularz i poczekać na weryfikację.
          </p>
        </div>
        <div ref={cardsAnim.ref} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`transition-all duration-700 ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
            className="transition-all delay-[var(--delay)]"
          >
          <Card 
            className="rounded-2xl border border-border/60 bg-card/72 backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
          >
            <CardContent className="flex h-full flex-col gap-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary transition-all hover:bg-primary/30">
                  <PremiumIcon icon={step.icon} variant="glow" size="lg" hoverGlow />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </CardContent>
          </Card>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

