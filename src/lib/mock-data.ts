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
    gbpStatus: 'VERIFIED',
    gbpHours: 'Mon-Fri 8am-5pm',
    gbpPhotoCount: 6,
    gbpPostCount: 1,
    gbpLastPostDate: '2026-05-10T10:00:00Z',
    lat: 30.2672,
    lng: -97.7431,
    organizationId: 'org-agency-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'loc-2',
    name: 'Austin Dental Clinic (West Campus)',
    address: '2200 San Antonio St',
    city: 'Austin',
    state: 'TX',
    zip: '78705',
    phone: '(512) 555-9831',
    website: 'https://austindentaltx.com',
    category: 'Dentist',
    additionalCats: ['Pediatric Dentist'],
    placeId: 'ChIJbU60yXA1RIYR3HwY2aY0qWh',
    gbpConnected: true,
    gbpStatus: 'VERIFIED',
    gbpHours: 'Mon-Fri 9am-6pm',
    gbpPhotoCount: 14,
    gbpPostCount: 4,
    lat: 30.2849,
    lng: -97.7404,
    organizationId: 'org-agency-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'loc-3',
    name: 'Manhattan Premier SEO & Legal Agency',
    address: '350 5th Ave, Floor 42',
    city: 'New York',
    state: 'NY',
    zip: '10118',
    phone: '(212) 555-0144',
    website: 'https://manhattanlocalseo.com',
    category: 'Marketing Agency',
    additionalCats: ['SEO Agency', 'Web Design Agency'],
    placeId: 'ChIJ51wL3X5ZwokR1uY-8d8q_68',
    gbpConnected: true,
    gbpStatus: 'VERIFIED',
    gbpHours: 'Mon-Fri 8:30am-6:30pm',
    gbpPhotoCount: 28,
    gbpPostCount: 12,
    lat: 40.7484,
    lng: -73.9857,
    organizationId: 'org-agency-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'loc-4',
    name: 'Miami Beach Wellness & Spa Center',
    address: '1100 Lincoln Rd',
    city: 'Miami Beach',
    state: 'FL',
    zip: '33139',
    phone: '(305) 555-0188',
    website: 'https://miamibeachspa.com',
    category: 'Medical Spa',
    additionalCats: ['Wellness Center', 'Skin Care Clinic'],
    placeId: 'ChIJ44m01X622YgR2m-6-a7_69',
    gbpConnected: true,
    gbpStatus: 'VERIFIED',
    gbpHours: 'Mon-Sun 9am-8pm',
    gbpPhotoCount: 35,
    gbpPostCount: 8,
    lat: 25.7907,
    lng: -80.141,
    organizationId: 'org-agency-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'loc-5',
    name: 'Los Angeles Auto Spa & Detailing',
    address: '8400 Wilshire Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90211',
    phone: '(310) 555-0177',
    website: 'https://laautospa.com',
    category: 'Auto Detailing Service',
    additionalCats: ['Car Wash', 'Paint Protection Service'],
    placeId: 'ChIJ66m01X622YgR3m-7-b8_70',
    gbpConnected: true,
    gbpStatus: 'VERIFIED',
    gbpHours: 'Mon-Sat 8am-7pm',
    gbpPhotoCount: 42,
    gbpPostCount: 15,
    lat: 34.0652,
    lng: -118.3742,
    organizationId: 'org-agency-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'loc-6',
    name: 'Chicago Loop Injury Law Group',
    address: '200 S Wacker Dr, Suite 1500',
    city: 'Chicago',
    state: 'IL',
    zip: '60606',
    phone: '(312) 555-0122',
    website: 'https://chicagolooplaw.com',
    category: 'Personal Injury Attorney',
    additionalCats: ['Law Firm', 'Trial Attorney'],
    placeId: 'ChIJ77m01X622YgR4m-8-c9_71',
    gbpConnected: true,
    gbpStatus: 'VERIFIED',
    gbpHours: '24/7 Open',
    gbpPhotoCount: 19,
    gbpPostCount: 6,
    lat: 41.8791,
    lng: -87.6366,
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
  {
    id: 'kw-2',
    term: 'cosmetic dentist west campus austin',
    city: 'Austin',
    zip: '78705',
    locationId: 'loc-2',
    latestRank: 3,
    rankChange: 0,
  },
  {
    id: 'kw-3',
    term: 'seo agency new york',
    city: 'New York',
    zip: '10118',
    locationId: 'loc-3',
    latestRank: 1,
    rankChange: 2,
  },
  {
    id: 'kw-4',
    term: 'medical spa miami beach',
    city: 'Miami Beach',
    zip: '33139',
    locationId: 'loc-4',
    latestRank: 2,
    rankChange: 1,
  },
  {
    id: 'kw-5',
    term: 'auto detailing los angeles',
    city: 'Los Angeles',
    zip: '90211',
    locationId: 'loc-5',
    latestRank: 4,
    rankChange: -1,
  },
  {
    id: 'kw-6',
    term: 'personal injury lawyer chicago loop',
    city: 'Chicago',
    zip: '60606',
    locationId: 'loc-6',
    latestRank: 2,
    rankChange: 3,
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

export function createMockGridPoints(centerLat: number, centerLng: number, dim: number, radiusMiles: number) {
  const half = Math.floor(dim / 2);
  const latStep = half > 0 ? (radiusMiles / half) * 0.0145 : 0.0145;
  const lngStep = half > 0 ? (radiusMiles / half) * 0.0168 : 0.0168;

  const mockCompetitorPool = [
    { name: `Premier Local Competitor`, category: 'Service', rating: 4.9, reviews: 185, photos: 48, distance: '0.3 mi' },
    { name: `Metro Area Leader`, category: 'Service', rating: 4.8, reviews: 142, photos: 35, distance: '0.6 mi' },
    { name: `Downtown Center`, category: 'Service', rating: 4.7, reviews: 96, photos: 28, distance: '0.9 mi' },
    { name: `Citywide Specialist`, category: 'Service', rating: 4.6, reviews: 78, photos: 22, distance: '1.2 mi' },
    { name: `Express Local Hub`, category: 'Service', rating: 4.5, reviews: 62, photos: 19, distance: '1.5 mi' },
  ];

  const points = [];
  let idx = 0;
  for (let r = -half; r <= half; r++) {
    for (let c = -half; c <= half; c++) {
      idx++;
      const lat = parseFloat((centerLat + r * latStep).toFixed(4));
      const lng = parseFloat((centerLng + c * lngStep).toFixed(4));
      const distFromCenter = Math.sqrt(r * r + c * c);

      let position: number;
      if (r === 0 && c === 0) position = 1;
      else if (distFromCenter <= 1) position = (idx % 3) + 1; // #1 - #3
      else if (distFromCenter <= 2) position = (idx % 5) + 3; // #3 - #7
      else if (distFromCenter <= 3) position = (idx % 8) + 7; // #7 - #14
      else position = (idx % 12) + 12; // #12 - #23

      points.push({
        lat,
        lng,
        position,
        organicPosition: position + 2,
        address: `GPS Node #${idx}`,
        competitors: mockCompetitorPool.map((comp, cIdx) => ({
          ...comp,
          rank: cIdx < position ? cIdx + 1 : cIdx + 2,
        })),
        deviceType: 'MOBILE' as const,
        isCenterNode: r === 0 && c === 0,
        isDisabled: false,
      });
    }
  }
  return points;
}

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
    shareOfLocalVoice: 76,
    volatilityScore: 1.8,
    projectedTrend: +1.4,
    scannedAt: '2026-07-21T00:00:00Z',
    points: createMockGridPoints(30.2672, -97.7431, 5, 2.0),
  },
  {
    id: 'scan-austin-westcampus',
    keywordTerm: 'cosmetic dentist west campus austin',
    locationId: 'loc-2',
    gridSize: '5x5',
    radiusMiles: 2.5,
    centerLat: 30.2849,
    centerLng: -97.7404,
    averageRank: 2.8,
    shareOfLocalVoice: 80,
    volatilityScore: 1.4,
    projectedTrend: +2.1,
    scannedAt: '2026-07-22T00:00:00Z',
    points: createMockGridPoints(30.2849, -97.7404, 5, 2.5),
  },
  {
    id: 'scan-ny-jul25',
    keywordTerm: 'seo agency new york',
    locationId: 'loc-3',
    gridSize: '7x7',
    radiusMiles: 3.5,
    centerLat: 40.7484,
    centerLng: -73.9857,
    averageRank: 1.8,
    shareOfLocalVoice: 88,
    volatilityScore: 1.2,
    projectedTrend: +3.1,
    scannedAt: '2026-07-25T00:00:00Z',
    points: createMockGridPoints(40.7484, -73.9857, 7, 3.5),
  },
  {
    id: 'scan-miami-jul26',
    keywordTerm: 'medical spa miami beach',
    locationId: 'loc-4',
    gridSize: '5x5',
    radiusMiles: 2.5,
    centerLat: 25.7907,
    centerLng: -80.141,
    averageRank: 2.4,
    shareOfLocalVoice: 76,
    volatilityScore: 1.5,
    projectedTrend: +2.0,
    scannedAt: '2026-07-26T00:00:00Z',
    points: createMockGridPoints(25.7907, -80.141, 5, 2.5),
  },
  {
    id: 'scan-la-jul27',
    keywordTerm: 'auto detailing los angeles',
    locationId: 'loc-5',
    gridSize: '7x7',
    radiusMiles: 4.0,
    centerLat: 34.0652,
    centerLng: -118.3742,
    averageRank: 3.1,
    shareOfLocalVoice: 71,
    volatilityScore: 2.1,
    projectedTrend: +1.8,
    scannedAt: '2026-07-27T00:00:00Z',
    points: createMockGridPoints(34.0652, -118.3742, 7, 4.0),
  },
  {
    id: 'scan-chicago-jul27',
    keywordTerm: 'personal injury lawyer chicago loop',
    locationId: 'loc-6',
    gridSize: '9x9',
    radiusMiles: 5.0,
    centerLat: 41.8791,
    centerLng: -87.6366,
    averageRank: 2.1,
    shareOfLocalVoice: 82,
    volatilityScore: 1.4,
    projectedTrend: +2.5,
    scannedAt: '2026-07-27T12:00:00Z',
    points: createMockGridPoints(41.8791, -87.6366, 9, 5.0),
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
    domainAuthority: 42,
    backlinkCount: 1240,
    organicTraffic: 2800,
    citationCount: 44,
    locationId: 'loc-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'comp-2',
    name: 'West Lake Hills Dental Pack',
    address: '3801 Bee Cave Rd, Austin, TX 78746',
    category: 'Dentist',
    rating: 4.7,
    reviewCount: 198,
    photoCount: 22,
    postFrequencyPerMonth: 2,
    shareOfLocalVoice: 54,
    domainAuthority: 32,
    backlinkCount: 650,
    organicTraffic: 1450,
    citationCount: 36,
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
    platform: 'Google',
    rating: 5,
    reviewerName: 'Emily Vance',
    text: 'Dr. Johnson provided the best dental cleaning! Extremely professional staff.',
    sentiment: 'POSITIVE',
    replyStatus: 'REPLIED',
    replyText: 'Thank you Emily! We love having you as a patient.',
    locationId: 'loc-1',
    createdAt: '2026-07-18T14:30:00Z',
  },
  {
    id: 'rev-2',
    platform: 'Yelp',
    rating: 1,
    reviewerName: 'John Doe (Anonymous)',
    text: 'Worst place ever! The clinic smells bad and doctor was very rude! (Note: Reviewer account has 0 past reviews and was created today).',
    sentiment: 'NEGATIVE',
    replyStatus: 'UNANSWERED',
    isFakeDetected: true,
    locationId: 'loc-1',
    createdAt: '2026-07-20T09:15:00Z',
  },
  {
    id: 'rev-3',
    platform: 'Facebook',
    rating: 4,
    reviewerName: 'Marcus Aurelius',
    text: 'Highly recommend this local office. Very easy booking.',
    sentiment: 'POSITIVE',
    replyStatus: 'UNANSWERED',
    locationId: 'loc-1',
    createdAt: '2026-07-21T11:45:00Z',
  },
  {
    id: 'rev-4',
    platform: 'Trustpilot',
    rating: 5,
    reviewerName: 'Sarah Jenkins',
    text: 'Clean facilities and transparent pricing structure.',
    sentiment: 'POSITIVE',
    replyStatus: 'REPLIED',
    replyText: 'Thanks Sarah, transparency is our core value.',
    locationId: 'loc-1',
    createdAt: '2026-07-22T08:00:00Z',
  },
  {
    id: 'rev-5',
    platform: 'TripAdvisor',
    rating: 3,
    reviewerName: 'David Miller',
    text: 'Decent service, but the waiting room was a bit crowded.',
    sentiment: 'NEUTRAL',
    replyStatus: 'UNANSWERED',
    locationId: 'loc-1',
    createdAt: '2026-07-22T15:20:00Z',
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
  // Location 1 (loc-1)
  {
    id: 'auto-1',
    name: 'Scheduled Site Audits',
    description: 'Crawl landing pages for heading status, schema validations, and link health.',
    frequency: 'WEEKLY',
    status: 'ACTIVE',
    lastRun: '2026-07-22T08:00:00Z',
    locationId: 'loc-1',
  },
  {
    id: 'auto-2',
    name: 'Citation Consistency Monitoring',
    description: 'Audit directory profile lists for NAP conflicts or duplicate listings.',
    frequency: 'DAILY',
    status: 'ACTIVE',
    lastRun: '2026-07-23T01:00:00Z',
    locationId: 'loc-1',
  },
  {
    id: 'auto-3',
    name: 'AI Review Replies Broadcast',
    description: 'Automatically publish AI-generated replies to new positive reviews.',
    frequency: 'DAILY',
    status: 'PAUSED',
    lastRun: '2026-07-23T02:00:00Z',
    locationId: 'loc-1',
  },
  {
    id: 'auto-4',
    name: 'Keyword Tracking Rank Checks',
    description: 'Query search engine local pack positions and log volatility index.',
    frequency: 'DAILY',
    status: 'ACTIVE',
    lastRun: '2026-07-23T00:00:00Z',
    locationId: 'loc-1',
  },
  {
    id: 'auto-5',
    name: 'Competitor Change Monitoring',
    description: 'Scan rival search visibility shifts and review volume speed updates.',
    frequency: 'WEEKLY',
    status: 'PAUSED',
    lastRun: '2026-07-20T12:00:00Z',
    locationId: 'loc-1',
  },
  {
    id: 'auto-6',
    name: 'GBP Posting Campaign Scheduler',
    description: 'Automatically schedule promotional discount posts on active profiles.',
    frequency: 'WEEKLY',
    status: 'ACTIVE',
    lastRun: '2026-07-21T09:00:00Z',
    locationId: 'loc-1',
  },
  {
    id: 'auto-7',
    name: 'Reports Compilation & Export',
    description: 'Generate white-label PDF/CSV dashboards and email to client lists.',
    frequency: 'MONTHLY',
    status: 'ACTIVE',
    lastRun: '2026-07-01T00:00:00Z',
    locationId: 'loc-1',
  },
  {
    id: 'auto-8',
    name: 'Alerts & GBP Suspension Notifications',
    description: 'Send high-priority warnings via SMTP/Slack if profile health drops.',
    frequency: 'DAILY',
    status: 'ACTIVE',
    lastRun: '2026-07-23T02:15:00Z',
    locationId: 'loc-1',
  },

  // Location 2 (loc-2)
  {
    id: 'auto-1',
    name: 'Scheduled Site Audits',
    description: 'Crawl landing pages for heading status, schema validations, and link health.',
    frequency: 'WEEKLY',
    status: 'ACTIVE',
    lastRun: '2026-07-22T08:00:00Z',
    locationId: 'loc-2',
  },
  {
    id: 'auto-2',
    name: 'Citation Consistency Monitoring',
    description: 'Audit directory profile lists for NAP conflicts or duplicate listings.',
    frequency: 'DAILY',
    status: 'ACTIVE',
    lastRun: '2026-07-23T01:00:00Z',
    locationId: 'loc-2',
  },
  {
    id: 'auto-3',
    name: 'AI Review Replies Broadcast',
    description: 'Automatically publish AI-generated replies to new positive reviews.',
    frequency: 'DAILY',
    status: 'PAUSED',
    lastRun: '2026-07-23T02:00:00Z',
    locationId: 'loc-2',
  },
  {
    id: 'auto-4',
    name: 'Keyword Tracking Rank Checks',
    description: 'Query search engine local pack positions and log volatility index.',
    frequency: 'DAILY',
    status: 'ACTIVE',
    lastRun: '2026-07-23T00:00:00Z',
    locationId: 'loc-2',
  },
  {
    id: 'auto-5',
    name: 'Competitor Change Monitoring',
    description: 'Scan rival search visibility shifts and review volume speed updates.',
    frequency: 'WEEKLY',
    status: 'PAUSED',
    lastRun: '2026-07-20T12:00:00Z',
    locationId: 'loc-2',
  },
  {
    id: 'auto-6',
    name: 'GBP Posting Campaign Scheduler',
    description: 'Automatically schedule promotional discount posts on active profiles.',
    frequency: 'WEEKLY',
    status: 'ACTIVE',
    lastRun: '2026-07-21T09:00:00Z',
    locationId: 'loc-2',
  },
  {
    id: 'auto-7',
    name: 'Reports Compilation & Export',
    description: 'Generate white-label PDF/CSV dashboards and email to client lists.',
    frequency: 'MONTHLY',
    status: 'ACTIVE',
    lastRun: '2026-07-01T00:00:00Z',
    locationId: 'loc-2',
  },
  {
    id: 'auto-8',
    name: 'Alerts & GBP Suspension Notifications',
    description: 'Send high-priority warnings via SMTP/Slack if profile health drops.',
    frequency: 'DAILY',
    status: 'ACTIVE',
    lastRun: '2026-07-23T02:15:00Z',
    locationId: 'loc-2',
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

import { AiPrompt, AuditLog } from './types';

export const INITIAL_AI_PROMPTS: AiPrompt[] = [
  {
    id: 'prompt-reply',
    name: 'Review Reply Assistant',
    description: 'Generates polite, professional responses to customer reviews incorporating local search keywords.',
    template: 'You are a customer relationship assistant for {businessName}. Draft a warm, professional response to a {rating}-star review from {reviewerName} containing feedback: "{reviewText}". Incorporate localized SEO phrases when natural, but prioritize customer service. Keep it concise.',
    lastUpdated: '2026-07-15T12:00:00Z'
  },
  {
    id: 'prompt-diag',
    name: 'SEO Diagnostic Analyst',
    description: 'Analyzes citation errors, ranking drops, and site speed to draft actionable step-by-step optimization recommendations.',
    template: 'Analyze the following business metrics for {businessName}: Citations NAP Accuracy: {citationScore}%, Unanswered Reviews: {unansweredReviews}, PageSpeed Score: {pageSpeedScore}. Outline the top 3 highest impact recommendations with estimated time limits.',
    lastUpdated: '2026-07-18T15:30:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-23T19:40:00Z',
    userId: 'usr-1',
    userName: 'Alex Rivera',
    action: 'USER_LOGIN',
    details: 'Successful login. Session initialized with JWT token authorization.',
    ipAddress: '192.168.1.45'
  },
  {
    id: 'log-2',
    timestamp: '2026-07-23T20:15:00Z',
    userId: 'usr-1',
    userName: 'Alex Rivera',
    action: 'CONNECT_INTEGRATION',
    details: 'Connected Google Business Profile for "Downtown Dental - Central Austin" (loc-1).',
    ipAddress: '192.168.1.45'
  },
  {
    id: 'log-3',
    timestamp: '2026-07-23T20:45:00Z',
    userId: 'usr-1',
    userName: 'Alex Rivera',
    action: 'SECURITY_CHECK',
    details: 'API credentials rotated for organization "Apex Local Marketing Agency" (org-agency-1).',
    ipAddress: '192.168.1.45'
  }
];

