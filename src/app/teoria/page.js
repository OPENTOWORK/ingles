'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

// ====== Datos ======
const LEVELS = [
  { 
    code: 'A1', 
    name: 'Acceso', 
    description: 'Principiante - Expresiones cotidianas básicas',
    color: '#7bed9f',
    skills: 'Presentarse, información personal, necesidades inmediatas'
  },
  { 
    code: 'A2', 
    name: 'Plataforma', 
    description: 'Elemental - Comunicación simple y directa',
    color: '#58cc02',
    skills: 'Tareas rutinarias, intercambio de información, descripción del entorno'
  },
  { 
    code: 'B1', 
    name: 'Umbral', 
    description: 'Intermedio - Temas familiares y situaciones cotidianas',
    color: '#ff9900',
    skills: 'Viajes, experiencias, planes, opiniones justificadas'
  },
  { 
    code: 'B2', 
    name: 'Avanzado', 
    description: 'Intermedio Alto - Textos complejos y fluidez',
    color: '#1cb0f6',
    skills: 'Interacción fluida, textos detallados, argumentación'
  },
  { 
    code: 'C1', 
    name: 'Dominio Operativo', 
    description: 'Avanzado - Textos extensos y sentidos implícitos',
    color: '#8e44ad',
    skills: 'Expresión fluida, uso flexible del idioma, textos complejos'
  },
  { 
    code: 'C2', 
    name: 'Maestría', 
    description: 'Experto - Comprensión total y expresión precisa',
    color: '#e74c3c',
    skills: 'Comprensión total, expresión espontánea, matices de significado'
  }
];

