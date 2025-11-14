import { BookOpen } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { CompanyMedia } from "@/components/companies/company-media";
import { CompanyPopularityChartWrapper } from "@/components/companies/company-popularity-chart-wrapper";
import { ResourceCardClient } from "@/components/companies/company-page-client";
import type { CompanyWithDetails } from "@/lib/types";

interface CompanyMediaSectionProps {
  company: CompanyWithDetails;
  educationLinks: string[];
}

export function CompanyMediaSection({ company, educationLinks }: CompanyMediaSectionProps) {
  const hasMedia = company.mediaItems && company.mediaItems.length > 0;
  const hasPopularityData = company.rankingHistory && company.rankingHistory.length > 0;
  const hasEducation = Boolean(educationLinks.length);

  if (!hasMedia && !hasPopularityData && !hasEducation) {
    return null;
  }

  return (
    <section className="flex flex-col fluid-stack-lg">
      {hasMedia ? (
        <>
          <Separator className="bg-border/40" />
          <CompanyMedia mediaItems={company.mediaItems} />
        </>
      ) : null}

      {hasPopularityData ? (
        <>
          <Separator className="bg-border/40" />
          <CompanyPopularityChartWrapper rankingHistory={company.rankingHistory} companyName={company.name} />
        </>
      ) : null}

      {hasEducation ? (
        <>
          <Separator className="bg-border/40" />
          <section className="flex flex-col fluid-stack-md">
            <div className="flex flex-col fluid-stack-sm">
              <div className="flex items-center gap-[clamp(0.4rem,0.6vw,0.5rem)]">
                <BookOpen className="h-[clamp(1.1rem,0.6vw+1rem,1.25rem)] w-[clamp(1.1rem,0.6vw+1rem,1.25rem)] text-primary" />
                <h2 className="fluid-h2 font-semibold">Materiały edukacyjne</h2>
              </div>
              <p className="fluid-caption text-muted-foreground">
                Oficjalne zasoby i materiały szkoleniowe udostępnione przez firmę.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {educationLinks.map((link, index) => (
                <ResourceCardClient key={link} link={link} resourceType={detectResourceType(link)} index={index} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}

function detectResourceType(url: string) {
  const value = url.toLowerCase();
  if (value.includes("youtube") || value.includes("youtu.be") || value.includes("vimeo")) {
    return { iconName: "BookOpen", label: "Wideo" };
  }
  if (value.includes("pdf") || value.includes("doc") || value.includes("docx")) {
    return { iconName: "FileText", label: "Dokument" };
  }
  return { iconName: "ExternalLink", label: "Strona" };
}
