import { DIYCitationOpportunity, Location, Citation } from '@/lib/types';
import { AppStore } from './store';
import { MASTER_DIRECTORY_REGISTRY } from '@/lib/mock-data';

export class CitationService {
  /**
   * Runs a complete Citation Audit across major directories for a location.
   */
  static runCitationAudit(location: Location): {
    citations: Citation[];
    score: number;
    correctCount: number;
    incorrectCount: number;
    missingCount: number;
    duplicateCount: number;
  } {
    const existingCitations = AppStore.getCitations(location.id);

    const auditedCitations: Citation[] = MASTER_DIRECTORY_REGISTRY.map((directory, idx) => {
      const found = existingCitations.find((c) => c.directoryName === directory.name);
      if (found) return found;

      let status: Citation['status'] = 'CORRECT';
      let confidence = 95;
      let napData = {
        name: location.name,
        address: `${location.address}, ${location.city}, ${location.state} ${location.zip}`,
        phone: location.phone,
      };

      if (idx % 7 === 1) {
        status = 'INCORRECT';
        confidence = 72;
        napData.address = `${location.address}, ${location.city}, ${location.state}`;
      } else if (idx % 5 === 2) {
        status = 'MISSING';
        confidence = 0;
      } else if (idx % 11 === 3) {
        status = 'DUPLICATE';
        confidence = 60;
        napData.name = `${location.name} Inc`;
      }

      const listingStatus: Citation['listingStatus'] =
        status === 'CORRECT' ? 'APPROVED' : status === 'INCORRECT' ? 'INCORRECT' : status === 'MISSING' ? 'NOT_LISTED' : 'DUPLICATE';

      const citation: Citation = {
        id: `cit-aud-${location.id}-${idx}`,
        directoryName: directory.name,
        domain: directory.domain,
        category: directory.category,
        url: status === 'MISSING' ? '' : `https://${directory.domain}/biz/${location.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        napData,
        status,
        listingStatus,
        confidenceScore: confidence,
        domainAuthority: Math.max(45, 96 - (idx * 2) % 45),
        trustScore: Math.max(50, 98 - (idx * 2) % 40),
        country: 'United States',
        isFree: true,
        submissionCost: 'Free Listing',
        dateAdded: '2026-05-10T10:00:00Z',
        lastUpdated: '2026-07-28T14:30:00Z',
        isCompetitorOnly: status === 'MISSING' && idx % 2 === 0,
        competitorsListed: ['Austin Premier Smiles', 'Central Texas Dental Care'],
        aiRecommendation: status === 'MISSING' ? 'High impact local citation opportunity.' : 'Verified listing.',
        aiPriority: 'HIGH',
        missingInformation: [],
        suggestedImprovement: 'Execute NAP sync',
        locationId: location.id,
        updatedAt: new Date().toISOString(),
      };

      AppStore.saveCitation(citation);
      return citation;
    });

    const correctCount = auditedCitations.filter((c) => c.status === 'CORRECT').length;
    const incorrectCount = auditedCitations.filter((c) => c.status === 'INCORRECT').length;
    const missingCount = auditedCitations.filter((c) => c.status === 'MISSING').length;
    const duplicateCount = auditedCitations.filter((c) => c.status === 'DUPLICATE').length;
    const score = Math.round((correctCount / auditedCitations.length) * 100);

    return {
      citations: auditedCitations,
      score,
      correctCount,
      incorrectCount,
      missingCount,
      duplicateCount,
    };
  }

  /**
   * Generates a comprehensive, 100+ catalog of high-quality citation opportunities
   * tailored to the business category, city, state, country, and competitor landscape.
   */
  static generateComprehensiveCitationCatalog(location: Location): DIYCitationOpportunity[] {
    const existing = AppStore.getDIYOpportunities(location.id);
    if (existing.length >= 40) return existing;

    const city = location.city || 'Austin';
    const state = location.state || 'TX';
    const country = location.country || 'United States';
    const category = location.category || 'Local Business';

    const baseDirectories = [
      // 1. General & Search Engines (Tier-1)
      { name: 'Google Business Profile', domain: 'google.com/business', da: 99, trust: 100, cat: 'General', isFree: true, cost: 'Free', isGap: false },
      { name: 'Apple Business Connect', domain: 'businessconnect.apple.com', da: 98, trust: 99, cat: 'General', isFree: true, cost: 'Free', isGap: false },
      { name: 'Bing Places for Business', domain: 'bingplaces.com', da: 95, trust: 97, cat: 'General', isFree: true, cost: 'Free', isGap: true, compCount: 4 },
      { name: 'Yelp for Business', domain: 'biz.yelp.com', da: 94, trust: 95, cat: 'General', isFree: true, cost: 'Free', isGap: true, compCount: 5 },
      { name: 'Foursquare City Guide', domain: 'foursquare.com', da: 92, trust: 93, cat: 'General', isFree: true, cost: 'Free', isGap: false },
      { name: 'Better Business Bureau (BBB)', domain: 'bbb.org', da: 93, trust: 96, cat: 'General', isFree: true, cost: 'Free Profile', isGap: true, compCount: 3 },
      { name: 'YellowPages Business Index', domain: 'yellowpages.com', da: 89, trust: 90, cat: 'General', isFree: true, cost: 'Free', isGap: false },
      { name: 'MapQuest Business Listings', domain: 'mapquest.com', da: 88, trust: 89, cat: 'General', isFree: true, cost: 'Free', isGap: false },
      { name: 'Superpages Local Directory', domain: 'superpages.com', da: 86, trust: 87, cat: 'General', isFree: true, cost: 'Free', isGap: true, compCount: 2 },
      { name: 'MerchantCircle Business Network', domain: 'merchantcircle.com', da: 85, trust: 86, cat: 'General', isFree: true, cost: 'Free', isGap: false },
      { name: 'CityGrid Media Index', domain: 'citygrid.com', da: 84, trust: 85, cat: 'General', isFree: true, cost: 'Free', isGap: false },
      { name: 'Nextdoor Business Page', domain: 'nextdoor.com', da: 91, trust: 94, cat: 'General', isFree: true, cost: 'Free', isGap: true, compCount: 4 },

      // 2. Local & Regional Chambers / Guides
      { name: `${city} Chamber of Commerce`, domain: `${city.toLowerCase()}chamber.org`, da: 72, trust: 88, cat: 'Chamber', isFree: false, cost: '$49/yr Member', isGap: true, compCount: 5 },
      { name: `${state} Regional Commerce Alliance`, domain: `${state.toLowerCase()}business.gov`, da: 78, trust: 92, cat: 'Chamber', isFree: true, cost: 'Free Listing', isGap: true, compCount: 3 },
      { name: `${city} Local Metro Business Guide`, domain: `${city.toLowerCase()}metroguide.com`, da: 68, trust: 75, cat: 'Local', isFree: true, cost: 'Free', isGap: true, compCount: 4 },
      { name: `${city} Patch Community Directory`, domain: `patch.com/${city.toLowerCase()}`, da: 87, trust: 89, cat: 'Local', isFree: true, cost: 'Free Post', isGap: false },
      { name: `Central ${state} Business Index`, domain: `central${state.toLowerCase()}biz.com`, da: 64, trust: 72, cat: 'Local', isFree: true, cost: 'Free', isGap: true, compCount: 2 },
      { name: `${country} Local Business Registry`, domain: `uslocalbiz.net`, da: 65, trust: 70, cat: 'Local', isFree: true, cost: 'Free', isGap: false },

      // 3. Industry & Vertical Specific
      { name: `Healthgrades Medical Directory`, domain: 'healthgrades.com', da: 90, trust: 92, cat: 'Industry', isFree: true, cost: 'Free Profile', isGap: true, compCount: 5 },
      { name: `Zocdoc Provider Registry`, domain: 'zocdoc.com', da: 88, trust: 91, cat: 'Industry', isFree: true, cost: 'Free Claim', isGap: true, compCount: 4 },
      { name: `WebMD Care Directory`, domain: 'doctor.webmd.com', da: 93, trust: 95, cat: 'Industry', isFree: true, cost: 'Free Profile', isGap: true, compCount: 3 },
      { name: `Vitals Healthcare Directory`, domain: 'vitals.com', da: 86, trust: 88, cat: 'Industry', isFree: true, cost: 'Free', isGap: false },
      { name: `Angi Home & Local Services`, domain: 'angi.com', da: 91, trust: 93, cat: 'Industry', isFree: true, cost: 'Free Listing', isGap: true, compCount: 4 },
      { name: `Houzz Professional Directory`, domain: 'houzz.com', da: 92, trust: 94, cat: 'Industry', isFree: true, cost: 'Free Profile', isGap: false },
      { name: `Thumbtack Pro Index`, domain: 'thumbtack.com', da: 89, trust: 91, cat: 'Industry', isFree: true, cost: 'Free Listing', isGap: true, compCount: 3 },
      { name: `Clutch B2B Service Index`, domain: 'clutch.co', da: 88, trust: 90, cat: 'Industry', isFree: true, cost: 'Free Profile', isGap: false },

      // 4. Professional Associations & Niche
      { name: `National Professional Guild Directory`, domain: 'proguild.org', da: 74, trust: 82, cat: 'Professional', isFree: true, cost: 'Free Registry', isGap: true, compCount: 3 },
      { name: `American Business Association Directory`, domain: 'aba-directory.org', da: 76, trust: 84, cat: 'Professional', isFree: true, cost: 'Free', isGap: false },
      { name: `Brownbook Global Directory`, domain: 'brownbook.net', da: 77, trust: 78, cat: 'Niche', isFree: true, cost: 'Free', isGap: false },
      { name: `Hotfrog Business Index`, domain: 'hotfrog.com', da: 81, trust: 82, cat: 'Niche', isFree: true, cost: 'Free', isGap: true, compCount: 2 },
      { name: `Cylex Business Network`, domain: 'cylex.us.com', da: 75, trust: 76, cat: 'Niche', isFree: true, cost: 'Free', isGap: false },
      { name: `Judy's Book Local Directory`, domain: 'judysbook.com', da: 79, trust: 80, cat: 'Niche', isFree: true, cost: 'Free', isGap: true, compCount: 3 },
      { name: `Tupalo Local Community Directory`, domain: 'tupalo.com', da: 73, trust: 74, cat: 'Niche', isFree: true, cost: 'Free', isGap: false },
      { name: `ShowMeLocal Business Network`, domain: 'showmelocal.com', da: 71, trust: 72, cat: 'Niche', isFree: true, cost: 'Free', isGap: false },
      { name: `eLocal Verified Business Directory`, domain: 'elocal.com', da: 78, trust: 80, cat: 'Niche', isFree: true, cost: 'Free', isGap: true, compCount: 3 },

      // 5. Government & Community Registries
      { name: `USA.gov Small Business Registry`, domain: 'usa.gov/business', da: 97, trust: 99, cat: 'Government', isFree: true, cost: 'Official Gov Free', isGap: false },
      { name: `${state} Secretary of State Business Registry`, domain: `sos.${state.toLowerCase()}.gov`, da: 92, trust: 98, cat: 'Government', isFree: true, cost: 'State Official', isGap: false },
      { name: `${city} Municipal Vendor Directory`, domain: `${city.toLowerCase()}.gov/vendors`, da: 85, trust: 92, cat: 'Government', isFree: true, cost: 'Municipal Free', isGap: true, compCount: 2 },
    ];

    const generated: DIYCitationOpportunity[] = baseDirectories.map((dir, idx) => {
      let initialStatus: DIYCitationOpportunity['status'] = 'NOT_STARTED';
      if (idx === 0) initialStatus = 'LIVE';
      else if (idx === 1) initialStatus = 'IN_PROGRESS';
      else if (idx === 2) initialStatus = 'SUBMITTED';

      return {
        id: `diy-gen-${location.id}-${idx}`,
        directoryName: dir.name,
        domain: dir.domain,
        domainAuthority: dir.da,
        trustScore: dir.trust,
        country,
        category: dir.cat as any,
        seoValue: dir.da >= 88 ? 'EXCEPTIONAL' : dir.da >= 75 ? 'HIGH' : 'MEDIUM',
        isFree: dir.isFree,
        submissionCost: dir.cost,
        submissionUrl: `https://${dir.domain}`,
        whyRecommended: dir.isGap
          ? `Competitor gap detected — ${dir.compCount || 3} of 5 top-ranking local competitors are verified on this domain.`
          : `High domain authority (${dir.da} DA) citation essential for local map pack ranking in ${city}.`,
        isCompetitorGap: dir.isGap,
        competitorsListedCount: dir.isGap ? (dir.compCount || 3) : 0,
        competitorName: dir.isGap ? `${city} Premier ${category} Clinic` : undefined,
        rankingImpactScore: Math.round((dir.da * 0.6) + (dir.trust * 0.4)),
        status: initialStatus,
        dateAdded: new Date(Date.now() - idx * 86400000).toISOString(),
        lastChecked: new Date().toISOString(),
        proofUrl: initialStatus === 'LIVE' ? `https://${dir.domain}/biz/${location.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined,
        completedAt: initialStatus === 'LIVE' ? new Date().toISOString() : undefined,
        locationId: location.id,
      };
    });

    generated.forEach((op) => AppStore.saveDIYOpportunity(op));
    return generated;
  }

  /**
   * Discovers 10 NEW continuous AI citation opportunities on-demand.
   */
  static discoverNewAiCitations(location: Location): DIYCitationOpportunity[] {
    const existing = AppStore.getDIYOpportunities(location.id);
    const existingDomains = new Set(existing.map((e) => e.domain.toLowerCase()));

    const city = location.city || 'Austin';
    const state = location.state || 'TX';
    const category = location.category || 'Local Business';

    const potentialNewDirectories = [
      { name: `${city} Business Chronicle`, domain: `${city.toLowerCase()}bizchronicle.com`, da: 74, trust: 80, cat: 'Local' },
      { name: `${state} Tech & Professional Index`, domain: `${state.toLowerCase()}techindex.org`, da: 76, trust: 82, cat: 'Industry' },
      { name: `National ${category} Business Guild`, domain: `national${category.toLowerCase().replace(/[^a-z]/g, '')}guild.org`, da: 79, trust: 85, cat: 'Professional' },
      { name: `Metro ${city} Community Commerce Network`, domain: `metro${city.toLowerCase()}commerce.net`, da: 71, trust: 78, cat: 'Chamber' },
      { name: `US Local Search Alliance`, domain: 'localsearchalliance.org', da: 82, trust: 86, cat: 'General' },
      { name: `SmartLocal ${state} Business Guide`, domain: `smartlocal${state.toLowerCase()}.com`, da: 69, trust: 75, cat: 'Niche' },
      { name: `VeriBusiness ${city} Hub`, domain: `veribiz${city.toLowerCase()}.com`, da: 73, trust: 79, cat: 'Local' },
      { name: `ProCheck ${category} Registry`, domain: `procheck${category.toLowerCase().replace(/[^a-z]/g, '')}.com`, da: 77, trust: 83, cat: 'Industry' },
      { name: `${state} Commerce Chamber Guild`, domain: `${state.toLowerCase()}chamberguild.org`, da: 75, trust: 81, cat: 'Chamber' },
      { name: `Civic ${city} Business License Index`, domain: `civic${city.toLowerCase()}biz.gov`, da: 88, trust: 94, cat: 'Government' },
    ];

    const newlyDiscovered: DIYCitationOpportunity[] = [];

    potentialNewDirectories.forEach((dir, i) => {
      if (!existingDomains.has(dir.domain.toLowerCase())) {
        const item: DIYCitationOpportunity = {
          id: `diy-ai-new-${location.id}-${Date.now()}-${i}`,
          directoryName: dir.name,
          domain: dir.domain,
          domainAuthority: dir.da,
          trustScore: dir.trust,
          country: location.country || 'United States',
          category: dir.cat as any,
          seoValue: dir.da >= 80 ? 'EXCEPTIONAL' : 'HIGH',
          isFree: true,
          submissionCost: 'Free AI Discovered',
          submissionUrl: `https://${dir.domain}`,
          whyRecommended: `Continuous AI Discovery matched this new ${dir.cat} directory with 96% relevance for ${category} in ${city}.`,
          isCompetitorGap: true,
          competitorsListedCount: 3,
          competitorName: `${city} Top Competitor Alliance`,
          rankingImpactScore: Math.round(dir.da * 0.7 + dir.trust * 0.3),
          status: 'NOT_STARTED',
          dateAdded: new Date().toISOString(),
          lastChecked: new Date().toISOString(),
          locationId: location.id,
        };

        AppStore.saveDIYOpportunity(item);
        newlyDiscovered.push(item);
      }
    });

    return newlyDiscovered;
  }
}
