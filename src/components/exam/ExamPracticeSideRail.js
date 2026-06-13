'use client';

/**
 * Columna lateral: Strategy (opcional) + Progress + Tools.
 */
export default function ExamPracticeSideRail({ strategy = null, progress = null, tools = null }) {
  if (!strategy && !progress && !tools) return null;

  return (
    <div className="levels-listening-practice-side">
      {strategy}
      {progress}
      {tools}
    </div>
  );
}
