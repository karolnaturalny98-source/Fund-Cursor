import type { CompanyPlan } from "@/lib/types";

export type CompanyRiskAlert = {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  iconName: "AlertTriangle" | "Shield" | "LifeBuoy" | "Zap";
};

export type CompanyChecklistItem = {
  id: string;
  title: string;
  description: string;
  recommended: boolean;
  iconName: "Shield" | "Layers" | "FileText" | "Clock" | "BookOpen" | "LifeBuoy";
};

export type CompanyReviewCard = {
  id: string;
  rating: number;
  pros: string[];
  cons: string[];
  body: string | null;
  publishedAt: string;
  experienceLevel: string | null;
  tradingStyle: string | null;
  timeframe: string | null;
  monthsWithCompany: number | null;
  accountSize: string | null;
  recommended: boolean | null;
  influencerDisclosure: string | null;
  resourceLinks: string[];
  userDisplayName: string | null;
  verified: boolean;
};

export type CompanyPlanSummaryRow = {
  id: string;
  name: string;
  evaluationModel: string;
  firstPayout: string;
  cycle: string;
  profitSplit: string | null;
  notes: string | null;
};

export type CompanyPayoutSummary = {
  highlights: Array<{ id: string; label: string; value: string }>;
  rows: CompanyPlanSummaryRow[];
  slaNotice: string | null;
};

export type CompanyPlanHighlight = {
  id: string;
  label: string;
  value: string;
  description: string;
  iconName: "Award" | "TrendingUp" | "Gauge" | "Receipt" | "Clock";
};

export type CompanyPlanStats = {
  bestProfitSplit: string | null;
  bestLeverage: number | null;
};

export type CompanyPlanWithCurrency = CompanyPlan & {
  currency: string;
};
