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

const CohesionAndConnectorsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are Cohesion and Connectors?" icon="🔗">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Cohesion</strong> and <strong>connectors</strong> are essential for building texts that are coherent and easy to follow. 
          They help link ideas, create smooth transitions, and keep your writing fluent.
        </p>
        
        <QuickReference items={[
          "Cohesion: logical linking between ideas",
          "Connectors: words that join sentences and paragraphs",
          "Reference: pronouns and articles",
          "Transitions: smooth shifts between ideas",
          "Repetition: key words to keep the topic clear"
        ]} />
      </TheorySection>

      <TheorySection title="Types of Connectors" icon="🔧">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Connectors are classified by the relationship they create between ideas.
        </p>

        <GrammarTable
          caption="Connectors Classified by Function"
          headers={["Function", "Connectors", "Example", "Meaning"]}
          rows={[
            ["Addition", "Furthermore, Moreover, In addition, Also", "Furthermore, technology improves education", "Besides / In addition"],
            ["Contrast", "However, Nevertheless, On the other hand, Yet", "However, there are disadvantages", "However"],
            ["Cause", "Because, Since, Due to, As a result of", "Due to technology, life is easier", "Because of / Due to"],
            ["Result", "Therefore, Consequently, Thus, Hence", "Therefore, we should use technology", "Therefore"],
            ["Sequence", "First, Then, Next, Finally, Subsequently", "First, I will discuss benefits", "First"],
            ["Example", "For example, For instance, Such as, Namely", "For example, smartphones are useful", "For example"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Furthermore, technology improves education"
            note="Addition: builds on the previous point."
          />
          <Example 
            english="However, there are disadvantages"
            note="Contrast: signals a shift or limitation."
          />
          <Example 
            english="Therefore, we should use technology"
            note="Result: shows a consequence or conclusion."
          />
        </div>

        <Rule 
          title="Using Connectors"
          description="Connectors help you:"
          examples={[
            "Create smooth transitions between ideas",
            "Show logical relationships",
            "Improve text flow",
            "Make your writing sound more professional"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Use a variety of connectors to avoid repetition and keep your text engaging.
        </Tip>
      </TheorySection>

      <TheorySection title="Connectors of Addition" icon="➕">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These add information, ideas, or supporting arguments.
        </p>

        <GrammarTable
          caption="Connectors of Addition by Formality"
          headers={["Formal", "Neutral", "Informal", "Use"]}
          rows={[
            ["Furthermore, Moreover", "In addition, Also", "And, Plus", "Add important information"],
            ["Additionally, Besides", "What's more", "Another thing", "Add an extra point"],
            ["Not only...but also", "As well as", "Along with", "Show that there is more than one option"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Furthermore, technology is very useful"
            note="Formal addition."
          />
          <Example 
            english="In addition, it's important to study"
            note="Neutral addition."
          />
          <Example 
            english="Not only is it useful, but also necessary"
            note="Emphasizes two related points."
          />
        </div>

        <Tip type="success">
          <strong>Remember:</strong> “Furthermore” and “Moreover” are more formal than “also” and “and”.
        </Tip>
      </TheorySection>

      <TheorySection title="Connectors of Contrast" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These show differences, contrasts, or opposition between ideas.
        </p>

        <GrammarTable
          caption="Connectors of Contrast"
          headers={["Connector", "Use", "Position", "Example"]}
          rows={[
            ["However", "Strong contrast", "Start of sentence", "However, there are problems"],
            ["Nevertheless", "Formal contrast", "Start of sentence", "Nevertheless, we continue"],
            ["On the other hand", "Present an alternative", "Start of sentence", "On the other hand, it's expensive"],
            ["Yet", "Contrast in the same sentence", "Middle of sentence", "It's difficult, yet possible"],
            ["Although/Though", "Contrast with a subordinate clause", "Start", "Although it's hard, it's worth it"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="However, there are problems"
            note="Common contrast opener."
          />
          <Example 
            english="On the other hand, it's expensive"
            note="Introduces an alternative view."
          />
          <Example 
            english="It's difficult, yet possible"
            note="“Yet” inside the sentence."
          />
        </div>

        <Rule 
          title="Using Contrast Connectors"
          description="Use them to:"
          examples={[
            "Present two different viewpoints",
            "Introduce counterarguments",
            "Compare advantages and disadvantages",
            "Express concessions"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out:</strong> “But” is informal; use “However” in formal writing.
        </Tip>
      </TheorySection>

      <TheorySection title="Cause and Result Connectors" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These express cause-and-effect relationships between ideas.
        </p>

        <GrammarTable
          caption="Cause and Result Connectors"
          headers={["Type", "Connectors", "Example", "Meaning"]}
          rows={[
            ["Cause", "Because, Since, Due to", "Due to rain, we stayed home", "Because of"],
            ["Result", "Therefore, Consequently, Thus", "It rained, therefore we stayed home", "Therefore"],
            ["Formal cause", "Owing to, As a result of", "Owing to bad weather", "Because of"],
            ["Formal result", "Hence, Accordingly", "Hence, we must act", "As a result / Accordingly"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Due to rain, we stayed home"
            note="Cause introduced with a prepositional phrase."
          />
          <Example 
            english="It rained, therefore we stayed home"
            note="Result follows cause."
          />
          <Example 
            english="You studied hard, so you passed"
            note="“So” is more informal than “therefore”."
          />
        </div>

        <Tip type="info">
          <strong>Note:</strong> “So” is informal; prefer “Therefore” or “Consequently” in formal contexts.
        </Tip>
      </TheorySection>

      <TheorySection title="Sequence and Time Connectors" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These organise ideas in time or in sequence.
        </p>

        <GrammarTable
          caption="Sequence Connectors"
          headers={["Position", "Connectors", "Example", "Use"]}
          rows={[
            ["Opening", "First, Initially, To begin with", "First, I will discuss...", "First point"],
            ["Continuation", "Then, Next, Subsequently", "Then, we will see...", "Next point"],
            ["Addition", "Furthermore, Moreover", "Furthermore, it's important...", "Extra point"],
            ["Closing", "Finally, Lastly, In conclusion", "Finally, we can say...", "Last point"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="First, I will discuss the benefits"
            note="Opens the sequence."
          />
          <Example 
            english="Then, we will see the disadvantages"
            note="Moves to the next step."
          />
          <Example 
            english="Finally, we will reach a conclusion"
            note="Signals the end of the line of argument."
          />
        </div>

        <Rule 
          title="Using Sequence Connectors"
          description="Use them to:"
          examples={[
            "Order arguments logically",
            "Present steps in a process",
            "Structure body paragraphs",
            "Create a clear flow in your text"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Sequence connectors make your text easier to follow.
        </Tip>
      </TheorySection>

      <TheorySection title="Cohesion Devices" icon="🧩">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Besides connectors, other devices create cohesion in a text.
        </p>

        <GrammarTable
          caption="Cohesion Devices"
          headers={["Device", "Function", "Example", "Effect"]}
          rows={[
            ["Reference", "Avoid unnecessary repetition", "The technology... It is useful", "Natural flow"],
            ["Repetition", "Highlight key ideas", "Technology... technological...", "Emphasis"],
            ["Synonyms", "Vary vocabulary", "Important... significant...", "Lexical variety"],
            ["Ellipsis", "Avoid redundancy", "Some people like it, others don't", "Concision"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Technology is useful. It is important for society"
            note="Pronoun “it” refers back to “technology.”"
          />
          <Example 
            english="It is important. It is also significant"
            note="Synonyms vary the wording while staying on topic."
          />
          <Example 
            english="Some people use it, others don't"
            note="Ellipsis: “don't” stands for “don't use it.”"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Combine different cohesion devices for fluent, natural writing.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> “But however” ❌<br/>
            <strong>Correct:</strong> “However” or “But” ✅<br/>
            <em>Do not use two contrast connectors together</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> “Because therefore” ❌<br/>
            <strong>Correct:</strong> “Because” or “Therefore” ✅<br/>
            <em>Do not stack cause and result connectors redundantly</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Repeating “and” over and over ❌<br/>
            <strong>Correct:</strong> Vary connectors ✅<br/>
            <em>Use “furthermore”, “moreover”, “in addition”</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> No connectors between paragraphs ❌<br/>
            <strong>Correct:</strong> Create clear transitions ✅<br/>
            <em>Connectors improve flow between paragraphs</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Variety in connectors"
            description="Use different connectors to avoid repetition."
            examples={[
              "Do not rely on “and” alone",
              "Alternate formal and informal connectors where appropriate",
              "Choose connectors that fit the context"
            ]}
          />

          <Rule 
            title="2. Connector position"
            description="Most go at the start of the sentence."
            examples={[
              "However, Nevertheless, Therefore",
              "Furthermore, Moreover, Consequently",
              "Some go in the middle: yet, so"
            ]}
          />

          <Rule 
            title="3. Cohesion without connectors"
            description="Use reference, repetition, and synonyms."
            examples={[
              "Pronouns: it, they, this, that",
              "Repetition of key words",
              "Synonyms to vary vocabulary"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'Technology has many benefits. _____, it improves communication.'"
      options={[
        "However",
        "Furthermore",
        "But",
        "Although"
      ]}
      correctAnswer={1}
      explanation="“Furthermore” adds supporting information that builds on the previous idea."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which connector is most appropriate for adding important information?"
      options={[
        "However",
        "Furthermore",
        "Nevertheless",
        "Yet"
      ]}
      correctAnswer={1}
      explanation="“Furthermore” adds important supporting information; the others are mainly for contrast."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'However' and 'but' may be used together in the same sentence.",
          isTrue: false,
          explanation: "Incorrect. Do not use two contrast connectors together. Use one."
        },
        {
          text: "'Furthermore' is more formal than 'and'.",
          isTrue: true,
          explanation: "Correct. “Furthermore” is formal; “and” is simpler and more neutral."
        },
        {
          text: "Connectors always come at the start of the sentence.",
          isTrue: false,
          explanation: "Incorrect. Many do, but some such as “yet” and “so” often appear mid-sentence."
        },
        {
          text: "Using a range of connectors improves the quality of a text.",
          isTrue: true,
          explanation: "Correct. Variety avoids repetition and keeps the reader engaged."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which connector is most appropriate to show result?"
      options={[
        "Because",
        "However",
        "Therefore",
        "Furthermore"
      ]}
      correctAnswer={2}
      explanation="“Therefore” shows result or consequence; “because” shows cause."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What is wrong with this sentence: 'But however, there are problems'?"
      options={[
        "A connector is missing",
        "It uses two contrast connectors together",
        "The connector is in the wrong place",
        "Punctuation is missing"
      ]}
      correctAnswer={1}
      explanation="The problem is using “But” and “However” together—both signal contrast. Use only one."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "'However' and 'but' can be used interchangeably in all contexts.",
          isTrue: false,
          explanation: "Incorrect. “However” is more formal and often starts a sentence with a comma; “but” links clauses more directly."
        },
        {
          text: "Cohesion can be achieved without using connectors.",
          isTrue: true,
          explanation: "Correct. Cohesion also comes from pronouns, repetition, synonyms, and reference."
        },
        {
          text: "'Therefore' shows a cause-and-effect relationship.",
          isTrue: true,
          explanation: "Correct. “Therefore” signals result or consequence (e.g. “It's raining, therefore I'll stay home”)."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'I studied hard. _____, I passed the exam.'"
      options={[
        "However",
        "Although",
        "Therefore",
        "Nevertheless"
      ]}
      correctAnswer={2}
      explanation="“Therefore” shows result: you studied hard, so you passed."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which connector works best to add an important point?"
      options={[
        "However",
        "Moreover",
        "Nevertheless",
        "Although"
      ]}
      correctAnswer={1}
      explanation="“Moreover” adds important information that strengthens the previous argument."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'In addition' and 'furthermore' have similar functions.",
          isTrue: true,
          explanation: "Correct. Both add information that supports the previous idea."
        },
        {
          text: "Connectors should be used in every sentence for good cohesion.",
          isTrue: false,
          explanation: "Incorrect. Overusing connectors sounds repetitive. Cohesion also uses other devices."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: '_____ the rain, we went to the park.'"
      options={[
        "Because",
        "Despite",
        "Therefore",
        "Furthermore"
      ]}
      correctAnswer={1}
      explanation="“Despite” shows contrast: in spite of the rain, we still went."
    />
  ];

  return (
    <TheoryLayout
      title="Cohesion and Connectors"
      description="Master cohesion and connectors in English. Learn to link ideas, create smooth transitions, and improve the flow of your writing."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic writing skills", "Understanding of sentence structure"]}
      estimatedTime="65 min"
    />
  );
};

export default CohesionAndConnectorsPage;
