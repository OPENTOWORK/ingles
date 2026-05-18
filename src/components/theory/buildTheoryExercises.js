import {
  MultipleChoiceExercise,
  FillBlanksExercise,
  TrueFalseExercise,
} from '@/components/theory/ExerciseComponents';
import {
  MatchingExercise,
  FindErrorExercise,
  SentenceOrderExercise,
  SelectAllExercise,
} from '@/components/theory/ExtendedExerciseComponents';

/**
 * Builds exactly 20 interactive exercises in a fixed order:
 * 5× MC → 3× Fill → 2× T/F → 2× Match → 3× Find error → 3× Order → 2× Select all
 */
export function buildTheoryExercises(slug, config) {
  const key = (n) => `${slug}-${n}`;
  const {
    multipleChoice = [],
    fillBlanks = [],
    trueFalse = [],
    matching = [],
    findError = [],
    sentenceOrder = [],
    selectAll = [],
  } = config;

  const exercises = [];
  let n = 1;

  multipleChoice.slice(0, 5).forEach((mc) => {
    exercises.push(
      <MultipleChoiceExercise
        key={key(n++)}
        question={mc.question}
        options={mc.options}
        correctAnswer={mc.correctAnswer}
        explanation={mc.explanation}
      />,
    );
  });

  fillBlanks.slice(0, 3).forEach((fb) => {
    exercises.push(
      <FillBlanksExercise
        key={key(n++)}
        text={fb.text}
        blanks={fb.blanks}
      />,
    );
  });

  trueFalse.slice(0, 2).forEach((tf) => {
    exercises.push(
      <TrueFalseExercise key={key(n++)} statements={tf.statements} />,
    );
  });

  matching.slice(0, 2).forEach((m) => {
    exercises.push(
      <MatchingExercise
        key={key(n++)}
        title={m.title}
        pairs={m.pairs}
        explanation={m.explanation}
      />,
    );
  });

  findError.slice(0, 3).forEach((fe) => {
    exercises.push(
      <FindErrorExercise
        key={key(n++)}
        title={fe.title}
        sentence={fe.sentence}
        options={fe.options}
        correctIndex={fe.correctIndex}
        explanation={fe.explanation}
      />,
    );
  });

  sentenceOrder.slice(0, 3).forEach((so) => {
    exercises.push(
      <SentenceOrderExercise
        key={key(n++)}
        title={so.title}
        words={so.words}
        explanation={so.explanation}
      />,
    );
  });

  selectAll.slice(0, 2).forEach((sa) => {
    exercises.push(
      <SelectAllExercise
        key={key(n++)}
        title={sa.title}
        prompt={sa.prompt}
        options={sa.options}
        explanation={sa.explanation}
      />,
    );
  });

  return exercises;
}
