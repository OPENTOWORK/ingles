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
import TheoryExerciseShell from '@/components/theory/TheoryExerciseShell';
import { getTheoryExerciseType } from '@/lib/theoryExerciseTypeCatalog';

function nextFromPool(pool, name, counters) {
  const items = pool[name] || [];
  if (!items.length) return null;
  const idx = counters[name] % items.length;
  counters[name] += 1;
  return items[idx];
}

export function buildTheoryExerciseElement(tipoId, pools, counters, reactKey, typeLabel) {
  const type = getTheoryExerciseType(tipoId);
  const label = typeLabel || type.labelEn;
  const poolName = type.pool;

  let inner = null;

  switch (poolName) {
    case 'multipleChoice': {
      const mc = nextFromPool(pools, 'multipleChoice', counters);
      if (mc) {
        inner = (
          <MultipleChoiceExercise
            question={mc.question}
            options={mc.options}
            correctAnswer={mc.correctAnswer}
            explanation={mc.explanation}
          />
        );
      }
      break;
    }
    case 'trueFalse': {
      const tf = nextFromPool(pools, 'trueFalse', counters);
      if (tf) inner = <TrueFalseExercise statements={tf.statements} />;
      break;
    }
    case 'fillBlanks': {
      const fb = nextFromPool(pools, 'fillBlanks', counters);
      if (fb) inner = <FillBlanksExercise text={fb.text} blanks={fb.blanks} />;
      break;
    }
    case 'matching': {
      const m = nextFromPool(pools, 'matching', counters);
      if (m) {
        inner = (
          <MatchingExercise title={m.title} pairs={m.pairs} explanation={m.explanation} />
        );
      }
      break;
    }
    case 'findError': {
      const fe = nextFromPool(pools, 'findError', counters);
      if (fe) {
        inner = (
          <FindErrorExercise
            title={fe.title}
            sentence={fe.sentence}
            options={fe.options}
            correctIndex={fe.correctIndex}
            explanation={fe.explanation}
          />
        );
      }
      break;
    }
    case 'sentenceOrder': {
      const so = nextFromPool(pools, 'sentenceOrder', counters);
      if (so) {
        inner = (
          <SentenceOrderExercise
            title={so.title}
            words={so.words}
            explanation={so.explanation}
          />
        );
      }
      break;
    }
    case 'selectAll': {
      const sa = nextFromPool(pools, 'selectAll', counters);
      if (sa) {
        inner = (
          <SelectAllExercise
            title={sa.title}
            prompt={sa.prompt}
            options={sa.options}
            explanation={sa.explanation}
          />
        );
      }
      break;
    }
    default:
      break;
  }

  if (!inner) return null;

  return (
    <TheoryExerciseShell key={reactKey} typeLabel={label}>
      {inner}
    </TheoryExerciseShell>
  );
}
