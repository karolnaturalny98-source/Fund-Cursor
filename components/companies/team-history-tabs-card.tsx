"use client";

import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamTree } from "@/components/companies/team-tree";
import { CompanyTimeline } from "@/components/companies/company-timeline";
import type { Company } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TeamHistoryTabsCardProps {
  company: Company;
}

export function TeamHistoryTabsCard({ company }: TeamHistoryTabsCardProps) {
  const teamMembers = company.teamMembers ?? [];
  const timelineItems = company.timelineItems ?? [];

  const hasTeam = teamMembers.length > 0;
  const hasTimeline = timelineItems.length > 0;

  if (!hasTeam && !hasTimeline) {
    return null;
  }

  // Determine default tab
  const defaultTab = hasTeam ? "team" : "history";

  return (
    <Card className="rounded-2xl border border-border/60 bg-[rgba(10,12,15,0.72)]! backdrop-blur-[36px]! shadow-xs transition-all hover:border-primary/50 hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-semibold sm:text-2xl">
            Zespół i historia
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Poznaj zespół stojący za firmą oraz kluczowe wydarzenia w jej historii.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList className="flex w-full gap-2 bg-transparent p-0">
            {hasTeam && (
              <TabsTrigger
                value="team"
                className={cn(
                  "flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  "border-transparent bg-muted/30 text-muted-foreground hover:border-primary/50 hover:shadow-xs",
                  "data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs",
                )}
              >
                Zespół
              </TabsTrigger>
            )}
            {hasTimeline && (
              <TabsTrigger
                value="history"
                className={cn(
                  "flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  "border-transparent bg-muted/30 text-muted-foreground hover:border-primary/50 hover:shadow-xs",
                  "data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs",
                )}
              >
                Historia firmy
              </TabsTrigger>
            )}
          </TabsList>

          {hasTeam && (
            <TabsContent value="team" className="mt-0">
              <TeamTree teamMembers={teamMembers} />
            </TabsContent>
          )}

          {hasTimeline && (
            <TabsContent value="history" className="mt-0">
              <CompanyTimeline timelineItems={timelineItems} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

