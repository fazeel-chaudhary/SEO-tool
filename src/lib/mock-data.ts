import {
  Organization,
  Location,
  Keyword,
  RankingSnapshot,
  Recommendation,
  Citation,
  Review,
  NotificationItem,
  GeoGridScan,
  CompetitorMetric,
  WebsiteAuditResult,
  AutomationRule,
  ApiKey,
  WebhookEndpoint,
  WhiteLabelSettings,
  CitationSubmission,
  ReviewCampaign,
  DuplicateListing,
} from './types';

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-agency-1',
    name: 'Apex Local Marketing Agency',
    slug: 'apex-marketing',
    type: 'AGENCY',
    primaryColor: '#0c8ce9',
    users: [
      {
        id: 'usr-1',
        email: 'alex@apexmarketing.com',
        name: 'Alex Rivera (Agency Owner)',
        role: 'OWNER',
        organizationId: 'org-agency-1',
      },
    ],
  },
];

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'loc-1',
    name: 'Downtown Dental - Central Austin',
    address: '501 W 6th St, Suite 200',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    phone: '(512) 555-0192',
    website: 'https://downtowndentalaustin.com',
    category: 'Dentist',
    additionalCats: ['Cosmetic Dentist', 'Teeth Whitening Service'],
    placeId: 'ChIJbU60yXA1RIYR3HwY2aY0qWg',
    gbpConnected: true,
    gbpHours: 'Mon-Fri 8am-5pm',
    gbpPhotoCount: 6,
    gbpPostCount: 1,
    gbpLastPostDate: '2026-05-10T10:00:00Z',
    lat: 30.2672,
    lng: -97.7431,
    organizationId: 'org-agency-1',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_KEYWORDS: Keyword[] = [
  {
    id: 'kw-1',
    term: 'emergency dentist austin',
    city: 'Austin',
    zip: '78701',
    locationId: 'loc-1',
    latestRank: 2,
    rankChange: 1,
  },
];

export const INITIAL_SNAPSHOTS: RankingSnapshot[] = [
  {
    id: 'snap-1',
    position: 2,
    checkedAt: '2026-07-20T00:00:00Z',
    keywordId: 'kw-1',
    locationId: 'loc-1',
  },
];

export const INITIAL_GEO_SCANS: GeoGridScan[] = [
  {
    id: 'scan-austin-jul21',
    keywordTerm: 'emergency dentist austin',
    locationId: 'loc-1',
    gridSize: '5x5',
    radiusMiles: 2.0,
    centerLat: 30.2672,
    centerLng: -97.7431,
    averageRank: 3.2,
    shareOfLocalVoice: 68,
    volatilityScore: 1.8,
    projectedTrend: +1.4,
    scannedAt: '2026-07-21T00:00:00Z',
    points: [{ lat: 30.2672, lng: -97.7431, position: 1 }],
  },
];

