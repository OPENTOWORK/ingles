'use client';

import { useParams } from 'next/navigation';
import QuizGamePage from '@/components/quiz-game/QuizGamePage';

export default function LevelQuizGameRoute() {
  const params = useParams();
  const level = String(params?.cefr || 'b2').toLowerCase();
  return <QuizGamePage level={level} />;
}
