"use client";

import { CheckCircle2, FileText, Sparkles, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Section } from "@/components/layout/section";
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
    <Section size="lg" className="flex flex-col fluid-stack-xl">
      <div
        ref={sectionAnim.ref}
        className={`rounded-3xl border border-border/60 bg-card/72 p-[clamp(1.75rem,2.5vw,2.2rem)] shadow-xs backdrop-blur-[36px]! ${sectionAnim.className}`}
      >
        <div className="mb-[clamp(1.25rem,1.8vw,1.6rem)] flex flex-col fluid-stack-sm">
          <p className="font-semibold uppercase tracking-[0.28em] text-primary fluid-eyebrow">
            Jak to działa
          </p>
          <h2 className="font-semibold text-foreground fluid-h2">
            Proces rejestracji w 4 krokach
          </h2>
          <p className="max-w-3xl text-muted-foreground fluid-copy">
            Dołączanie do programu affilacyjnego jest proste i szybkie. 
            Wystarczy wypełnić formularz i poczekać na weryfikację.
          </p>
        </div>
        <div ref={cardsAnim.ref} className="grid gap-[clamp(1rem,1.5vw,1.35rem)] md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`transition-all duration-700 delay-[var(--delay)] ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
          >
          <Card 
            className="rounded-2xl border border-border/60 bg-card/72 p-[clamp(1.1rem,1.5vw,1.3rem)] shadow-xs transition-all hover:border-primary/50 hover:shadow-md backdrop-blur-[36px]!"
          >
            <CardContent className="flex h-full flex-col gap-[clamp(0.85rem,1.2vw,1rem)] p-0">
              <div className="flex items-center gap-[clamp(0.75rem,1.1vw,1rem)]">
                <div className="flex h-[clamp(2.75rem,3vw,3rem)] w-[clamp(2.75rem,3vw,3rem)] items-center justify-center rounded-full bg-primary/20 text-primary transition-all hover:bg-primary/30">
                  <PremiumIcon icon={step.icon} variant="glow" size="lg" hoverGlow />
                </div>
                <div className="flex h-[clamp(2rem,2.4vw,2.2rem)] w-[clamp(2rem,2.4vw,2.2rem)] items-center justify-center rounded-full bg-primary/10 text-primary">
                  {index + 1}
                </div>
              </div>
              <div className="flex flex-col fluid-stack-xs">
                <h3 className="font-semibold text-foreground fluid-copy">{step.title}</h3>
                <p className="text-muted-foreground fluid-caption">{step.description}</p>
              </div>
            </CardContent>
          </Card>
          </div>
        ))}
      </div>
      </div>
    </Section>
  );
}