const SECTIONS = {
  Grammar: [
    { text: "Articles, Determiners and Quantifiers", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/1-Articles-Determiners-and-Quantifiers" },
    { text: "Verb \"to be\"", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/2-Verb-to-be" },
    { text: "Pronouns", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/3-Pronouns" },
    { text: "Question Formation", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/Question-Formation" },
    { text: "Adverbs and Adjectives", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/4-Adverbs-and-Adjectives" },
    { text: "Prepositions", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/5-Prepositions" },
    { text: "Present Tenses", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/7-Present-Tenses" },
    { text: "Past Tenses", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/8-PastTenses" },
    { text: "Future Tenses", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/9-Future-Tenses" },
    { text: "Comparatives and Superlatives", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/comparatives-superlatives" },
    { text: "Modal Verbs", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/Modal-Verbs" },
    { text: "Infinitive vs Gerund", levels: ['B1','B2','C1','C2'], href: "/teoria/10-Infinitive-vs-Gerund" },
    { text: "Relative Clauses", levels: ['B1','B2','C1','C2'], href: "/teoria/Relative-Clauses" },
    { text: "Passive Voice", levels: ['B1','B2','C1','C2'], href: "/teoria/Passive-Voice" },
    { text: "Reported Speech", levels: ['B1','B2','C1','C2'], href: "/teoria/Reported-Speech" },
    { text: "Conditionals", levels: ['B1','B2','C1','C2'], href: "/teoria/Conditionals" },
    { text: "Sentence Structures", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/11-Sentence-Structures" },
    { text: "Linking Words", levels: ['B2','C1','C2'], href: "/teoria/Linking-Words" },
    { text: "Word Formation", levels: ['B2','C1','C2'], href: "/teoria/6-Word-Formation" },
    { text: "Advanced Conditionals", levels: ['B2','C1','C2'], href: "/teoria/Advanced-Conditionals" },
    { text: "Subjunctive and Unreal Past", levels: ['B2','C1','C2'], href: "/teoria/Subjunctive-and-Unreal-Past" },
    { text: "Collocations and Phrasal Verbs", levels: ['B2','C1','C2'], href: "/teoria/collocations-phrasal-verbs" },
    { text: "False Friends", levels: ['B1','B2','C1','C2'], href: "/teoria/false-friends" },
  ],
  "Use of English": [
    { text: "Multiple Choice Cloze", levels: ['B2','C1','C2'], href: "/teoria/Multiple-Choice-Cloze" },
    { text: "Open Cloze", levels: ['B2','C1','C2'], href: "/teoria/Open-Cloze" },
    { text: "Word Formation", levels: ['B2','C1','C2'], href: "/teoria/Advanced-Word-Formation" },
    { text: "Key Word Transformations", levels: ['B2','C1','C2'], href: "/teoria/Key-Word-Transformations" },
    { text: "Multiple Choice Questions", levels: ['B2','C1','C2'], href: "/teoria/Multiple-Choice-Questions" },
    { text: "Gapped Text", levels: ['B2','C1','C2'], href: "/teoria/Gapped-Text" },
    { text: "Multiple Matching", levels: ['B2','C1','C2'], href: "/teoria/Multiple-Matching" },
    { text: "Cross-text Multiple Matching", levels: ['C2'], href: "/teoria/Cross-Text-Multiple-Matching" },
  ],
  Reading: [
    { text: "Reading for Gist", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/Reading-for-Gist" },
    { text: "Skimming and Scanning Techniques", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/Skimming-Scanning-Techniques" },
    { text: "Reading for Detail", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/Reading-for-Detail" },
    { text: "Vocabulary in Context", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/Vocabulary-in-Context" },
    { text: "Inference and Implication", levels: ['B1','B2','C1','C2'], href: "/teoria/Inference-and-Implication" },
    { text: "Opinion and Attitude", levels: ['B1','B2','C1','C2'], href: "/teoria/Opinion-and-Attitude" },
    { text: "Text Organization and Structure", levels: ['B2','C1','C2'], href: "/teoria/Text-Organization-Structure" },
    { text: "Cohesion and Coherence", levels: ['B2','C1','C2'], href: "/teoria/Cohesion-and-Coherence" },
  ],
  Listening: [
    { text: "Types of Understanding: Main Idea, Details, Contrast, Tone", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/Listening-Types" },
    { text: "Short Dialogues", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/Short-Dialogues" },
    { text: "Contextual Vocabulary", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/Contextual-Vocabulary" },
    { text: "Pronunciation and Connected Speech", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/Connected-Speech" },
    { text: "Monologues", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/Monologues" },
    { text: "Long Conversations", levels: ['B1','B2','C1','C2'], href: "/teoria/Long-Conversations" },
    { text: "Note-Taking Techniques", levels: ['B1','B2','C1','C2'], href: "/teoria/Note-Taking-Techniques" },
    { text: "Active Listening Strategies", levels: ['B1','B2','C1','C2'], href: "/teoria/Active-Listening-Strategies" },
    { text: "Multi-speaker Dialogues", levels: ['B2','C1','C2'], href: "/teoria/Multi-speaker-Dialogues" },
    { text: "English Varieties", levels: ['B2','C1','C2'], href: "/teoria/English-Varieties" },
  ],
  Writing: [
    { text: "Text Types and Structure", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/Text-Types-and-Structure" },
    { text: "Key Resources to Improve", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/Key-Resources-to-Improve" },
    { text: "Cohesion and Connectors", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/Cohesion-and-Connectors" },
    { text: "Useful Grammar and Structures", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/Useful-Grammar-and-Structures" },
    { text: "Vocabulary by Register", levels: ['B1','B2','C1','C2'], href: "/teoria/Vocabulary-by-Register" },
    { text: "Essay Writing Techniques", levels: ['B2','C1','C2'], href: "/teoria/Essay-Writing-Techniques" },
    { text: "Planning, Reviewing, and Self-Editing", levels: ['B2','C1','C2'], href: "/teoria/Planning-Reviewing-and-Self-Editing" },
  ],
  Speaking: [
    { text: "Pronunciation", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/Pronunciation" },
    { text: "Connectors", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/Speaking-Connectors" },
    { text: "Set Phrases", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/Set-Phrases" },
    { text: "Functional and Thematic Vocabulary", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/Functional-and-Thematic-Vocabulary" },
    { text: "Active Grammar and Useful Structures", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/Active-Grammar-and-Useful-Structures" },
    { text: "Interaction and Conversational Strategies", levels: ['B1','B2','C1','C2'], href: "/teoria/Interaction-and-Conversational-Strategies" },
    { text: "Advanced Speaking Strategies", levels: ['B2','C1','C2'], href: "/teoria/Advanced-Speaking-Strategies" },
  ]
};

// ====== Página ======
export default function TeoriaPage() {
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');

  const toggle = (lvl) =>
    setSelected((prev) => prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]);

  const clear = () => { setSelected([]); setQuery(''); };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = {};
    Object.entries(SECTIONS).forEach(([name, arr]) => {
      let items = arr;
      if (selected.length) items = items.filter(t => t.levels.some(l => selected.includes(l)));
      if (q) items = items.filter(t => t.text.toLowerCase().includes(q));
      if (items.length) out[name] = items;
    });
    return out;
  }, [selected, query]);

  const total = useMemo(
    () => Object.values(filtered).reduce((n, arr) => n + arr.length, 0),
    [filtered]
  );

  return (
    <main className="shell teoria-page">
      <header className="header">
        <h1>Theory</h1>
        <p>Filtra por nivel, busca por título y explora los temas.</p>
      </header>

      {/* Filtros */}
      <section className="toolbar">
        <div className="chips">
          {LEVELS.map((level) => {
            const active = selected.includes(level.code);
            return (
              <button
                key={level.code}
                className={`chip ${active ? 'chip--active' : ''}`}
                onClick={() => toggle(level.code)}
                aria-pressed={active}
                title={`${level.name}: ${level.description}`}
                style={{
                  borderColor: active ? level.color : '#eaeaea',
                  background: active ? level.color : 'var(--card)',
                  color: active ? 'white' : 'var(--text)',
                  boxShadow: active ? `0 8px 20px ${level.color}35` : 'none'
                }}
              >
                {level.code}
              </button>
            );
          })}
          <button className="chip chip--ghost" onClick={clear}>Limpiar</button>
        </div>

        <div className="search">
          <input
            type="search"
            placeholder="Buscar tema…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar tema"
          />
          <span className="search__icon" aria-hidden>⌕</span>
        </div>

        <div className="meta">
          Mostrando <strong>{total}</strong> tema{total === 1 ? '' : 's'}
        </div>

        {/* Level Information */}
        {selected.length > 0 && (
          <div className="level-info">
            <h4>Niveles Seleccionados:</h4>
            <div className="level-cards">
              {LEVELS.filter(level => selected.includes(level.code)).map(level => (
                <div key={level.code} className="level-card" style={{ borderColor: level.color }}>
                  <div className="level-header" style={{ backgroundColor: level.color }}>
                    <span className="level-code">{level.code}</span>
                    <span className="level-name">{level.name}</span>
                  </div>
                  <div className="level-content">
                    <p className="level-description">{level.description}</p>
                    <p className="level-skills">
                      <strong>Habilidades:</strong> {level.skills}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Contenido */}
      {total === 0 ? (
        <EmptyState onReset={clear} />
      ) : (
        <div className="sections">
          {Object.entries(filtered).map(([title, topics]) => (
            <Section key={title} title={title} topics={topics} />
          ))}
        </div>
      )}

      <GlobalStyles />
    </main>
  );
}

// ====== Subcomponentes ======
function Section({ title, topics }) {
  return (
    <section className="section">
      <div className="section__head">
        <h2>{title}</h2>
        <span className="count">{topics.length}</span>
      </div>
      <ul className="grid">
        {topics.map((t, i) => (
          <li key={`${t.href}-${i}`}>
            <Link href={t.href} className="card">
              <div className="card__title">{t.text}</div>
              <div className="card__levels">
                {t.levels.map((l) => (
                  <span key={l} className="pill" aria-label={`Nivel ${l}`}>{l}</span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="empty">
      <div className="empty__icon">😕</div>
      <h3>Sin resultados</h3>
      <p>Prueba quitando filtros o buscando otra palabra.</p>
      <button className="btn" onClick={onReset}>Quitar filtros</button>
    </div>
  );
}

// ====== Estilos (styled-jsx global + locales) ======
function GlobalStyles() {
  return (
    <style jsx global>{`
      .teoria-page {
        background-color: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
      .shell{min-height:100svh;max-width:1100px;margin:0 auto;padding:32px 20px}
      .center{display:grid;place-items:center}
      .header h1{font-size:44px;margin:0 0 6px;color:var(--text)}
      .header p{margin:0;color:#666}
      .toolbar{position:sticky;top:16px;z-index:5;margin:22px 0 18px;padding:14px;border:1px solid #eaeaea;border-radius:16px;background:var(--card);box-shadow:0 2px 6px rgba(0,0,0,0.1)}
      .chips{display:flex;flex-wrap:wrap;gap:8px}
      .chip{padding:8px 12px;border-radius:9999px;border:1px solid #eaeaea;background:var(--card);color:var(--text);cursor:pointer;transition:.2s;display:flex;align-items:center;gap:0.25rem}
      .chip:hover{transform:translateY(-1px);border-color:#0070f3;background:#b0d6fa}
      .chip--active{border-color:transparent;color:white}
      .chip--ghost{background:transparent}
      .search{position:relative;margin-top:12px}
      .search input{width:100%;padding:12px 36px 12px 12px;border-radius:12px;border:1px solid #eaeaea;background:white;color:var(--text);outline:none}
      .search input:focus{box-shadow:0 0 0 6px rgba(0,112,243,.35);border-color:#0070f3}
      .search__icon{position:absolute;right:10px;top:50%;translate:0 -50%;opacity:.6}
      .meta{margin-top:10px;font-size:12px;color:#666}
      .level-info{margin-top:16px;padding-top:16px;border-top:1px solid #eaeaea}
      .level-info h4{margin:0 0 12px;color:var(--text);font-size:14px;font-weight:600}
      .level-cards{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
      .level-card{border:2px solid;border-radius:12px;overflow:hidden;background:white;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
      .level-header{color:white;padding:8px 12px;display:flex;align-items:center;gap:8px;font-weight:600}
      .level-code{font-size:14px}
      .level-name{font-size:12px;opacity:0.9}
      .level-content{padding:12px}
      .level-description{margin:0 0 8px;font-size:12px;color:#4a5568;line-height:1.4}
      .level-skills{margin:0;font-size:11px;color:#666;line-height:1.3}
      .level-skills strong{color:#4a5568}
      .sections{display:flex;flex-direction:column;gap:28px}
      .section{padding:6px}
      .section__head{display:flex;align-items:center;gap:8px;margin-bottom:10px}
      .section__head h2{margin:0;font-size:22px;color:var(--text)}
      .count{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:9999px;border:1px solid #eaeaea;background:var(--card);font-size:12px;color:#666}
      .grid{list-style:none;margin:0;padding:0;display:grid;gap:12px;grid-template-columns:repeat(1,minmax(0,1fr))}
      @media (min-width:640px){ .grid{grid-template-columns:repeat(2,minmax(0,1fr));} }
      @media (min-width:980px){ .grid{grid-template-columns:repeat(3,minmax(0,1fr));} }
      .card{display:block;height:100%;border:1px solid #eaeaea;border-radius:18px;background:var(--card);padding:18px;transition:transform .2s, box-shadow .2s, border-color .2s}
      .card:hover{transform:translateY(-2px);box-shadow:0 18px 40px rgba(0,0,0,.1);border-color:#0070f3;background:#b0d6fa}
      .card:focus{outline:none;box-shadow:0 0 0 6px rgba(0,112,243,.35)}
      .card__title{font-size:16px;font-weight:600;line-height:1.25;color:var(--text)}
      .card__levels{margin-top:12px;display:flex;flex-wrap:wrap;gap:6px}
      .pill{font-size:11px;border:1px solid #eaeaea;border-radius:9999px;padding:4px 8px;background:white;color:#666}
      .empty{display:grid;place-items:center;text-align:center;padding:48px;border:1px dashed #eaeaea;border-radius:16px;background:var(--card)}
      .empty__icon{font-size:36px;margin-bottom:6px}
      .btn{margin-top:10px;padding:10px 14px;border-radius:12px;background:#0070f3;border:none;color:white;cursor:pointer;box-shadow:0 10px 24px rgba(0,112,243,.35)}
      .loader{width:48px;height:48px;border-radius:50%;border:3px solid rgba(0,112,243,.2);border-top-color:#0070f3;animation:spin 1s linear infinite}
      @keyframes spin{to{transform:rotate(360deg)}}
    `}</style>
  );
}
