'use client';
import { buildOpenClozeExercises } from './openClozeExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const OpenClozePage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What is Open Cloze?" icon="📝">
        <p>
          <strong>Open Cloze</strong> is Part 2 of the Use of English paper in First Certificate (B2) and Advanced (C1). 
          You must complete 8 blanks in a text with no multiple-choice options, using only ONE word per gap. 
          This task tests grammar, functional vocabulary, and contextual understanding.
        </p>
        
        <Example 
          title="Open Cloze example"
          content="The weather was terrible yesterday. It _____ raining all day and the wind was very strong. People had to _____ inside their houses because _____ was dangerous to go out."
          explanation="Answers: was, stay, it. You must use context and grammar to find the correct words."
        />
      </TheorySection>

      <TheorySection title="Main strategies" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Read the whole text first"
            description="Grasp the general topic before filling the gaps."
            examples={[
              "Identify whether the tone is formal or informal",
              "Recognise the main theme",
              "Note the dominant tense",
              "Observe the style of the text"
            ]}
          />

          <Rule 
            title="2. Analyse the immediate context"
            description="Look at the words before and after the gap."
            examples={[
              "Prepositions that require specific words",
              "Articles that signal nouns",
              "Auxiliaries that signal main verbs",
              "Connectors that link ideas"
            ]}
          />

          <Rule 
            title="3. Consider grammar"
            description="Think about what type of word you need."
            examples={[
              "Do you need a noun, verb, or adjective?",
              "Which tense fits best?",
              "Singular or plural?",
              "Positive or negative form?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Common word types at B2 certification level" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Function words (about 70% of the task)"
            description="The most frequent type in Open Cloze exercises."
            examples={[
              "Articles: a, an, the (especially 'the' with superlatives)",
              "Prepositions: in, on, at, for, with, by, of, from",
              "Pronouns: it, they, them, this, that, which, who",
              "Auxiliaries: do, does, did, will, would, have, has, had"
            ]}
          />

          <Rule 
            title="2. Connectors and transitions"
            description="Words that join ideas and paragraphs."
            examples={[
              "Contrast: but, however, although",
              "Addition: and, also, furthermore",
              "Result: so, therefore, consequently",
              "Time: when, while, after, before"
            ]}
          />

          <Rule 
            title="3. Content words"
            description="Common nouns, verbs, and adjectives."
            examples={[
              "Frequent verbs: make, take, get, go",
              "Common nouns: time, way, people, work",
              "Basic adjectives: good, bad, big, small",
              "Adverbs: very, really, quite, rather"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Important rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. One word per gap"
            description="You usually need only one word per gap."
            examples={[
              "Do not use contractions (don't → do not)",
              "Avoid long phrases",
              "Think of the simplest word that fits",
              "Consider high-frequency words"
            ]}
          />

          <Rule 
            title="2. Textual consistency"
            description="Stay consistent with the rest of the text."
            examples={[
              "Same register (formal/informal)",
              "Same tense where appropriate",
              "Same style of vocabulary",
              "Thematic coherence"
            ]}
          />

          <Rule 
            title="3. Final check"
            description="Always review your answers in context."
            examples={[
              "Read the full sentence with your answer",
              "Check it is grammatically sound",
              "Confirm the meaning is logical",
              "Check spelling"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Exam-specific strategies" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="Time management (10–12 minutes)"
            description="Suggested timing for Open Cloze in the exam."
            examples={[
              "2–3 minutes: full first read of the text",
              "5–6 minutes: complete all 8 gaps",
              "2–3 minutes: final review and checking",
              "Do not spend more than about 1 minute per answer"
            ]}
          />

          <Rule 
            title="Frequent exam patterns"
            description="Structures that often appear in papers."
            examples={[
              "Phrasal verbs: look forward TO, depend ON",
              "Fixed expressions: in spite OF, as well AS",
              "Comparative structures: as... as, more... than",
              "Conditionals: if, unless, provided THAT"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Open Cloze"
      description="Master Open Cloze tasks. Learn strategies for completing blanks using context, grammar, and appropriate vocabulary."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildOpenClozeExercises}
      prerequisites={["Advanced grammar", "Strong vocabulary", "Reading comprehension"]}
      estimatedTime="80 min"
    />
  );
};

export default OpenClozePage;
