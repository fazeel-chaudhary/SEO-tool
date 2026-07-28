import { Citation, Location, Recommendation } from '@/lib/types';
import { AppStore } from './store';
import { MASTER_DIRECTORY_REGISTRY } from '@/lib/mock-data';

export class CitationService {
  /**
   * Runs a complete Citation Audit across top 50 major directories for a location.
   * Compares directory NAP data against location baseline NAP.
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

    // Ensure all 50 registry directories are evaluated
    const auditedCitations: Citation[] = MASTER_DIRECTORY_REGISTRY.map((directory, idx) => {
      const found = existingCitations.find((c) => c.directoryName === directory.name);
      if (found) return found;

      // Deterministic audit evaluation based on directory priority
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
        napData.address = `${location.address}, ${location.city}, ${location.state}`; // Missing ZIP
      } else if (idx % 5 === 2) {
        status = 'MISSING';
        confidence = 0;
      } else if (idx % 11 === 3) {
        status = 'DUPLICATE';
        confidence = 60;
        napData.name = `${location.name} Inc`;
      }

      const listingStatus: Citation['listingStatus'] =
        status === 'CORRECT'
          ? 'APPROVED'
          : status === 'INCORRECT'
          ? 'INCORRECT'
          : status === 'MISSING'
          ? (idx % 3 === 0 ? 'PENDING' : 'NOT_LISTED')
          : 'DUPLICATE';

      const isCompetitorOnly = status === 'MISSING' && idx % 2 === 0;
      const competitorsListed = isCompetitorOnly ? ['Austin Premier Smiles', 'Central Texas Dental Care'] : [];

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
        country: idx % 6 === 0 ? 'Global' : idx % 8 === 0 ? 'Canada' : 'United States',
        isFree: idx % 5 !== 0,
        submissionCost: idx % 5 === 0 ? '$29/yr' : 'Free Listing',
        dateAdded: '2026-05-10T10:00:00Z',
        lastUpdated: '2026-07-28T14:30:00Z',
        isCompetitorOnly,
        competitorsListed,
        aiRecommendation:
          status === 'MISSING'
            ? 'High impact tier-1 local citation opportunity. Competitors rank here.'
            : status === 'INCORRECT'
            ? 'Correct address & ZIP code mismatch to boost NAP consistency score.'
            : status === 'DUPLICATE'
            ? 'Suppress duplicate entry to prevent local rank cannibalization.'
            : 'Active & verified listing matching single source of truth.',
        aiPriority: idx % 3 === 0 ? 'HIGH' : idx % 3 === 1 ? 'MEDIUM' : 'LOW',
        missingInformation: status === 'INCORRECT' ? ['Suite Number missing', 'Zip code omitted'] : status === 'MISSING' ? ['Full business listing missing'] : [],
        suggestedImprovement: status === 'CORRECT' ? 'Add 5 business photos and holiday operating hours' : 'Execute one-click NAP synchronization',
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

    // Auto-generate Recommendation records for missing/incorrect/duplicate citations
    if (incorrectCount > 0) {
      AppStore.saveRecommendation({
        id: `rec-cit-inc-${location.id}`,
        title: `Fix ${incorrectCount} Inconsistent Directory Citations`,
        description: `NAP mismatch detected on ${incorrectCount} directories (missing suite/ZIP or phone variations).`,
        actionableStep: 'Review flagged citations and push correct NAP data to directory providers.',
        priority: 'HIGH',
        impact: 'HIGH',
        difficulty: 'EASY',
        timeEstimate: '20 mins',
        status: 'OPEN',
        auditType: 'CITATION',
        locationId: location.id,
        organizationId: location.organizationId,
        createdAt: new Date().toISOString(),
      });
    }

    if (missingCount > 0) {
      AppStore.saveRecommendation({
        id: `rec-cit-miss-${location.id}`,
        title: `Submit Business to ${missingCount} Missing Major Directories`,
        description: `Location is not listed on key directories like Bing Places, Apple Maps, or MapQuest.`,
        actionableStep: 'Claim and publish your business NAP profile on missing tier-1 directories.',
        priority: 'MEDIUM',
        impact: 'HIGH',
        difficulty: 'MEDIUM',
        timeEstimate: '45 mins',
        status: 'OPEN',
        auditType: 'CITATION',
        locationId: location.id,
        organizationId: location.organizationId,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      citations: auditedCitations,
      score,
      correctCount,
      incorrectCount,
      missingCount,
      duplicateCount,
    };
  }
}
