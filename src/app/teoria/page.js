'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

// ====== Datos ======
const LEVELS = ['A1','A2','B1','B2','C1','C2'];

const SECTIONS = {
  Grammar: [
    { text: "Articles, Determiners and Quantifiers", levels: ['A1'], href: "/teoria/articles" },
    { text: "Verb “to be”", levels: ['A1'], href: "/teoria/verb-to-be" },
    { text: "Pronouns", levels: ['A1'], href: "/teoria/pronouns" },
    { text: "Adverbs and Adjectives", levels: ['A1','A2'], href: "/teoria/adverbs-adjectives" },
    { text: "Prepositions", levels: ['A1','A2'], href: "/teoria/prepositions" },
    { text: "Word Formation", levels: ['B2'], href: "/teoria/word-formation" },
    { text: "Present Tenses", levels: ['A1','A2','B1'], href: "/teoria/present-tenses" },
    { text: "Past Tenses", levels: ['A2','B1','B2'], href: "/teoria/past-tenses" },
    { text: "Future Tenses", levels: ['A2','B1','B2'], href: "/teoria/future-tenses" },
    { text: "Infinitive vs Gerund", levels: ['B1'], href: "/teoria/infinitive-gerund" },
    { text: "Sentence Structures", levels: ['A1','B1','B2'], href: "/teoria/sentence-structures" },
    { text: "Linking Words", levels: ['B2','C1'], href: "/teoria/linking-words" },
    { text: "Modal Verbs", levels: ['A2','B1','C1'], href: "/teoria/modal-verbs" },
    { text: "Conditionals", levels: ['B1','B2','C1'], href: "/teoria/conditionals" },
    { text: "Passive Voice", levels: ['B1','B2','C1'], href: "/teoria/passive-voice" },
    { text: "Reported Speech", levels: ['B1','B2','C1'], href: "/teoria/reported-speech" },
    { text: "Comparatives and Superlatives", levels: ['A2'], href: "/teoria/comparatives-superlatives" },
    { text: "Collocations and Phrasal Verbs", levels: ['B2'], href: "/teoria/collocations-phrasal-verbs" },
    { text: "False Friends", levels: ['B1'], href: "/teoria/false-friends" },
  ],
  Writing: [
    { text: "Text Types and Structure", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/text-types" },
    { text: "Cohesion and Connectors", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/cohesion" },
    { text: "Useful Grammar and Structures", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/writing-grammar" },
    { text: "Vocabulary by Register", levels: ['B1','B2','C1','C2'], href: "/teoria/vocabulary-register" },
    { text: "Planning, Reviewing, and Self-Editing", levels: ['B2','C1','C2'], href: "/teoria/planning-reviewing" },
    { text: "Key Resources to Improve", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/resources" },
  ],
  Listening: [
    { text: "Types of Understanding: Main Idea, Details, Contrast, Tone", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/listening-types" },
    { text: "English Varieties", levels: ['B2','C1','C2'], href: "/teoria/english-varieties" },
    { text: "Short Dialogues", levels: ['A1','A2'], href: "/teoria/short-dialogues" },
    { text: "Monologues", levels: ['A2','B1'], href: "/teoria/monologues" },
    { text: "Long Conversations", levels: ['B1','B2'], href: "/teoria/long-conversations" },
    { text: "Multi-speaker Dialogues", levels: ['B2','C1','C2'], href: "/teoria/multi-speaker" },
    { text: "Contextual Vocabulary", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/contextual-vocabulary" },
    { text: "Pronunciation and Connected Speech", levels: ['A1','A2','B1'], href: "/teoria/connected-speech" },
    { text: "Note-Taking Techniques", levels: ['B1','B2','C1','C2'], href: "/teoria/note-taking" },
    { text: "Active Listening Strategies", levels: ['B1','B2','C1','C2'], href: "/teoria/listening-strategies" },
  ],
  Speaking: [
    { text: "Pronunciation", levels: ['A1','A2','B1','B2','C1','C2'], href: "/teoria/pronunciation" },
    { text: "Connectors", levels: ['A2','B1','B2'], href: "/teoria/speaking-connectors" },
    { text: "Set Phrases", levels: ['A2','B1','B2'], href: "/teoria/set-phrases" },
    { text: "Functional and Thematic Vocabulary", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/speaking-vocabulary" },
    { text: "Active Grammar and Useful Structures", levels: ['A2','B1','B2','C1','C2'], href: "/teoria/speaking-grammar" },
    { text: "Interaction and Conversational Strategies", levels: ['B1','B2','C1','C2'], href: "/teoria/interaction-strategies" },
  ],
};

// ====== Página ======
export default function TeoriaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');

  // Auth
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace('/login');
      else setLoading(false);
    })();
  }, [router]);

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

  if (loading) {
    return (
      <main className="shell teoria-page center">
        <div className="loader" aria-label="Cargando" />
      </main>
    );
  }

  return (
    <main className="shell teoria-page">
      <header className="header">
        <h1>Theory</h1>
        <p>Filtra por nivel, busca por título y explora los temas.</p>
      </header>

      {/* Filtros */}
      <section className="toolbar">
        <div className="chips">
          {LEVELS.map((l) => {
            const active = selected.includes(l);
            return (
              <button
                key={l}
                className={`chip ${active ? 'chip--active' : ''}`}
                onClick={() => toggle(l)}
                aria-pressed={active}
              >
                {l}
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
      .chip{padding:8px 12px;border-radius:9999px;border:1px solid #eaeaea;background:var(--card);color:var(--text);cursor:pointer;transition:.2s}
      .chip:hover{transform:translateY(-1px);border-color:#0070f3;background:#b0d6fa}
      .chip--active{background:#0070f3;border-color:transparent;color:white;box-shadow:0 8px 20px rgba(0,112,243,.35)}
      .chip--ghost{background:transparent}
      .search{position:relative;margin-top:12px}
      .search input{width:100%;padding:12px 36px 12px 12px;border-radius:12px;border:1px solid #eaeaea;background:white;color:var(--text);outline:none}
      .search input:focus{box-shadow:0 0 0 6px rgba(0,112,243,.35);border-color:#0070f3}
      .search__icon{position:absolute;right:10px;top:50%;translate:0 -50%;opacity:.6}
      .meta{margin-top:10px;font-size:12px;color:#666}
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
