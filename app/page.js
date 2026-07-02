'use client';

import { useMemo, useState } from 'react';
import { themes, goalsByDomain, interventionsByGoal } from './data/taxonomy';

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedIntervention, setSelectedIntervention] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [message, setMessage] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const goals = useMemo(() => selectedTheme ? goalsByDomain[selectedTheme.domain] || [] : [], [selectedTheme]);
  const interventions = useMemo(() => selectedGoal ? interventionsByGoal[selectedGoal] || [] : [], [selectedGoal]);

  function chooseTheme(theme) {
    setSelectedTheme(theme);
    const firstGoal = goalsByDomain[theme.domain]?.[0] || '';
    setSelectedGoal(firstGoal);
    setSelectedIntervention(interventionsByGoal[firstGoal]?.[0] || '');
    setResults([]);
    setMessage('');
  }

  function chooseGoal(goal) {
    setSelectedGoal(goal);
    setSelectedIntervention(interventionsByGoal[goal]?.[0] || '');
    setResults([]);
    setMessage('');
  }

  async function searchSupport() {
    if (!selectedTheme || !selectedGoal || !selectedIntervention || !municipality.trim()) {
      setMessage('Kies eerst een thema, doel, interventie en gemeente.');
      return;
    }

    setLoading(true);
    setMessage('');
    setResults([]);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: selectedTheme.theme, domain: selectedTheme.domain, goal: selectedGoal, intervention: selectedIntervention, municipality: municipality.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Zoeken is niet gelukt.');
        return;
      }
      setResults(data.results || []);
      setMessage(data.message || '');
    } catch {
      setMessage('Zoeken is niet gelukt. Controleer of OPENAI_API_KEY in Vercel staat en redeploy daarna.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <p className="label">MVP deel 2</p>
        <h1>Sociaal Domein Kompas</h1>
        <p>Elementaire versie met OpenAI-koppeling. De app toont verifieerbare organisaties of meldt dat niets is gevonden.</p>
      </section>

      <section className="notice">
        Dit hulpmiddel is bedoeld als gespreksstarter en vervangt geen medische, psychologische of crisishulp. Controleer altijd de website van de organisatie.
      </section>

      <section className="card">
        <h2>1. Kies sociaal domein thema</h2>
        <p className="muted">De mogelijke klachten of signalen staan per thema vermeld.</p>
        <div className="themeGrid">
          {themes.map((theme) => (
            <button key={theme.theme} className={`themeCard ${selectedTheme?.theme === theme.theme ? 'selected' : ''}`} onClick={() => chooseTheme(theme)}>
              <strong>{theme.theme}</strong>
              <span>{theme.signals}</span>
            </button>
          ))}
        </div>
      </section>

      {selectedTheme && (
        <section className="card">
          <h2>2. Kies doel</h2>
          <p className="muted">Gekozen thema: <strong>{selectedTheme.theme}</strong></p>
          <div className="optionList">
            {goals.map((goal) => <button key={goal} className={`option ${selectedGoal === goal ? 'selected' : ''}`} onClick={() => chooseGoal(goal)}>{goal}</button>)}
          </div>
        </section>
      )}

      {selectedGoal && (
        <section className="card">
          <h2>3. Kies interventie</h2>
          <p className="muted">Gekozen doel: <strong>{selectedGoal}</strong></p>
          <div className="optionList">
            {interventions.map((intervention) => (
              <button key={intervention} className={`option ${selectedIntervention === intervention ? 'selected' : ''}`} onClick={() => { setSelectedIntervention(intervention); setResults([]); setMessage(''); }}>
                {intervention}
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedIntervention && (
        <section className="card">
          <h2>4. Vul gemeente in</h2>
          <label>Gemeente
            <input value={municipality} onChange={(event) => { setMunicipality(event.target.value); setResults([]); setMessage(''); }} placeholder="Bijvoorbeeld Ede, Utrecht of Groningen" />
          </label>
          <button className="primaryButton" onClick={searchSupport} disabled={loading}>{loading ? 'Bezig met zoeken...' : 'Zoek ondersteuning'}</button>
          {message && <div className="resultBox">{message}</div>}
        </section>
      )}

      {results.length > 0 && (
        <section className="card">
          <h2>Gevonden ondersteuning</h2>
          <div className="resultsList">
            {results.map((item, index) => (
              <article className="resultCard" key={`${item.name}-${index}`}>
                <h3>{item.name}</h3>
                <p><strong>Interventie gevonden:</strong> {item.intervention}</p>
                <p><strong>Omschrijving:</strong> {item.description}</p>
                {item.website && <p><strong>Website:</strong> <a href={item.website} target="_blank" rel="noreferrer">{item.website}</a></p>}
                {item.source && <p><strong>Bron:</strong> <a href={item.source} target="_blank" rel="noreferrer">{item.source}</a></p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {selectedTheme && (
        <section className="summary">
          <h2>Gekozen combinatie</h2>
          <p><strong>Thema:</strong> {selectedTheme.theme}</p>
          <p><strong>Doel:</strong> {selectedGoal || '-'}</p>
          <p><strong>Interventie:</strong> {selectedIntervention || '-'}</p>
          <p><strong>Gemeente:</strong> {municipality || '-'}</p>
        </section>
      )}
    </main>
  );
}
