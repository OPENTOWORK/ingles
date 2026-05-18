'use client';
import { buildKeyWordTransformationsExercises } from './keyWordTransformationsExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const KeyWordTransformationsPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What are Key Word Transformations?" icon="🔄">
        <p>
          <strong>Key Word Transformations</strong> is Part 4 of Use of English in First Certificate (B2) and Advanced (C1). 
          You must complete six transformations using a given key word, keeping the meaning exactly the same. 
          You may use 2–5 words (B2) or 3–6 words (C1) including the key word, which you must not change.
        </p>
        
        <Example 
          title="Key Word Transformation example"
          content="1. 'I haven't seen him for ages.' KEY WORD: since
          2. 'It's ages _____ him.' 
          Answer: 'It's ages since I saw him.'"
          explanation="You change the structure while keeping the meaning, using the key word 'since'."
        />
      </TheorySection>

      <TheorySection title="Common transformation types" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Tense changes"
            description="Switch between different verb tenses."
            examples={[
              "Present Perfect → Past Simple with 'ago'",
              "Past Simple → Present Perfect with 'since/for'",
              "Future → Present with 'about to'",
              "Conditional → Past with 'wish'"
            ]}
          />

          <Tip 
            title="2. Active and passive voice"
            description="Change between active and passive."
            examples={[
              "They built the house → The house was built",
              "Someone stole my bike → My bike was stolen",
              "People say he is rich → He is said to be rich",
              "We must finish this → This must be finished"
            ]}
          />

          <Tip 
            title="3. Structures with modal verbs"
            description="Transformations with can, could, must, should, etc."
            examples={[
              "It's possible → might/could/may",
              "It's necessary → must/have to",
              "It's not necessary → don't have to/needn't",
              "It's forbidden → mustn't/can't"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Frequent patterns" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Expressions with 'make' and 'let'"
            description="Transformations with causative structures."
            examples={[
              "He forced me to go → made me go",
              "She allowed me to leave → let me leave",
              "They didn't allow smoking → wouldn't let people smoke",
              "The teacher made us study → forced us to study"
            ]}
          />

          <Rule 
            title="2. Conditionals and 'wish'"
            description="Hypothetical structures and wishes."
            examples={[
              "I regret not studying → wish I had studied",
              "It's a pity you can't come → wish you could come",
              "If only I were taller → wish I were taller",
              "I should have listened → wish I had listened"
            ]}
          />

          <Rule 
            title="3. Comparisons and superlatives"
            description="Different ways to express comparisons."
            examples={[
              "No one is taller → the tallest person",
              "Nothing is more important → the most important thing",
              "I've never seen anything better → the best thing I've ever seen",
              "She's not as tall as → shorter than"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Problem-solving strategies" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Analyse the meaning"
            description="Understand exactly what the first sentence means."
            examples={[
              "Identify subject and object",
              "Recognise the tense",
              "Note register (formal/informal)",
              "Watch for negation or emphasis"
            ]}
          />

          <Rule 
            title="2. Identify the transformation needed"
            description="Decide what kind of structural change you need."
            examples={[
              "Tense shift?",
              "Active to passive or the reverse?",
              "A different grammatical pattern?",
              "An equivalent idiomatic expression?"
            ]}
          />

          <Rule 
            title="3. Build around the key word"
            description="Use the key word as the centre of your answer."
            examples={[
              "What pattern does this word require?",
              "Which prepositions go with it?",
              "Which tense does it need?",
              "How does it fit the gap?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Frequent exam patterns" icon="📋">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="Most common transformations (B2/C1)"
            description="Structures that appear regularly in exams."
            examples={[
              "Wish + past perfect: 'I regret...' → 'I wish I had...'",
              "So/such + that: 'very tired' → 'so tired that'",
              "Have something done: 'Someone repaired' → 'had it repaired'",
              "It's time + past simple: 'should go' → 'it's time we went'"
            ]}
          />

          <Rule 
            title="Frequent key words"
            description="Words that often appear as key words."
            examples={[
              "WISH (regret, hypothetical situations)",
              "RATHER (preferences: would rather, rather than)",
              "POINT (there's no point, what's the point)",
              "SOONER (no sooner, would sooner)"
            ]}
          />

          <Rule 
            title="Time management (15–20 minutes)"
            description="Timing strategy for this section."
            examples={[
              "Spend at most 2–3 minutes per transformation",
              "If you are stuck, move on",
              "Leave 3–4 minutes for a final check",
              "Write something even if you are not sure"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Key Word Transformations"
      description="Master key word transformations. Learn to rewrite grammatical structures while keeping the same meaning, using specific key words."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildKeyWordTransformationsExercises}
      prerequisites={["Advanced grammar", "Understanding of verb tenses", "Knowledge of sentence structures"]}
      estimatedTime="85 min"
    />
  );
};

export default KeyWordTransformationsPage;
