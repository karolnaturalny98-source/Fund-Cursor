"use client";

import { Sparkles, Users, Shield, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { useFadeIn, useScrollAnimation, useStaggerAnimation } from "@/lib/animations";

const values = [
  {
    title: "Przejrzystość",
    description: "Dostarczamy uczciwe i niezależne rankingi oparte na rzeczywistych danych i weryfikowanych opiniach społeczności.",
    icon: Sparkles,
  },
  {
    title: "Społeczność",
    description: "Budujemy przestrzeń, gdzie traderzy dzielą się doświadczeniami, wspierają się nawzajem i razem rozwijają.",
    icon: Users,
  },
  {
    title: "Zaufanie",
    description: "Każda opinia jest weryfikowana, każda firma sprawdzona. Twoje bezpieczeństwo i zaufanie są dla nas priorytetem.",
    icon: Shield,
  },
  {
    title: "Innowacja",
    description: "Rozwijamy nowoczesne narzędzia dla traderów prop - od rankingów po cashback i systemy analityczne.",
    icon: Heart,
  },
];

export function CompanyValues() {
  const sectionAnim = useFadeIn({ rootMargin: "-100px" });
  const sectionVisible = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(values.length, 100);
  const visibleStaggerItems = sectionVisible.isVisible ? staggerItems : new Array(values.length).fill(false);

  return (
    <section ref={sectionVisible.ref} className="container space-y-8 py-12">
      <div ref={sectionAnim.ref} className={`space-y-3 ${sectionAnim.className}`}>
        <PremiumBadge variant="glow" className="rounded-full px-4 py-1 text-xs font-semibold">
          Nasze wartości
        </PremiumBadge>
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Na czym nam zależy
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Wartości, które kierują naszymi działaniami i definiują to, kim jesteśmy 
          jako platforma dla społeczności prop traderów.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {values.map((value, index) => (
          <Card
            key={value.title}
            className={`border border-border/60 bg-card/72 backdrop-blur-[36px]! transition-all hover:border-primary/50 hover:shadow-md ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
            className="transition-all duration-700 delay-[var(--delay)]"
          >
            <CardContent className="flex h-full flex-col gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary transition-all hover:bg-primary/30">
                <PremiumIcon icon={value.icon} variant="glow" size="lg" hoverGlow />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

