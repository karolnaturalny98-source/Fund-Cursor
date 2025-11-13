import type { Metadata } from "next";
import { AuroraWrapper } from "@/components/aurora-wrapper";
import { AboutHero } from "@/components/about/about-hero";
import { MissionVision } from "@/components/about/mission-vision";
import { CompanyValues } from "@/components/about/company-values";
import { TeamSection } from "@/components/about/team-section";
import { AboutCta } from "@/components/about/about-cta";

export const metadata: Metadata = {
  title: "O nas | FundedRank",
  description:
    "Poznaj zespół FundedRank i naszą misję tworzenia najlepszego ekosystemu dla społeczności prop traderów w Polsce i Europie.",
};

export default function AboutPage() {
  return (
    <div className="relative">
      {/* Aurora background from top to end of hero section */}
      <div className="fixed inset-0 -z-10 h-[150vh]">
        <AuroraWrapper
          colorStops={["#34D399", "#a78bfa", "#3b82f6"]}
          blend={0.35}
          amplitude={0.7}
          speed={0.5}
        />
      </div>

      <div className="flex flex-col fluid-stack-xl pb-[clamp(2.5rem,3vw,3.5rem)]">
        <AboutHero />
        <MissionVision />
        <CompanyValues />
        <TeamSection />
        <AboutCta />
      </div>
    </div>
  );
}

