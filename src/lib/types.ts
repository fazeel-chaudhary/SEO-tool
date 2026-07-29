export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'CLIENT_VIEWER';

export type AuditType = 'GBP' | 'WEBSITE' | 'CITATION' | 'REVIEW' | 'RANKING' | 'GRID_HEATMAP';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Impact = 'HIGH' | 'MEDIUM' | 'LOW';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'DONE';

export type CitationStatus = 'CORRECT' | 'INCORRECT' | 'MISSING' | 'DUPLICATE';
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
export type ReplyStatus = 'UNANSWERED' | 'REPLIED';

export type GridSize = '3x3' | '5x5' | '7x7' | '9x9' | '11x11' | '13x13' | '15x15';

export type CenterMode = 'BUSINESS_LOCATION' | 'CITY_CENTER' | 'ZIP_CODE' | 'CUSTOM_COORDS';
export type DeviceType = 'DESKTOP' | 'MOBILE';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: Role;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'AGENCY' | 'BUSINESS';
  logoUrl?: string;
  primaryColor?: string;
  users: User[];
  trialStartedAt?: string;
  plan?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website?: string;
  category: string;
  additionalCats?: string[];
  placeId?: string;
  gbpConnected: boolean;
  gbpStatus?: 'VERIFIED' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  gbpHours?: string;
  gbpPhotoCount: number;
  gbpPostCount: number;
  gbpLastPostDate?: string;
  lat?: number;
  lng?: number;
  organizationId: string;
  createdAt: string;
}

export interface Keyword {
  id: string;
  term: string;
  city: string;
  zip?: string;
  gridPoints?: string[];
  locationId: string;
  latestRank?: number;
  rankChange?: number;
}

export interface RankingSnapshot {
  id: string;
  position: number | null;
  organicPosition?: number | null;
  gridPoint?: string;
  checkedAt: string;
  keywordId: string;
  locationId: string;
}

export interface Project {
  id: string;
  name: string;
  folderName: string;
  description?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  assignedUserIds: string[];
  locationIds: string[];
  organizationId: string;
  createdAt: string;
}

export interface GridScanSchedule {
  id: string;
  locationId: string;
  keywordTerm: string;
  gridSize: GridSize;
  radiusMiles: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  emailRecipients: string[];
  active: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  createdAt: string;
}

export interface NodeCompetitor {
  rank: number;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  photos: number;
  distance: string;
  address?: string;
}

export interface GridPoint {
  lat: number;
  lng: number;
  position: number | null;
  organicPosition?: number | null;
  address?: string;
  label?: string;
  competitors?: NodeCompetitor[];
  deviceType?: DeviceType;
  isCenterNode?: boolean;
  isDisabled?: boolean;
}

export interface GeoGridScan {
  id: string;
  keywordTerm: string;
  locationId: string;
  gridSize: GridSize;
  radiusMiles: number;
  centerLat: number;
  centerLng: number;
  centerMode?: CenterMode;
  deviceType?: DeviceType;
  searchEngine?: string;
  averageRank: number;
  highestRank?: number;
  lowestRank?: number;
  visibilityScore?: number;
  shareOfLocalVoice: number;
  volatilityScore: number;
  projectedTrend: number;
  points: GridPoint[];
  bestArea?: string;
  weakArea?: string;
  scannedAt: string;
}

export interface CompetitorMetric {
  id: string;
  name: string;
  address: string;
  website?: string;
  category: string;
  rating: number;
  reviewCount: number;
  photoCount: number;
  totalPosts: number;
  postFrequencyPerMonth?: number;
  shareOfLocalVoice: number;
  domainAuthority?: number;
  backlinkCount?: number;
  organicTraffic?: number;
  citationCount?: number;
  websiteUrl?: string;
  mapsUrl?: string;
  placeId?: string;
  cid?: string;
  phone?: string;
  businessHours?: string;
  secondaryCategories?: string[];
  reviewGrowthRate?: string;
  mapRankPosition?: number;
  distanceMiles?: number;
  qnaCount?: number;
  confidenceScore?: number;
  verificationStatus?: 'VERIFIED' | 'NEEDS_VERIFICATION';
  isPinned?: boolean;
  isLocked?: boolean;
  isPermanentlyClosed?: boolean;
  aiValidated?: boolean;
  aiValidationNotes?: string;
  locationId: string;
  createdAt: string;
}

