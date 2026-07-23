import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, location } = await request.json();
    if (!query || !location) {
      return NextResponse.json(
        { status: 'error', message: 'Missing query or location context' },
        { status: 400 }
      );
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. Try OpenAI Live Call
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
            messages: [
              {
                role: 'system',
                content: `You are an expert Local SEO Analyst AI for the SaaS platform 'Local SEO OS'. 
                Use this business context for your analysis:
                - Business Name: ${location.name}
                - Primary Category: ${location.category}
                - City/State: ${location.city}, ${location.state}
                - Phone: ${location.phone}
                - Website URL: ${location.website || 'Not configured'}
                - GBP Connected: ${location.gbpConnected ? 'Yes' : 'No'}
                - GBP Photo Count: ${location.gbpPhotoCount || 0}
                
                Provide highly actionable, diagnostic advice in response to the user's questions. Prioritize data accuracy and clear steps.`
              },
              {
                role: 'user',
                content: query
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            return NextResponse.json({
              status: 'success',
              answer: content,
              source: 'openai-live',
            });
          }
        } else {
          const errText = await response.text();
          console.warn('OpenAI api call warning:', errText);
        }
      } catch (err) {
        console.warn('OpenAI fetch error:', err);
      }
    }

    // 2. Try Gemini Live Call
    if (geminiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert Local SEO Analyst AI.
                Context:
                - Business Name: ${location.name}
                - Category: ${location.category}
                - City/State: ${location.city}, ${location.state}
                - Website: ${location.website || 'Not configured'}
                
                Analyze the local ranking query: "${query}". Provide a concise action plan.`
              }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            return NextResponse.json({
              status: 'success',
              answer: content,
              source: 'gemini-live',
            });
          }
        } else {
          const errText = await response.text();
          console.warn('Gemini api call warning:', errText);
        }
      } catch (err) {
        console.warn('Gemini fetch error:', err);
      }
    }

    // 3. Fallback
    return NextResponse.json({
      status: 'success',
      answer: null,
      source: 'local-fallback',
    });
  } catch (err: any) {
    console.error('AI chat endpoint failure:', err);
    return NextResponse.json(
      { status: 'error', message: err.message || 'Internal AI Service Error' },
      { status: 500 }
    );
  }
}
