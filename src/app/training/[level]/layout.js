const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

export function generateStaticParams() {
  return LEVELS.map((level) => ({ level }));
}

export default function TrainingLevelLayout({ children }) {
  return children;
}
