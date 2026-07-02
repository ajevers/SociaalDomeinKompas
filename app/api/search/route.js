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

    const relatedTermsByIntervention = {
      "Mantelzorgcoaching": ["mantelzorgondersteuning", "mantelzorgadvies", "mantelzorgconsulent", "steunpunt mantelzorg", "mantelzorg begeleiding"],
      "Mantelzorgadvies": ["mantelzorgondersteuning", "mantelzorgconsulent", "steunpunt mantelzorg", "mantelzorg begeleiding"],
      "Mantelzorggroep": ["mantelzorggroep", "lotgenoten mantelzorg", "bijeenkomsten mantelzorg", "steunpunt mantelzorg"],
      "Respijtzorg": ["respijtzorg", "vervangende mantelzorg", "mantelzorgvervanging", "logeerzorg", "dagopvang mantelzorg"],
      "Vervangende mantelzorg": ["vervangende mantelzorg", "respijtzorg", "mantelzorgvervanging"],
      "Budgetbeheer": ["budgetbeheer", "schuldhulpverlening", "geldzaken", "budgetcoaching", "financiële begeleiding"],
      "Budgetcoaching": ["budgetcoaching", "budgetbeheer", "geldzaken", "financiële begeleiding", "schuldhulpverlening"],
      "Schuldhulpverlening": ["schuldhulpverlening", "schuldhulp", "geldzorgen", "financiële hulp", "geldzaken"],
      "Formulierenhulp": ["formulierenhulp", "administratiehulp", "hulp bij aanvragen", "sociaal raadslieden"],
      "Hulp bij aanvragen van voorzieningen": ["hulp bij aanvragen", "formulierenhulp", "cliëntondersteuning", "sociaal raadslieden"],
      "Welzijnscoaching": ["welzijnscoaching", "welzijn op recept", "sociaal werk", "maatschappelijk werk", "zelfregie"],
      "Stressmanagement": ["stressmanagement", "omgaan met stress", "stress training", "mentale veerkracht", "zelfregie"],
      "Zelfregietraining": ["zelfregie", "zelfregietraining", "empowerment", "herstel", "mentale veerkracht"],
      "Assertiviteitstraining": ["assertiviteitstraining", "weerbaarheid", "grenzen stellen", "sociale vaardigheid"],
      "Ervaringsdeskundige begeleiding": ["ervaringsdeskundige begeleiding", "herstel", "herstelacademie", "zelfregiecentrum"],
      "Maatjescontact": ["maatjescontact", "maatjesproject", "buddy", "vrijwilliger", "eenzaamheid"],
      "Buddyproject": ["buddyproject", "maatjesproject", "maatje", "buddy"],
      "Ontmoetingsgroep": ["ontmoetingsgroep", "ontmoeting", "buurtactiviteiten", "inloop"],
      "Lotgenotengroep": ["lotgenotengroep", "lotgenotencontact", "zelfhulpgroep"],
      "Buurtactiviteiten": ["buurtactiviteiten", "ontmoeting", "wijkactiviteiten", "inloop"],
      "Wandelgroep": ["wandelgroep", "samen wandelen", "beweeggroep"],
      "Dagbesteding": ["dagbesteding", "dagactiviteiten", "activering", "structuur"],
      "Participatiecoaching": ["participatiecoaching", "participatie", "meedoen", "activering"],
      "Vrijwilligerswerktoeleiding": ["vrijwilligerswerk", "vrijwilligerscentrale", "meedoen", "participatie"],
      "Maatschappelijke dagbesteding": ["maatschappelijke dagbesteding", "dagbesteding", "dagactiviteiten"],
      "Arbeidsmatige dagbesteding": ["arbeidsmatige dagbesteding", "dagbesteding", "werk en participatie"],
      "Gezinscoaching": ["gezinscoaching", "gezinsbegeleiding", "opvoedondersteuning", "jeugd en gezin"],
      "Gezinsgesprekken": ["gezinsgesprekken", "gezinsbegeleiding", "maatschappelijk werk"],
      "Relatieondersteuning": ["relatieondersteuning", "relatieproblemen", "maatschappelijk werk"],
      "Scheidingsondersteuning": ["scheidingsondersteuning", "scheiding", "ouderschap na scheiding"],
      "Opvoedadvies": ["opvoedadvies", "opvoedondersteuning", "centrum jeugd en gezin"],
      "Rouwbegeleiding": ["rouwbegeleiding", "rouwverwerking", "verliesbegeleiding"],
      "Rouwgroep": ["rouwgroep", "lotgenoten rouw", "rouwverwerking"],
      "Zingevingsgesprek": ["zingeving", "levensvragen", "geestelijke verzorging"],
      "Geestelijke begeleiding": ["geestelijke begeleiding", "geestelijke verzorging", "levensvragen"],
      "Leefstijlcoaching": ["leefstijlcoaching", "leefstijl", "gezonde leefstijl"],
      "Gecombineerde leefstijlinterventie": ["gecombineerde leefstijlinterventie", "GLI", "leefstijlprogramma"],
      "Buurtsportcoach": ["buurtsportcoach", "sportcoach", "bewegen"],
      "Beweeggroep": ["beweeggroep", "samen bewegen", "sportprogramma"],
      "Voedingsprogramma": ["voedingsprogramma", "voedingsadvies", "gezonde leefstijl"]
    };

    const relatedTerms = relatedTermsByIntervention[intervention] || [intervention];

    const prompt = `Je bent een neutrale informatie-analist voor het Nederlandse sociaal domein.

Gebruik web search om actuele openbare bronnen te vinden.

Zoekvraag:
Vind organisaties of gemeentelijke voorzieningen in of rond gemeente "${municipality}" die ondersteuning bieden die past bij de interventie "${intervention}".

Belangrijk:
De exacte interventienaam hoeft niet letterlijk op de website te staan. Zoek ook op deze verwante termen:
${relatedTerms.map((term) => `- ${term}`).join("\n")}

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
3. De bron moet de interventie of één van de verwante termen inhoudelijk ondersteunen.
4. Geef geen advies, geen oordeel, geen score en geen rangschikking.
5. Gebruik een neutrale, feitelijke stijl.
6. Als een pagina alleen algemeen over zorg of welzijn gaat zonder duidelijke relatie met de interventie of verwante termen, neem die niet op.
7. Als je niets vindt, geef een lege results-array terug en de melding: "Geen verifieerbare organisaties gevonden."
8. Antwoord uitsluitend als JSON, zonder markdown.

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
