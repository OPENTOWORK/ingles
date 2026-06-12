import { exercisesConfig as a2RueConfig, getExercise as getA2RueExercise } from '@/data/exercises/a2-reading-and-use-of-english';
import { exercisesConfig as a2ListeningConfig, getExercise as getA2ListeningExercise } from '@/data/exercises/a2-listening';
import { exercisesConfig as a2WritingConfig, getExercise as getA2WritingExercise } from '@/data/exercises/a2-writing';
import { exercisesConfig as a2SpeakingConfig, getExercise as getA2SpeakingExercise } from '@/data/exercises/a2-speaking';
import { exercisesConfig as b1RueConfig, getExercise as getB1RueExercise } from '@/data/exercises/b1-reading-and-use-of-english';
import { exercisesConfig as b1ListeningConfig, getExercise as getB1ListeningExercise } from '@/data/exercises/b1-listening';
import { exercisesConfig as b1WritingConfig, getExercise as getB1WritingExercise } from '@/data/exercises/b1-writing';
import { exercisesConfig as b1SpeakingConfig, getExercise as getB1SpeakingExercise } from '@/data/exercises/b1-speaking';
import { exercisesConfig as b2RueConfig, getExercise as getB2RueExercise } from '@/data/exercises/b2-reading-and-use-of-english';
import { exercisesConfig as b2ListeningConfig, getExercise as getB2ListeningExercise } from '@/data/exercises/b2-listening';
import { exercisesConfig as b2WritingConfig, getExercise as getB2WritingExercise } from '@/data/exercises/b2-writing';
import { exercisesConfig as b2SpeakingConfig, getExercise as getB2SpeakingExercise } from '@/data/exercises/b2-speaking';
import { exercisesConfig as c1RueConfig, getExercise as getC1RueExercise } from '@/data/exercises/c1-reading-and-use-of-english';
import { exercisesConfig as c1ListeningConfig, getExercise as getC1ListeningExercise } from '@/data/exercises/c1-listening';
import { exercisesConfig as c1WritingConfig, getExercise as getC1WritingExercise } from '@/data/exercises/c1-writing';
import { exercisesConfig as c1SpeakingConfig, getExercise as getC1SpeakingExercise } from '@/data/exercises/c1-speaking';
import { exercisesConfig as c2RueConfig, getExercise as getC2RueExercise } from '@/data/exercises/c2-reading-and-use-of-english';
import { exercisesConfig as c2ListeningConfig, getExercise as getC2ListeningExercise } from '@/data/exercises/c2-listening';
import { exercisesConfig as c2WritingConfig, getExercise as getC2WritingExercise } from '@/data/exercises/c2-writing';
import { exercisesConfig as c2SpeakingConfig, getExercise as getC2SpeakingExercise } from '@/data/exercises/c2-speaking';

const REGISTRY = {
  'a2-reading-and-use-of-english': { exercisesConfig: a2RueConfig, getExercise: getA2RueExercise },
  'a2-listening': { exercisesConfig: a2ListeningConfig, getExercise: getA2ListeningExercise },
  'a2-writing': { exercisesConfig: a2WritingConfig, getExercise: getA2WritingExercise },
  'a2-speaking': { exercisesConfig: a2SpeakingConfig, getExercise: getA2SpeakingExercise },
  'b1-reading-and-use-of-english': { exercisesConfig: b1RueConfig, getExercise: getB1RueExercise },
  'b1-listening': { exercisesConfig: b1ListeningConfig, getExercise: getB1ListeningExercise },
  'b1-writing': { exercisesConfig: b1WritingConfig, getExercise: getB1WritingExercise },
  'b1-speaking': { exercisesConfig: b1SpeakingConfig, getExercise: getB1SpeakingExercise },
  'b2-reading-and-use-of-english': { exercisesConfig: b2RueConfig, getExercise: getB2RueExercise },
  'b2-listening': { exercisesConfig: b2ListeningConfig, getExercise: getB2ListeningExercise },
  'b2-writing': { exercisesConfig: b2WritingConfig, getExercise: getB2WritingExercise },
  'b2-speaking': { exercisesConfig: b2SpeakingConfig, getExercise: getB2SpeakingExercise },
  'c1-reading-and-use-of-english': { exercisesConfig: c1RueConfig, getExercise: getC1RueExercise },
  'c1-listening': { exercisesConfig: c1ListeningConfig, getExercise: getC1ListeningExercise },
  'c1-writing': { exercisesConfig: c1WritingConfig, getExercise: getC1WritingExercise },
  'c1-speaking': { exercisesConfig: c1SpeakingConfig, getExercise: getC1SpeakingExercise },
  'c2-reading-and-use-of-english': { exercisesConfig: c2RueConfig, getExercise: getC2RueExercise },
  'c2-listening': { exercisesConfig: c2ListeningConfig, getExercise: getC2ListeningExercise },
  'c2-writing': { exercisesConfig: c2WritingConfig, getExercise: getC2WritingExercise },
  'c2-speaking': { exercisesConfig: c2SpeakingConfig, getExercise: getC2SpeakingExercise },
};

export function getExamPartTipsExerciseBundle(levelSlug, skillFolder) {
  const key = `${String(levelSlug).toLowerCase()}-${skillFolder}`;
  return REGISTRY[key] || { exercisesConfig: {}, getExercise: null };
}
