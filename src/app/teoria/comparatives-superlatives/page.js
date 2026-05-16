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

const ComparativesSuperlativesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are Comparatives and Superlatives?" icon="📊">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Comparatives</strong> and <strong>superlatives</strong> are used to compare people, things, or situations. 
          Comparatives compare two items; superlatives compare three or more.
        </p>
        
        <QuickReference items={[
          "Comparatives: compare two things",
          "Superlatives: compare three or more things",
          "Short adjectives: -er, -est",
          "Long adjectives: more, most",
          "Special irregular forms"
        ]} />
      </TheorySection>

      <TheorySection title="Forming Comparatives and Superlatives" icon="🔧">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Formation depends on adjective length and a few special rules.
        </p>

        <GrammarTable
          caption="Formation Rules"
          headers={["Adjective Type", "Comparative", "Superlative", "Example"]}
          rows={[
            ["Short (1–2 syllables)", "adjective + -er", "adjective + -est", "tall → taller → tallest"],
            ["Long (3+ syllables)", "more + adjective", "most + adjective", "beautiful → more beautiful → most beautiful"],
            ["Irregular", "special form", "special form", "good → better → best"],
            ["Two-syllable", "both rules", "both rules", "happy → happier → happiest"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Este coche es más rápido que ese"
            english="This car is faster than that one"
            translation="This car is faster than that one"
          />
          <Example 
            spanish="Esta es la película más interesante"
            english="This is the most interesting movie"
            translation="This is the most interesting movie"
          />
          <Example 
            spanish="Ella es la más alta de su familia"
            english="She is the tallest in her family"
            translation="She is the tallest in her family"
          />
        </div>

        <Rule 
          title="Spelling Rules"
          description="For short adjectives:"
          examples={[
            "Double final consonant: big → bigger → biggest",
            "Change 'y' to 'i': happy → happier → happiest",
            "Add 'e' if ending in 'e': nice → nicer → nicest"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Two-syllable adjectives can follow either rule. Those ending in -y, -ow, -er, -le usually take -er/-est.
        </Tip>
      </TheorySection>

      <TheorySection title="Irregular Adjectives" icon="⚠️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Some adjectives have irregular forms you need to memorise.
        </p>

        <GrammarTable
          caption="Irregular Adjectives"
          headers={["Adjective", "Comparative", "Superlative", "Example"]}
          rows={[
            ["good", "better", "best", "This is better than that"],
            ["bad", "worse", "worst", "This is the worst movie"],
            ["far", "farther/further", "farthest/furthest", "It's farther than I thought"],
            ["little", "less", "least", "This costs less money"],
            ["much/many", "more", "most", "I have more books"],
            ["old", "older/elder", "oldest/eldest", "My elder brother"],
            ["late", "later/latter", "latest/last", "The latter option"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Esta es una mejor solución"
            english="This is a better solution"
            translation="This is a better solution"
          />
          <Example 
            spanish="Esta es la peor película que he visto"
            english="This is the worst movie I've ever seen"
            translation="This is the worst movie I've ever seen"
          />
          <Example 
            spanish="Tengo más libros que tú"
            english="I have more books than you"
            translation="I have more books than you"
          />
        </div>

        <Tip type="warning">
          <strong>Special note:</strong> 'Farther' is used for physical distance, 'further' for abstract distance. 'Elder' is used only for family (my elder brother).
        </Tip>
      </TheorySection>

      <TheorySection title="Comparison Structures" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Different ways to structure comparisons in English.
        </p>

        <GrammarTable
          caption="Comparison Structures"
          headers={["Type", "Structure", "Example"]}
          rows={[
            ["Basic comparative", "Subject + be + comparative + than + object", "This car is faster than that one"],
            ["Basic superlative", "Subject + be + the + superlative + (in/of + group)", "This is the tallest building in the city"],
            ["Equality", "Subject + be + as + adjective + as + object", "This book is as interesting as that one"],
            ["Difference", "Subject + be + not as + adjective + as + object", "This is not as expensive as that"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Este coche es más rápido que ese"
            english="This car is faster than that one"
            translation="This car is faster than that one"
          />
          <Example 
            spanish="Este es el edificio más alto de la ciudad"
            english="This is the tallest building in the city"
            translation="This is the tallest building in the city"
          />
          <Example 
            spanish="Este libro es tan interesante como ese"
            english="This book is as interesting as that one"
            translation="This book is as interesting as that one"
          />
        </div>

        <Rule 
          title="Structure Tips"
          description="To use structures correctly:"
          examples={[
            "Use 'than' with comparatives, not with superlatives",
            "Use 'the' with superlatives (except predicatives)",
            "Use 'as...as' for equality",
            "Use 'not as...as' for difference"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Comparison structures make your descriptions more precise and expressive.
        </Tip>
      </TheorySection>

      <TheorySection title="Degree Modifiers" icon="📈">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Words that modify the degree of comparison to emphasise differences.
        </p>

        <GrammarTable
          caption="Degree Modifiers"
          headers={["Modifier", "Use", "Example"]}
          rows={[
            ["much", "emphasise a large difference", "This is much better than that"],
            ["far", "emphasise a large difference", "This is far more expensive"],
            ["a lot", "emphasise a large difference", "This is a lot cheaper"],
            ["a little", "small difference", "This is a little more difficult"],
            ["a bit", "small difference", "This is a bit longer"],
            ["slightly", "small difference", "This is slightly warmer"],
            ["no", "negation", "This is no better than that"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Esto es mucho mejor que eso"
            english="This is much better than that"
            translation="This is much better than that"
          />
          <Example 
            spanish="Esto es un poco más difícil"
            english="This is a little more difficult"
            translation="This is a little more difficult"
          />
          <Example 
            spanish="Esto es ligeramente más cálido"
            english="This is slightly warmer"
            translation="This is slightly warmer"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Degree modifiers help express nuance in comparisons and make language more natural.
        </Tip>
      </TheorySection>

      <TheorySection title="Double Comparatives" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Special structures to show progression in comparisons.
        </p>

        <GrammarTable
          caption="Double Comparatives"
          headers={["Structure", "Use", "Example"]}
          rows={[
            ["The more..., the more...", "positive progression", "The more you study, the more you learn"],
            ["The better..., the better...", "positive progression", "The better the weather, the better the trip"],
            ["The sooner..., the better...", "time progression", "The sooner we start, the better it will be"],
            ["The less..., the less...", "negative progression", "The less you worry, the less stress you have"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Mientras más estudias, más aprendes"
            english="The more you study, the more you learn"
            translation="The more you study, the more you learn"
          />
          <Example 
            spanish="Mientras más trabajes, más exitoso te vuelves"
            english="The harder you work, the more successful you become"
            translation="The harder you work, the more successful you become"
          />
          <Example 
            spanish="Mientras antes empecemos, mejor"
            english="The sooner we start, the better"
            translation="The sooner we start, the better"
          />
        </div>

        <Rule 
          title="Using Double Comparatives"
          description="To use double comparatives:"
          examples={[
            "Use 'the' before each comparative",
            "Structure: The + comparative + ..., the + comparative + ...",
            "Express cause-and-effect relationships",
            "Useful for giving advice and expressing results"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Double comparatives are very useful for expressing causal relationships and giving effective advice.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Using 'more' with short adjectives ❌<br/>
            <strong>Correct:</strong> Use -er with short adjectives ✅<br/>
            <em>This is more big than that. → This is bigger than that.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Forgetting 'the' with superlatives ❌<br/>
            <strong>Correct:</strong> Use 'the' with superlatives ✅<br/>
            <em>This is most beautiful flower. → This is the most beautiful flower.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using 'than' with superlatives ❌<br/>
            <strong>Correct:</strong> Use 'of' or 'in' with superlatives ✅<br/>
            <em>This is the tallest than all buildings. → This is the tallest of all buildings.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Double comparison ❌<br/>
            <strong>Correct:</strong> One comparison form only ✅<br/>
            <em>This is more better than that. → This is better than that.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Incorrect irregular forms ❌<br/>
            <strong>Correct:</strong> Memorise irregular forms ✅<br/>
            <em>This is the goodest solution. → This is the best solution.</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Adjective length"
            description="Length determines the comparison form."
            examples={[
              "Short adjectives (1–2 syllables): use -er, -est",
              "Long adjectives (3+ syllables): use more, most",
              "Two-syllable adjectives: can use either rule",
              "Check pronunciation to determine length"
            ]}
          />

          <Rule 
            title="2. Position and articles"
            description="Use the correct articles and prepositions."
            examples={[
              "Superlatives need 'the' before the adjective",
              "Use 'than' with comparatives, not superlatives",
              "Use 'in' for places, 'of' for groups",
              "Don't use 'the' with predicative superlatives"
            ]}
          />

          <Rule 
            title="3. Irregular forms"
            description="Memorise the most common irregular forms."
            examples={[
              "good → better → best",
              "bad → worse → worst",
              "far → farther/further → farthest/furthest",
              "much/many → more → most",
              "little → less → least"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'This is the ___ movie I've ever seen.'"
      options={[
        "gooder",
        "better",
        "best",
        "more good"
      ]}
      correctAnswer={2}
      explanation="'Best' is the irregular superlative form of 'good'."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Choose the correct comparative: This book is ___ than the other one."
      options={[
        "interesting",
        "more interesting",
        "most interesting",
        "interestinger"
      ]}
      correctAnswer={1}
      explanation="'Interesting' is a long adjective (3+ syllables), so we use 'more' for the comparative form."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "We always use 'the' before superlative adjectives.",
          isTrue: false,
          explanation: "We don't use 'the' when the superlative is predicative or when it means 'very' rather than 'most'."
        },
        {
          text: "Short adjectives use -er and -est for comparatives and superlatives.",
          isTrue: true,
          explanation: "Correct. Short adjectives (1-2 syllables) generally use -er for comparative and -est for superlative."
        },
        {
          text: "'Good' has regular comparative and superlative forms.",
          isTrue: false,
          explanation: "False. 'Good' is irregular: good → better → best."
        },
        {
          text: "We use 'than' with superlatives to show comparison.",
          isTrue: false,
          explanation: "False. We use 'than' with comparatives, not superlatives. With superlatives we use 'of' or 'in'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the superlative form of 'far'?"
      options={[
        "farther",
        "farthest",
        "furthest",
        "both b and c"
      ]}
      correctAnswer={3}
      explanation="'Far' has two superlative forms: 'farthest' (for physical distance) and 'furthest' (for abstract distance)."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which sentence is correct?"
      options={[
        "This is the most tallest building.",
        "This is the tallest building.",
        "This is more tall building.",
        "This is tallest building."
      ]}
      correctAnswer={1}
      explanation="'Tall' is a short adjective, so we use -est for superlative, and we need 'the' before superlatives."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "'Less' is the opposite of 'more' in comparisons.",
          isTrue: true,
          explanation: "Correct. 'Less' is used for negative comparatives: 'less expensive' = 'cheaper'."
        },
        {
          text: "We can use 'much' to emphasize comparatives.",
          isTrue: true,
          explanation: "Correct. 'Much better', 'much more expensive', 'much taller' emphasise the difference."
        },
        {
          text: "All two-syllable adjectives use 'more' and 'most'.",
          isTrue: false,
          explanation: "Incorrect. Some two-syllable adjectives can use -er/-est: 'simpler', 'cleverer'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'She is ___ person I know.'"
      options={[
        "the kindest",
        "the most kind",
        "kinder",
        "more kind"
      ]}
      correctAnswer={0}
      explanation="'Kind' is a short adjective; use -est for superlative: 'the kindest'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: 'Today is ___ than yesterday.'"
      options={[
        "more hot",
        "hotter",
        "hottest",
        "most hot"
      ]}
      correctAnswer={1}
      explanation="'Hot' doubles the final consonant and adds -er for comparative: 'hotter'."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Elder' and 'older' can both be used for age.",
          isTrue: true,
          explanation: "Correct. 'Older' is more common, but 'elder' is used especially for family: 'my elder brother'."
        },
        {
          text: "We need 'than' after superlatives.",
          isTrue: false,
          explanation: "Incorrect. Superlatives use 'of' or 'in', not 'than': 'the tallest in the class'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'This exercise is ___ difficult ___ the previous one.'"
      options={[
        "as... than",
        "as... as",
        "so... as",
        "more... than"
      ]}
      correctAnswer={1}
      explanation="For equality we use 'as... as': 'This exercise is as difficult as the previous one'."
    />
  ];

  return (
    <TheoryLayout
      title="Comparatives and Superlatives"
      description="Master comparatives and superlatives in English. Learn to compare people, things, and situations using -er, -est, more, most, and special structures."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic adjectives", "Understanding of sentence structure"]}
      estimatedTime="70 min"
    />
  );
};

export default ComparativesSuperlativesPage;