export interface CompetitorGbpAudit {
  businessName: string;
  primaryCategory: string;
  secondaryCategories: string[];
  description?: string;
  services?: string[];
  products?: string[];
  phone?: string;
  website?: string;
  appointmentLink?: string;
  businessHours?: string;
  photosCount: number;
  videosCount: number;
  postsFrequency: string; // e.g. "2 posts / week"
  totalPosts: number;
  qnaCount: number;
  reviewCount: number;
  averageRating: number;
  reviewResponseRate: number; // percentage e.g. 92
  recentReviewsCount: number;
  yearsInBusiness?: string;
  attributes: string[]; // e.g. ["Wheelchair accessible", "Online appointments"]
  serviceAreas: string[];
}

export interface CompetitorCitationDirectory {
  directoryName: string;
  liveUrl?: string;
  status: 'ACTIVE' | 'MISSING' | 'NAP_INCONSISTENT';
  napConsistent: boolean;
  businessDescription?: string;
  categories?: string[];
  rating?: number;
  authorityScore: number;
}

export interface CompetitorCitationAudit {
  directories: CompetitorCitationDirectory[];
  totalCitations: number;
  missingCitationsCount: number;
  citationAuthorityScore: number; // 0 - 100
  citationConsistencyScore: number; // 0 - 100
}

export interface CompetitorWebsiteAudit {
  domainAuthority: number;
  pageAuthority: number;
  websiteSpeedScore: number;
  mobileFriendly: boolean;
  https: boolean;
  metaTitle: string;
  metaDescription: string;
  headingStructure: {
    h1Count: number;
    h2Count: number;
    h1Text?: string;
  };
  schemaTypesFound: string[];
  internalLinksCount: number;
  externalLinksCount: number;
  backlinksCount: number;
  referringDomainsCount: number;
  indexStatus: string;
  coreWebVitals: {
    lcp: string; // e.g. "1.8s"
    fid: string; // e.g. "12ms"
    cls: string; // e.g. "0.02"
  };
}

export interface CompetitorReviewAudit {
  googleReviewCount: number;
  googleRating: number;
  facebookReviewCount: number;
  facebookRating: number;
  yelpReviewCount: number;
  yelpRating: number;
  totalReviews: number;
  averageRating: number;
  reviewGrowthRate: string;
  reviewFrequency: string;
  responseRatePercent: number;
  positiveKeywords: string[];
  negativeKeywords: string[];
  aiSentimentScore: number; // 0 - 100
  aiSentimentLabel: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'MIXED' | 'NEGATIVE';
}

export interface CompetitorLocalSeoAudit {
  napConsistencyScore: number; // 0 - 100
  categoriesOptimized: boolean;
  localKeywordsRankedCount: number;
  googlePostsActivityScore: number;
  photosOptimizationScore: number;
  qnaOptimizationScore: number;
  localLandingPageExists: boolean;
  locationPageExists: boolean;
  localBusinessSchemaImplemented: boolean;
  localBacklinksCount: number;
  localSeoScore: number; // 0 - 100 total Local SEO Score
}

export interface DeepCompetitorAuditResult {
  id: string;
  competitorId: string;
  competitorName: string;
  auditedAt: string;
  gbpAudit: CompetitorGbpAudit;
  citationAudit: CompetitorCitationAudit;
  websiteAudit: CompetitorWebsiteAudit;
  reviewAudit: CompetitorReviewAudit;
  localSeoAudit: CompetitorLocalSeoAudit;
}

export interface AiCompetitiveGapAnalysis {
  rankingAdvantageAnswers: {
    whyRankingAbove: string;
    missingCitationsSummary: string;
    rankingKeywordsSummary: string;
    gbpOptimizationGap: string;
    reviewGapSummary: string;
    postFrequencyGap: string;
    directoriesGap: string;
    schemaGapSummary: string;
  };
  strengths: string[];
  weaknesses: string[];
}

export interface AiActionItem {
  id: string;
  title: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'CITATIONS' | 'GBP' | 'POSTS' | 'REVIEWS' | 'SCHEMA' | 'BACKLINKS' | 'WEBSITE';
  timeEstimate: string;
  actionUrl?: string;
}

export interface WebsiteAuditResult {
  id: string;
  url: string;
  score: number;
  titleTag: string;
  titleTagOk: boolean;
  metaDescription: string;
  metaDescriptionOk: boolean;
  h1Tag: string;
  h1TagOk: boolean;
  napOnPage: boolean;
  schemaTypesFound: string[];
  httpsOk: boolean;
  mobileOk: boolean;
  pageSpeedScore: number;
  lcpTime: string;
  issues: string[];
  locationId: string;
  auditedAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  actionableStep: string;
  priority: Priority;
  impact: Impact;
  difficulty: Difficulty;
  timeEstimate: string;
  status: Status;
  auditType: AuditType;
  locationId: string;
  organizationId: string;
  createdAt: string;
}

