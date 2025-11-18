import { Section } from "@/components/layout/section";
import IntegrationsSection from "@/components/integrations-5";

export function HomeCompareTeaser() {
  return (
    <Section size="lg" stack="lg" className="flex flex-col items-center gap-6">
      <IntegrationsSection />
    </Section>
  );
}
