import { NextResponse } from 'next/server';

function cleanText(value = '') {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeDuckUrl(href = '') {
  try {
    const full = href.startsWith('//') ? `https:${href}` : href;
    const url = new URL(full);
    if (url.hostname.includes('duckduckgo.com') && url.pathname.startsWith('/l/')) {
      return decodeURIComponent(url.searchParams.get('uddg') || '');
    }
    return full;
  } catch {
    return href;
  }
}

function source(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function score(item, body) {
  const text = `${item.title} ${item.snippet} ${item.url}`.toLowerCase();
  let value = 0;

  const important = [
    body.municipality,
    body.intervention,
    body.goal,
    'gemeente',
    'sociaal wijkteam',
    'wijkteam',
    'welzijn',
    'wmo',
    'ondersteuning',
    'hulp',
    'mantelzorg',
    'schuldhulp',
    'maatjes',
    'dagbesteding'
  ];

  for (const term of important) {
    for (const part of String(term || '').toLowerCase().split(/\s+/)) {
      if (part.length > 3 && text.includes(part)) value += 2;
    }
  }

  for (const bad of ['vacature', 'jaarverslag', 'aanbesteding', 'pdf', 'nieuwsbrief']) {
    if (text.includes(bad)) value -= 3;
  }

  return value;
}

function parseResults(html, body) {
  const blocks = html.split('<div class="result').slice(1);
  const results = [];

  for (const block of blocks) {
    const link = block.match(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    const snippet = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|div)>/);

    if (!link) continue;

    const url = decodeDuckUrl(link[1].replace(/&amp;/g, '&'));
    if (!url || url.includes('duckduckgo.com')) continue;

    const item = {
      title: cleanText(link[2]),
      snippet: cleanText(snippet?.[1] || ''),
      url,
      source: source(url),
      type: 'live resultaat'
    };

    item.score = score(item, body);
    results.push(item);
  }

  const seen = new Set();

  return results
    .sort((a, b) => b.score - a.score)
    .filter((item) => {
      const key = item.url.split('?')[0].replace(/\/$/, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return item.title && item.score >= 4;
    })
    .slice(0, 8)
    .map(({ score, ...item }) => item);
}

function googleUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function fallbackResults(body, query) {
  const { municipality, intervention, goal } = body;

  const baseQueries = [
    {
      title: `${municipality} — officiële gemeentelijke informatie over ${intervention}`,
      snippet: `Zoek op de officiële gemeentelijke website naar ondersteuning rond ${intervention} en het doel "${goal}". Dit is vaak de beste ingang voor toegang, Wmo, sociaal wijkteam of schuldhulp.`,
      q: `${municipality} gemeente ${intervention} ${goal} ondersteuning sociaal wijkteam`
    },
    {
      title: `Sociaal wijkteam / buurtteam ${municipality}`,
      snippet: `Het sociaal wijkteam of buurtteam kan vaak helpen met de eerste vraagverheldering en verwijzing naar passende ondersteuning in de gemeente.`,
      q: `${municipality} sociaal wijkteam buurtteam ${intervention}`
    },
    {
      title: `Welzijnsorganisatie in ${municipality}`,
      snippet: `Welzijnsorganisaties bieden vaak laagdrempelige ondersteuning, groepsaanbod, maatjescontact, mantelzorgondersteuning, participatie of dagstructuur.`,
      q: `${municipality} welzijn ${intervention} ondersteuning`
    },
    {
      title: `${municipality} — sociale kaart of zorgkaart`,
      snippet: `Veel gemeenten of regio's hebben een sociale kaart met lokale voorzieningen. Zoek daarin naar de gekozen interventie.`,
      q: `${municipality} sociale kaart ${intervention}`
    },
    {
      title: `Lokale vrijwilligers- of maatschappelijke organisaties in ${municipality}`,
      snippet: `Organisaties zoals Humanitas, MEE, mantelzorgsteunpunten of lokale welzijnspartijen kunnen passend aanbod hebben bij deze interventie.`,
      q: `${municipality} Humanitas MEE mantelzorg welzijn ${intervention}`
    }
  ];

  return baseQueries.map((item) => ({
    title: item.title,
    snippet: item.snippet,
    url: googleUrl(item.q),
    source: 'gerichte zoeklink',
    type: 'suggestie'
  }));
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
    const { municipality, goal, intervention } = body;

    if (!municipality || !goal || !intervention) {
      return NextResponse.json({ error: 'Gemeente, doel en interventie zijn verplicht.' }, { status: 400 });
    }

    const query = `${municipality} ${intervention} ${goal} sociaal domein gemeente welzijn wijkteam ondersteuning`;
    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    let liveResults = [];

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 SociaalDomeinKompas/1.0' },
        cache: 'no-store'
      });

      if (response.ok) {
        const html = await response.text();
        liveResults = parseResults(html, body);
      }
    } catch {
      liveResults = [];
    }

    if (liveResults.length > 0) {
      return NextResponse.json({
        query,
        results: liveResults,
        note: 'Resultaten zijn automatisch opgehaald. Controleer altijd actualiteit, toegang en contactgegevens.'
      });
    }

    return NextResponse.json({
      query,
      results: fallbackResults(body, query),
      note: 'Live zoeken werd geblokkeerd of gaf geen sterke resultaten. Daarom toont de app gerichte controlelinks per relevante ingang.'
    });
  } catch (error) {
    const query = body?.municipality && body?.intervention
      ? `${body.municipality} ${body.intervention} ${body.goal || ''} sociaal domein`
      : '';

    return NextResponse.json({
      query,
      results: body?.municipality ? fallbackResults(body, query) : [],
      note: 'Live zoeken is mislukt. De app toont waar mogelijk gerichte controlelinks.',
      error: String(error?.message || error)
    });
  }
}
