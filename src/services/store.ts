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
  IntegrationConnector,
  AuditLog,
  AiPrompt,
  User,
} from '@/lib/types';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_LOCATIONS,
  INITIAL_KEYWORDS,
  INITIAL_SNAPSHOTS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_CITATIONS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_GEO_SCANS,
  INITIAL_COMPETITORS,
  INITIAL_WEBSITE_AUDITS,
  INITIAL_AUTOMATIONS,
  INITIAL_API_KEYS,
  INITIAL_WEBHOOKS,
  INITIAL_WHITE_LABEL,
  INITIAL_CITATION_SUBMISSIONS,
  INITIAL_REVIEW_CAMPAIGNS,
  INITIAL_DUPLICATE_LISTINGS,
  INITIAL_AI_PROMPTS,
  INITIAL_AUDIT_LOGS,
} from '@/lib/mock-data';

const STORAGE_KEYS = {
  ORGS: 'seo_os_orgs',
  ACTIVE_ORG: 'seo_os_active_org_id',
  LOCATIONS: 'seo_os_locations',
  KEYWORDS: 'seo_os_keywords',
  SNAPSHOTS: 'seo_os_snapshots',
  RECOMMENDATIONS: 'seo_os_recommendations',
  CITATIONS: 'seo_os_citations',
  REVIEWS: 'seo_os_reviews',
  NOTIFICATIONS: 'seo_os_notifications',
  GEO_SCANS: 'seo_os_geo_scans',
  COMPETITORS: 'seo_os_competitors',
  WEBSITE_AUDITS: 'seo_os_website_audits',
  AUTOMATIONS: 'seo_os_automations',
  API_KEYS: 'seo_os_api_keys',
  WEBHOOKS: 'seo_os_webhooks',
  WHITE_LABEL: 'seo_os_white_label',
  CITATION_SUBMISSIONS: 'seo_os_citation_submissions',
  REVIEW_CAMPAIGNS: 'seo_os_review_campaigns',
  DUPLICATES: 'seo_os_duplicates',
  INTEGRATIONS: 'seo_os_integrations',
  AUDIT_LOGS: 'seo_os_audit_logs',
  AI_PROMPTS: 'seo_os_ai_prompts',
};

const memCache: Record<string, any> = {};

