import type { Metadata } from "next";
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
    <div className="flex flex-col gap-10 pb-[clamp(2.5rem,3vw,3.5rem)]">
      <AboutHero />
      <MissionVision />
      <CompanyValues />
      <TeamSection />
      <AboutCta />
    </div>
  );
}
