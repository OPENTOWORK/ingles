'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const sections = {
  Grammar: [
    { text: "Articles, Determiners and Quantifiers", levels: ['A1'], href: "/teoria/articles" },
    { text: "Verb “to be”", levels: ['A1'], href: "/teoria/verb-to-be" },
    { text: "Pronouns", levels: ['A1'], href: "/teoria/pronouns" },
    { text: "Adverbs and Adjectives", levels: ['A1', 'A2'], href: "/teoria/adverbs-adjectives" },
    { text: "Prepositions", levels: ['A1', 'A2'], href: "/teoria/prepositions" },
    { text: "Word Formation", levels: ['B2'], href: "/teoria/word-formation" },
    { text: "Present Tenses", levels: ['A1', 'A2', 'B1'], href: "/teoria/present-tenses" },
    { text: "Past Tenses", levels: ['A2', 'B1', 'B2'], href: "/teoria/past-tenses" },
    { text: "Future Tenses", levels: ['A2', 'B1', 'B2'], href: "/teoria/future-tenses" },
    { text: "Infinitive vs Gerund", levels: ['B1'], href: "/teoria/infinitive-gerund" },
    { text: "Sentence Structures", levels: ['A1', 'B1', 'B2'], href: "/teoria/sentence-structures" },
    { text: "Linking Words", levels: ['B2', 'C1'], href: "/teoria/linking-words" },
    { text: "Modal Verbs", levels: ['A2', 'B1', 'C1'], href: "/teoria/modal-verbs" },
    { text: "Conditionals", levels: ['B1', 'B2', 'C1'], href: "/teoria/conditionals" },
    { text: "Passive Voice", levels: ['B1', 'B2', 'C1'], href: "/teoria/passive-voice" },
    { text: "Reported Speech", levels: ['B1', 'B2', 'C1'], href: "/teoria/reported-speech" },
    { text: "Comparatives and Superlatives", levels: ['A2'], href: "/teoria/comparatives-superlatives" },
    { text: "Collocations and Phrasal Verbs", levels: ['B2'], href: "/teoria/collocations-phrasal-verbs" },
    { text: "False Friends", levels: ['B1'], href: "/teoria/false-friends" },
  ],
  Writing: [
    { text: "Text Types and Structure", levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], href: "/teoria/text-types" },
    { text: "Cohesion and Connectors", levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: "/teoria/cohesion" },
    { text: "Useful Grammar and Structures", levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: "/teoria/writing-grammar" },
    { text: "Vocabulary by Register", levels: ['B1', 'B2', 'C1', 'C2'], href: "/teoria/vocabulary-register" },
    { text: "Planning, Reviewing, and Self-Editing", levels: ['B2', 'C1', 'C2'], href: "/teoria/planning-reviewing" },
    { text: "Key Resources to Improve", levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], href: "/teoria/resources" },
  ],
  Listening: [
    { text: "Types of Understanding: Main Idea, Details, Contrast, Tone", levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], href: "/teoria/listening-types" },
    { text: "English Varieties", levels: ['B2', 'C1', 'C2'], href: "/teoria/english-varieties" },
    { text: "Short Dialogues", levels: ['A1', 'A2'], href: "/teoria/short-dialogues" },
    { text: "Monologues", levels: ['A2', 'B1'], href: "/teoria/monologues" },
    { text: "Long Conversations", levels: ['B1', 'B2'], href: "/teoria/long-conversations" },
    { text: "Multi-speaker Dialogues", levels: ['B2', 'C1', 'C2'], href: "/teoria/multi-speaker" },
    { text: "Contextual Vocabulary", levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], href: "/teoria/contextual-vocabulary" },
    { text: "Pronunciation and Connected Speech", levels: ['A1', 'A2', 'B1'], href: "/teoria/connected-speech" },
    { text: "Note-Taking Techniques", levels: ['B1', 'B2', 'C1', 'C2'], href: "/teoria/note-taking" },
    { text: "Active Listening Strategies", levels: ['B1', 'B2', 'C1', 'C2'], href: "/teoria/listening-strategies" },
  ],
  Speaking: [
    { text: "Pronunciation", levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], href: "/teoria/pronunciation" },
    { text: "Connectors", levels: ['A2', 'B1', 'B2'], href: "/teoria/speaking-connectors" },
    { text: "Set Phrases", levels: ['A2', 'B1', 'B2'], href: "/teoria/set-phrases" },
    { text: "Functional and Thematic Vocabulary", levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: "/teoria/speaking-vocabulary" },
    { text: "Active Grammar and Useful Structures", levels: ['A2', 'B1', 'B2', 'C1', 'C2'], href: "/teoria/speaking-grammar" },
    { text: "Interaction and Conversational Strategies", levels: ['B1', 'B2', 'C1', 'C2'], href: "/teoria/interaction-strategies" },
  ]
};

export default function TeoriaPage() {
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error.message);
        router.replace('/login');
      }
    };

    checkSession();
  }, [router]);

  if (loading) return <p style={{ textAlign: 'center' }}>Cargando contenido...</p>;

  const toggleLevel = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const filterTopics = (topics) => {
    if (selectedLevels.length === 0) return topics;
    return topics.filter((topic) =>
      topic.levels.some((l) => selectedLevels.includes(l))
    );
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Theory</h1>
      <p>Select the levels you want to explore:</p>

      <div style={{ marginBottom: '1rem' }}>
        {levels.map((level) => (
          <label key={level} style={{ marginRight: '1rem' }}>
            <input
              type="checkbox"
              value={level}
              onChange={() => toggleLevel(level)}
              checked={selectedLevels.includes(level)}
            />
            {" "}{level}
          </label>
        ))}
      </div>

      {Object.entries(sections).map(([section, topics]) => (
        <section key={section} style={{ marginBottom: '2rem' }}>
          <h2>{section}</h2>
          <ul>
            {filterTopics(topics).map((topic, index) => (
              <li key={index}>
                <Link href={topic.href}>{topic.text}</Link>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                  ({topic.levels.join(", ")})
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
