'use client';

import { useMemo, useState } from 'react';
import { themes, goalsByDomain, interventionsByGoal, municipalities } from './data/taxonomie';

export default function Home() {
  const [theme, setTheme] = useState(null);
  const [goal, setGoal] = useState('');
  const [intervention, setIntervention] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const goals = useMemo(() => theme ? goalsByDomain[theme.domain] || [] : [], [theme]);
  const interventions = useMemo(() => goal ? interventionsByGoal[goal] || [] : [], [goal]);

  function selectTheme(item) {
    setTheme(item);
    const firstGoal = goalsByDomain[item.domain]?.[0] || '';
    setGoal(firstGoal);
    setIntervention(interventionsByGoal[firstGoal]?.[0] || '');
    setResults([]);
    setNotice('');
  }

  function selectGoal(value) {
    setGoal(value);
    setIntervention(interventionsByGoal[value]?.[0] || '');
    setResults([]);
    setNotice('');
  }

  async function searchSupport() {
    if (!theme || !goal || !intervention || !municipality) {
      setNotice('Kies eerst thema, doel, interventie en gemeente.');
      return;
    }

    setLoading(true);
    setResults([]);
    setNotice('');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: theme.theme, domain: theme.domain, goal, intervention, municipality })
      });

      const payload = await response.json();
      setQuery(payload.query || '');
      setResults(payload.results || []);
      setNotice(payload.note || '');

      if (!response.ok) {
        setNotice(payload.error || 'Zoeken is niet gelukt.');
      }
    } catch {
      setNotice('Zoeken is niet gelukt. Gebruik eventueel de handmatige zoekknop.');
    } finally {
      setLoading(false);
    }
  }

  function manualUrl() {
    const q = query || `${municipality} ${intervention} ${goal} sociaal wijkteam gemeente welzijn ondersteuning`;
    return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  }

  return (
    <main>
      <section className="hero">
        <div className="badge">Sociaal Domein Kompas</div>
        <h1>Van mentale klachten naar passend lokaal aanbod</h1>
        <p>Kies thema, doel, interventie en gemeente. De applicatie zoekt daarna zelf naar mogelijke ondersteuning.</p>
      </section>

      <section className="warning">
        Dit hulpmiddel is bedoeld als gespreksstarter. Controleer altijd de actuele toegang, voorwaarden en contactgegevens.
        Bij acuut gevaar of suïcidaliteit: huisarts, huisartsenpost of 112.
      </section>

      <section className="card">
        <h2>A. Thema’s met mogelijke klachten</h2>
        <div className="grid">
          {themes.map((item) => (
            <button key={item.theme} className={`tile ${theme?.theme === item.theme ? 'selected' : ''}`} onClick={() => selectTheme(item)}>
              <strong>{item.theme}</strong>
              <span>{item.signals}</span>
            </button>
          ))}
        </div>
      </section>

      {theme && (
        <section className="card">
          <h2>B/C/D. Kies doel</h2>
          <p className="muted">Gekozen thema: <strong>{theme.theme}</strong> · Domein: <strong>{theme.domain}</strong></p>
          <div className="chips">
            {goals.map((item) => (
              <button key={item} className={`chip ${goal === item ? 'selected' : ''}`} onClick={() => selectGoal(item)}>
                {item}
              </button>
            ))}
          </div>
        </section>
      )}

      {goal && (
        <section className="card">
          <h2>E. Kies interventie</h2>
          <div className="chips">
            {interventions.map((item) => (
              <button key={item} className={`chip ${intervention === item ? 'selected' : ''}`} onClick={() => { setIntervention(item); setResults([]); }}>
                {item}
              </button>
            ))}
          </div>
        </section>
      )}

      {intervention && (
        <section className="card">
          <h2>F/G. Kies gemeente en zoek</h2>
          <label>
            Gemeente
            <select value={municipality} onChange={(e) => { setMunicipality(e.target.value); setResults([]); }}>
              <option value="">Kies gemeente</option>
              {municipalities.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <div className="actions">
            <button onClick={searchSupport} disabled={loading}>
              {loading ? 'Bezig met zoeken...' : 'Zoek ondersteuning'}
            </button>
            <a className="secondary" href={manualUrl()} target="_blank" rel="noreferrer">Handmatig zoeken</a>
          </div>

          {query && <div className="query">Zoekopdracht: {query}</div>}
          {notice && <p className="muted">{notice}</p>}
        </section>
      )}

      {municipality && (
        <section className="card">
          <h2>H. Mogelijke opties</h2>
          {results.length === 0 ? (
            <p className="muted">Nog geen resultaten. Klik op “Zoek ondersteuning”.</p>
          ) : (
            <div className="results">
              {results.map((result, index) => (
                <article className="result" key={`${result.url}-${index}`}>
                  <div className="rank">{index + 1}</div>
                  <div>
                    <a href={result.url} target="_blank" rel="noreferrer">{result.title}</a>
                    <p>{result.snippet}</p>
                    <span>{result.source}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
