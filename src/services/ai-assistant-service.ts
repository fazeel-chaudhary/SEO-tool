import { Location } from '@/lib/types';
import { AppStore } from './store';
import { AuditEngine } from './audit-engine';
import { CitationService } from './citation-service';
import { ReviewService } from './review-service';

/** Strip markdown formatting symbols from AI-generated text for clean UI display */
function cleanAiText(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[-]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export class AiAssistantService {
  static async answerUserQuery(
    location: Location,
    query: string,
    allLocations?: Location[]
  ): Promise<string> {
    try {
      const competitors = AppStore.getCompetitors(location.id);
      const locationsContext = allLocations && allLocations.length > 1
        ? allLocations.map((l) => {
            const audit = AuditEngine.runUnifiedAudit(l);
            const c = CitationService.runCitationAudit(l);
            const r = ReviewService.runReviewAudit(l);
            const comps = AppStore.getCompetitors(l.id);
            return {
              name: l.name, city: l.city, state: l.state, category: l.category,
              gbpConnected: l.gbpConnected, gbpPhotoCount: l.gbpPhotoCount,
              overallScore: audit.overallScore, citationScore: c.score,
              reviewResponseRate: r.responseRate, averageRating: r.averageRating,
              topCompetitor: comps[0]?.name || null,
            };
          })
        : null;

      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          // Enrich location with computed metrics for the AI system prompt
          location: {
            ...location,
            overallScore: AuditEngine.runUnifiedAudit(location).overallScore,
            citationScore: CitationService.runCitationAudit(location).score,
            reviewResponseRate: ReviewService.runReviewAudit(location).responseRate,
            averageRating: ReviewService.runReviewAudit(location).averageRating,
          },
          allLocations: locationsContext,
          competitors: competitors.slice(0, 5),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.answer) {
          return cleanAiText(data.answer);
        }
      }
    } catch (err) {
      console.warn('Live AI router query failed, falling back to local reasoning:', err);
    }

    const qLower = query.toLowerCase();
    const citAudit = CitationService.runCitationAudit(location);
    const revAudit = ReviewService.runReviewAudit(location);
    const competitors = AppStore.getCompetitors(location.id);
    const openRecs = AppStore.getRecommendations(location.organizationId, location.id).filter(
      (r) => r.status !== 'DONE'
    );

    if (allLocations && allLocations.length > 1 &&
      (qLower.includes('compare') || qLower.includes('all location') || qLower.includes('which location') || qLower.includes('needs the most'))) {
      const rows = allLocations.map((l) => {
        const a = AuditEngine.runUnifiedAudit(l);
        const c = CitationService.runCitationAudit(l);
        const r = ReviewService.runReviewAudit(l);
        return { name: l.name, score: a.overallScore, citation: c.score, rating: r.averageRating };
      }).sort((a, b) => a.score - b.score);
      const worst = rows[0];
      let reply = `Multi-Location Performance Overview (${allLocations.length} profiles):\n\n`;
      rows.forEach((r, i) => { reply += `${i + 1}. ${r.name}\n   SEO Score: ${r.score}/100 | Citations: ${r.citation}% | Rating: ${r.rating}\n\n`; });
      reply += `Recommendation: "${worst.name}" needs the most urgent attention (SEO score: ${worst.score}/100). Focus on citation fixes, review responses, and photo uploads there first.`;
      return reply;
    }

    if (qLower.includes('competitor') || qLower.includes('competition')) {
      if (competitors.length === 0) {
        return `No competitors have been added yet for ${location.name}. Go to the Competitors tab and add your top 3-5 local competitors to enable AI comparison and strategy suggestions.`;
      }
      const top = competitors[0];
      return `Competitor Analysis for ${location.name}:\n\nTop Competitor: ${top.name}\n• Their Rating: ${top.rating || 'N/A'} | Your Rating: ${revAudit.averageRating}\n• Their Review Count: ${top.reviewCount || 'N/A'} | Yours: ${revAudit.reviews.length}\n\nAI Recommendations to Outperform ${top.name}:\n\n1. Post Strategy: Publish 2-3 GBP posts per week with local keywords like "${location.category} in ${location.city}".\n2. Photo Campaign: Upload 35+ photos (you currently have ${location.gbpPhotoCount}).\n3. Review Velocity: Respond to all pending reviews within 24 hours. Target a 4.8+ rating.\n4. FAQ Schema: Add structured Q&A data to your website to capture featured snippet positions.\n5. Citation Accuracy: Fix ${citAudit.incorrectCount} inconsistent listings to build stronger local authority.`;
    }

    if (qLower.includes('why') && (qLower.includes('drop') || qLower.includes('rank'))) {
      let analysis = `Data-Backed Ranking Diagnostic for "${location.name}":\n\n`;
      if (citAudit.incorrectCount > 0) analysis += `1. Directory NAP Inconsistency: Found ${citAudit.incorrectCount} listings with mismatched details. This dilutes local pack trust.\n`;
      if (revAudit.unansweredCount > 0) analysis += `2. Pending Reviews: ${revAudit.unansweredCount} unanswered reviews degrade your GBP response rate.\n`;
      if (location.gbpPhotoCount < 10) analysis += `3. Low GBP Photo Count: Only ${location.gbpPhotoCount} photos. Top competitors average 35+.\n`;
      analysis += `\nRecommended Actions:\n• Execute: "${openRecs[0]?.title || 'Update Directory NAP'}"\n• Publish AI-drafted replies to pending reviews.\n• Run a 5x5 Geo-Grid scan to track local pack recovery.`;
      return analysis;
    }

    if (qLower.includes('strategy') || qLower.includes('optimization') || qLower.includes('optimize')) {
      return `AI Optimization Strategies for ${location.name}:\n\n1. Add Local Keywords to H1: Include your city in your homepage H1 (e.g., "${location.category} in ${location.city}").\n\n2. FAQ Schema Integration: Missing FAQPage structured JSON-LD detected. Use the Schema Generator tab to add this.\n\n3. Photos Upload Campaign: Boost your GBP photo count from ${location.gbpPhotoCount} to 35+ to match top competitors.\n\n4. Click-to-Call Links: Ensure all phone mentions use href="tel:${location.phone}" for mobile crawlers.\n\n5. Post Regularly: Publish 2-3 GBP posts per week to signal activity to Google.`;
    }

    if (qLower.includes('category') || qLower.includes('categories')) {
      return `Primary and Secondary Category Mapping for ${location.name}:\n\n• Primary Category: ${location.category}\n• Secondary Categories: ${location.additionalCats?.join(', ') || 'None configured yet'}\n\nAI Recommendation: Add "Emergency ${location.category}" and "Specialist ${location.category}" as secondary categories to increase search impressions by up to 25%.`;
    }

    if (qLower.includes('citation') || qLower.includes('directories') || qLower.includes('opportunity')) {
      return `Citation Opportunities and NAP Audit for ${location.name}:\n\n• Current Accuracy: ${citAudit.score}% NAP Consistency\n• Inconsistent Listings: ${citAudit.incorrectCount} (e.g. Yelp, Superpages)\n• Missing Opportunities: ${citAudit.missingCount} directories\n\nTop Claims Opportunities:\n1. Bing Places: Claim listing (Impact: HIGH)\n2. Apple Maps: Sync business profile (Impact: HIGH)\n3. YellowPages: Submit citation profile (Impact: MEDIUM)`;
    }

    if (qLower.includes('plan') || qLower.includes('action plan')) {
      let res = `AI Step-by-Step Action Plan for ${location.name}:\n\n`;
      openRecs.slice(0, 4).forEach((rec, idx) => { res += `${idx + 1}. ${rec.title}\n   Priority: ${rec.priority} | Time: ${rec.timeEstimate}\n   Action: ${rec.actionableStep}\n\n`; });
      return res;
    }

    if (qLower.includes('review') || qLower.includes('rating') || qLower.includes('sentiment')) {
      return `Customer Review Summary for ${location.name}:\n\n• Average Rating: ${revAudit.averageRating} stars across ${revAudit.reviews.length} reviews\n• Response Rate: ${revAudit.responseRate}% (${revAudit.unansweredCount} pending replies)\n• Sentiment: Majority Positive, with pending negative reviews requiring attention\n\nAction: Reply to all pending reviews to improve your GBP response rate score.`;
    }

    const auditReport = AuditEngine.runUnifiedAudit(location);
    return `Local SEO Overview for ${location.name}:\n\n• SEO Index Score: ${auditReport.overallScore}/100\n• Citation Accuracy: ${citAudit.score}%\n• Review Response Rate: ${revAudit.responseRate}%\n• Open Recommendations: ${openRecs.length}\n• Competitors Tracked: ${competitors.length}\n\nAsk me:\n• "Why did my rankings drop?"\n• "What optimization strategies should I use?"\n• "Analyze my competitors"\n• "Compare all my locations"\n• "Show citation opportunities"\n• "Generate an action plan"`;
  }
}
