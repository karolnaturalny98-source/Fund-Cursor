import type { Metadata } from "next";
import Aurora from "@/components/Aurora";
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
        <Aurora
          colorStops={["#1e5a3d", "#34d399", "#a7f3d0"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      <div className="pb-24">
        <AboutHero />
        
        <div className="space-y-20">
          <MissionVision />
          <CompanyValues />
          <TeamSection />
          <AboutCta />
        </div>
      </div>
    </div>
  );
}

