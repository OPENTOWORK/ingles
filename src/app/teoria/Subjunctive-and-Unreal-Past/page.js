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

const SubjunctivePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="Subjunctive and Unreal Past" icon="🎭">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The <strong>subjunctive</strong> and <strong>unreal past</strong> structures in English express 
          hypothetical situations, wishes, recommendations, and situations contrary to reality. 
          They are essential for sophisticated communication at advanced levels.
        </p>
        
        <QuickReference items={[
          "Subjunctive: hypothetical and formal situations",
          "Unreal past: 'were' for all persons",
          "Wish expressions: wish, if only, would rather",
          "Recommendations: suggest, recommend, insist",
          "Formal and academic structures"
        ]} />
      </TheorySection>

      <TheorySection title="The Subjunctive in English" icon="👑">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Although less common than in Spanish, English retains subjunctive forms in specific contexts.
        </p>

        <GrammarTable
          caption="Uses of the Subjunctive"
          headers={["Context", "Structure", "Example", "Register"]}
          rows={[
            ["Recommendations", "suggest/recommend + (that) + base form", "I suggest that he study harder", "Formal"],
            ["Necessity", "it's important/necessary + (that) + base form", "It's vital that she be present", "Very formal"],
            ["Formal wishes", "wish + past subjunctive", "I wish I were taller", "Neutral"],
            ["Unreal conditions", "if + were (all persons)", "If I were you, I would go", "Neutral"],
            ["Fixed expressions", "God save the Queen, Long live...", "God save the Queen", "Ceremonial"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Es importante que él esté presente."
            english="It's important that he be present."
            translation="Formal subjunctive: 'be' instead of 'is'"
          />
          
          <Example 
            spanish="Sugiero que estudies más."
            english="I suggest that you study more."
            translation="Base form after 'suggest'"
          />
        </motion.div>

        <Tip type="info">
          <strong>Note:</strong> In modern English, many subjunctive forms are replaced by 'should' + infinitive: 
          "I suggest that he should study" is more common than "I suggest that he study".
        </Tip>
      </TheorySection>

      <TheorySection title="Unreal Past with 'Were'" icon="🌟">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          'Were' is used for all persons in hypothetical situations, contrary to normal grammar.
        </p>

        <Rule 
          title="When to use 'were' for all persons"
          description="Use 'were' (not 'was') in these situations:"
          examples={[
            "Unreal conditionals: 'If I were rich...'",
            "After 'wish': 'I wish I were there'",
            "After 'as if/as though': 'He acts as if he were the boss'",
            "After 'suppose/imagine': 'Suppose you were famous'",
            "In formal inversion: 'Were I to leave early...'"
          ]}
        />

        <GrammarTable
          caption="Were vs Was in Unreal Contexts"
          headers={["Situation", "Incorrect", "Correct", "Explanation"]}
          rows={[
            ["Unreal conditional", "If I was you", "If I were you", "'Were' in hypothetical situations"],
            ["After wish", "I wish I was taller", "I wish I were taller", "Expresses an unreal wish"],
            ["As if/as though", "He acts as if he was rich", "He acts as if he were rich", "Unreal comparison"],
            ["Suppose", "Suppose she was here", "Suppose she were here", "Imaginary situation"]
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> If you can replace the situation with "imagine that..." then use 'were'. 
          "Imagine that I were rich" → "If I were rich".
        </Tip>
      </TheorySection>

      <TheorySection title="Wish Expressions" icon="⭐">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Several structures express wishes about present, past, or future situations.
        </p>

        <GrammarTable
          caption="Wish Structures"
          headers={["Structure", "Time", "Use", "Example"]}
          rows={[
            ["wish + past simple", "Present", "Wish about a current situation", "I wish I had more time"],
            ["wish + past perfect", "Past", "Regret about the past", "I wish I had studied harder"],
            ["wish + would", "Future/Habit", "Wish for future change", "I wish you would listen to me"],
            ["if only + past simple", "Present", "Strong wish about the present", "If only I were younger"],
            ["if only + past perfect", "Past", "Strong regret", "If only I had known"],
            ["would rather + past", "Preference", "Preference about others' actions", "I'd rather you didn't smoke"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Ojalá tuviera más dinero (ahora)."
            english="I wish I had more money."
            translation="Wish about a present situation"
          />
          
          <Example 
            spanish="Ojalá hubiera estudiado más (en el pasado)."
            english="I wish I had studied more."
            translation="Regret about the past"
          />
          
          <Example 
            spanish="Ojalá me escucharas (cambio futuro)."
            english="I wish you would listen to me."
            translation="Wish for a change in behaviour"
          />
        </div>

        <Tip type="warning">
          <strong>Watch out!</strong> Don't use 'wish + would' for yourself: "I wish I would be rich" ❌ 
          → "I wish I were rich" ✅
        </Tip>
      </TheorySection>

      <TheorySection title="Would Rather - Preferences" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          'Would rather' expresses preferences politely and with sophistication.
        </p>

        <Rule 
          title="Structures with Would Rather"
          description="Different ways to express preferences:"
          examples={[
            "Would rather + infinitive: 'I'd rather stay home'",
            "Would rather + past simple (others): 'I'd rather you came early'",
            "Would rather + past perfect (past): 'I'd rather you had told me'",
            "Would rather... than: 'I'd rather walk than drive'"
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Prefiero quedarme en casa."
            english="I would rather stay home."
            translation="Personal preference"
          />
          
          <Example 
            spanish="Prefiero que vengas temprano."
            english="I would rather you came early."
            translation="Preference about others' actions (present/future)"
          />
          
          <Example 
            spanish="Prefiero caminar que conducir."
            english="I would rather walk than drive."
            translation="Comparing preferences"
          />
        </div>
      </TheorySection>

      <TheorySection title="It's Time - Time Expressions" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Expressions with 'time' that require special structures.
        </p>

        <GrammarTable
          caption="Expressions with 'Time'"
          headers={["Expression", "Structure", "Meaning", "Example"]}
          rows={[
            ["It's time", "It's time + past simple", "It's time to do something now", "It's time we left"],
            ["It's about time", "It's about time + past simple", "It's about time (with impatience)", "It's about time you apologized"],
            ["It's high time", "It's high time + past simple", "It's high time (urgency)", "It's high time we made changes"],
            ["It's time for", "It's time for + noun/gerund", "It's time for (something specific)", "It's time for dinner"]
          ]}
        />

        <Example 
          spanish="Ya es hora de que te vayas."
          english="It's time you left."
          translation="'Left' (past) to express the immediate present/future"
        />

        <Tip type="info">
          <strong>Nuance:</strong> "It's time to go" (infinitive) is neutral, but "It's time we went" (past) 
          implies we should have left already.
        </Tip>
      </TheorySection>

      <TheorySection title="Recommendation Verbs" icon="💡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Certain verbs require the subjunctive or special structures in formal English.
        </p>

        <GrammarTable
          caption="Verbs That Require the Subjunctive"
          headers={["Verb", "Formal Structure", "Informal Structure", "Example"]}
          rows={[
            ["suggest", "suggest + (that) + base form", "suggest + -ing", "I suggest (that) he go / I suggest going"],
            ["recommend", "recommend + (that) + base form", "recommend + -ing", "We recommend (that) you be careful"],
            ["insist", "insist + (that) + base form", "insist on + -ing", "She insists (that) we arrive early"],
            ["demand", "demand + (that) + base form", "demand + to + infinitive", "They demand (that) he resign"],
            ["propose", "propose + (that) + base form", "propose + -ing", "I propose (that) we meet tomorrow"]
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> In American English, the subjunctive is more common. In British English, 
          'should + infinitive' is more frequent: "I suggest that he should go".
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "If I was you..." ❌<br/>
            <strong>Correct:</strong> "If I were you..." ✅<br/>
            <em>Use 'were' in unreal conditionals</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I wish I would have more money" ❌<br/>
            <strong>Correct:</strong> "I wish I had more money" ✅<br/>
            <em>Don't use 'would' with 'wish' for yourself in the present</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I suggest that he goes" ❌<br/>
            <strong>Correct:</strong> "I suggest that he go" ✅<br/>
            <em>Use the base form after recommendation verbs</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I'd rather you will come" ❌<br/>
            <strong>Correct:</strong> "I'd rather you came" ✅<br/>
            <em>Use past simple after 'would rather' for others</em>
          </Tip>
        </motion.div>
      </TheorySection>
    </motion.div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'If I _____ you, I would take that job.'"
      options={[
        "was",
        "were",
        "am",
        "will be"
      ]}
      correctAnswer={1}
      explanation="In hypothetical situations we use 'were' for all persons: 'If I were you'."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which sentence is grammatically correct?"
      options={[
        "I wish I would be taller.",
        "I wish I was taller.",
        "I wish I were taller.",
        "I wish I am taller."
      ]}
      correctAnswer={2}
      explanation="'I wish I were taller' correctly uses unreal past 'were' to express a wish about the present."
    />,

    <MultipleChoiceExercise
      key="3"
      question="Complete: 'I'd rather you _____ smoking in the house.'"
      options={[
        "don't",
        "didn't",
        "wouldn't",
        "not"
      ]}
      correctAnswer={1}
      explanation="After 'would rather' for others' actions, we use past simple: 'didn't smoke'."
    />,

    <TrueFalseExercise
      key="4"
      statements={[
        {
          text: "In formal English, we say 'I suggest that he goes' after suggestion verbs.",
          isTrue: false,
          explanation: "False. In formal English we use the base form: 'I suggest that he go'."
        },
        {
          text: "'Were' is used for all persons in unreal situations.",
          isTrue: true,
          explanation: "Correct. 'Were' is used for all persons in unreal situations."
        },
        {
          text: "'I wish you would listen' expresses a desire for future change.",
          isTrue: true,
          explanation: "Correct. 'Wish + would' expresses a desire for future change in others."
        },
        {
          text: "'It's time we left' means we should leave now or soon.",
          isTrue: true,
          explanation: "Correct. This structure indicates it's time to act."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which expresses the strongest urgency?"
      options={[
        "It's time to go.",
        "It's time we went.",
        "It's about time we went.",
        "It's high time we went."
      ]}
      correctAnswer={3}
      explanation="'It's high time' expresses the strongest urgency, indicating something should have happened long ago."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: 'I wish I _____ studied harder when I was younger.'"
      options={[
        "have",
        "had",
        "would have",
        "will have"
      ]}
      correctAnswer={1}
      explanation="For regrets about the past we use 'wish + had + past participle'."
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'I recommend that you _____ a lawyer.'"
      options={[
        "consult",
        "consults",
        "should consult",
        "Both A and C are correct"
      ]}
      correctAnswer={3}
      explanation="Both forms are correct: subjunctive (consult) or 'should + infinitive'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which sentence uses 'were' correctly?"
      options={[
        "If I was rich, I would travel.",
        "I wish I was younger.",
        "If I were you, I would go.",
        "He acts as if he was the boss."
      ]}
      correctAnswer={2}
      explanation="'If I were you' correctly uses 'were' in a hypothetical situation."
    />,

    <MultipleChoiceExercise
      key="9"
      question="Complete: 'It's vital that he _____ the truth.'"
      options={[
        "tells",
        "tell",
        "told",
        "will tell"
      ]}
      correctAnswer={1}
      explanation="After 'it's vital that' we use the subjunctive (base form): 'tell'."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Which expresses regret about the past?"
      options={[
        "I wish I had more money.",
        "I wish I would have more money.",
        "I wish I had had more money.",
        "I wish I have more money."
      ]}
      correctAnswer={2}
      explanation="'I wish I had had more money' expresses regret about the past."
    />
  ];

  return (
    <TheoryLayout
      title="Subjunctive and Unreal Past"
      description="Master the English subjunctive and unreal past structures to express wishes, recommendations, and hypothetical situations with sophistication."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic conditionals", "Verb tenses", "Basic wish structures"]}
      estimatedTime="55 min"
    />
  );
};

export default SubjunctivePage;
