import { notFound } from 'next/navigation';
import ExamStrategiesChapterView from '@/components/theory/ExamStrategiesChapterView';
import { getExamStrategiesChapterCopy } from '@/data/examStrategiesStudentIndex';
import { getExamStrategiesOverallContent } from '@/data/examStrategiesOverallContent';

export function generateStaticParams() {
  return [
    { skill: 'reading-and-use-of-english', chapter: 'overall-strategy' },
    { skill: 'listening', chapter: 'overall-strategy' },
    { skill: 'writing', chapter: 'overall-strategy' },
    { skill: 'writing', chapter: 'part-2-review' },
    { skill: 'writing', chapter: 'part-2-report' },
    { skill: 'writing', chapter: 'part-2-article' },
    { skill: 'writing', chapter: 'part-2-email' },
    { skill: 'speaking', chapter: 'overall-strategy' },
  ];
}

export default function ExamStrategiesChapterPage({ params }) {
  const skill = String(params.skill || '');
  const chapter = String(params.chapter || '');
  const copy = getExamStrategiesChapterCopy(skill, chapter);

  if (!copy) {
    notFound();
  }

  return (
    <ExamStrategiesChapterView
      skill={skill}
      chapter={chapter}
      title={copy.title}
      intro={copy.intro}
      content={getExamStrategiesOverallContent(skill, chapter)}
    />
  );
}
