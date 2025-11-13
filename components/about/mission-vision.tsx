"use client";

import { Target, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumIcon } from "@/components/custom/premium-icon";
import { Section } from "@/components/layout/section";
import { useScrollAnimation, useStaggerAnimation } from "@/lib/animations";

export function MissionVision() {
  const sectionVisible = useScrollAnimation({ rootMargin: "-100px" });
  const staggerItems = useStaggerAnimation(2, 150);
  const visibleStaggerItems = sectionVisible.isVisible ? staggerItems : [false, false];

  const items = [
    {
      title: "Nasza misja",
      icon: Target,
      content: "Nasza misja to dostarczanie przejrzystych i niezależnych rankingów firm prop tradingowych, pomagając traderom podejmować świadome decyzje. Chcemy być mostem między traderami a najlepszymi firmami fundingowymi, oferując uczciwy system cashback jako dodatkową wartość.",
    },
    {
      title: "Nasza wizja",
      icon: Eye,
      content: "Wizja FundedRank to stworzenie największego i najbardziej zaufanego ekosystemu dla społeczności prop trading w Polsce i Europie. Dążymy do budowy platformy, która nie tylko ranujuje firmy, ale także edukuje, łączy społeczność i wspiera traderów w ich drodze do sukcesu.",
    },
  ];

  return (
    <Section ref={sectionVisible.ref} size="lg">
      <div className="grid fluid-stack-lg lg:grid-cols-2">
        {items.map((item, index) => (
          <Card
            key={item.title}
            className={`border border-border/60 bg-card/72 backdrop-blur-[36px]! transition-all duration-700 hover:border-primary/50 hover:shadow-md delay-[var(--delay)] ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ "--delay": `${index * 150}ms` } as React.CSSProperties}
          >
            <CardHeader className="flex flex-col fluid-stack-sm">
              <div className="flex h-[clamp(2.5rem,1.5vw+2rem,3rem)] w-[clamp(2.5rem,1.5vw+2rem,3rem)] items-center justify-center rounded-full bg-primary/20 text-primary">
                <PremiumIcon icon={item.icon} variant="glow" size="lg" hoverGlow />
              </div>
              <CardTitle className="fluid-h2 font-semibold text-foreground">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col fluid-stack-sm">
              <p className="fluid-copy text-muted-foreground leading-relaxed">
                {item.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