export interface Citation {
  id: string;
  directoryName: string;
  domain: string;
  category: string;
  url?: string;
  napData: {
    name: string;
    address: string;
    phone: string;
  };
  status: CitationStatus;
  listingStatus?: 'APPROVED' | 'SUBMITTED' | 'PENDING' | 'REJECTED' | 'NOT_LISTED' | 'DUPLICATE' | 'INCORRECT';
  confidenceScore: number;
  domainAuthority?: number;
  trustScore?: number;
  country?: string;
  isFree?: boolean;
  submissionCost?: string;
  dateAdded?: string;
  lastUpdated?: string;
  isCompetitorOnly?: boolean;
  competitorsListed?: string[];
  aiRecommendation?: string;
  aiPriority?: 'HIGH' | 'MEDIUM' | 'LOW';
  missingInformation?: string[];
  suggestedImprovement?: string;
  locationId: string;
  updatedAt: string;
}

export interface CitationSubmission {
  id: string;
  directoryName: string;
  domain: string;
  category: string;
  submissionStatus: 'SUBMITTED' | 'IN_PROGRESS' | 'LIVE' | 'FAILED';
  submittedAt: string;
  liveUrl?: string;
  locationId: string;
}

export interface DIYCitationOpportunity {
  id: string;
  directoryName: string;
  domain: string;
  domainAuthority: number;
  trustScore: number;
  country: string;
  category: string;
  seoValue: 'EXCEPTIONAL' | 'HIGH' | 'MEDIUM';
  isFree: boolean;
  submissionCost?: string;
  submissionUrl: string;
  whyRecommended: string;
  isCompetitorGap: boolean;
  competitorName?: string;
  rankingImpactScore: number;
  status: 'RECOMMENDED' | 'IN_PROGRESS' | 'COMPLETED' | 'IGNORED';
  proofUrl?: string;
  completedAt?: string;
  locationId: string;
}

export interface DFYCitationSubmissionItem {
  id: string;
  directoryName: string;
  domain: string;
  domainAuthority: number;
  liveUrl?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  proofScreenshotUrl?: string;
  submittedAt?: string;
  approvedAt?: string;
}

export interface DFYCitationOrder {
  id: string;
  locationId: string;
  packageCount: number;
  totalCost: number;
  orderStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  orderedAt: string;
  completedAt?: string;
  items: DFYCitationSubmissionItem[];
}

export interface ReviewCampaign {
  id: string;
  name: string;
  type: 'EMAIL' | 'SMS';
  recipientsCount: number;
  sentCount: number;
  openRate: number;
  positiveReviewsGenerated: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DRAFT';
  locationId: string;
  createdAt: string;
}

export interface DuplicateListing {
  id: string;
  directoryName: string;
  duplicateName: string;
  duplicateAddress: string;
  duplicatePhone?: string;
  duplicateUrl?: string;
  confidenceScore?: number;
  cannibalizationRisk?: 'HIGH' | 'MEDIUM' | 'LOW';
  suppressionStatus: 'DETECTED' | 'SUPPRESSION_REQUESTED' | 'SUPPRESSED';
  locationId: string;
  detectedAt: string;
}

export interface Review {
  id: string;
  platform: 'Google' | 'Yelp' | 'Facebook' | 'Trustpilot' | 'TripAdvisor';
  rating: number;
  reviewerName: string;
  reviewerAvatar?: string;
  text: string;
  sentiment: Sentiment;
  replyStatus: ReplyStatus;
  replyText?: string;
  isFakeDetected?: boolean;
  locationId: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'NEGATIVE_REVIEW' | 'MISSING_CITATION' | 'RANK_DROP' | 'GBP_AUDIT' | 'GEO_GRID' | 'WEBSITE_AUDIT' | 'AUTOMATION';
  title: string;
  message: string;
  read: boolean;
  locationId: string;
  organizationId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'ACTIVE' | 'PAUSED';
  lastRun: string;
  locationId: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
  organizationId: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  organizationId: string;
}

export interface WhiteLabelSettings {
  agencyName: string;
  customDomain?: string;
  logoUrl?: string;
  primaryColor: string;
  customHeaderHtml?: string;
  organizationId: string;
}

export interface AuditResult {
  id: string;
  type: AuditType;
  score: number;
  issuesCount: number;
  issues: string[];
  locationId: string;
  createdAt: string;
}

export interface IntegrationConnector {
  name: string;
  category: 'Search & Maps' | 'Social & Reviews' | 'AI & CRM' | 'Payment';
  status: 'CONNECTED' | 'DISCONNECTED';
  lastSync?: string;
  locationId: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
}

export interface AiPrompt {
  id: string;
  name: string;
  description: string;
  template: string;
  lastUpdated: string;
}

