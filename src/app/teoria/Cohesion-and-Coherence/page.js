'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const CohesionAndCoherencePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What are Cohesion and Coherence?" icon="🔗">
        <p>
          <strong>Cohesion</strong> is the grammatical and lexical linking between sentences and paragraphs. 
          <strong>Coherence</strong> is the logical, semantic unity of the text: ideas working together 
          to produce a clear message.
        </p>
        
        <Example 
          title="Cohesion and coherence example"
          content="Cohesion: 'John bought a car. It was red. He drove it home.' (pronouns link the sentences)
          Coherence: All sentences are about the same topic (John and his car) in a sensible order."
          explanation="Cohesion uses grammar to connect; coherence ensures the whole message makes sense."
        />
      </TheorySection>

      <TheorySection title="Cohesive devices" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Pronoun reference"
            description="Pronouns point back to earlier items."
            examples={[
              "Personal: he, she, it, they — people or things already mentioned",
              "Demonstrative: this, that, these, those — specific ideas or objects",
              "Relative: which, who, that — link clauses",
              "Possessive: his, her, its, their — show ownership"
            ]}
          />

          <Tip 
            title="2. Lexical substitution"
            description="Replace words to avoid repetition."
            examples={[
              "Synonyms: car → vehicle, house → home",
              "Hypernyms: roses → flowers, dogs → animals",
              "General words: thing, matter, issue, aspect",
              "Pro-forms: do so, such, one, ones"
            ]}
          />

          <Tip 
            title="3. Explicit connectors"
            description="Words that show logical relations."
            examples={[
              "Addition: and, also, furthermore, moreover",
              "Contrast: but, however, nevertheless, on the other hand",
              "Cause–effect: because, therefore, consequently, as a result",
              "Time: then, next, meanwhile, subsequently"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Coherence factors" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Thematic unity"
            description="All parts support the main topic."
            examples={[
              "Each paragraph develops one aspect of the theme",
              "No irrelevant or off-topic material",
              "Digressions are clearly marked",
              "The title matches the real content"
            ]}
          />

          <Rule 
            title="2. Logical progression"
            description="Ideas unfold in sensible order."
            examples={[
              "General to specific or the reverse",
              "Chronological order when fitting",
              "Order of importance",
              "Problem → analysis → solution"
            ]}
          />

          <Rule 
            title="3. Consistent point of view"
            description="Keep person, tense, and register steady."
            examples={[
              "Stable viewpoint (1st, 2nd, 3rd person)",
              "Tense fits the text and stays consistent",
              "Formal or informal register maintained",
              "Tone stays coherent throughout"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Common problems and fixes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Ambiguous reference"
            description="When a pronoun's target is unclear."
            examples={[
              "Problem: 'John told Peter he was wrong' (who was wrong?)",
              "Fix: Repeat the name or restructure",
              "Avoid pronouns when several referents are possible",
              "Use specific demonstratives (this idea, that problem)"
            ]}
          />

          <Rule 
            title="2. Logical gaps"
            description="Missing links between ideas."
            examples={[
              "Problem: Unrelated ideas appear together",
              "Fix: Add suitable connectors",
              "Add bridging information",
              "Re-order for clearer flow"
            ]}
          />

          <Rule 
            title="3. Over-repetition"
            description="The same word appears too often."
            examples={[
              "Problem: 'The problem is that this problem causes problems'",
              "Fix: Use synonyms (issue, difficulty, challenge)",
              "Use pronouns where clear",
              "Restructure sentences to vary wording"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="What is the main difference between cohesion and coherence?"
      options={[
        "None—they are synonyms",
        "Cohesion is grammatical linking; coherence is logical unity",
        "Cohesion is for long texts only",
        "Cohesion matters more than coherence"
      ]}
      correctAnswer={1}
      explanation="Cohesion is surface linking; coherence is whether the whole text makes unified sense."
    />,

    <MultipleChoiceExercise
      key="2"
      question="In 'Mary bought a dress. It was beautiful.', what cohesive device is used?"
      options={[
        "Explicit connector",
        "Lexical substitution",
        "Pronoun reference",
        "Repetition"
      ]}
      correctAnswer={2}
      explanation="'It' refers to 'dress'—pronoun reference creates cohesion."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "A text can have strong cohesion but weak coherence.",
          isTrue: true,
          explanation: "Correct. Sentences may link grammatically while the overall argument stays disjointed."
        },
        {
          text: "Connectors like 'however' and 'therefore' add cohesion.",
          isTrue: true,
          explanation: "Correct. Explicit connectors are major cohesive devices."
        },
        {
          text: "Coherence depends only on correct pronouns.",
          isTrue: false,
          explanation: "Incorrect. Coherence needs topic unity, logical order, and consistent stance—not only pronouns."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What cohesion problem appears in: 'John told Peter he was wrong.'?"
      options={[
        "Missing connectors",
        "Ambiguous pronoun reference",
        "Wrong tense",
        "Inappropriate vocabulary"
      ]}
      correctAnswer={1}
      explanation="'He' could mean John or Peter, which confuses the reader."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What strategy reduces clumsy repetition?"
      options={[
        "Use only pronouns",
        "Remove all reference words",
        "Use synonyms and appropriate pro-forms",
        "Repeat the same word always"
      ]}
      correctAnswer={2}
      explanation="Synonyms, hypernyms, and pro-forms like 'such' and 'one' vary wording while staying cohesive."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Each paragraph should support the main topic for coherence.",
          isTrue: true,
          explanation: "Correct. Thematic unity needs every paragraph to serve the overall aim."
        },
        {
          text: "Switching from first to third person for no reason is fine.",
          isTrue: false,
          explanation: "Incorrect. Random viewpoint shifts harm coherence."
        },
        {
          text: "Demonstratives like 'this' and 'that' can create cohesion.",
          isTrue: true,
          explanation: "Correct. They point back to ideas mentioned earlier."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which best connects these ideas? 'It was raining. We decided to stay home.'"
      options={[
        "It was raining. We decided to stay home.",
        "It was raining, so we decided to stay home.",
        "It was raining. However, we decided to stay home.",
        "It was raining. Furthermore, we decided to stay home."
      ]}
      correctAnswer={1}
      explanation="'So' shows cause and effect: rain led to staying home."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which does NOT directly support coherence?"
      options={[
        "Thematic unity",
        "Logical progression of ideas",
        "Correct use of articles",
        "Consistent register"
      ]}
      correctAnswer={2}
      explanation="Articles matter for grammar but do not by themselves fix global coherence."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Coherent texts must always use chronological order.",
          isTrue: false,
          explanation: "Incorrect. Many patterns can produce coherence—not only time order."
        },
        {
          text: "Transition words support both cohesion and coherence.",
          isTrue: true,
          explanation: "Correct. They link sentences (cohesion) and show logic (coherence)."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="What is the key to strong cohesion AND coherence?"
      options={[
        "Using many pronouns",
        "Writing very long sentences",
        "Planning a clear structure and appropriate linking devices",
        "Repeating the same words often"
      ]}
      correctAnswer={2}
      explanation="Clear planning plus the right connectors guides the reader smoothly."
    />
  ];

  return (
    <TheoryLayout
      title="Cohesion and Coherence"
      description="Master textual cohesion and coherence. Learn to connect ideas effectively and keep a unified logical thread in complex texts."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced writing skills", "Understanding of text structure", "Knowledge of connectors"]}
      estimatedTime="80 min"
    />
  );
};

export default CohesionAndCoherencePage;
