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

const ConditionalsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are Conditionals?" icon="🔀">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Conditionals</strong> are grammatical structures that express hypothetical situations, 
          possibilities, and their outcomes. They consist of a conditional clause (if) and a main clause 
          that expresses the result.
        </p>
        
        <QuickReference items={[
          "Express hypothetical situations",
          "Have an ‘if’ clause and a result",
          "Different types depending on likelihood",
          "Zero, First, Second, Third, Mixed",
          "Essential for expressing possibilities"
        ]} />
      </TheorySection>

      <TheorySection title="Zero Conditional" icon="🌍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used for general facts, universal truths, and situations that always hold true.
        </p>

        <GrammarTable
          caption="Zero Conditional — Structure"
          headers={["Structure", "Example", "Meaning"]}
          rows={[
            ["If + present simple, present simple", "If you heat water, it boils", "If you heat water, it boils"],
            ["Present simple + if + present simple", "Water boils if you heat it", "Water boils if you heat it"],
            ["When/whenever + present simple, present simple", "When it rains, the ground gets wet", "When it rains, the ground gets wet"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si no comes, tienes hambre"
            english="If you don't eat, you get hungry"
            translation="If you don't eat, you get hungry"
          />
          <Example 
            spanish="Cuando hace frío, uso abrigo"
            english="When it's cold, I wear a coat"
            translation="When it's cold, I wear a coat"
          />
          <Example 
            spanish="Si estudias, aprendes"
            english="If you study, you learn"
            translation="If you study, you learn"
          />
        </div>

        <Rule 
          title="Uses of the Zero Conditional"
          description="It is used for:"
          examples={[
            "Scientific and natural facts",
            "Routines and habits",
            "Instructions and rules",
            "General cause and effect"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Zero Conditional expresses situations that are always true, not hypothetical ones.
        </Tip>
      </TheorySection>

      <TheorySection title="First Conditional" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used for real, possible situations in the future. It expresses conditions that may be fulfilled.
        </p>

        <GrammarTable
          caption="First Conditional — Structure"
          headers={["Structure", "Example", "Meaning"]}
          rows={[
            ["If + present simple, will + infinitive", "If it rains, I will stay home", "If it rains, I’ll stay home"],
            ["If + present simple, be going to + infinitive", "If you study, you are going to pass", "If you study, you’re going to pass"],
            ["If + present simple, modal + infinitive", "If you hurry, you can catch the bus", "If you hurry, you can catch the bus"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si tengo tiempo, te llamaré"
            english="If I have time, I will call you"
            translation="If I have time, I will call you"
          />
          <Example 
            spanish="Si estudias mucho, aprobarás"
            english="If you study hard, you will pass"
            translation="If you study hard, you’ll pass"
          />
          <Example 
            spanish="Si viene temprano, podremos almorzar juntos"
            english="If he comes early, we can have lunch together"
            translation="If he comes early, we can have lunch together"
          />
        </div>

        <Rule 
          title="Features of the First Conditional"
          description="Key points:"
          examples={[
            "Possible, real condition",
            "Likely result in the future",
            "Can use will, be going to, or modals",
            "Expresses realistic plans and predictions"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> First Conditional is the most common structure for realistic future plans.
        </Tip>
      </TheorySection>

      <TheorySection title="Second Conditional" icon="🌙">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used for hypothetical, unreal, or unlikely situations in the present or future.
        </p>

        <GrammarTable
          caption="Second Conditional — Structure"
          headers={["Structure", "Example", "Meaning"]}
          rows={[
            ["If + past simple, would + infinitive", "If I won the lottery, I would travel", "If I won the lottery, I would travel"],
            ["If + past simple, could + infinitive", "If I had time, I could help you", "If I had time, I could help you"],
            ["If + past simple, might + infinitive", "If it rained, we might stay inside", "If it rained, we might stay inside"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si fuera rico, compraría una casa grande"
            english="If I were rich, I would buy a big house"
            translation="If I were rich, I would buy a big house"
          />
          <Example 
            spanish="Si tuviera alas, podría volar"
            english="If I had wings, I could fly"
            translation="If I had wings, I could fly"
          />
          <Example 
            spanish="Si fuera más joven, haría más deporte"
            english="If I were younger, I would do more sport"
            translation="If I were younger, I would do more exercise"
          />
        </div>

        <Rule 
          title="Uses of the Second Conditional"
          description="It is used for:"
          examples={[
            "Unreal hypothetical situations",
            "Dreams and fantasies",
            "Indirect advice",
            "Unlikely situations"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> With ‘be’, use ‘were’ for every person: If I were, If you were, If he were.
        </Tip>
      </TheorySection>

      <TheorySection title="Third Conditional" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Used for hypothetical situations in the past that cannot be changed. It expresses regret or speculation about the past.
        </p>

        <GrammarTable
          caption="Third Conditional — Structure"
          headers={["Structure", "Example", "Meaning"]}
          rows={[
            ["If + past perfect, would have + past participle", "If I had studied, I would have passed", "If I had studied, I would have passed"],
            ["If + past perfect, could have + past participle", "If you had called, I could have helped", "If you had called, I could have helped"],
            ["If + past perfect, might have + past participle", "If it had rained, we might have stayed", "If it had rained, we might have stayed"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si hubiera sabido, habría venido antes"
            english="If I had known, I would have come earlier"
            translation="If I had known, I would have come earlier"
          />
          <Example 
            spanish="Si no hubiera llovido, habríamos ido al parque"
            english="If it hadn't rained, we would have gone to the park"
            translation="If it hadn’t rained, we would have gone to the park"
          />
          <Example 
            spanish="Si hubiera tenido dinero, habría comprado el coche"
            english="If I had had money, I would have bought the car"
            translation="If I had had money, I would have bought the car"
          />
        </div>

        <Rule 
          title="Features of the Third Conditional"
          description="Key points:"
          examples={[
            "Past situation that did not happen",
            "Result also in the past",
            "Expresses regret or speculation",
            "The outcome cannot be changed"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Third Conditional is ideal for expressing “what would have happened if…” about the past.
        </Tip>
      </TheorySection>

      <TheorySection title="Mixed Conditionals" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          They combine different tenses when the condition and the result lie at different points in time.
        </p>

        <GrammarTable
          caption="Mixed Conditionals — Types"
          headers={["Type", "Structure", "Example"]}
          rows={[
            ["Type 1", "If + past perfect, would + infinitive", "If I had studied, I would be smarter now"],
            ["Type 2", "If + past simple, would have + past participle", "If I were taller, I would have played basketball"],
            ["Type 3", "If + present perfect, would + infinitive", "If I have finished, I will leave early"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si hubiera estudiado medicina, sería doctor ahora"
            english="If I had studied medicine, I would be a doctor now"
            translation="If I had studied medicine, I would be a doctor now"
          />
          <Example 
            spanish="Si fuera más valiente, habría viajado solo"
            english="If I were braver, I would have traveled alone"
            translation="If I were braver, I would have traveled alone"
          />
          <Example 
            spanish="Si tengo tiempo mañana, habré terminado el proyecto"
            english="If I have time tomorrow, I will have finished the project"
            translation="If I have time tomorrow, I’ll have finished the project"
          />
        </div>

        <Rule 
          title="Uses of Mixed Conditionals"
          description="They are used to:"
          examples={[
            "Link the past with the present",
            "Link the present with the past",
            "Express complex results",
            "Show relationships across time"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Mixed Conditionals are advanced but very useful for complex situations.
        </Tip>
      </TheorySection>

      <TheorySection title="Unless, Provided that, As long as" icon="🔧">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Other words can introduce conditions with more specific meanings.
        </p>

        <GrammarTable
          caption="Other Conditional Expressions"
          headers={["Word", "Meaning", "Example"]}
          rows={[
            ["unless", "except if / if … not", "Unless you study, you won't pass"],
            ["provided that", "provided that / as long as", "I'll help provided that you ask nicely"],
            ["as long as", "as long as / while", "As long as you're happy, I'm happy"],
            ["in case", "in case / just in case", "Take an umbrella in case it rains"],
            ["suppose/supposing", "suppose / let’s suppose", "Supposing it rains, what will we do?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="No aprobarás a menos que estudies"
            english="You won't pass unless you study"
            translation="You won’t pass unless you study"
          />
          <Example 
            spanish="Te ayudaré siempre que me lo pidas bien"
            english="I'll help you provided that you ask nicely"
            translation="I'll help you as long as you ask nicely"
          />
          <Example 
            spanish="Lleva paraguas por si llueve"
            english="Take an umbrella in case it rains"
            translation="Take an umbrella in case it rains"
          />
        </div>

        <Rule 
          title="Important Differences"
          description="Pick the right word:"
          examples={[
            "Unless = if not (negative)",
            "Provided that = a specific condition",
            "As long as = ongoing condition",
            "In case = precaution"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> ‘Unless’ already includes negation—do not add ‘not’ after it: Unless you don't study ❌ → Unless you study ✅
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Mixing up tenses inconsistently ❌<br/>
            <strong>Correct:</strong> Use consistent tenses ✅<br/>
            <em>If I will have time, I would help. → If I have time, I will help.</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Using ‘was’ instead of ‘were’ ❌<br/>
            <strong>Correct:</strong> Use ‘were’ for every person ✅<br/>
            <em>If I was rich... → If I were rich...</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Omitting ‘have’ in Third Conditional ❌<br/>
            <strong>Correct:</strong> Include ‘have’ in the result ✅<br/>
            <em>If I had known, I would come. → If I had known, I would have come.</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Using ‘unless’ together with ‘not’ ❌<br/>
            <strong>Correct:</strong> ‘Unless’ already conveys negation ✅<br/>
            <em>Unless you don't study... → Unless you study...</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Confusing Zero and First Conditional ❌<br/>
            <strong>Correct:</strong> Understand the difference in likelihood ✅<br/>
            <em>If water boils (Zero) vs If it rains (First)</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Verb tenses"
            description="Each conditional type uses specific tenses."
            examples={[
              "Zero: present + present",
              "First: present + future",
              "Second: past + would + infinitive",
              "Third: past perfect + would have + past participle"
            ]}
          />

          <Rule 
            title="2. Probability"
            description="Conditionals express different degrees of likelihood."
            examples={[
              "Zero: always true (100%)",
              "First: possible (50–90%)",
              "Second: unlikely (10–30%)",
              "Third: impossible (0%)"
            ]}
          />

          <Rule 
            title="3. Flexible word order"
            description="You can change the order of the clauses."
            examples={[
              "If clause + comma + main clause",
              "Main clause + if clause (no comma)",
              "Both orders are correct",
              "Choose based on emphasis"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'If I _____ time tomorrow, I _____ you.'"
      options={[
        "have, call",
        "have, will call",
        "will have, call",
        "had, would call"
      ]}
      correctAnswer={1}
      explanation="In the first conditional we use: If + present simple, will + infinitive."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which conditional is used for real and possible situations in the future?"
      options={[
        "Zero Conditional",
        "First Conditional",
        "Second Conditional",
        "Third Conditional"
      ]}
      correctAnswer={1}
      explanation="First Conditional is used for real and possible situations in the future. It uses 'if + present simple, will + infinitive'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Zero Conditional is used for general truths and facts that are always true.",
          isTrue: true,
          explanation: "Correct. Zero Conditional expresses general truths, scientific facts, and situations that are always true."
        },
        {
          text: "In Second Conditional, you can use 'was' instead of 'were' with all persons.",
          isTrue: false,
          explanation: "Incorrect. In Second Conditional, 'were' is used for all persons with the verb 'be': If I were, If you were, If he were."
        },
        {
          text: "Third Conditional is used for hypothetical situations in the past that cannot be changed.",
          isTrue: true,
          explanation: "Correct. Third Conditional expresses regret or speculation about past situations that cannot be changed."
        },
        {
          text: "'Unless' means the same as 'if not' and already includes the negative.",
          isTrue: true,
          explanation: "Correct. 'Unless' means 'if not' and already contains the negative, so you don't add 'not' after it."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the correct structure for Second Conditional?"
      options={[
        "If + present simple, will + infinitive",
        "If + past simple, would + infinitive",
        "If + past perfect, would have + past participle",
        "If + present simple, present simple"
      ]}
      correctAnswer={1}
      explanation="Second Conditional uses 'If + past simple, would + infinitive' to express hypothetical or unreal situations."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which sentence is correct?"
      options={[
        "If I was rich, I would buy a house.",
        "If I were rich, I would buy a house.",
        "If I am rich, I will buy a house.",
        "If I had been rich, I would buy a house."
      ]}
      correctAnswer={1}
      explanation="The correct Second Conditional uses 'were' for all persons with 'be': 'If I were rich, I would buy a house.'"
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Third Conditional is used for impossible past situations.",
          isTrue: true,
          explanation: "Correct. Third Conditional describes past situations that cannot be changed: 'If I had studied, I would have passed.'"
        },
        {
          text: "'Unless' means the same as 'if'.",
          isTrue: false,
          explanation: "Incorrect. 'Unless' means 'if not': 'Unless you study' = 'If you don't study.'"
        },
        {
          text: "Zero Conditional uses present tense in both clauses.",
          isTrue: true,
          explanation: "Correct. Zero Conditional uses present tense in both parts for general facts: 'If you heat water, it boils.'"
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'If I ___ you, I would apologize.'"
      options={[
        "am",
        "was",
        "were",
        "will be"
      ]}
      correctAnswer={2}
      explanation="With ‘be’ in Second Conditional we use ‘were’ for every person: ‘If I were you.’"
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: 'If she ___ earlier, she wouldn't have missed the train.'"
      options={[
        "left",
        "had left",
        "leaves",
        "would leave"
      ]}
      correctAnswer={1}
      explanation="Third Conditional uses 'had + past participle' in the if-clause: 'If she had left earlier.'"
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "First Conditional expresses real possibilities in the future.",
          isTrue: true,
          explanation: "Correct. First Conditional expresses real possibilities: 'If it rains, I will stay home.'"
        },
        {
          text: "We can start a conditional sentence with the main clause.",
          isTrue: true,
          explanation: "Correct. You can say 'I will help you if you ask me' (no comma when the if-clause comes last)."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: '___ you don't study, you will fail the exam.'"
      options={[
        "If",
        "Unless",
        "When",
        "Because"
      ]}
      correctAnswer={0}
      explanation="'If you don't study' is correct. 'Unless' already includes negation—you would say 'Unless you study.'"
    />
  ];

  return (
    <TheoryLayout
      title="Conditionals"
      description="Master conditionals in English. Learn how to express hypothetical situations and real versus impossible possibilities with if, unless, and provided that."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Present and past tenses", "Future forms", "Modal verbs"]}
      estimatedTime="95 min"
    />
  );
};

export default ConditionalsPage;
