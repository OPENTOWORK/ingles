'use client';

import { notFound, useParams } from 'next/navigation';
import LevelExamModePractice from '@/components/niveles/LevelExamModePractice';
import { cefrSlugToLevel } from '@/lib/placementLevelAccess';

export default function CefrExamModePage() {
  const params = useParams();
  const slug = String(params?.cefr || '').toLowerCase();

  if (!cefrSlugToLevel(slug)) {
    notFound();
  }

  return <LevelExamModePractice slug={slug} />;
}
