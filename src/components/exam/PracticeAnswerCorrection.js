/** Correct answers are shown next to the student's attempt after checking. */
export default function PracticeAnswerCorrection({ answer, visible = false }) {
  if (!visible || !answer) return null;
  return (
    <span className="practice-answer-correction" aria-label={`Correct answer: ${answer}`}>
      <span aria-hidden="true"> → </span>{answer}
    </span>
  );
}
