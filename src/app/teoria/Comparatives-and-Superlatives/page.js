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

const ComparativesandSuperlativesPage = () => {
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
            ["Short adjectives (1–2 syllables)", "adjective + -er", "adjective + -est", "tall → taller → tallest"],
            ["Long adjectives (3+ syllables)", "more + adjective", "most + adjective", "beautiful → more beautiful → most beautiful"],
            ["Irregular adjectives", "special form", "special form", "good → better → best"],
            ["Two-syllable adjectives", "both rules possible", "both rules possible", "happy → happier → happiest"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="This car is faster than that one" />
          <Example english="This is the most interesting movie" />
          <Example english="She is the tallest in her family" />
        </div>

        <Rule 
          title="Spelling Rules"
          description="For short adjectives:"
          examples={[
            "Double final consonant: big → bigger → biggest",
            "Change y to i: happy → happier → happiest",
            "Add -r/-st if the adjective ends in -e: nice → nicer → nicest"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Two-syllable adjectives can follow either rule. Those ending in -y, -ow, -er, or -le often use -er/-est.
        </Tip>
      </TheorySection>

      <TheorySection title="Irregular Adjectives" icon="⚠️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Some adjectives have irregular forms you should memorize.
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
          <Example english="This is a better solution" />
          <Example english="This is the worst movie I've ever seen" />
          <Example english="I have more books than you" />
        </div>

        <Tip type="warning">
          <strong>Special note:</strong> Use <em>farther</em> for physical distance and <em>further</em> for abstract distance. <em>Elder</em> is mainly used for family (my elder brother).
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
          <Example english="This car is faster than that one" />
          <Example english="This is the tallest building in the city" />
          <Example english="This book is as interesting as that one" />
        </div>

        <Rule 
          title="Structure Tips"
          description="To use structures correctly:"
          examples={[
            "Use 'than' with comparatives, not superlatives",
            "Use 'the' with superlatives (except some predicative uses)",
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
          Words that modify the degree of comparison to emphasize differences.
        </p>

        <GrammarTable
          caption="Degree Modifiers"
          headers={["Modifier", "Use", "Example"]}
          rows={[
            ["much", "emphasize a large difference", "This is much better than that"],
            ["far", "emphasize a large difference", "This is far more expensive"],
            ["a lot", "emphasize a large difference", "This is a lot cheaper"],
            ["a little", "small difference", "This is a little more difficult"],
            ["a bit", "small difference", "This is a bit longer"],
            ["slightly", "small difference", "This is slightly warmer"],
            ["no", "negation", "This is no better than that"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="This is much better than that" />
          <Example english="This is a little more difficult" />
          <Example english="This is slightly warmer" />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Degree modifiers help you express nuance in comparisons and sound more natural.
        </Tip>
      </TheorySection>

      <TheorySection title="Progressive Comparatives" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Special structures that show progression in comparisons.
        </p>

        <GrammarTable
          caption="Progressive Comparatives"
          headers={["Structure", "Use", "Example"]}
          rows={[
            ["The more..., the more...", "positive progression", "The more you study, the more you learn"],
            ["The better..., the better...", "positive progression", "The better the weather, the better the trip"],
            ["The sooner..., the better...", "time progression", "The sooner we start, the better it will be"],
            ["The less..., the less...", "negative progression", "The less you worry, the less stress you have"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="The more you study, the more you learn" />
          <Example english="The harder you work, the more successful you become" />
          <Example english="The sooner we start, the better" />
        </div>

        <Rule 
          title="Using Progressive Comparatives"
          description="To use progressive comparatives:"
          examples={[
            "Use 'the' before each comparative",
            "Pattern: The + comparative + ..., the + comparative + ...",
            "Express cause-and-effect relationships",
            "Useful for giving advice and stating results"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Progressive comparatives are very useful for expressing causal relationships and giving effective advice.
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
            <strong>Correct:</strong> Use only one comparative form ✅<br/>
            <em>This is more better than that. → This is better than that.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Incorrect irregular forms ❌<br/>
            <strong>Correct:</strong> Memorize irregular forms ✅<br/>
            <em>This is the goodest solution. → This is the best solution.</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Adjective length"
            description="Length determines the comparative form."
            examples={[
              "Short adjectives (1–2 syllables): use -er, -est",
              "Long adjectives (3+ syllables): use more, most",
              "Two-syllable adjectives: may use either rule",
              "Check pronunciation to decide length"
            ]}
          />

          <Rule 
            title="2. Position and articles"
            description="Use the correct articles and prepositions."
            examples={[
              "Superlatives need 'the' before the adjective",
              "Use 'than' with comparatives, not superlatives",
              "Use 'in' for places, 'of' for groups",
              "Do not use 'the' with some predicative superlatives"
            ]}
          />

          <Rule 
            title="3. Irregular forms"
            description="Memorize the most common irregular forms."
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
      options={["gooder", "better", "best", "more good"]}
      correctAnswer={2}
      explanation="'Best' is the irregular superlative form of 'good'."
    />,
    <MultipleChoiceExercise
      key="2"
      question="Choose the correct comparative: This book is ___ than the other one."
      options={["interesting", "more interesting", "most interesting", "interestinger"]}
      correctAnswer={1}
      explanation="'Interesting' has three or more syllables, so we use 'more' for the comparative."
    />,
    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "We always use 'the' before superlative adjectives.",
          isTrue: false,
          explanation: "We do not use 'the' when the superlative is predicative or means 'very' rather than 'most'."
        },
        {
          text: "Short adjectives use -er and -est for comparatives and superlatives.",
          isTrue: true,
          explanation: "Correct. Short adjectives (1–2 syllables) generally use -er and -est."
        },
        {
          text: "'Good' has regular comparative and superlative forms.",
          isTrue: false,
          explanation: "False. 'Good' is irregular: good → better → best."
        },
        {
          text: "We use 'than' with superlatives to show comparison.",
          isTrue: false,
          explanation: "False. We use 'than' with comparatives. With superlatives we use 'of' or 'in'."
        }
      ]}
    />,
    <MultipleChoiceExercise
      key="4"
      question="What is the superlative form of 'far'?"
      options={["farther", "farthest", "furthest", "both b and c"]}
      correctAnswer={3}
      explanation="'Far' has two superlative forms: 'farthest' (physical distance) and 'furthest' (abstract distance)."
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
      explanation="'Tall' is a short adjective, so we use -est for the superlative and need 'the' before it."
    />,
    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "'Less' is the opposite of 'more' in comparisons.",
          isTrue: true,
          explanation: "Correct. 'Less' is used in negative comparatives: 'less expensive'."
        },
        {
          text: "We can use 'much' to emphasize comparatives.",
          isTrue: true,
          explanation: "Correct. 'Much better', 'much more expensive', and 'much taller' emphasize the difference."
        },
        {
          text: "All two-syllable adjectives use 'more' and 'most'.",
          isTrue: false,
          explanation: "Incorrect. Some two-syllable adjectives use -er/-est: 'simpler', 'cleverer'."
        }
      ]}
    />,
    <MultipleChoiceExercise
      key="7"
      question="Complete: 'She is ___ person I know.'"
      options={["the kindest", "the most kind", "kinder", "more kind"]}
      correctAnswer={0}
      explanation="'Kind' is a short adjective; the superlative is 'the kindest'."
    />,
    <MultipleChoiceExercise
      key="8"
      question="Complete: 'Today is ___ than yesterday.'"
      options={["more hot", "hotter", "hottest", "most hot"]}
      correctAnswer={1}
      explanation="'Hot' doubles the final consonant and adds -er: 'hotter'."
    />,
    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Elder' and 'older' can both be used for age.",
          isTrue: true,
          explanation: "Correct. 'Older' is more common, but 'elder' is often used for family: 'my elder brother'."
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
      options={["as... than", "as... as", "so... as", "more... than"]}
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

export default ComparativesandSuperlativesPage;
