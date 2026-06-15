'use client';

/**
 * Columna lateral: Strategy (opcional) + Progress + Tools.
 */
export default function ExamPracticeSideRail({
  strategy = null,
  progress = null,
  tools = null,
  finishNotice = null,
}) {
  if (!strategy && !progress && !tools && !finishNotice) return null;

  return (
    <div className="levels-listening-practice-side">
      {strategy}
      {progress}
      {tools}
      {finishNotice}
    </div>
  );
}
