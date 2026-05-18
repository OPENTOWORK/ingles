'use client';
import { buildCohesionAndCoherenceExercises } from './cohesionAndCoherenceExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const CohesionAndCoherencePage = () => {
  const theoryContent = (
    <>
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
    </>
  );

    return (
    <TheoryLayout
      title="Cohesion and Coherence"
      description="Master textual cohesion and coherence. Learn to connect ideas effectively and keep a unified logical thread in complex texts."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildCohesionAndCoherenceExercises}
      prerequisites={["Advanced writing skills", "Understanding of text structure", "Knowledge of connectors"]}
      estimatedTime="80 min"
    />
  );
};

export default CohesionAndCoherencePage;
