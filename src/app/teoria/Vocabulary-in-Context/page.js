'use client';
import { buildVocabularyInContextExercises } from './vocabularyInContextExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const VocabularyInContextPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What is Vocabulary in Context?" icon="🧩">
        <p>
          <strong>Vocabulary in Context</strong> is the skill of learning the meaning of unfamiliar words 
          from the surrounding text. You may not need a dictionary if you use context well.
        </p>
        
        <Example 
          title="Vocabulary in context example"
          content="'The ancient artifact was so fragile that even a gentle touch could damage it permanently.' Even if you do not know 'fragile', the context shows it means something easily damaged."
          explanation="Clues like 'gentle touch could damage it' help you infer that 'fragile' means easily broken or delicate."
        />
      </TheorySection>

      <TheorySection title="Types of context clues" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Direct definitions"
            description="The text defines the word outright."
            examples={[
              "A pediatrician, a doctor who treats children, examined the patient.",
              "Photosynthesis - the process by which plants make food - is essential.",
              "The protagonist, or main character, faces many challenges.",
              "Claustrophobia, the fear of enclosed spaces, affects many people."
            ]}
          />

          <Rule 
            title="2. Examples and lists"
            description="The word is explained through examples."
            examples={[
              "Citrus fruits such as oranges, lemons, and limes are rich in vitamin C.",
              "Nocturnal animals like owls, bats, and raccoons are active at night.",
              "The menu included various appetizers: soup, salad, and bread.",
              "She collected memorabilia including old photos, letters, and souvenirs."
            ]}
          />

          <Rule 
            title="3. Contrast and opposition"
            description="The word is set against something known."
            examples={[
              "Unlike his gregarious brother, Tom was quite shy and reserved.",
              "While the first half was tedious, the second half was exciting.",
              "She was frugal with money but generous with her time.",
              "The weather was inclement, not sunny and pleasant as predicted."
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Advanced strategies" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Cause and effect"
            description="Use cause–effect links to guess meaning."
            examples={[
              "The drought caused the crops to wither and die.",
              "Due to his procrastination, he missed the deadline.",
              "The medicine alleviated her pain immediately.",
              "His arrogance resulted in losing many friends."
            ]}
          />

          <Rule 
            title="2. Grammatical clues"
            description="Word class hints at meaning."
            examples={[
              "She walked cautiously (adverb — manner of walking)",
              "The enormous building (adjective — describes size)",
              "He scrutinized the document (verb — action on a document)",
              "Her benevolence was appreciated (noun — personal quality)"
            ]}
          />

          <Rule 
            title="3. World knowledge"
            description="Use general knowledge to infer meaning."
            examples={[
              "The archaeologist excavated ancient ruins.",
              "The chef garnished the dish with herbs.",
              "The meteorologist predicted severe weather.",
              "The surgeon performed a delicate operation."
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Important rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Read beyond the sentence"
            description="Clues sometimes sit in neighbouring sentences."
            examples={[
              "Look at the whole paragraph",
              "Search nearby sentences",
              "Join ideas from different places",
              "Use the overall topic"
            ]}
          />

          <Rule 
            title="2. Do not fixate on one word"
            description="If you cannot infer it, keep reading."
            examples={[
              "One word does not ruin whole-text understanding",
              "Meaning may clear up later",
              "Focus on important keywords",
              "Use general context to compensate"
            ]}
          />

          <Rule 
            title="3. Check your guess"
            description="Make sure your reading fits the text."
            examples={[
              "Does your guess fit logically?",
              "Is it consistent with the rest?",
              "Is it grammatically sound?",
              "Does it support the overall message?"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Vocabulary in Context"
      description="Master understanding unknown words from context. Learn to use definitions, examples, contrast, and grammar cues to infer meanings."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildVocabularyInContextExercises}
      prerequisites={["Basic reading skills", "Understanding of sentence structure"]}
      estimatedTime="75 min"
    />
  );
};

export default VocabularyInContextPage;
