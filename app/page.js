'use client';

import { useMemo, useState } from 'react';
import { themes, goalsByDomain, interventionsByGoal } from './data/taxonomy';

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedIntervention, setSelectedIntervention] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [message, setMessage] = useState('');

  const goals = useMemo(() => selectedTheme ? goalsByDomain[selectedTheme.domain] || [] : [], [selectedTheme]);
  const interventions = useMemo(() => selectedGoal ? interventionsByGoal[selectedGoal] || [] : [], [selectedGoal]);

  function chooseTheme(theme) {
    setSelectedTheme(theme);
    const firstGoal = goalsByDomain[theme.domain]?.[0] || '';
    setSelectedGoal(firstGoal);
    setSelectedIntervention(interventionsByGoal[firstGoal]?.[0] || '');
    setMessage('');
  }

  function chooseGoal(goal) {
    setSelectedGoal(goal);
    setSelectedIntervention(interventionsByGoal[goal]?.[0] || '');
    setMessage('');
  }

  function fakeSearch() {
    if (!selectedTheme || !selectedGoal || !selectedIntervention || !municipality.trim()) {
      setMessage('Kies eerst een thema, doel, interventie en gemeente.');
      return;
    }
    setMessage(`Deel 1 is klaar. In deel 2 wordt hier gezocht naar ondersteuning in ${municipality} bij de interventie "${selectedIntervention}".`);
  }

  return (
    <main>
      <section className="hero">
        <p className="label">MVP deel 1</p>
        <h1>Sociaal Domein Kompas</h1>
        <p>Elementaire versie: kies een thema, doel, interventie en gemeente. De OpenAI-zoekfunctie voegen we toe in deel 2.</p>
      </section>

      <section className="notice">
        Dit hulpmiddel is bedoeld als gespreksstarter en vervangt geen medische, psychologische of crisishulp.
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
            {goals.map((goal) => (
              <button key={goal} className={`option ${selectedGoal === goal ? 'selected' : ''}`} onClick={() => chooseGoal(goal)}>
                {goal}
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedGoal && (
        <section className="card">
          <h2>3. Kies interventie</h2>
          <p className="muted">Gekozen doel: <strong>{selectedGoal}</strong></p>
          <div className="optionList">
            {interventions.map((intervention) => (
              <button key={intervention} className={`option ${selectedIntervention === intervention ? 'selected' : ''}`} onClick={() => { setSelectedIntervention(intervention); setMessage(''); }}>
                {intervention}
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedIntervention && (
        <section className="card">
          <h2>4. Vul gemeente in</h2>
          <label>
            Gemeente
            <input value={municipality} onChange={(event) => { setMunicipality(event.target.value); setMessage(''); }} placeholder="Bijvoorbeeld Ede, Utrecht of Groningen" />
          </label>
          <button className="primaryButton" onClick={fakeSearch}>Zoek ondersteuning</button>
          {message && <div className="resultBox">{message}</div>}
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
