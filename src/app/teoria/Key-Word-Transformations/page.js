'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const KeyWordTransformationsPage = () => {
  const theoryContent = (
    <div>
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
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="In Key Word Transformations, how many words should you generally use?"
      options={[
        "Exactly 3 words",
        "Between 2–5 words including the key word",
        "As many as you need",
        "Only the key word"
      ]}
      correctAnswer={1}
      explanation="You must use between 2–5 words including the given key word, keeping the same meaning."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Transform: 'I haven't been to Paris for years.' KEY: since. 'It's years _____ to Paris.'"
      options={[
        "since I went",
        "since I have been",
        "since I go",
        "since going"
      ]}
      correctAnswer={0}
      explanation="'Since' needs a specific point in time, so you need Past Simple: 'since I went'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "In Key Word Transformations you must keep exactly the same meaning.",
          isTrue: true,
          explanation: "Correct. The second sentence must mean exactly the same as the first."
        },
        {
          text: "You may change the given key word.",
          isTrue: false,
          explanation: "Incorrect. You must use the key word exactly as given, without changing it."
        },
        {
          text: "Contractions count as one word.",
          isTrue: true,
          explanation: "Correct. Contractions such as 'don't', 'I'll', 'we've' count as a single word."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Transform: 'They made me wait for an hour.' KEY: forced. 'I _____ wait for an hour.'"
      options={[
        "was forced to",
        "was forced for",
        "forced to",
        "was forcing to"
      ]}
      correctAnswer={0}
      explanation="Passive 'force' needs 'was forced to + infinitive': 'I was forced to wait'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Transform: 'It's possible that it will rain.' KEY: might. 'It _____ rain.'"
      options={[
        "might be",
        "might to",
        "might",
        "might have"
      ]}
      correctAnswer={2}
      explanation="'Might' expresses possibility and is followed directly by the base verb: 'It might rain'."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "You must always use exactly five words in your answer.",
          isTrue: false,
          explanation: "Incorrect. You may use between 2–5 words; it does not have to be exactly five."
        },
        {
          text: "The key word must always come at the start of your answer.",
          isTrue: false,
          explanation: "Incorrect. The key word can appear anywhere in your answer."
        },
        {
          text: "You should consider the tense of the original sentence.",
          isTrue: true,
          explanation: "Correct. The tense may change in the transformation, but the time meaning must stay the same."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Transform: 'I regret not studying harder.' KEY: wish. 'I _____ studied harder.'"
      options={[
        "wish I",
        "wish I had",
        "wish I have",
        "wish to have"
      ]}
      correctAnswer={1}
      explanation="To express regret about the past we use 'wish + past perfect': 'I wish I had studied'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Transform: 'No one in the class is taller than John.' KEY: tallest. 'John _____ in the class.'"
      options={[
        "is the tallest",
        "is tallest",
        "the tallest is",
        "is the taller"
      ]}
      correctAnswer={0}
      explanation="For a superlative you need the article 'the': 'John is the tallest in the class'."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "You may change the subject of the sentence in transformations.",
          isTrue: true,
          explanation: "Correct. You often switch from active to passive, which changes the grammatical subject."
        },
        {
          text: "Transformations always keep the same grammatical structure.",
          isTrue: false,
          explanation: "Incorrect. Transformations often change structure while keeping the meaning."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Transform: 'She didn't let me go to the party.' KEY: allowed. 'I _____ to the party.'"
      options={[
        "wasn't allowed to go",
        "wasn't allowed go",
        "didn't allow to go",
        "wasn't allowing to go"
      ]}
      correctAnswer={0}
      explanation="Passive 'allow' needs 'wasn't allowed to + infinitive': 'I wasn't allowed to go'."
    />
  ];

  return (
    <TheoryLayout
      title="Key Word Transformations"
      description="Master key word transformations. Learn to rewrite grammatical structures while keeping the same meaning, using specific key words."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced grammar", "Understanding of verb tenses", "Knowledge of sentence structures"]}
      estimatedTime="85 min"
    />
  );
};

export default KeyWordTransformationsPage;
