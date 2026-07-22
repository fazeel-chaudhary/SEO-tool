import { Location, Recommendation, AuditResult } from '@/lib/types';
import { AppStore } from './store';
import { CitationService } from './citation-service';
import { ReviewService } from './review-service';

export interface AuditReport {
  overallScore: number;
  gbpScore: number;
  citationScore: number;
  reviewScore: number;
  rankingScore: number;
  issues: string[];
  recommendations: Recommendation[];
}

export class AuditEngine {
  /**
   * Runs complete Unified Audit across GBP, Citations, Reviews, and Rankings.
   */
  static runUnifiedAudit(location: Location): AuditReport {
    const issues: string[] = [];
    const recommendations: Recommendation[] = [];

    // 1. GBP Health Audit
    let gbpDeductions = 0;

    if (location.gbpStatus === 'SUSPENDED') {
      issues.push('Google Business Profile status is SUSPENDED. Local visibility is completely disabled.');
      gbpDeductions += 55;
      recommendations.push({
        id: `rec-audit-susp-${location.id}`,
        title: 'File Google Business Profile Reinstatement Appeal',
        description: `Listing is suspended. This completely blocks local search visibility.`,
        actionableStep: 'Review Google Guidelines, remove keyword stuffing from name, verify NAP matches your official business registration, and submit a GBP reinstatement appeal form.',
        priority: 'HIGH',
        impact: 'HIGH',
        difficulty: 'HARD',
        timeEstimate: '3-5 days',
        status: 'OPEN',
        auditType: 'GBP',
        locationId: location.id,
        organizationId: location.organizationId,
        createdAt: new Date().toISOString(),
      });
    }

    if (!location.gbpConnected) {
      issues.push('Google Business Profile OAuth is disconnected');
      gbpDeductions += 30;
      recommendations.push({
        id: `rec-audit-conn-${location.id}`,
        title: 'Connect Google Business Profile OAuth',
        description: `Location "${location.name}" is missing GBP authorization.`,
        actionableStep: 'Click "Connect GBP" to authorize official Google Business Profile account access.',
        priority: 'HIGH',
        impact: 'HIGH',
        difficulty: 'EASY',
        timeEstimate: '5 mins',
        status: 'OPEN',
        auditType: 'GBP',
        locationId: location.id,
        organizationId: location.organizationId,
        createdAt: new Date().toISOString(),
      });
    }

    if (!location.category) {
      issues.push('Primary business category is missing');
      gbpDeductions += 25;
      recommendations.push({
        id: `rec-audit-cat-${location.id}`,
        title: 'Set Primary Business Category',
        description: 'No primary category assigned. Primary category drives 60%+ of local pack visibility.',
        actionableStep: 'Edit business profile and set a specific primary category (e.g. Dentist, Auto Repair).',
        priority: 'HIGH',
        impact: 'HIGH',
        difficulty: 'EASY',
        timeEstimate: '10 mins',
        status: 'OPEN',
        auditType: 'GBP',
        locationId: location.id,
        organizationId: location.organizationId,
        createdAt: new Date().toISOString(),
      });
    }

    if (!location.gbpHours || location.gbpHours.trim() === '') {
      issues.push('Operating hours are missing');
      gbpDeductions += 20;
      recommendations.push({
        id: `rec-audit-hours-${location.id}`,
        title: 'Add Complete Business Operating Hours',
        description: 'Missing hours reduces customer trust and local map placement.',
        actionableStep: 'Update business hours for every day of the week in Google Business Profile.',
        priority: 'HIGH',
        impact: 'HIGH',
        difficulty: 'EASY',
        timeEstimate: '10 mins',
        status: 'OPEN',
        auditType: 'GBP',
        locationId: location.id,
        organizationId: location.organizationId,
        createdAt: new Date().toISOString(),
      });
    }

    if ((location.gbpPhotoCount || 0) < 10) {
      issues.push(`Low photo count (${location.gbpPhotoCount || 0} vs 10 min)`);
      gbpDeductions += 15;
      recommendations.push({
        id: `rec-audit-photo-${location.id}`,
        title: 'Upload High-Quality Business Photos',
        description: `Current photo count is ${location.gbpPhotoCount || 0}. Listings with 10+ photos get 42% more direction requests.`,
        actionableStep: 'Upload high-resolution photos of storefront, interior, products, and team.',
        priority: 'MEDIUM',
        impact: 'HIGH',
        difficulty: 'EASY',
        timeEstimate: '20 mins',
        status: 'OPEN',
        auditType: 'GBP',
        locationId: location.id,
        organizationId: location.organizationId,
        createdAt: new Date().toISOString(),
      });
    }

    const gbpScore = Math.max(0, 100 - gbpDeductions);

    // 2. Citation Audit
    const citationAudit = CitationService.runCitationAudit(location);
    if (citationAudit.incorrectCount > 0) {
      issues.push(`${citationAudit.incorrectCount} directory citations have inconsistent NAP data`);
    }

    // 3. Review Audit
    const reviewAudit = ReviewService.runReviewAudit(location);
    if (reviewAudit.unansweredCount > 0) {
      issues.push(`${reviewAudit.unansweredCount} customer reviews are pending reply`);
    }

    // 4. Keyword Rank Score
    const keywords = AppStore.getKeywords(location.id);
    const validRanks = keywords.map((k) => k.latestRank).filter((r): r is number => typeof r === 'number');
    const avgRank = validRanks.length > 0 ? validRanks.reduce((a, b) => a + b, 0) / validRanks.length : null;

    let rankingScore = 50;
    if (avgRank !== null) {
      if (avgRank <= 3) rankingScore = 100;
      else if (avgRank <= 5) rankingScore = 85;
      else if (avgRank <= 10) rankingScore = 70;
      else rankingScore = 40;
    }

    // Overall Weighted Score: GBP (35%) + Citations (25%) + Reviews (25%) + Rank Power (15%)
    const overallScore = Math.round(
      gbpScore * 0.35 + citationAudit.score * 0.25 + reviewAudit.responseRate * 0.25 + rankingScore * 0.15
    );

    // Save recommendations to store
    recommendations.forEach((r) => AppStore.saveRecommendation(r));

    return {
      overallScore,
      gbpScore,
      citationScore: citationAudit.score,
      reviewScore: reviewAudit.responseRate,
      rankingScore,
      issues,
      recommendations: AppStore.getRecommendations(location.organizationId, location.id),
    };
  }
}
