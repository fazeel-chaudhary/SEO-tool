import { NextResponse } from 'next/server';
import { CompetitorService } from '@/services/competitor-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, location, competitor, competitors, targetKeywords } = body;

    if (!location || !location.id) {
      return NextResponse.json({ error: 'Target location is required' }, { status: 400 });
    }

    if (action === 'DISCOVER') {
      const discovered = CompetitorService.discoverRealCompetitors(location, targetKeywords);
      const filtered = CompetitorService.filterAndRankCompetitors(discovered, location, 10, 90);
      return NextResponse.json({
        success: true,
        action: 'DISCOVER',
        data: filtered,
        count: filtered.length,
      });
    }

    if (action === 'AUDIT_SINGLE') {
      if (!competitor || !competitor.name) {
        return NextResponse.json({ error: 'Competitor object is required for single audit' }, { status: 400 });
      }
      const auditResult = CompetitorService.performFullCompetitorAudit(competitor, location);
      return NextResponse.json({
        success: true,
        action: 'AUDIT_SINGLE',
        data: auditResult,
      });
    }

    if (action === 'AUDIT_ALL') {
      const compList = competitors?.length ? competitors : CompetitorService.discoverRealCompetitors(location);
      const audits = compList.map((c: any) => CompetitorService.performFullCompetitorAudit(c, location));
      const topAudit = audits[0];
      const gapAnalysis = CompetitorService.generateAiCompetitiveGapAnalysis(location, compList, topAudit);
      const actionPlan = CompetitorService.generateAiActionPlan(gapAnalysis);

      return NextResponse.json({
        success: true,
        action: 'AUDIT_ALL',
        data: {
          audits,
          gapAnalysis,
          actionPlan,
        },
      });
    }

    if (action === 'GAP_ANALYSIS') {
      const compList = competitors?.length ? competitors : CompetitorService.discoverRealCompetitors(location);
      const topAudit = CompetitorService.performFullCompetitorAudit(compList[0], location);
      const gapAnalysis = CompetitorService.generateAiCompetitiveGapAnalysis(location, compList, topAudit);
      const actionPlan = CompetitorService.generateAiActionPlan(gapAnalysis);

      return NextResponse.json({
        success: true,
        action: 'GAP_ANALYSIS',
        data: {
          gapAnalysis,
          actionPlan,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action parameter specified' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process competitor audit' }, { status: 500 });
  }
}
