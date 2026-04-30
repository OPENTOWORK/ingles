const DIFFICULTIES = ['basico', 'intermedio', 'avanzado'];

export function generateStaticParams() {
  return DIFFICULTIES.map((difficulty) => ({ difficulty }));
}

export default function TrainingDifficultyLayout({ children }) {
  return children;
}
