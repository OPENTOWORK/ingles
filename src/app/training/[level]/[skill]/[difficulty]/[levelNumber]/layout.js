export function generateStaticParams() {
  return Array.from({ length: 12 }, (_, i) => ({
    levelNumber: `level-${i + 1}`,
  }));
}

export default function TrainingLevelNumberLayout({ children }) {
  return children;
}
