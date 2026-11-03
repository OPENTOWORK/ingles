export const QUIZ_GAME_QUESTION_COUNT = 10;
export const QUIZ_GAME_SECONDS = 15;
export const QUIZ_GAME_LIVES = 3;
export const QUIZ_GAME_BEST_KEY = 'dralo-quiz-game-best';

export function shuffleList(list) {
  const next = [...list];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  return next;
}

export function buildQuizRound(questions, { category = 'mixed', count = QUIZ_GAME_QUESTION_COUNT } = {}) {
  const pool =
    category === 'mixed' ? questions : questions.filter((item) => item.category === category);
  return shuffleList(pool)
    .slice(0, Math.min(count, pool.length))
    .map((item) => ({
      ...item,
      options: shuffleList(item.options),
    }));
}

export function scoreQuizAnswer({ correct, secondsLeft, streakAfter }) {
  if (!correct) return 0;
  let points = 100 + Math.max(0, secondsLeft) * 10;
  if (streakAfter >= 5) points += 100;
  else if (streakAfter >= 3) points += 50;
  return points;
}

export function quizBestStorageKey(level = 'b2') {
  const slug = String(level || 'b2').trim().toLowerCase();
  return slug === 'b2' ? QUIZ_GAME_BEST_KEY : `${QUIZ_GAME_BEST_KEY}-${slug}`;
}

function readStoredBest(key) {
  const raw = window.localStorage.getItem(key);
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function readQuizBestScore(level = 'b2') {
  try {
    return readStoredBest(quizBestStorageKey(level));
  } catch {
    return 0;
  }
}

export function writeQuizBestScore(score, level = 'b2') {
  try {
    const previous = readQuizBestScore(level);
    const next = Math.max(previous, Number(score) || 0);
    window.localStorage.setItem(quizBestStorageKey(level), String(next));
    return next;
  } catch {
    return Number(score) || 0;
  }
}
