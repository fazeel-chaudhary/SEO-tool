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
You have complete access to the business's profile data, performance metrics, and competitor intelligence. You act as a strategic business advisor â€” analyzing ALL available data, identifying critical issues, spotting opportunities, and delivering clear, prioritized, actionable recommendations.

IMPORTANT OUTPUT RULES:
- Never use markdown symbols like **, ##, ###, *, or _ in your response
- Use plain numbered lists (1. 2. 3.) and bullet points (â€¢) only
- Write in a professional, conversational tone â€” clear and direct
- Always structure your response with labeled sections (e.g., "Profile Analysis:", "Competitor Comparison:", "Top Recommendations:")
- Be specific with numbers and data â€” do not give generic advice

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
ACTIVE BUSINESS PROFILE DATA
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
Business Name: ${location.name}
Primary Category: ${location.category}
Additional Categories: ${location.additionalCats?.join(', ') || 'None configured'}
Full Address: ${location.address}, ${location.city}, ${location.state} ${location.zip}
Phone: ${location.phone}
Website: ${location.website || 'NOT CONFIGURED â€” CRITICAL ISSUE'}
GBP Status: ${location.gbpConnected ? 'Connected' : 'NOT CONNECTED â€” CRITICAL ISSUE'}
GBP Verification: ${location.gbpStatus || 'Unknown'}
Business Hours: ${location.gbpHours || 'Not set'}
Photo Count: ${location.gbpPhotoCount ?? 0} photos (Benchmark: 35+ recommended)
Post Count: ${location.gbpPostCount ?? 0} posts
Last GBP Post Date: ${location.gbpLastPostDate || 'Never posted'}
Google Place ID: ${location.placeId || 'Not linked'}

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
PERFORMANCE METRICS (FROM PLATFORM DATA)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
${location.citationScore !== undefined ? `Citation NAP Accuracy: ${location.citationScore}%` : 'Citation data: Available via platform audit'}
${location.reviewResponseRate !== undefined ? `Review Response Rate: ${location.reviewResponseRate}%` : 'Review data: Available via platform audit'}
${location.averageRating !== undefined ? `Average Star Rating: ${location.averageRating}` : ''}
${location.overallScore !== undefined ? `Overall Local SEO Score: ${location.overallScore}/100` : ''}

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
COMPETITOR INTELLIGENCE (${competitors.length} tracked)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
${competitorBlock}

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
ALL BUSINESS LOCATIONS (${allLocations?.length || 1} total)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
${multiLocBlock}

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
YOUR ANALYSIS APPROACH
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
When answering, always:
1. Reference the specific business data above â€” not generic advice
2. Compare the profile against competitor benchmarks where relevant
3. Prioritize recommendations by impact (HIGH / MEDIUM / LOW)
4. If asking about a specific location, focus on that location's data but reference the others for context
5. For competitor questions, provide a head-to-head comparison table in plain text format
6. Flag any CRITICAL issues (no website, GBP not connected, 0 photos, etc.) at the top of your response
7. End every response with 3 specific "Next Action Steps" the user should do TODAY`;
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
            temperature: 0.4,
            max_tokens: 900,
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
          console.warn('OpenAI api warning:', await response.text());
        }
      } catch (err) {
        console.warn('OpenAI fetch error:', err);
      }
    }

    // 2. Try Gemini 1.5 Flash
    if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
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
                temperature: 0.4,
                maxOutputTokens: 900,
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
          console.warn('Gemini api warning:', await response.text());
        }
      } catch (err) {
        console.warn('Gemini fetch error:', err);
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

