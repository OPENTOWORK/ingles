'use client';
import React from 'react';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { 
  TheorySection, 
  Example, 
  Rule, 
  Tip, 
  GrammarTable, 
  QuickReference 
} from '@/components/theory/TheoryContent';
import { 
  MultipleChoiceExercise, 
  FillBlanksExercise, 
  TrueFalseExercise 
} from '@/components/theory/ExerciseComponents';

const AdverbsAndAdjectivesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What are Adverbs and Adjectives?" icon="📝">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Adjectives</strong> describe nouns, while <strong>adverbs</strong> modify verbs, adjectives, or other adverbs. 
          They are essential for adding detail and nuance to our sentences.
        </p>
        
        <QuickReference items={[
          "Adjectives: describe nouns (big house)",
          "Adverbs: modify verbs (run quickly)",
          "Position: adjectives go before the noun",
          "Formation: many adverbs end in -ly",
          "Comparatives and superlatives for both"
        ]} />
      </TheorySection>

      <TheorySection title="Adjectives" icon="🎨">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Adjectives describe qualities, characteristics, or states of nouns.
        </p>

        <GrammarTable
          caption="Types of Adjectives"
          headers={["Type", "Function", "Example", "Meaning"]}
          rows={[
            ["Descriptive", "Describe qualities", "big house", "big house"],
            ["Colors", "Indicate color", "red car", "red car"],
            ["Numbers", "Indicate quantity", "three books", "three books"],
            ["Possessive", "Indicate possession", "my book", "my book"],
            ["Demonstrative", "Point to something specific", "this book", "this book"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Tengo un coche grande y rojo"
            english="I have a big red car"
            translation="I have a big red car"
          />
          <Example 
            spanish="Ella es muy inteligente"
            english="She is very intelligent"
            translation="She is very intelligent"
          />
          <Example 
            spanish="Los estudiantes están contentos"
            english="The students are happy"
            translation="The students are happy"
          />
        </div>

        <Rule 
          title="Position of Adjectives"
          description="In English, adjectives go before the noun:"
          examples={[
            "A beautiful flower (a beautiful flower)",
            "An old house (an old house)",
            "Big red apples (big red apples)"
          ]}
        />

        <Tip type="info">
          <strong>Order of adjectives:</strong> opinion, size, age, shape, color, origin, material, purpose + noun.
        </Tip>
      </TheorySection>

      <TheorySection title="Adverbs" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Adverbs modify verbs, adjectives, or other adverbs to give more information about how, when, where, or how often something happens.
        </p>

        <GrammarTable
          caption="Types of Adverbs"
          headers={["Type", "Function", "Example", "Question"]}
          rows={[
            ["Manner (How)", "How something is done", "quickly", "How?"],
            ["Time (When)", "When it happens", "yesterday", "When?"],
            ["Place (Where)", "Where it happens", "here", "Where?"],
            ["Frequency (How often)", "How often", "always", "How often?"],
            ["Degree (How much)", "To what degree", "very", "How much?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Corre rápidamente"
            english="He runs quickly"
            translation="He runs quickly"
          />
          <Example 
            spanish="Siempre estudio por la noche"
            english="I always study at night"
            translation="I always study at night"
          />
          <Example 
            spanish="Ella es muy hermosa"
            english="She is very beautiful"
            translation="She is very beautiful"
          />
        </div>

        <Rule 
          title="Forming Adverbs"
          description="Many adverbs are formed by adding -ly to the adjective:"
          examples={[
            "Quick → Quickly (quick → quickly)",
            "Beautiful → Beautifully (beautiful → beautifully)",
            "Careful → Carefully (careful → carefully)"
          ]}
        />

        <Tip type="warning">
          <strong>Exceptions:</strong> Some adjectives already work as adverbs: fast, hard, late, early, daily.
        </Tip>
      </TheorySection>

      <TheorySection title="Comparatives and Superlatives" icon="📊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Comparatives and superlatives let us compare qualities between two or more things.
        </p>

        <GrammarTable
          caption="Forming Comparatives and Superlatives"
          headers={["Type", "Comparative", "Superlative", "Example"]}
          rows={[
            ["Short (1 syllable)", "adjective + er", "adjective + est", "big → bigger → biggest"],
            ["Long (2+ syllables)", "more + adjective", "most + adjective", "beautiful → more beautiful → most beautiful"],
            ["Ends in -y", "adjective -y + ier", "adjective -y + iest", "happy → happier → happiest"],
            ["Irregular", "Special forms", "Special forms", "good → better → best"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Mi hermano es más alto que yo"
            english="My brother is taller than me"
            translation="My brother is taller than me"
          />
          <Example 
            spanish="Esta película es más interesante"
            english="This movie is more interesting"
            translation="This movie is more interesting"
          />
          <Example 
            spanish="Es el estudiante más inteligente"
            english="He is the most intelligent student"
            translation="He is the most intelligent student"
          />
        </div>

        <Rule 
          title="Using Comparatives and Superlatives"
          description="When to use each one:"
          examples={[
            "Comparative: compare 2 things (than)",
            "Superlative: compare 3+ things (the)",
            "As...as: equality (as tall as)",
            "Not as...as: inequality (not as tall as)"
          ]}
        />

        <Tip type="success">
          <strong>Key words:</strong> than, the, as...as.
        </Tip>
      </TheorySection>

      <TheorySection title="Adverbs of Frequency" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Adverbs of frequency show how often an action happens.
        </p>

        <GrammarTable
          caption="Common Adverbs of Frequency"
          headers={["Adverb", "Frequency", "Position", "Example"]}
          rows={[
            ["Always", "100%", "Before the main verb", "I always eat breakfast"],
            ["Usually", "80-90%", "Before the main verb", "I usually go to bed early"],
            ["Often", "60-70%", "Before the main verb", "I often read books"],
            ["Sometimes", "30-50%", "Before the main verb", "I sometimes watch TV"],
            ["Rarely", "10-20%", "Before the main verb", "I rarely eat fast food"],
            ["Never", "0%", "Before the main verb", "I never smoke"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Siempre desayuno en casa"
            english="I always have breakfast at home"
            translation="I always have breakfast at home"
          />
          <Example 
            spanish="A veces voy al cine"
            english="I sometimes go to the cinema"
            translation="I sometimes go to the cinema"
          />
          <Example 
            spanish="Nunca llego tarde"
            english="I never arrive late"
            translation="I never arrive late"
          />
        </div>

        <Tip type="info">
          <strong>Position:</strong> Adverbs of frequency go after the verb &quot;to be&quot; but before other verbs.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> &quot;I am good in English&quot; ❌<br/>
            <strong>Correct:</strong> &quot;I am good at English&quot; ✅<br/>
            <em>We use &apos;at&apos; with &apos;good&apos; for skills</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> &quot;She runs quick&quot; ❌<br/>
            <strong>Correct:</strong> &quot;She runs quickly&quot; ✅<br/>
            <em>To describe verbs we use adverbs, not adjectives</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> &quot;I am very tiredly&quot; ❌<br/>
            <strong>Correct:</strong> &quot;I am very tired&quot; ✅<br/>
            <em>After &apos;be&apos; we use adjectives, not adverbs</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> &quot;This is more better&quot; ❌<br/>
            <strong>Correct:</strong> &quot;This is better&quot; ✅<br/>
            <em>We don&apos;t use &apos;more&apos; with short comparatives</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Adjectives after 'be'"
            description="After the verb 'to be' we use adjectives, not adverbs."
            examples={[
              "She is beautiful (she is beautiful)",
              "The food is delicious (the food is delicious)"
            ]}
          />

          <Rule 
            title="2. Adverbs with action verbs"
            description="To describe how an action is done, we use adverbs."
            examples={[
              "She sings beautifully (she sings beautifully)",
              "He drives carefully (he drives carefully)"
            ]}
          />

          <Rule 
            title="3. Order of adjectives"
            description="When there are several adjectives, they follow a specific order."
            examples={[
              "A beautiful big red car (a beautiful big red car)",
              "An expensive Italian leather bag (an expensive Italian leather bag)"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'She is a _____ girl who sings _____.' (beautiful)"
      options={[
        "beautiful, beautiful",
        "beautifully, beautifully", 
        "beautiful, beautifully",
        "beautifully, beautiful"
      ]}
      correctAnswer={2}
      explanation="'Beautiful' (adjective) describes nouns; 'beautifully' (adverb) describes verbs."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which is the correct form to complete: 'She runs ___'?"
      options={[
        "quick",
        "quickly",
        "quicklyly",
        "quicklyer"
      ]}
      correctAnswer={1}
      explanation="To describe how she runs (verb), we use the adverb 'quickly'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'I am very tiredly' is correct.",
          isTrue: false,
          explanation: "Incorrect. After 'be' we use adjectives: 'I am very tired'."
        },
        {
          text: "'She sings beautifully' is correct.",
          isTrue: true,
          explanation: "Correct. To describe how she sings we use the adverb 'beautifully'."
        },
        {
          text: "'This car is more expensive than that one' is correct.",
          isTrue: true,
          explanation: "Correct. For long adjectives we use 'more + adjective + than'."
        },
        {
          text: "'I always am happy' is correct.",
          isTrue: false,
          explanation: "Incorrect. With 'be', the adverb goes after: 'I am always happy'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which is the correct form to complete: 'He is ___ student in the class'?"
      options={[
        "the most intelligent",
        "the intelligentest",
        "the more intelligent",
        "the intelligenter"
      ]}
      correctAnswer={0}
      explanation="For superlatives of long adjectives we use 'the most + adjective': 'the most intelligent'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which is the correct form to complete: 'I am ___ at mathematics'?"
      options={[
        "good",
        "well",
        "goodly",
        "goods"
      ]}
      correctAnswer={0}
      explanation="After 'be' we use adjectives. 'Good' is the correct adjective here."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Adverbs usually end in -ly.",
          isTrue: true,
          explanation: "Correct. Most adverbs end in -ly: quickly, slowly, carefully."
        },
        {
          text: "We can say 'She sings beautiful'.",
          isTrue: false,
          explanation: "Incorrect. We need the adverb 'beautifully' to modify the verb: 'She sings beautifully'."
        },
        {
          text: "Adjectives describe nouns.",
          isTrue: true,
          explanation: "Correct. Adjectives describe or modify nouns: 'beautiful flower', 'tall building'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'She drives very _____.'"
      options={[
        "careful",
        "carefully",
        "care",
        "caring"
      ]}
      correctAnswer={1}
      explanation="To modify a verb we need an adverb: 'carefully'. 'She drives very carefully'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="What is the superlative of 'bad'?"
      options={[
        "baddest",
        "most bad",
        "worst",
        "worse"
      ]}
      correctAnswer={2}
      explanation="'Bad' is irregular: bad → worse → worst. 'Worst' is the superlative."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Fast' can be both an adjective and an adverb.",
          isTrue: true,
          explanation: "Correct. 'Fast' works as an adjective ('a fast car') and as an adverb ('he runs fast')."
        },
        {
          text: "We say 'more better' for emphasis.",
          isTrue: false,
          explanation: "Incorrect. 'Better' is already comparative. We cannot say 'more better', only 'better'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'This is the ___ book I've ever read.'"
      options={[
        "more interesting",
        "most interesting",
        "interestinger",
        "interestingest"
      ]}
      correctAnswer={1}
      explanation="For superlatives of long adjectives we use 'the most + adjective': 'the most interesting'."
    />
  ];

  return (
    <TheoryLayout
      title="Adverbs and Adjectives"
      description="Master adjectives and adverbs in English. Learn their uses, positions, comparatives, and superlatives to express yourself with precision."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic vocabulary", "Understanding of nouns and verbs"]}
      estimatedTime="55 min"
    />
  );
};

export default AdverbsAndAdjectivesPage;
