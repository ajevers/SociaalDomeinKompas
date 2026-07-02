import { NextResponse } from 'next/server';

function extractJson(text) {
  const cleaned = text.trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  throw new Error('Geen geldige JSON ontvangen van OpenAI.');
}

export async function POST(request) {
  try {
    const { theme, domain, goal, intervention, municipality } = await request.json();

    if (!theme || !goal || !intervention || !municipality) {
      return NextResponse.json({ error: 'Thema, doel, interventie en gemeente zijn verplicht.' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY ontbreekt in Vercel.' }, { status: 500 });
    }

    const prompt = `Je bent een neutrale informatie-analist voor het Nederlandse sociaal domein.

Gebruik web search om actuele openbare bronnen te vinden.

Zoekvraag:
Vind organisaties of gemeentelijke voorzieningen in of rond gemeente "${municipality}" die de interventie "${intervention}" aanbieden of expliciet noemen.

Context:
- Thema: ${theme}
- Sociaal domein: ${domain}
- Doel: ${goal}
- Interventie: ${intervention}
- Gemeente: ${municipality}

Zoek extra gericht op:
- officiële gemeentelijke website van ${municipality}
- sociaal wijkteam / buurtteam / toegang sociaal domein
- welzijnsorganisatie in ${municipality}
- sociale kaart ${municipality}
- organisaties zoals Humanitas, MEE, mantelzorgsteunpunt, schuldhulp of welzijn, alleen als relevant voor de interventie

Strikte regels:
1. Verzin geen organisaties.
2. Neem alleen organisaties of voorzieningen op waarvoor je een concrete bron-URL hebt.
3. Geef geen advies, geen oordeel, geen score en geen rangschikking.
4. Gebruik een neutrale, feitelijke stijl.
5. Als je geen bron vindt waarop de interventie of duidelijke verwante ondersteuning staat, neem die organisatie niet op.
6. Als je niets vindt, geef een lege results-array terug en de melding: "Geen verifieerbare organisaties gevonden."
7. Antwoord uitsluitend als JSON, zonder markdown.

JSON-formaat:
{
  "message": "korte melding",
  "results": [
    {
      "name": "naam organisatie of voorziening",
      "intervention": "gevonden interventie of verwante term",
      "description": "korte feitelijke omschrijving gebaseerd op de bron",
      "website": "officiële website",
      "source": "concrete bronpagina waarop de informatie staat"
    }
  ]
}

Maximaal 5 resultaten.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        tools: [{ type: 'web_search' }],
        include: ['web_search_call.action.sources'],
        input: prompt,
        temperature: 0
      })
    });

    const raw = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return NextResponse.json({
        error: 'OpenAI gaf een foutmelding.',
        details: raw.error?.message || 'Onbekende fout.'
      }, { status: 500 });
    }

    const outputText =
      raw.output_text ||
      raw.output?.flatMap((item) => item.content || []).map((content) => content.text || '').join('\n') ||
      '';

    const parsed = extractJson(outputText);

    return NextResponse.json({
      message: parsed.message || '',
      results: Array.isArray(parsed.results) ? parsed.results : []
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Zoeken is niet gelukt.',
      details: String(error?.message || error)
    }, { status: 500 });
  }
}
