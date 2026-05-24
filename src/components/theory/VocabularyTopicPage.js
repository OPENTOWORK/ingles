'use client';

import { useEffect, useState } from 'react';
import TheoryLayout from '@/components/theory/TheoryLayout';
import {
  TheorySection,
  Example,
  Tip,
  GrammarTable,
  QuickReference,
} from '@/components/theory/TheoryContent';
import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';
import { defaultExerciseLevel } from '@/lib/theoryExerciseLevelConfig';

export default function VocabularyTopicPage({ topicId }) {
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    let cancelled = false;
    import('@/data/vocabularyTopicContent').then((mod) => {
      if (!cancelled) setTopic(mod.VOCABULARY_TOPICS[topicId] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  if (!topic) {
    return (
      <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Cargando tema…</p>
    );
  }

  const theoryContent = (
    <>
      {topic.sections.map((section) => (
        <TheorySection key={section.title} title={section.title} icon={section.icon}>
          {section.intro && (
            <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
              {section.intro}
            </p>
          )}
          {section.bullets?.length > 0 && <QuickReference items={section.bullets} />}
          {section.table && (
            <GrammarTable
              caption={section.table.caption}
              headers={section.table.headers}
              rows={section.table.rows}
            />
          )}
          {section.examples?.map((ex) => (
            <Example key={ex.en} spanish={ex.es} english={ex.en} />
          ))}
          {section.tip && (
            <Tip type={section.tip.type || 'info'}>{section.tip.text}</Tip>
          )}
        </TheorySection>
      ))}
    </>
  );

  const getExercises = (
    exerciseLevel = defaultExerciseLevel(topic.level || 'B1'),
    primaryLevel = defaultExerciseLevel(topic.level || 'B1'),
  ) =>
    buildTheoryExercises(
      topicId,
      topic.exercises || {},
      exerciseLevel,
      primaryLevel,
    );

  return (
    <TheoryLayout
      title={topic.title}
      description={topic.description}
      level={topic.level || 'B1'}
      theoryContent={theoryContent}
      getExercises={getExercises}
      estimatedTime="30 min"
    />
  );
}
