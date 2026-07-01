'use client';

import { notFound, useParams } from 'next/navigation';
import ExamModeResultsView from '@/components/niveles/ExamModeResultsView';
import { cefrSlugToLevel } from '@/lib/placementLevelAccess';

export default function CefrExamModeResultsPage() {
  const params = useParams();
  const slug = String(params?.cefr || '').toLowerCase();

  if (!cefrSlugToLevel(slug)) {
    notFound();
  }

  return <ExamModeResultsView slug={slug} />;
}
