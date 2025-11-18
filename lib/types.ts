export type EvaluationModel = "one-step" | "two-step" | "instant-funding";

export type CompanySortOption = "rating" | "reviews" | "cashback" | "newest" | "name" | "popular";

export type SupportedCurrency = "USD" | "EUR" | "PLN" | "CZK" | "GBP";

export interface PriceHistoryPoint {
  id: string;
  price: number;
  currency: string;
  recordedAt: string;
}

export interface CompanyInstrumentGroup {
  title: string;
  description: string | null;
  instruments: string[];
}

export interface CompanyLeverageTier {
  label: string;
  accountSize: string | null;
  maxLeverage: number | null;
  notes: string | null;
}

export interface CompanyCommission {
  market: string;
  value: string;
  notes: string | null;
}

export interface CompanyRules {
  allowed: string[];
  restricted: string[];
}

export interface TeamMember {
  id: string;
  companyId: string;
  name: string;
  role: string;
  linkedInUrl: string | null;
  profileImageUrl: string | null;
  level: number;
  position: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyTimeline {
  id: string;
  companyId: string;
  title: string;
  description: string | null;
  date: string;
  type: string | null;
  icon: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyCertification {
  id: string;
  companyId: string;
  name: string;
  issuer: string | null;
  description: string | null;
  url: string | null;
  imageUrl: string | null;
  issuedDate: string | null;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyMedia {
  id: string;
  companyId: string;
  title: string;
  source: string | null;
  url: string;
  publishedAt: string;
  description: string | null;
  imageUrl: string | null;
  type: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyRankingHistory {
  id: string;
  companyId: string;
  overallScore: number;
  recordedAt: string;
}

export interface CompanyPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  evaluationModel: EvaluationModel;
  maxDrawdown: number | null;
  maxDailyLoss: number | null;
  profitTarget: number | null;
  profitSplit: string | null;
  description: string | null;
  features: string[];
  minTradingDays: number | null;
  payoutFirstAfterDays: number | null;
  payoutCycleDays: number | null;
  leverage: number | null;
  trailingDrawdown: boolean | null;
  refundableFee: boolean | null;
  scalingPlan: boolean | null;
  accountType: string | null;
  affiliateUrl: string | null;
  affiliateCommission: number | null;
  notes: string | null;
  priceHistory?: PriceHistoryPoint[];
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  slug: string;
  name: string;
  headline: string | null;
  logoUrl: string | null;
  shortDescription: string | null;
  websiteUrl: string | null;
  country: string | null;
  foundedYear: number | null;
  discountCode: string | null;
  cashbackRate: number | null;
  payoutFrequency: string | null;
  rating: number | null;
  highlights: string[];
  socials: Record<string, unknown> | null;
  regulation: string | null;
  kycRequired: boolean;
  paymentMethods: string[];
  instruments: string[];
  platforms: string[];
  educationLinks: string[];
  supportContact: string | null;
  instrumentGroups: CompanyInstrumentGroup[];
  leverageTiers: CompanyLeverageTier[];
  tradingCommissions: CompanyCommission[];
  firmRules: CompanyRules;
  ceo: string | null;
  legalName: string | null;
  headquartersAddress: string | null;
  foundersInfo: string | null;
  verificationStatus: string | null;
  licenses: string[];
  registryLinks: string[];
  registryData: string | null;
  createdAt: string;
  updatedAt: string;
  // Optional relations - may be included in queries
  plans?: CompanyPlan[];
  faqs?: FaqItem[];
  reviews?: Review[];
  teamMembers?: TeamMember[];
  timelineItems?: CompanyTimeline[];
  certifications?: CompanyCertification[];
  mediaItems?: CompanyMedia[];
  // Computed fields added by queries
  viewerHasFavorite?: boolean;
  clickCount?: number;
}

export interface CompanyWithDetails extends Company {
  plans: CompanyPlan[];
  faqs: FaqItem[];
  reviews: Review[];
  teamMembers: TeamMember[];
  timelineItems: CompanyTimeline[];
  certifications: CompanyCertification[];
  mediaItems: CompanyMedia[];
}

export interface TopCashbackCompany {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  cashbackRate: number;
  minCashback: number;
  maxCashback: number;
  discountCode: string | null;
  minPlanPrice: number | null;
  maxPlanPrice: number | null;
}

export interface FaqItem {
  id: string;
  companyId: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  companyId: string;
  userId: string | null;
  rating: number;
  pros: string[];
  cons: string[];
  body: string | null;
  status: ReviewStatus;
  publishedAt: string | null;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    clerkId: string | null;
    displayName: string | null;
  } | null;
}

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type CashbackStatus = "PENDING" | "APPROVED" | "REDEEMED" | "REJECTED";

export interface CashbackTransaction {
  id: string;
  companyId: string;
  userId: string | null;
  transactionRef: string;
  points: number;
  status: CashbackStatus;
  purchasedAt: string | null;
  approvedAt: string | null;
  fulfilledAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClickEvent {
  id: string;
  companyId: string;
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  source: string | null;
  clickedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  companyId: string;
  createdAt: string;
}

export interface InfluencerProfile {
  id: string;
  platform: string;
  handle: string;
  audienceSize: number | null;
  referralCode: string | null;
  socialLinks: string[];
  bio: string | null;
  status: InfluencerStatus;
  preferredCompanies: string[];
  notes: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export type InfluencerStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface InfluencerProfileWithUser extends InfluencerProfile {
  user: {
    id: string;
    clerkId: string;
    displayName: string | null;
    email: string | null;
  } | null;
}

export type DataIssueStatus = "PENDING" | "RESOLVED" | "DISMISSED";

export interface DataIssueReport {
  id: string;
  companyId: string | null;
  planId: string | null;
  userId: string | null;
  email: string | null;
  category: string;
  description: string;
  status: DataIssueStatus;
  source: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type DisputeStatus = "OPEN" | "IN_REVIEW" | "WAITING_USER" | "RESOLVED" | "REJECTED";

export interface DisputeCase {
  id: string;
  userId: string | null;
  companyId: string | null;
  planId: string | null;
  assignedAdminId: string | null;
  status: DisputeStatus;
  title: string;
  category: string;
  description: string;
  requestedAmount: number | null;
  requestedCurrency: string | null;
  evidenceLinks: string[];
  resolutionNotes: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    clerkId: string;
    displayName: string | null;
    email: string | null;
  } | null;
  company?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  plan?: {
    id: string;
    name: string;
  } | null;
  assignedAdmin?: {
    id: string;
    clerkId: string;
    displayName: string | null;
    email: string | null;
  } | null;
}

export interface CashbackSummary {
  pending: number;
  approved: number;
  redeemed: number;
  available: number;
}

export interface RedeemPlanOption {
  id: string;
  name: string;
  price: number;
  currency: string;
}

export interface RedeemCompanyOffer {
  id: string;
  name: string;
  slug: string;
  plans: RedeemPlanOption[];
}

export type BlogPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  status: BlogPostStatus;
  authorId: string;
  publishedAt: string | null;
  views: number;
  readingTime: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostWithRelations extends BlogPost {
  author: {
    id: string;
    clerkId: string;
    displayName: string | null;
    email: string | null;
  };
  categories: BlogCategory[];
}

// Homepage & Metrics Types
export interface HomepageMetrics {
  totalCompanies: number;
  totalReviews: number;
  avgRating: number;
  totalCashbackPaid: number;
  totalPlans?: number;
  approvedReviews?: number;
  totalCashback?: number;
  activeInfluencers?: number;
}

export interface RecentCompanySummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  shortDescription: string | null;
  rating: number | null;
  cashbackRate: number | null;
  createdAt: string;
}

export interface MarketingSpotlightSection {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  emoji: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  spotlights?: MarketingSpotlight[];
}

export interface MarketingSpotlight {
  id: string;
  sectionId: string;
  companyId: string | null;
  title: string;
  headline: string | null;
  badgeLabel: string | null;
  badgeTone: string | null;
  discountValue: number | null;
  rating: number | null;
  ratingCount: number | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  order: number;
  startsAt: string | null;
  endsAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    rating?: number | null;
  } | null;
}

export interface CompanyFiltersMetadata {
  countries: string[];
  evaluationModels: string[];
  accountTypes: string[];
  profitSplits: number[];
  minPrice: number;
  maxPrice: number;
}

// Review Types
export type ReviewExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert"
  | "professional";

export interface ReviewHighlight {
  id: string;
  rating: number;
  pros: string[];
  cons: string[];
  body: string | null;
  experienceLevel: ReviewExperienceLevel | null;
  tradingStyle: string | null;
  timeframe: string | null;
  monthsWithCompany: number | null;
  recommended: boolean | null;
  resourceLinks: string[];
  createdAt: string;
  publishedAt: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  user: {
    id: string;
    clerkId: string | null;
    displayName: string | null;
  } | null;
}

// Wallet & Transaction Types
export type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED" | "REDEEMED";

export interface WalletTransaction {
  id: string;
  type: "CASHBACK" | "REDEEM" | "BONUS" | "REFUND";
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  processedAt: string | null;
  points?: number | null;
  notes?: string | null;
  company?: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    discountCode?: string | null;
  } | null;
}

// Company Copy Metrics (for tracking affiliate link copies)
export interface CompanyCopyMetrics {
  last24h: number;
  last7d: number;
  total: number;
}
