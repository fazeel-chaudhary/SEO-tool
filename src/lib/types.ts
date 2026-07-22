export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'CLIENT_VIEWER';

export type AuditType = 'GBP' | 'WEBSITE' | 'CITATION' | 'REVIEW' | 'RANKING' | 'GRID_HEATMAP';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Impact = 'HIGH' | 'MEDIUM' | 'LOW';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'DONE';

export type CitationStatus = 'CORRECT' | 'INCORRECT' | 'MISSING' | 'DUPLICATE';
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
export type ReplyStatus = 'UNANSWERED' | 'REPLIED';

export type GridSize = '3x3' | '5x5' | '7x7';

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

export interface GridPoint {
  lat: number;
  lng: number;
  position: number | null;
  label?: string;
}

export interface GeoGridScan {
  id: string;
  keywordTerm: string;
  locationId: string;
  gridSize: GridSize;
  radiusMiles: number;
  centerLat: number;
  centerLng: number;
  averageRank: number;
  shareOfLocalVoice: number;
  volatilityScore: number;
  projectedTrend: number;
  points: GridPoint[];
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
  postFrequencyPerMonth: number;
  shareOfLocalVoice: number;
  domainAuthority?: number;
  backlinkCount?: number;
  organicTraffic?: number;
  citationCount?: number;
  locationId: string;
  createdAt: string;
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
  confidenceScore: number;
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
  duplicatePhone: string;
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
