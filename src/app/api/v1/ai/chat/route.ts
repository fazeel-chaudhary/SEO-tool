import { NextRequest, NextResponse } from 'next/server';

// Helper: build a rich system prompt from all available business data
function buildSystemPrompt(location: any, allLocations: any[], competitors: any[]): string {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Build competitor comparison block
  const competitorBlock = competitors.length > 0
    ? competitors.map((c: any, i: number) => `
  Competitor ${i + 1}: ${c.name}
    - Category: ${c.category || 'N/A'}
    - Rating: ${c.rating ?? 'N/A'} stars | Reviews: ${c.reviewCount ?? 'N/A'}
    - Photos: ${c.photoCount ?? 'N/A'} | Posts/Month: ${c.postFrequencyPerMonth ?? 'N/A'}
    - Local Voice Share: ${c.shareOfLocalVoice ?? 'N/A'}%
    - Domain Authority: ${c.domainAuthority ?? 'N/A'}
    - Citations: ${c.citationCount ?? 'N/A'}
    - Website: ${c.website || 'N/A'}`).join('\n')
    : '  No competitors tracked yet. Recommend user adds competitors in the Competitors tab.';

  // Build multi-location summary block
  const multiLocBlock = allLocations && allLocations.length > 1
    ? allLocations.map((l: any, i: number) => `
  Location ${i + 1}: ${l.name} (${l.city}, ${l.state})
    - SEO Score: ${l.overallScore ?? 'N/A'}/100
    - Citation Accuracy: ${l.citationScore ?? 'N/A'}%
    - Review Response Rate: ${l.reviewResponseRate ?? 'N/A'}%
    - Average Rating: ${l.averageRating ?? 'N/A'}
    - GBP Connected: ${l.gbpConnected ? 'Yes' : 'No'}
    - Photos: ${l.gbpPhotoCount ?? 0}
    - Top Competitor: ${l.topCompetitor || 'None tracked'}`).join('\n')
    : '  Single location account.';

  return `You are an expert Local SEO Business Consultant and GBP (Google Business Profile) Specialist AI integrated into a premium Local SEO SaaS platform.

CURRENT DATE: ${now}

YOUR ROLE:
You have complete access to the business's profile data, performance metrics, and competitor intelligence. You act as a strategic business advisor — analyzing ALL available data, identifying critical issues, spotting opportunities, and delivering clear, prioritized, actionable recommendations.

CRITICAL FORMATTING RULES & COMPARISON TABLE DIRECTIVES:
1. ALWAYS use clean Markdown formatting:
   - Use bold text **like this** for key terms, metrics, and labels.
   - Use Markdown Headers (### Header) for section titles.
   - Use structured lists (1., 2., 3. or - ) for action items.
2. MANDATORY TABLES FOR COMPARISONS:
   Whenever the user asks for a comparison (comparing locations, comparing against competitors, comparing metrics, citations, or categories), YOU MUST PROVIDE A PROPER MARKDOWN TABLE:
   
   Example Table Format:
   | Metric / Factor | ${location.name} | Competitor 1 | Status / Gap |
   |---|---|---|---|
   | SEO Score | 82/100 | 91/100 | -9 pts gap |
   | Average Rating | ${location.averageRating ?? '4.8'}★ | 4.9★ | 0.1★ lower |
   | Review Count | ${location.reviewCount ?? '45'} | 120 | Need +75 reviews |
   | Photo Count | ${location.gbpPhotoCount ?? 0} | 45 | Need +35 photos |
   
3. Always include 3 clear "Next Action Steps Today" at the end of your response.

─────────────────────────────────────────
ACTIVE BUSINESS PROFILE DATA
─────────────────────────────────────────
Business Name: ${location.name}
Primary Category: ${location.category}
Additional Categories: ${location.additionalCats?.join(', ') || 'None configured'}
Full Address: ${location.address}, ${location.city}, ${location.state} ${location.zip}
Phone: ${location.phone}
Website: ${location.website || 'NOT CONFIGURED — CRITICAL ISSUE'}
GBP Status: ${location.gbpConnected ? 'Connected' : 'NOT CONNECTED — CRITICAL ISSUE'}
GBP Verification: ${location.gbpStatus || 'Unknown'}
Business Hours: ${location.gbpHours || 'Not set'}
Photo Count: ${location.gbpPhotoCount ?? 0} photos (Benchmark: 35+ recommended)
Post Count: ${location.gbpPostCount ?? 0} posts
Last GBP Post Date: ${location.gbpLastPostDate || 'Never posted'}
Google Place ID: ${location.placeId || 'Not linked'}

─────────────────────────────────────────
PERFORMANCE METRICS (FROM PLATFORM DATA)
─────────────────────────────────────────
${location.citationScore !== undefined ? `Citation NAP Accuracy: ${location.citationScore}%` : 'Citation data: Available via platform audit'}
${location.reviewResponseRate !== undefined ? `Review Response Rate: ${location.reviewResponseRate}%` : 'Review data: Available via platform audit'}
${location.averageRating !== undefined ? `Average Star Rating: ${location.averageRating}` : ''}
${location.overallScore !== undefined ? `Overall Local SEO Score: ${location.overallScore}/100` : ''}

─────────────────────────────────────────
COMPETITOR INTELLIGENCE (${competitors.length} tracked)
─────────────────────────────────────────
${competitorBlock}

─────────────────────────────────────────
ALL BUSINESS LOCATIONS (${allLocations?.length || 1} total)
─────────────────────────────────────────
${multiLocBlock}
`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, location, allLocations, competitors } = body;

    if (!query || !location) {
      return NextResponse.json(
        { status: 'error', message: 'Missing query or location context' },
        { status: 400 }
      );
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = buildSystemPrompt(
      location,
      allLocations || [],
      competitors || []
    );

    // 1. Try OpenAI GPT-4o
    if (openAiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            temperature: 0.3,
            max_tokens: 1200,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: query }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            return NextResponse.json({ status: 'success', answer: content, source: 'openai-live' });
          }
        } else {
          console.warn('OpenAI api notice:', response.statusText);
        }
      } catch (err) {
        console.warn('OpenAI fetch error:', err);
      }
    }

    // 2. Try Gemini (1.5 / 2.0 Flash)
    if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `${systemPrompt}\n\nUser Question: ${query}`
                }]
              }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1200,
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            return NextResponse.json({ status: 'success', answer: content, source: 'gemini-live' });
          }
        } else {
          console.warn('Gemini api notice:', response.statusText);
        }
      } catch (err) {
        console.warn('Gemini fetch notice:', err);
      }
    }

    // 3. Fallback to local reasoning engine
    return NextResponse.json({ status: 'success', answer: null, source: 'local-fallback' });

  } catch (err: any) {
    console.error('AI chat endpoint failure:', err);
    return NextResponse.json(
      { status: 'error', message: err.message || 'Internal AI Service Error' },
      { status: 500 }
    );
  }
}
