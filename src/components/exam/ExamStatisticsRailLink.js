'use client';

import Link from 'next/link';
import { studentProfileHref } from '@/lib/studentProfileNav';

/** Practice-rail shortcut to Exam Statistics in the student profile. */
export default function ExamStatisticsRailLink({ lang = 'en' }) {
  const en = lang === 'en';
  const label = en ? 'Exam statistics' : 'Estadísticas del examen';

  return (
    <aside className="levels-listening-strategy levels-listening-strategy--progress exam-practice-rail-disclosure">
      <Link
        href={studentProfileHref('exam-statistics')}
        className="levels-listening-strategy__toggle levels-listening-strategy__toggle--progress"
      >
        {label}
      </Link>
    </aside>
  );
}
