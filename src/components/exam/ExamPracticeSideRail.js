'use client';

/**
 * Columna lateral: top (stats + notes) + Strategy + Progress + Tools.
 */
export default function ExamPracticeSideRail({
  topRail = null,
  strategy = null,
  progress = null,
  tools = null,
  finishNotice = null,
}) {
  if (!topRail && !strategy && !progress && !tools && !finishNotice) return null;

  return (
    <div className="levels-listening-practice-side">
      {topRail}
      {strategy || progress || tools || finishNotice ? (
        <div className="levels-listening-practice-side__panels">
          {strategy}
          {progress}
          {tools}
          {finishNotice}
        </div>
      ) : null}
    </div>
  );
}
