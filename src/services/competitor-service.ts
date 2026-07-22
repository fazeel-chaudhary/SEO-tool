import { CompetitorMetric, Location } from '@/lib/types';
import { AppStore } from './store';

export class CompetitorService {
  /**
   * Generates a short AI analysis summarizing key ranking advantages & gaps against competitors.
   */
  static generateAiCompetitiveSummary(location: Location, competitors: CompetitorMetric[]): string {
    if (competitors.length === 0) {
      return 'No competitors tracked yet for this location. Add competitor GBP listings to analyze ranking factors.';
    }

    const topComp = competitors[0];
    const reviewGap = topComp.reviewCount - 45; // Assumed baseline
    const photoGap = topComp.photoCount - (location.gbpPhotoCount || 6);

    let summary = `AI Ranking Analysis for ${location.name}:\n\n`;

    if (reviewGap > 0) {
      summary += `• Review Advantage: "${topComp.name}" holds ${topComp.reviewCount} Google reviews (${topComp.rating}★), outperforming your current review count. Increasing customer review requests will close this local pack gap.\n`;
    }

    if (photoGap > 0) {
      summary += `• Photo Content Advantage: "${topComp.name}" has uploaded ${topComp.photoCount} profile photos compared to your ${location.gbpPhotoCount} photos. Uploading interior & team photos weekly will improve map engagement.\n`;
    }

    summary += `• Share of Local Voice: "${topComp.name}" currently commands a ${topComp.shareOfLocalVoice}% Share of Local Voice in your 2-mile target radius.`;

    return summary;
  }

  /**
   * Identifies real-time competitive alerts and warnings.
   */
  static getCompetitorAlerts(location: Location, competitors: CompetitorMetric[]): string[] {
    const alerts: string[] = [];
    competitors.forEach((comp) => {
      if (comp.shareOfLocalVoice > 70) {
        alerts.push(`High Local Pack Share of Local Voice (${comp.shareOfLocalVoice}%) commanded by "${comp.name}".`);
      }
      if (comp.rating >= 4.8 && comp.reviewCount > 300) {
        alerts.push(`Review Dominance Alert: "${comp.name}" is holding ${comp.reviewCount} reviews at ${comp.rating}★. Recommended: Launch automated review campaign.`);
      }
    });
    return alerts;
  }
}