export const INITIAL_COMPETITORS: CompetitorMetric[] = [
  {
    id: 'comp-1',
    name: 'Austin Central Dentistry',
    address: '600 Congress Ave, Austin, TX 78701',
    category: 'Dentist',
    rating: 4.9,
    reviewCount: 342,
    photoCount: 48,
    postFrequencyPerMonth: 4,
    shareOfLocalVoice: 78,
    locationId: 'loc-1',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_WEBSITE_AUDITS: WebsiteAuditResult[] = [
  {
    id: 'audit-web-1',
    url: 'https://downtowndentalaustin.com',
    score: 68,
    titleTag: 'Downtown Dental Care | Dentist in Austin TX',
    titleTagOk: true,
    metaDescription: 'Downtown Dental Care provides family dentistry in central Austin.',
    metaDescriptionOk: true,
    h1Tag: 'Welcome to Downtown Dental',
    h1TagOk: false,
    napOnPage: true,
    schemaTypesFound: ['LocalBusiness'],
    httpsOk: true,
    mobileOk: true,
    pageSpeedScore: 72,
    lcpTime: '2.4s',
    issues: ['H1 Tag missing primary keyword'],
    locationId: 'loc-1',
    auditedAt: new Date().toISOString(),
  },
];

export const MASTER_DIRECTORY_REGISTRY = [
  { name: 'Google Business Profile', domain: 'google.com', category: 'Major Search' },
  { name: 'Yelp', domain: 'yelp.com', category: 'Reviews & Local' },
];

export const INITIAL_CITATIONS: Citation[] = [
  {
    id: 'cit-1',
    directoryName: 'Google Business Profile',
    domain: 'google.com',
    category: 'Major Search',
    url: 'https://google.com/maps?cid=123456789',
    napData: {
      name: 'Downtown Dental - Central Austin',
      address: '501 W 6th St, Suite 200, Austin, TX 78701',
      phone: '(512) 555-0192',
    },
    status: 'CORRECT',
    confidenceScore: 100,
    locationId: 'loc-1',
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_CITATION_SUBMISSIONS: CitationSubmission[] = [
  {
    id: 'sub-1',
    directoryName: 'Apple Maps',
    domain: 'maps.apple.com',
    category: 'Maps & Nav',
    submissionStatus: 'LIVE',
    submittedAt: '2026-07-15T00:00:00Z',
    liveUrl: 'https://maps.apple.com/place?id=98765',
    locationId: 'loc-1',
  },
  {
    id: 'sub-2',
    directoryName: 'Bing Places for Business',
    domain: 'bingplaces.com',
    category: 'Search Engine',
    submissionStatus: 'IN_PROGRESS',
    submittedAt: '2026-07-20T00:00:00Z',
    locationId: 'loc-1',
  },
  {
    id: 'sub-3',
    directoryName: 'YellowPages',
    domain: 'yellowpages.com',
    category: 'Directory',
    submissionStatus: 'SUBMITTED',
    submittedAt: '2026-07-21T00:00:00Z',
    locationId: 'loc-1',
  },
];

export const INITIAL_REVIEW_CAMPAIGNS: ReviewCampaign[] = [
  {
    id: 'camp-1',
    name: 'Post-Cleaning Patient Review SMS Funnel',
    type: 'SMS',
    recipientsCount: 145,
    sentCount: 142,
    openRate: 88,
    positiveReviewsGenerated: 34,
    status: 'ACTIVE',
    locationId: 'loc-1',
    createdAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'camp-2',
    name: 'Family Dentistry Email Feedback Campaign',
    type: 'EMAIL',
    recipientsCount: 280,
    sentCount: 275,
    openRate: 64,
    positiveReviewsGenerated: 21,
    status: 'ACTIVE',
    locationId: 'loc-1',
    createdAt: '2026-07-10T00:00:00Z',
  },
];

export const INITIAL_DUPLICATE_LISTINGS: DuplicateListing[] = [
  {
    id: 'dup-1',
    directoryName: 'Yelp',
    duplicateName: 'Downtown Dental Suite 200',
    duplicateAddress: '501 W 6th St, Austin, TX 78701',
    duplicatePhone: '(512) 555-0192',
    suppressionStatus: 'DETECTED',
    locationId: 'loc-1',
    detectedAt: '2026-07-18T00:00:00Z',
  },
  {
    id: 'dup-2',
    directoryName: 'YellowPages',
    duplicateName: 'Dr Michael Johnson DDS',
    duplicateAddress: '501 West 6th Street, Austin, TX 78701',
    duplicatePhone: '(512) 555-9988',
    suppressionStatus: 'SUPPRESSION_REQUESTED',
    locationId: 'loc-1',
    detectedAt: '2026-07-12T00:00:00Z',
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    platform: 'Google Maps',
    rating: 5,
    reviewerName: 'Emily Vance',
    text: 'Dr. Johnson provided the best dental cleaning!',
    sentiment: 'POSITIVE',
    replyStatus: 'REPLIED',
    replyText: 'Thank you Emily!',
    locationId: 'loc-1',
    createdAt: '2026-07-18T14:30:00Z',
  },
];

export const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Suppress Duplicate Listing on Yelp',
    description: 'A duplicate Yelp listing was detected cannibalizing map authority.',
    actionableStep: 'Execute suppression request to merge duplicate listing on Yelp.',
    priority: 'HIGH',
    impact: 'HIGH',
    difficulty: 'EASY',
    timeEstimate: '10 mins',
    status: 'OPEN',
    auditType: 'CITATION',
    locationId: 'loc-1',
    organizationId: 'org-agency-1',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'AUTOMATION',
    title: 'Review Request Campaign Triggered',
    message: 'Post-Cleaning Patient SMS campaign delivered 12 new review links today.',
    read: false,
    locationId: 'loc-1',
    organizationId: 'org-agency-1',
    createdAt: '2026-07-21T00:05:00Z',
  },
];

export const INITIAL_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'auto-1',
    name: 'Weekly GBP & Citation Health Check',
    description: 'Runs automated audit checks every Monday at 02:00 AM.',
    frequency: 'WEEKLY',
    status: 'ACTIVE',
    lastRun: '2026-07-21T00:00:00Z',
    locationId: 'loc-1',
  },
];

export const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: 'key-1',
    name: 'Agency Production API Key',
    key: 'lseo_live_sk_9482710398471092',
    createdAt: '2026-07-01T00:00:00Z',
    lastUsedAt: '2026-07-21T00:10:00Z',
    organizationId: 'org-agency-1',
  },
];

export const INITIAL_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: 'wh-1',
    url: 'https://api.apexmarketing.com/webhooks/local-seo',
    events: ['ranking.drop', 'review.negative', 'audit.completed'],
    active: true,
    organizationId: 'org-agency-1',
  },
];

export const INITIAL_WHITE_LABEL: WhiteLabelSettings = {
  agencyName: 'Apex Local Marketing Agency',
  customDomain: 'reports.apexmarketing.com',
  primaryColor: '#0c8ce9',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
  organizationId: 'org-agency-1',
};
