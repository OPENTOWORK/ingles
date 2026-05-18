'use client';
import { buildGappedTextExercises } from './gappedTextExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const GappedTextPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What is Gapped Text?" icon="🧩">
        <p>
          <strong>Gapped Text</strong> is a task where paragraphs or sentences have been removed from a text 
          and you must choose from a list which ones fit each gap. You need to understand cohesion and coherence.
        </p>
        
        <Example 
          title="Gapped Text example"
          content="You have an article on climate change with 6 gaps and 8 optional paragraphs (A–H). You decide which paragraph goes in each gap based on logical flow and textual links."
          explanation="Analyse the content before and after each gap to find the option that best connects the ideas."
        />
      </TheorySection>

      <TheorySection title="Main strategies" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Read the whole text first"
            description="Grasp the topic and structure before filling gaps."
            examples={[
              "Identify the main theme",
              "Recognise the text type (article, essay, story)",
              "Note the author's tone and style",
              "Observe the logical progression of ideas"
            ]}
          />

          <Tip 
            title="2. Analyse the context of each gap"
            description="Look carefully at what comes before and after."
            examples={[
              "Which idea is developed before the gap?",
              "How does the idea continue after the gap?",
              "Are there words that need a clear referent?",
              "What kind of information is logically missing?"
            ]}
          />

          <Tip 
            title="3. Look for cohesion clues"
            description="Spot connectors, references, and textual links."
            examples={[
              "Pronouns that need antecedents",
              "Connectors that show relations (however, therefore)",
              "Repetition of key words",
              "Time references (then, later, previously)"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Cohesion devices" icon="🔗">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Pronoun reference"
            description="Pronouns that point back to earlier information."
            examples={[
              "This, that, these, those → what do they refer to?",
              "It, they, he, she → who or what is the antecedent?",
              "Such, one, ones → what do they replace?",
              "The former, the latter → which two items?"
            ]}
          />

          <Rule 
            title="2. Logical connectors"
            description="Words that show relations between ideas."
            examples={[
              "Contrast: However, Nevertheless, On the other hand",
              "Addition: Furthermore, Moreover, In addition",
              "Result: Therefore, Consequently, As a result",
              "Example: For instance, Such as, Namely"
            ]}
          />

          <Rule 
            title="3. Lexical repetition"
            description="Repetition of key words or synonyms."
            examples={[
              "Exact repetition of important terms",
              "Synonyms that keep the topic",
              "Words from the same semantic field",
              "Definitions or explanations of terms"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Important rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Logical flow of ideas"
            description="The paragraph must fit the progression of the text."
            examples={[
              "Does it follow chronological order?",
              "Does it develop the previous idea?",
              "Does it introduce information at the right point?",
              "Does it keep a consistent level of detail?"
            ]}
          />

          <Rule 
            title="2. Consistency of style"
            description="The paragraph should match tone and register."
            examples={[
              "Same level of formality",
              "Consistent point of view (1st, 2nd, 3rd person)",
              "Same dominant tense where appropriate",
              "Vocabulary suited to the context"
            ]}
          />

          <Rule 
            title="3. Elimination"
            description="Use elimination for difficult options."
            examples={[
              "Which options clearly do not fit?",
              "Which contradict the text?",
              "Which lack a logical link?",
              "Which have you already used elsewhere?"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Gapped Text"
      description="Master gapped text tasks. Learn to spot cohesion, coherence, and logical flow so you can choose paragraphs that fit perfectly."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildGappedTextExercises}
      prerequisites={["Advanced reading skills", "Understanding of text structure", "Knowledge of connectors"]}
      estimatedTime="85 min"
    />
  );
};

export default GappedTextPage;
