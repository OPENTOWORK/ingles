'use client';
import { buildAdvancedWordFormationExercises } from './advancedWordFormationExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const AdvancedWordFormationPage = () => {
  const theoryContent = (
    <>
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
    </>
  );

    return (
    <TheoryLayout
      title="Advanced Word Formation"
      description="Master advanced word formation. Learn prefixes, suffixes, and spelling changes to produce appropriate words in complex contexts."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildAdvancedWordFormationExercises}
      prerequisites={["Strong vocabulary base", "Understanding of word classes", "Basic morphology knowledge"]}
      estimatedTime="85 min"
    />
  );
};

export default AdvancedWordFormationPage;
