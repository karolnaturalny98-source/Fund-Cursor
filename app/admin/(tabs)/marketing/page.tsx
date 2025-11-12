import { MarketingDashboard } from "@/components/admin/marketing-dashboard";
import {
  MARKETING_DEFAULT_SECTION_SLUG,
  ensureMarketingSection,
  getMarketingCompanyOptions,
  getSpotlightsForSection,
} from "@/lib/queries/marketing";

export const revalidate = 0;

export default async function AdminMarketingPage() {
  await ensureMarketingSection(MARKETING_DEFAULT_SECTION_SLUG, {
    title: "Oferty marketingowe",
    subtitle: "Zarządzaj promowanymi kampaniami na stronie głównej",
    emoji: "🔥",
  });

  const [section, companies] = await Promise.all([
    getSpotlightsForSection(MARKETING_DEFAULT_SECTION_SLUG, { includeInactive: true }),
    getMarketingCompanyOptions(),
  ]);

  return (
    <MarketingDashboard
      section={section}
      companies={companies}
      defaultSlug={MARKETING_DEFAULT_SECTION_SLUG}
    />
  );
}


