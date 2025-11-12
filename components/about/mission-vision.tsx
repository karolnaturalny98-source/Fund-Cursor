"use client";

import { Target, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumIcon } from "@/components/custom/premium-icon";
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
    <section ref={sectionVisible.ref} className="container py-12">
      <div className="grid gap-6 lg:grid-cols-2">
        {items.map((item, index) => (
          <Card
            key={item.title}
            className={`border border-border/60 !bg-[rgba(10,12,15,0.72)] !backdrop-blur-[36px] transition-all hover:border-primary/50 hover:shadow-md ${
              visibleStaggerItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ transitionDelay: `${index * 150}ms`, transitionDuration: "700ms" }}
          >
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary mb-4">
                <PremiumIcon icon={item.icon} variant="glow" size="lg" hoverGlow />
              </div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

