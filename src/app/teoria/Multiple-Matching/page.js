'use client';
import { buildMultipleMatchingExercises } from './multipleMatchingExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const MultipleMatchingPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What is Multiple Matching?" icon="🔗">
        <p>
          <strong>Multiple Matching</strong> is a task where you match questions or statements 
          to different texts or sections. Each text may be used more than once, and some options may not be used.
        </p>
        
        <Example 
          title="Multiple Matching example"
          content="You have 4 texts about different restaurants (A, B, C, D) and 7 questions such as: 'Which mentions vegetarian food?', 'Which has the best service?' You find which text answers each question."
          explanation="One text can answer several questions, and more than one question may share the same answer."
        />
      </TheorySection>

      <TheorySection title="Main strategies" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Read the questions first"
            description="Before reading the texts, study all the questions."
            examples={[
              "Identify keywords in each question",
              "Group similar questions by topic",
              "Note what kind of information you need",
              "Predict vocabulary you might meet"
            ]}
          />

          <Tip 
            title="2. Strategic reading of texts"
            description="Read each text looking for specific answers."
            examples={[
              "Underline relevant information as you read",
              "Mark possible answers with question numbers",
              "Do not get stuck on irrelevant detail",
              "Look for synonyms of the keywords"
            ]}
          />

          <Tip 
            title="3. Check and review"
            description="Confirm your answers and find any you missed."
            examples={[
              "Have you used texts appropriately?",
              "Does one text answer several questions?",
              "Are any questions unanswered?",
              "Are your answers logical and consistent?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Common question types" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Specific information"
            description="Questions about concrete facts and details."
            examples={[
              "Which mentions a specific price?",
              "Where are opening hours discussed?",
              "Which text includes contact details?",
              "Which describes an exact location?"
            ]}
          />

          <Rule 
            title="2. Opinions and attitudes"
            description="Questions about viewpoints and feelings."
            examples={[
              "Which expresses a positive opinion?",
              "Where is disagreement shown?",
              "Which text sounds enthusiastic?",
              "Which suggests disappointment or criticism?"
            ]}
          />

          <Rule 
            title="3. Comparisons and contrasts"
            description="Questions that compare different aspects."
            examples={[
              "Which is the most expensive/cheapest?",
              "Which option is more convenient?",
              "Which offers better quality?",
              "Where is there the widest range?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Important rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Reusing texts"
            description="Texts can answer more than one question."
            examples={[
              "One text may answer 2–3 different questions",
              "Do not discard a text after using it once",
              "Some texts may answer no questions",
              "Read each text with all questions in mind"
            ]}
          />

          <Rule 
            title="2. Synonyms and paraphrase"
            description="Answers rarely repeat the exact words of the questions."
            examples={[
              "'Expensive' in the question → 'costly, pricey' in the text",
              "'Happy' in the question → 'delighted, pleased' in the text",
              "'Difficult' in the question → 'challenging, tough' in the text",
              "'Quick' in the question → 'rapid, fast, speedy' in the text"
            ]}
          />

          <Rule 
            title="3. Implicit information"
            description="Sometimes the answer is implied, not stated outright."
            examples={[
              "A question about 'high price' may be answered with 'luxury, premium'",
              "'Suitable for families' may appear as 'children's menu, playground'",
              "'Popular' may be implied by 'always busy, book in advance'",
              "'Experienced' may be suggested by 'established since 1950'"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Multiple Matching"
      description="Master Multiple Matching tasks. Learn to match questions to texts, recognise synonyms, and find specific information efficiently."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildMultipleMatchingExercises}
      prerequisites={["Advanced reading skills", "Vocabulary recognition", "Inference abilities"]}
      estimatedTime="80 min"
    />
  );
};

export default MultipleMatchingPage;