function getStored<T>(key: string, fallback: T): T {
  if (key in memCache) {
    return memCache[key];
  }

  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    const parsed = item ? JSON.parse(item) : fallback;
    memCache[key] = parsed;
    return parsed;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  memCache[key] = value;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

export class AppStore {
  static getOrganizations(): Organization[] {
    return getStored(STORAGE_KEYS.ORGS, INITIAL_ORGANIZATIONS);
  }

  static getOrganization(id: string): Organization | null {
    const orgs = this.getOrganizations();
    return orgs.find((o) => o.id === id) || null;
  }

  static saveOrganization(org: Organization): Organization {
    const orgs = this.getOrganizations();
    const index = orgs.findIndex((o) => o.id === org.id);
    if (index >= 0) orgs[index] = org;
    else orgs.push(org);
    setStored(STORAGE_KEYS.ORGS, orgs);
    return org;
  }

  static getActiveOrgId(): string {
    return getStored(STORAGE_KEYS.ACTIVE_ORG, INITIAL_ORGANIZATIONS[0].id);
  }

  static setActiveOrgId(id: string): void {
    setStored(STORAGE_KEYS.ACTIVE_ORG, id);
  }

  static getLocations(orgId?: string): Location[] {
    const all = getStored(STORAGE_KEYS.LOCATIONS, INITIAL_LOCATIONS);
    if (!orgId) return all;
    return all.filter((loc) => loc.organizationId === orgId);
  }

  static saveLocation(location: Location): Location {
    const all = this.getLocations();
    const index = all.findIndex((l) => l.id === location.id);
    if (index >= 0) all[index] = location;
    else all.push(location);
    setStored(STORAGE_KEYS.LOCATIONS, all);
    return location;
  }

  static deleteLocation(id: string): void {
    const all = this.getLocations();
    const filtered = all.filter((l) => l.id !== id);
    setStored(STORAGE_KEYS.LOCATIONS, filtered);
  }

  static getKeywords(locationId?: string): Keyword[] {
    const all = getStored(STORAGE_KEYS.KEYWORDS, INITIAL_KEYWORDS);
    if (!locationId) return all;
    return all.filter((kw) => kw.locationId === locationId);
  }

  static saveKeyword(keyword: Keyword): Keyword {
    const all = this.getKeywords();
    const index = all.findIndex((k) => k.id === keyword.id);
    if (index >= 0) all[index] = keyword;
    else all.push(keyword);
    setStored(STORAGE_KEYS.KEYWORDS, all);
    return keyword;
  }

  static getSnapshots(locationId?: string): RankingSnapshot[] {
    const all = getStored(STORAGE_KEYS.SNAPSHOTS, INITIAL_SNAPSHOTS);
    if (!locationId) return all;
    return all.filter((snap) => snap.locationId === locationId);
  }

  static saveSnapshot(snapshot: RankingSnapshot): RankingSnapshot {
    const all = getStored(STORAGE_KEYS.SNAPSHOTS, INITIAL_SNAPSHOTS);
    all.push(snapshot);
    setStored(STORAGE_KEYS.SNAPSHOTS, all);
    return snapshot;
  }

  static getRecommendations(orgId?: string, locationId?: string): Recommendation[] {
    const all = getStored(STORAGE_KEYS.RECOMMENDATIONS, INITIAL_RECOMMENDATIONS);
    return all.filter((rec) => {
      if (orgId && rec.organizationId !== orgId) return false;
      if (locationId && rec.locationId !== locationId) return false;
      return true;
    });
  }

  static saveRecommendation(recommendation: Recommendation): Recommendation {
    const all = getStored(STORAGE_KEYS.RECOMMENDATIONS, INITIAL_RECOMMENDATIONS);
    const index = all.findIndex((r) => r.id === recommendation.id);
    if (index >= 0) all[index] = recommendation;
    else all.unshift(recommendation);
    setStored(STORAGE_KEYS.RECOMMENDATIONS, all);
    return recommendation;
  }

  static updateRecommendationStatus(id: string, status: Recommendation['status']): void {
    const all = getStored(STORAGE_KEYS.RECOMMENDATIONS, INITIAL_RECOMMENDATIONS);
    const item = all.find((r) => r.id === id);
    if (item) {
      item.status = status;
      setStored(STORAGE_KEYS.RECOMMENDATIONS, all);
    }
  }

  static getCitations(locationId?: string): Citation[] {
    const all = getStored(STORAGE_KEYS.CITATIONS, INITIAL_CITATIONS);
    if (!locationId) return all;
    return all.filter((c) => c.locationId === locationId);
  }

  static saveCitation(citation: Citation): Citation {
    const all = getStored(STORAGE_KEYS.CITATIONS, INITIAL_CITATIONS);
    const index = all.findIndex((c) => c.id === citation.id);
    if (index >= 0) all[index] = citation;
    else all.push(citation);
    setStored(STORAGE_KEYS.CITATIONS, all);
    return citation;
  }

  static getReviews(locationId?: string): Review[] {
    const all = getStored(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    if (!locationId) return all;
    return all.filter((r) => r.locationId === locationId);
  }

  static saveReview(review: Review): Review {
    const all = getStored(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const index = all.findIndex((r) => r.id === review.id);
    if (index >= 0) all[index] = review;
    else all.unshift(review);
    setStored(STORAGE_KEYS.REVIEWS, all);
    return review;
  }

  static saveReviewReply(reviewId: string, replyText: string): Review | null {
    const all = getStored(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const item = all.find((r) => r.id === reviewId);
    if (item) {
      item.replyStatus = 'REPLIED';
      item.replyText = replyText;
      setStored(STORAGE_KEYS.REVIEWS, all);
      return item;
    }
    return null;
  }

  static getNotifications(orgId?: string): NotificationItem[] {
    const all = getStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!orgId) return all;
    return all.filter((n) => n.organizationId === orgId);
  }

  static saveNotification(notification: NotificationItem): NotificationItem {
    const all = getStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    all.unshift(notification);
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    return notification;
  }

  static markNotificationRead(id: string): void {
    const all = getStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const item = all.find((n) => n.id === id);
    if (item) {
      item.read = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  }

  static getGeoScans(locationId?: string): GeoGridScan[] {
    const all = getStored(STORAGE_KEYS.GEO_SCANS, INITIAL_GEO_SCANS);
    if (!locationId) return all;
    return all.filter((s) => s.locationId === locationId);
  }

  static saveGeoScan(scan: GeoGridScan): GeoGridScan {
    const all = getStored(STORAGE_KEYS.GEO_SCANS, INITIAL_GEO_SCANS);
    all.unshift(scan);
    setStored(STORAGE_KEYS.GEO_SCANS, all);
    return scan;
  }

  static getCompetitors(locationId?: string): CompetitorMetric[] {
    const all = getStored(STORAGE_KEYS.COMPETITORS, INITIAL_COMPETITORS);
    if (!locationId) return all;
    return all.filter((c) => c.locationId === locationId);
  }

  static saveCompetitor(competitor: CompetitorMetric): CompetitorMetric {
    const all = getStored(STORAGE_KEYS.COMPETITORS, INITIAL_COMPETITORS);
    const index = all.findIndex((c) => c.id === competitor.id);
    if (index >= 0) all[index] = competitor;
    else all.push(competitor);
    setStored(STORAGE_KEYS.COMPETITORS, all);
    return competitor;
  }

  static getWebsiteAudit(locationId?: string): WebsiteAuditResult | null {
    const all = getStored(STORAGE_KEYS.WEBSITE_AUDITS, INITIAL_WEBSITE_AUDITS);
    if (!locationId) return all[0] || null;
    return all.find((a) => a.locationId === locationId) || null;
  }

  static saveWebsiteAudit(audit: WebsiteAuditResult): WebsiteAuditResult {
    const all = getStored(STORAGE_KEYS.WEBSITE_AUDITS, INITIAL_WEBSITE_AUDITS);
    const index = all.findIndex((a) => a.locationId === audit.locationId);
    if (index >= 0) all[index] = audit;
    else all.push(audit);
    setStored(STORAGE_KEYS.WEBSITE_AUDITS, all);
    return audit;
  }

  static getAutomations(locationId?: string): AutomationRule[] {
    const all = getStored(STORAGE_KEYS.AUTOMATIONS, INITIAL_AUTOMATIONS);
    if (!locationId) return all;
    return all.filter((a) => a.locationId === locationId);
  }

  static toggleAutomation(id: string): void {
    const all = getStored(STORAGE_KEYS.AUTOMATIONS, INITIAL_AUTOMATIONS);
    const item = all.find((a) => a.id === id);
    if (item) {
      item.status = item.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      setStored(STORAGE_KEYS.AUTOMATIONS, all);
    }
  }

  static getApiKeys(orgId?: string): ApiKey[] {
    const all = getStored(STORAGE_KEYS.API_KEYS, INITIAL_API_KEYS);
    if (!orgId) return all;
    return all.filter((k) => k.organizationId === orgId);
  }

  static saveApiKey(key: ApiKey): ApiKey {
    const all = getStored(STORAGE_KEYS.API_KEYS, INITIAL_API_KEYS);
    all.unshift(key);
    setStored(STORAGE_KEYS.API_KEYS, all);
    return key;
  }

  static getWhiteLabel(orgId?: string): WhiteLabelSettings {
    return getStored(STORAGE_KEYS.WHITE_LABEL, INITIAL_WHITE_LABEL);
  }

  static saveWhiteLabel(settings: WhiteLabelSettings): WhiteLabelSettings {
    setStored(STORAGE_KEYS.WHITE_LABEL, settings);
    return settings;
  }

  // Citation Submissions (BrightLocal feature)
  static getCitationSubmissions(locationId?: string): CitationSubmission[] {
    const all = getStored(STORAGE_KEYS.CITATION_SUBMISSIONS, INITIAL_CITATION_SUBMISSIONS);
    if (!locationId) return all;
    return all.filter((s) => s.locationId === locationId);
  }

  static saveCitationSubmission(sub: CitationSubmission): CitationSubmission {
    const all = getStored(STORAGE_KEYS.CITATION_SUBMISSIONS, INITIAL_CITATION_SUBMISSIONS);
    const index = all.findIndex((s) => s.id === sub.id);
    if (index >= 0) all[index] = sub;
    else all.unshift(sub);
    setStored(STORAGE_KEYS.CITATION_SUBMISSIONS, all);
    return sub;
  }

  // Review Campaigns (Whitespark feature)
  static getReviewCampaigns(locationId?: string): ReviewCampaign[] {
    const all = getStored(STORAGE_KEYS.REVIEW_CAMPAIGNS, INITIAL_REVIEW_CAMPAIGNS);
    if (!locationId) return all;
    return all.filter((c) => c.locationId === locationId);
  }

  static saveReviewCampaign(camp: ReviewCampaign): ReviewCampaign {
    const all = getStored(STORAGE_KEYS.REVIEW_CAMPAIGNS, INITIAL_REVIEW_CAMPAIGNS);
    const index = all.findIndex((c) => c.id === camp.id);
    if (index >= 0) all[index] = camp;
    else all.unshift(camp);
    setStored(STORAGE_KEYS.REVIEW_CAMPAIGNS, all);
    return camp;
  }

  // Duplicate Listings (Moz Local feature)
  static getDuplicateListings(locationId?: string): DuplicateListing[] {
    const all = getStored(STORAGE_KEYS.DUPLICATES, INITIAL_DUPLICATE_LISTINGS);
    if (!locationId) return all;
    return all.filter((d) => d.locationId === locationId);
  }

  static suppressDuplicate(id: string): void {
    const all = getStored(STORAGE_KEYS.DUPLICATES, INITIAL_DUPLICATE_LISTINGS);
    const item = all.find((d) => d.id === id);
    if (item) {
      item.suppressionStatus = 'SUPPRESSED';
      setStored(STORAGE_KEYS.DUPLICATES, all);
    }
  }

  // Users Management (nested inside Orgs)
  static getUsers(orgId?: string): User[] {
    const orgs = this.getOrganizations();
    if (orgId) {
      const org = orgs.find((o) => o.id === orgId);
      return org ? org.users || [] : [];
    }
    const allUsers: User[] = [];
    orgs.forEach((o) => {
      if (o.users) {
        allUsers.push(...o.users);
      }
    });
    return allUsers;
  }

  static saveUser(user: User): User {
    const orgs = this.getOrganizations();
    const org = orgs.find((o) => o.id === user.organizationId);
    if (org) {
      if (!org.users) org.users = [];
      const idx = org.users.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        org.users[idx] = user;
      } else {
        org.users.push(user);
      }
      setStored(STORAGE_KEYS.ORGS, orgs);
    }
    return user;
  }

  static deleteUser(id: string): void {
    const orgs = this.getOrganizations();
    orgs.forEach((org) => {
      if (org.users) {
        const filtered = org.users.filter((u) => u.id !== id);
        if (filtered.length !== org.users.length) {
          org.users = filtered;
        }
      }
    });
    setStored(STORAGE_KEYS.ORGS, orgs);
  }

  // Integrations Connectors
  static getIntegrations(locationId: string): IntegrationConnector[] {
    const all = getStored<IntegrationConnector[]>(STORAGE_KEYS.INTEGRATIONS, []);
    const filtered = all.filter((i) => i.locationId === locationId);
    if (filtered.length === 0) {
      const defaults: IntegrationConnector[] = [
        { name: 'Google Business Profile', category: 'Search & Maps', status: 'CONNECTED', lastSync: '10 mins ago', locationId },
        { name: 'Google Analytics', category: 'Search & Maps', status: 'CONNECTED', lastSync: '1 hour ago', locationId },
        { name: 'Google Search Console', category: 'Search & Maps', status: 'CONNECTED', lastSync: '1 hour ago', locationId },
        { name: 'Google Maps API', category: 'Search & Maps', status: 'CONNECTED', lastSync: 'Live', locationId },
        { name: 'Bing Places', category: 'Search & Maps', status: 'DISCONNECTED', locationId },
        { name: 'Apple Business Connect', category: 'Search & Maps', status: 'CONNECTED', lastSync: '1 day ago', locationId },
        { name: 'Facebook Graph API', category: 'Social & Reviews', status: 'CONNECTED', lastSync: '2 hours ago', locationId },
        { name: 'Yelp Fusion API', category: 'Social & Reviews', status: 'CONNECTED', lastSync: '5 mins ago', locationId },
        { name: 'Trustpilot API', category: 'Social & Reviews', status: 'DISCONNECTED', locationId },
        { name: 'Stripe Billing Connect', category: 'Payment', status: 'CONNECTED', lastSync: 'Real-time', locationId },
        { name: 'OpenAI (GPT-4o)', category: 'AI & CRM', status: 'CONNECTED', lastSync: 'Live', locationId },
        { name: 'Gemini 1.5 Pro', category: 'AI & CRM', status: 'CONNECTED', lastSync: 'Live', locationId },
        { name: 'HubSpot / Salesforce CRM', category: 'AI & CRM', status: 'DISCONNECTED', locationId },
      ];
      const updated = [...all, ...defaults];
      setStored(STORAGE_KEYS.INTEGRATIONS, updated);
      return defaults;
    }
    return filtered;
  }

  static saveIntegrations(locationId: string, integrations: IntegrationConnector[]): void {
    const all = getStored<IntegrationConnector[]>(STORAGE_KEYS.INTEGRATIONS, []);
    const filtered = all.filter((i) => i.locationId !== locationId);
    const updated = [...filtered, ...integrations];
    setStored(STORAGE_KEYS.INTEGRATIONS, updated);
  }

  // AI Prompts
  static getAiPrompts(): AiPrompt[] {
    return getStored<AiPrompt[]>(STORAGE_KEYS.AI_PROMPTS, INITIAL_AI_PROMPTS);
  }

  static saveAiPrompt(prompt: AiPrompt): AiPrompt {
    const all = this.getAiPrompts();
    const index = all.findIndex((p) => p.id === prompt.id);
    if (index >= 0) all[index] = prompt;
    else all.push(prompt);
    setStored(STORAGE_KEYS.AI_PROMPTS, all);
    return prompt;
  }

  // Security Audit Logs
  static getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  static saveAuditLog(log: AuditLog): AuditLog {
    const all = this.getAuditLogs();
    all.unshift(log);
    setStored(STORAGE_KEYS.AUDIT_LOGS, all);
    return log;
  }

  // Save/Update Automation Rule details
  static saveAutomationRule(locationId: string, rule: AutomationRule): AutomationRule {
    const all = getStored(STORAGE_KEYS.AUTOMATIONS, INITIAL_AUTOMATIONS);
    const index = all.findIndex((a) => a.id === rule.id && a.locationId === locationId);
    if (index >= 0) {
      all[index] = rule;
    } else {
      all.push(rule);
    }
    setStored(STORAGE_KEYS.AUTOMATIONS, all);
    return rule;
  }
}
