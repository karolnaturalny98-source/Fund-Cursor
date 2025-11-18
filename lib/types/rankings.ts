export type RankingTabId =
  | "overall"
  | "conditions"
  | "payouts"
  | "community"
  | "cashback"
  | "growth";

export interface RankingScores {
  overall: number;
  conditions: number;
  payouts: number;
  community: number;
  cashback: number;
  growth: number;
}

export interface RankingCategoryScores {
  tradingConditions: number | null;
  customerSupport: number | null;
  userExperience: number | null;
  payoutExperience: number | null;
}

export interface RankingCompanySnapshot {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  country: string | null;
  foundedYear: number | null;
  headline: string | null;
  rating: number | null;
  reviewCount: number;
  averageRating: number | null;
  recommendedRatio: number | null;
  favoritesCount: number;
  newReviews30d: number;
  clicks30d: number;
  clicksPrev30d: number;
  trendRatio: number;
  cashbackAveragePoints: number | null;
  cashbackRedeemRate: number | null;
  cashbackPayoutHours: number | null;
  hasCashback: boolean;
  evaluationModels: string[];
  accountTypes: string[];
  maxProfitSplit: number | null;
  categoryScores: RankingCategoryScores;
  scores: RankingScores;
  discountCode?: string | null;
  cashbackRate?: number | null;
  maxPlanPrice?: number | null;
}

export interface RankingMaxValues {
  reviewCount: number;
  favoritesCount: number;
  newReviews30d: number;
  clicks30d: number;
  cashbackAveragePoints: number;
}

export interface RankingFilters {
  search?: string;
  countries?: string[];
  evaluationModels?: string[];
  accountTypes?: string[];
  minReviews?: number;
  hasCashback?: boolean;
}

export interface RankingsDataset {
  generatedAt: string;
  totalCompanies: number;
  filteredCompanies: number;
  companies: RankingCompanySnapshot[];
  maxValues: RankingMaxValues;
  availableCountries: string[];
  availableEvaluationModels: string[];
  availableAccountTypes: string[];
}

export interface RankingsExplorerInitialFilters {
  search: string;
  country: string | null;
  evaluationModel: string | null;
  accountType: string | null;
  minReviews: number;
  hasCashback: boolean;
}

export type HomeRankingTabId = "top" | "opinions" | "cashback" | "price" | "payouts";

export interface HomeRankingTab {
  id: HomeRankingTabId;
  label: string;
  description: string;
  companies: RankingCompanySnapshot[];
}

export interface HomeRankingInsight {
  id: string;
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  contextLabel: string;
  contextValue: string;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}
