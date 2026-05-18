'use client';
import { buildMultipleChoiceQuestionsExercises } from './multipleChoiceQuestionsExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const MultipleChoiceQuestionsPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What are Multiple Choice Questions?" icon="✅">
        <p>
          <strong>Multiple Choice Questions</strong> are questions with several answer options where you must choose 
          the correct one. In English exams they assess reading comprehension, grammar, vocabulary, and language use 
          through texts followed by questions with 3–4 options.
        </p>
        
        <Example 
          title="Multiple choice example"
          content="Text: 'The company's profits increased dramatically last year due to innovative marketing strategies.'
          Question: What was the main reason for the company's success?
          A) Better employees  B) Innovative marketing  C) Lower prices  D) New location"
          explanation="You must identify the specific information in the text that directly answers the question."
        />
      </TheorySection>

      <TheorySection title="Types of questions" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Specific information"
            description="Questions about concrete details mentioned in the text."
            examples={[
              "When did the event happen?",
              "Who did what?",
              "Where did the situation take place?",
              "What quantity or number is mentioned?"
            ]}
          />

          <Tip 
            title="2. Main idea"
            description="Questions about the central topic or purpose of the text."
            examples={[
              "What is the main topic of the paragraph?",
              "What is the author's purpose?",
              "Which option best summarises the text?",
              "What is the central message?"
            ]}
          />

          <Tip 
            title="3. Inference and attitude"
            description="Questions about implied information and the author's views."
            examples={[
              "What can be inferred about...?",
              "What is the author's attitude towards...?",
              "What does the text suggest about...?",
              "How does the character feel?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Answering strategies" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Read the question first"
            description="Before reading the text, read the question so you know what to look for."
            examples={[
              "Identify keywords in the question",
              "Decide what kind of information you need",
              "Predict where the answer might be",
              "Note whether it asks for specific or general information"
            ]}
          />

          <Rule 
            title="2. Eliminate wrong options"
            description="Use elimination to narrow down choices."
            examples={[
              "Reject options that contradict the text",
              "Remove options that are too extreme",
              "Drop options that are not mentioned",
              "Avoid options that are only partly right"
            ]}
          />

          <Rule 
            title="3. Find textual evidence"
            description="The correct answer should be supported by the text."
            examples={[
              "Find the exact place that supports your answer",
              "Check that the option matches what the text says",
              "Watch for synonyms and paraphrase",
              "Do not use outside knowledge—only the text"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Common traps" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Obvious distractors"
            description="Options designed to confuse you with partial information."
            examples={[
              "Options that reuse words from the text in the wrong context",
              "Information that is true but does not answer the question",
              "Details that appear but are not relevant to the question",
              "Overgeneralisations from specific information"
            ]}
          />

          <Rule 
            title="2. Information not stated"
            description="Options that sound logical but are not in the text."
            examples={[
              "Assumptions from general knowledge",
              "Logical conclusions that are never stated",
              "Information that 'should' be there but is not",
              "Inferences that go beyond the text"
            ]}
          />

          <Rule 
            title="3. Extreme options"
            description="Answers with absolute wording that are rarely correct."
            examples={[
              "Words like 'always', 'never', 'all', 'none'",
              "Extreme superlatives without support",
              "Categorical claims with no nuance",
              "Absolute generalisations"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Multiple Choice Questions"
      description="Master multiple choice questions. Learn how to pick correct answers, avoid common traps, and use textual evidence effectively."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildMultipleChoiceQuestionsExercises}
      prerequisites={["Reading comprehension", "Critical thinking", "Text analysis skills"]}
      estimatedTime="75 min"
    />
  );
};

export default MultipleChoiceQuestionsPage;
