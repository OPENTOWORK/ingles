'use client';

/**
 * Single briefing block for Listening part practice (replaces duplicate Directions + blue banner).
 */
export default function B2ListeningPracticeBriefing({
  whatYouWillHear,
  whatYouNeedToDo,
  practiceNote,
  examSimulation = false,
}) {
  if (!whatYouNeedToDo && !whatYouWillHear) return null;

  return (
    <div
      className={`levels-listening-briefing${examSimulation ? ' levels-listening-briefing--exam' : ''}`}
    >
      {whatYouWillHear ? (
        <div className="levels-listening-briefing__block">
          <p className="levels-listening-briefing__label">What you will hear</p>
          <p className="levels-listening-briefing__text">{whatYouWillHear}</p>
        </div>
      ) : null}
      <div className="levels-listening-briefing__block">
        <p className="levels-listening-briefing__label">What you need to do</p>
        <p className="levels-listening-briefing__text">{whatYouNeedToDo}</p>
      </div>
      {!examSimulation && practiceNote ? (
        <p className="levels-listening-briefing__practice-note">{practiceNote}</p>
      ) : null}
      {examSimulation ? (
        <p className="levels-listening-briefing__exam-note">
          Exam simulation: each recording will play twice when strict playback is enabled. Do not check
          answers until you finish the section.
        </p>
      ) : null}
    </div>
  );
}
