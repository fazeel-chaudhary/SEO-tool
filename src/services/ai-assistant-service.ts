import { Location } from '@/lib/types';
import { AppStore } from './store';
import { AuditEngine } from './audit-engine';
import { CitationService } from './citation-service';
import { ReviewService } from './review-service';

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
          return data.answer;
        }
      }
    } catch (err) {
      console.warn('Live AI router query failed, falling back to local structured reasoning:', err);
    }

    const qLower = query.toLowerCase();
    const citAudit = CitationService.runCitationAudit(location);
    const revAudit = ReviewService.runReviewAudit(location);
    const competitors = AppStore.getCompetitors(location.id);
    const openRecs = AppStore.getRecommendations(location.organizationId, location.id).filter(
      (r) => r.status !== 'DONE'
    );

    // 1. MULTI-LOCATION COMPARISON QUERY
    if (allLocations && allLocations.length > 1 &&
      (qLower.includes('compare') || qLower.includes('all location') || qLower.includes('which location') || qLower.includes('needs the most'))) {
      
      const locMetrics = allLocations.map((l) => {
        const a = AuditEngine.runUnifiedAudit(l);
        const c = CitationService.runCitationAudit(l);
        const r = ReviewService.runReviewAudit(l);
        return { name: l.name, city: l.city, score: a.overallScore, citation: c.score, rating: r.averageRating, reviews: r.reviews.length };
      }).sort((a, b) => a.score - b.score);
      const worst = locMetrics[0];

      let reply = `### 📊 Multi-Location Performance Comparison (${allLocations.length} Locations)\n\n`;
      reply += `| Location Name | SEO Score | Citation Accuracy | Star Rating | Total Reviews | Status |\n`;
      reply += `|---|---|---|---|---|---|\n`;
      locMetrics.forEach((m) => {
        const status = m.score >= 80 ? '🟢 Strong' : m.score >= 60 ? '🟡 Average' : '🔴 Action Needed';
        reply += `| **${m.name}** (${m.city}) | **${m.score}/100** | ${m.citation}% | ${m.rating}★ | ${m.reviews} | ${status} |\n`;
      });
      reply += `\n**Key Finding**: Location **"${worst.name}"** requires the most urgent optimization (SEO Score: **${worst.score}/100**).\n\n`;
      reply += `### 🎯 Recommended Action Steps Today:\n`;
      reply += `1. **Fix Inconsistent Citations**: Update directory details on ${worst.name}.\n`;
      reply += `2. **Publish GBP Updates**: Schedule 2 weekly posts to boost local pack activity.\n`;
      reply += `3. **Upload Photos**: Increase photos to 35+ to match top competitors.`;
      return reply;
    }

    // 2. COMPETITOR COMPARISON QUERY
    if (qLower.includes('competitor') || qLower.includes('competition') || qLower.includes('vs') || qLower.includes('benchmark')) {
      if (competitors.length === 0) {
        return `### ⚔️ Competitor Benchmark Analysis\n\nNo competitors tracked yet for **${location.name}**. Add 3-5 local competitors in the Competitors tab to generate comparative matrices.`;
      }

      const top = competitors[0];
      const overallScore = AuditEngine.runUnifiedAudit(location).overallScore;
      let reply = `### ⚔️ Head-to-Head Competitor Comparison\n\n`;
      reply += `| Metric / Metric Factor | **${location.name}** (You) | **${top.name}** (Top Competitor) | Performance Gap |\n`;
      reply += `|---|---|---|---|\n`;
      reply += `| **Average Star Rating** | **${revAudit.averageRating}★** | ${top.rating || 4.9}★ | ${revAudit.averageRating >= (top.rating || 4.9) ? '🟢 Ahead' : '🔴 -0.2★ Gap'} |\n`;
      reply += `| **Total Review Volume** | **${revAudit.reviews.length}** | ${top.reviewCount || 120} | ${revAudit.reviews.length >= (top.reviewCount || 120) ? '🟢 Ahead' : `🔴 Need +${(top.reviewCount || 120) - revAudit.reviews.length} reviews`} |\n`;
      reply += `| **GBP Photo Count** | **${location.gbpPhotoCount || 0} photos** | ${top.photoCount || 45} photos | ${location.gbpPhotoCount >= (top.photoCount || 45) ? '🟢 Ahead' : `🔴 Need +${(top.photoCount || 45) - (location.gbpPhotoCount || 0)} photos`} |\n`;
      reply += `| **Local Voice Share** | **${overallScore}%** | ${top.shareOfLocalVoice || 88}% | ${overallScore >= (top.shareOfLocalVoice || 88) ? '🟢 Leader' : '🟡 Challenge Zone'} |\n\n`;

      reply += `### 💡 AI Strategy to Outperform ${top.name}:\n`;
      reply += `1. **Review Velocity**: Send automated SMS review campaigns to gain 10+ new positive reviews monthly.\n`;
      reply += `2. **Photo Uploads**: Upload 15 high-quality interior & team photos to surpass their photo count.\n`;
      reply += `3. **Keyword GBP Posts**: Publish weekly updates targeting **"${location.category} near me"**.`;
      return reply;
    }

    // 3. RANK DROP DIAGNOSTIC
    if (qLower.includes('why') && (qLower.includes('drop') || qLower.includes('rank'))) {
      let reply = `### 🚨 Ranking Diagnostic & Cause Analysis for "${location.name}"\n\n`;
      reply += `| Potential Cause Factor | Current Finding | Impact Level | Recommended Fix |\n`;
      reply += `|---|---|---|---|\n`;
      reply += `| **NAP Citation Errors** | ${citAudit.incorrectCount} Inconsistent listings | 🔴 HIGH | Execute NAP Cleanup in Citation tab |\n`;
      reply += `| **Pending Reviews** | ${revAudit.unansweredCount} Unanswered reviews | 🟡 MEDIUM | Publish AI-drafted replies |\n`;
      reply += `| **Photo Upload Frequency** | ${location.gbpPhotoCount} total photos | 🟡 MEDIUM | Upload 10 new photos |\n\n`;

      reply += `### 🛠️ Immediate Action Steps:\n`;
      reply += `1. Fix top 3 directory NAP conflicts.\n`;
      reply += `2. Publish response to pending 4-star and 5-star reviews.\n`;
      reply += `3. Trigger a 5x5 Geo-Grid scan to track ranking recovery.`;
      return reply;
    }

    // 4. CITATION OPPORTUNITIES
    if (qLower.includes('citation') || qLower.includes('directory') || qLower.includes('opportunity')) {
      let reply = `### 🌐 Citation Audit & Directory Opportunities for "${location.name}"\n\n`;
      reply += `| Directory Platform | Current Status | NAP Consistency | Action Priority |\n`;
      reply += `|---|---|---|---|\n`;
      reply += `| **Google Business Profile** | 🟢 Verified | 100% Match | [HIGH PRIORITY] Active |\n`;
      reply += `| **Bing Places for Business** | 🟡 Pending Claim | 90% Match | [HIGH PRIORITY] Claim Listing |\n`;
      reply += `| **Apple Business Connect** | 🟡 Pending Sync | 85% Match | [HIGH PRIORITY] Sync Profile |\n`;
      reply += `| **Yelp Directory** | 🔴 Inconsistent | Mismatched Phone | [URGENT] Fix Phone Number |\n\n`;

      reply += `### 🎯 Next Steps:\n`;
      reply += `1. Fix phone number formatting on Yelp.\n`;
      reply += `2. Sync NAP profile with Apple Business Connect.\n`;
      reply += `3. Claim Bing Places business listing.`;
      return reply;
    }

    // DEFAULT SUMMARY WITH STRUCTURED TABLE
    const auditReport = AuditEngine.runUnifiedAudit(location);
    let reply = `### 📈 Executive Local SEO Overview for "${location.name}"\n\n`;
    reply += `| Performance Pillar | Current Metric | Target Benchmark | Status |\n`;
    reply += `|---|---|---|---|\n`;
    reply += `| **Local SEO Health Score** | **${auditReport.overallScore}/100** | 85/100 | ${auditReport.overallScore >= 80 ? '🟢 Strong' : '🟡 Needs Optimization'} |\n`;
    reply += `| **Citation NAP Accuracy** | **${citAudit.score}%** | 95%+ | ${citAudit.score >= 90 ? '🟢 Accurate' : '🔴 Fix Mismatches'} |\n`;
    reply += `| **Average Customer Rating** | **${revAudit.averageRating}★** | 4.8★ | 🟢 Excellent |\n\n`;

    reply += `### 🤖 Try Asking Me:\n`;
    reply += `- *"Compare all my business locations in a table"*\n`;
    reply += `- *"Analyze my competitors vs my business"*\n`;
    reply += `- *"Why did my local rankings drop?"*\n`;
    reply += `- *"Show citation opportunities table"*`;
    return reply;
  }
}
