"use client";

import { Sparkles, Users, Shield, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { PremiumBadge } from "@/components/custom/premium-badge";
import { Section } from "@/components/layout/section";
import { useFadeIn, useScrollAnimation, useStaggerAnimation } from "@/lib/animations";
import { cn } from "@/lib/utils";

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
    <Section
      ref={sectionVisible.ref}
      size="lg"
      className="flex flex-col fluid-stack-xl"
    >
      <div
        ref={sectionAnim.ref}
        className={cn("flex flex-col fluid-stack-sm", sectionAnim.className)}
      >
        <PremiumBadge variant="glow" className="fluid-badge rounded-full font-semibold">
          Nasze wartości
        </PremiumBadge>
        <h2 className="fluid-h2 font-semibold text-foreground">
          Na czym nam zależy
        </h2>
        <p className="max-w-3xl fluid-copy text-muted-foreground">
          Wartości, które kierują naszymi działaniami i definiują to, kim jesteśmy 
          jako platforma dla społeczności prop traderów.
        </p>
      </div>

      <div className="grid fluid-stack-lg md:grid-cols-2 lg:grid-cols-4">
        {values.map((value, index) => (
          <Card
            key={value.title}
            className={`border border-border/60 bg-card/72 backdrop-blur-[36px]! transition-all duration-700 hover:border-primary/50 hover:shadow-md delay-[var(--delay)] ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}
          >
            <CardContent className="flex h-full flex-col fluid-stack-md p-[clamp(1.25rem,1.5vw,1.5rem)]">
              <div className="flex h-[clamp(2.5rem,1.5vw+2rem,3rem)] w-[clamp(2.5rem,1.5vw+2rem,3rem)] items-center justify-center rounded-full bg-primary/20 text-primary transition-all hover:bg-primary/30">
                <PremiumIcon icon={value.icon} variant="glow" size="lg" hoverGlow />
              </div>
              <div className="flex flex-col fluid-stack-xs">
                <h3 className="fluid-copy font-semibold text-foreground">{value.title}</h3>
                <p className="fluid-caption text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

