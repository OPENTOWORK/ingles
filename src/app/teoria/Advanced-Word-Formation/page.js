'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const AdvancedWordFormationPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What is Advanced Word Formation?" icon="🔧">
        <p>
          <strong>Advanced Word Formation</strong> is the skill of creating new words using prefixes, suffixes, and 
          changes to the root of existing words. In advanced exams, you must form appropriate words to 
          complete texts while keeping meaning and grammar correct.
        </p>
        
        <Example 
          title="Advanced Word Formation example"
          content="Base word: 'manage' → management (noun), manageable (adjective), mismanage (verb with prefix), unmanageable (negative adjective)"
          explanation="One base word can produce several forms depending on the grammatical role and meaning needed."
        />
      </TheorySection>

      <TheorySection title="Main suffixes" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Noun suffixes"
            description="Turn verbs and adjectives into nouns."
            examples={[
              "-tion/-sion: create → creation, decide → decision",
              "-ment: develop → development, achieve → achievement",
              "-ness: happy → happiness, dark → darkness",
              "-ity/-ty: real → reality, safe → safety",
              "-ance/-ence: perform → performance, exist → existence"
            ]}
          />

          <Tip 
            title="2. Adjective suffixes"
            description="Turn nouns and verbs into adjectives."
            examples={[
              "-able/-ible: read → readable, access → accessible",
              "-ful: care → careful, help → helpful",
              "-less: care → careless, help → helpless",
              "-ous/-ious: danger → dangerous, mystery → mysterious",
              "-ive: act → active, create → creative"
            ]}
          />

          <Tip 
            title="3. Verb suffixes"
            description="Turn nouns and adjectives into verbs."
            examples={[
              "-ize/-ise: modern → modernize, special → specialize",
              "-ify: simple → simplify, class → classify",
              "-en: wide → widen, strong → strengthen",
              "-ate: active → activate, different → differentiate"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Important prefixes" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Negative prefixes"
            description="They create the opposite meaning of the base word."
            examples={[
              "un-: happy → unhappy, able → unable",
              "in-/im-/il-/ir-: possible → impossible, legal → illegal",
              "dis-: agree → disagree, appear → disappear",
              "mis-: understand → misunderstand, use → misuse",
              "non-: fiction → non-fiction, sense → nonsense"
            ]}
          />

          <Rule 
            title="2. Quantity/degree prefixes"
            description="They indicate amount, size, or intensity."
            examples={[
              "over-: work → overwork, confident → overconfident",
              "under-: estimate → underestimate, paid → underpaid",
              "super-: natural → supernatural, market → supermarket",
              "sub-: marine → submarine, conscious → subconscious",
              "multi-: cultural → multicultural, media → multimedia"
            ]}
          />

          <Rule 
            title="3. Time/position prefixes"
            description="They indicate temporal or spatial relations."
            examples={[
              "pre-: war → pre-war, historic → prehistoric",
              "post-: war → post-war, graduate → postgraduate",
              "re-: write → rewrite, consider → reconsider",
              "ex-: president → ex-president, wife → ex-wife",
              "co-: operate → cooperate, exist → coexist"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Rules and spelling changes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Root changes"
            description="Some words change their base form when you add suffixes."
            examples={[
              "y → i: happy → happiness, easy → easily",
              "Doubling consonants: big → bigger, stop → stopping",
              "Final -e dropped: create → creation, argue → argument",
              "Irregular changes: long → length, wide → width"
            ]}
          />

          <Rule 
            title="2. Affix compatibility"
            description="Not every prefix or suffix combines with every word."
            examples={[
              "Some suffixes only attach to certain word classes",
              "Check that the combination really exists",
              "Consider register (formal/informal)",
              "Some prefixes vary with the first letter of the base"
            ]}
          />

          <Rule 
            title="3. Meaning and context"
            description="The formed word must make sense in context."
            examples={[
              "Does the new word fit grammatically?",
              "Is the meaning logical in context?",
              "Is it a word that actually exists?",
              "Does it match the register of the text?"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="What is the correct noun form of 'manage'?"
      options={[
        "manageness",
        "management",
        "managation",
        "manageity"
      ]}
      correctAnswer={1}
      explanation="'Management' is the correct noun from 'manage' using the '-ment' suffix."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which prefix makes 'possible' mean the opposite?"
      options={[
        "un-",
        "dis-",
        "im-",
        "non-"
      ]}
      correctAnswer={2}
      explanation="'Impossible' uses the prefix 'im-' (a form of 'in-') before words beginning with 'p'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "The suffix '-ful' generally creates adjectives with a positive meaning.",
          isTrue: true,
          explanation: "Correct. '-ful' means 'full of' and often creates positive adjectives like 'helpful', 'useful'."
        },
        {
          text: "You can add any prefix to any word.",
          isTrue: false,
          explanation: "Incorrect. Prefixes follow specific rules and cannot all combine with every word."
        },
        {
          text: "Some words change their spelling when suffixes are added.",
          isTrue: true,
          explanation: "Correct. For example, 'happy' → 'happiness' (y to i), 'create' → 'creation' (drop e)."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the correct adjective form of 'access'?"
      options={[
        "accessful",
        "accessible",
        "accessable",
        "accessitive"
      ]}
      correctAnswer={1}
      explanation="'Accessible' is correct with the '-ible' suffix (not '-able' here)."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What does the prefix 'over-' mean in 'overconfident'?"
      options={[
        "Lack of confidence",
        "Normal confidence",
        "Too much confidence",
        "Past confidence"
      ]}
      correctAnswer={2}
      explanation="'Over-' indicates excess, so 'overconfident' means excessively confident."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "The suffix '-less' always creates words with a negative meaning.",
          isTrue: true,
          explanation: "Correct. '-less' means 'without' or 'lacking', producing negative meanings like 'careless', 'helpless'."
        },
        {
          text: "Formed words always keep exactly the same spelling of the root.",
          isTrue: false,
          explanation: "Incorrect. Spelling often changes—for example doubling consonants or y → i."
        },
        {
          text: "'-ize' and '-ise' are suffixes that turn words into verbs.",
          isTrue: true,
          explanation: "Correct. Both suffixes (US and UK variants) turn nouns/adjectives into verbs."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="What is the correct negative form of 'legal'?"
      options={[
        "unlegal",
        "dislegal",
        "illegal",
        "nonlegal"
      ]}
      correctAnswer={2}
      explanation="'Illegal' uses 'il-' (a form of 'in-') before words beginning with 'l'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which suffix turns 'real' into a noun?"
      options={[
        "-ness",
        "-ity",
        "-ment",
        "-tion"
      ]}
      correctAnswer={1}
      explanation="'Reality' uses '-ity' to turn the adjective 'real' into a noun."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "The prefix 're-' always means 'do again'.",
          isTrue: true,
          explanation: "Correct. 're-' indicates repetition: 'rewrite', 'reconsider'."
        },
        {
          text: "All words ending in '-tion' are nouns.",
          isTrue: true,
          explanation: "Correct. The '-tion' suffix always forms nouns such as 'creation', 'information', 'education'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="What is the best strategy for word formation in exams?"
      options={[
        "Memorise every possible word",
        "Understand prefix and suffix patterns",
        "Guess at random",
        "Use only simple words"
      ]}
      correctAnswer={1}
      explanation="Understanding patterns and rules for prefixes and suffixes helps you form words systematically."
    />
  ];

  return (
    <TheoryLayout
      title="Advanced Word Formation"
      description="Master advanced word formation. Learn prefixes, suffixes, and spelling changes to produce appropriate words in complex contexts."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Strong vocabulary base", "Understanding of word classes", "Basic morphology knowledge"]}
      estimatedTime="85 min"
    />
  );
};

export default AdvancedWordFormationPage;
