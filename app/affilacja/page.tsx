import { AffiliateHero } from "@/components/affiliate/affiliate-hero";
import { AffiliateBenefits } from "@/components/affiliate/affiliate-benefits";
import { AffiliateHowItWorks } from "@/components/affiliate/affiliate-how-it-works";
import { AffiliateList } from "@/components/affiliate/affiliate-list";
import { AffiliateRegistrationForm } from "@/components/affiliate/affiliate-registration-form";
import { AffiliateFinalCta } from "@/components/affiliate/affiliate-final-cta";
import { AffiliateStatistics } from "@/components/affiliate/affiliate-statistics";
import { getApprovedInfluencers } from "@/lib/queries/influencers";
import { prisma } from "@/lib/prisma";
import Aurora from "@/components/Aurora";

// Cache affiliate page for 10 minutes - affiliate list changes infrequently
export const revalidate = 600;

export default async function AffiliatePage() {
  const [affiliates, stats] = await Promise.all([
    getApprovedInfluencers(12),
    Promise.all([
      prisma.influencerProfile.count({ where: { status: "APPROVED" } }),
      prisma.influencerProfile.count({ where: { status: "PENDING" } }),
    ]),
  ]);

  const [approvedCount, pendingCount] = stats;

  return (
    <div className="relative">
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10" style={{ height: '150vh' }}>
        <Aurora
          colorStops={["#1e5a3d", "#34d399", "#a7f3d0"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="container relative z-10 flex flex-col gap-10 py-16">
          <AffiliateHero />
        </div>
      </section>
      
      <div className="space-y-20 pb-24">
        <AffiliateBenefits />
        <AffiliateHowItWorks />
        
        <AffiliateStatistics approvedCount={approvedCount} pendingCount={pendingCount} />

        <AffiliateList affiliates={affiliates} />
        <AffiliateRegistrationForm />

        {/* Final CTA Section */}
        <AffiliateFinalCta />
      </div>
    </div>
  );
}

