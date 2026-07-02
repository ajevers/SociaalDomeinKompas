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
      source: source(url)
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

export async function POST(request) {
  try {
    const body = await request.json();
    const { municipality, goal, intervention } = body;

    if (!municipality || !goal || !intervention) {
      return NextResponse.json({ error: 'Gemeente, doel en interventie zijn verplicht.' }, { status: 400 });
    }

    const query = `${municipality} ${intervention} ${goal} sociaal domein gemeente welzijn wijkteam ondersteuning`;
    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 SociaalDomeinKompas/1.0' },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({
        query,
        results: [],
        note: 'Automatisch zoeken gaf geen resultaten. Gebruik de handmatige zoekknop.'
      });
    }

    const html = await response.text();
    const results = parseResults(html, body);

    return NextResponse.json({
      query,
      results,
      note: results.length
        ? 'Resultaten zijn automatisch opgehaald. Controleer altijd actualiteit en toegang.'
        : 'Geen sterke resultaten gevonden. Gebruik eventueel de handmatige zoekknop.'
    });
  } catch (error) {
    return NextResponse.json({
      results: [],
      error: 'Zoeken is mislukt.',
      note: String(error?.message || error)
    }, { status: 500 });
  }
}
