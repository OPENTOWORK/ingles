'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const MultipleMatchingPage = () => {
  const theoryContent = (
    <div>
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
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="In Multiple Matching, can texts be the answer to more than one question?"
      options={[
        "No—each text answers only one question",
        "Yes—texts can answer several questions",
        "Only if the texts are very long",
        "It depends how many questions there are"
      ]}
      correctAnswer={1}
      explanation="Yes—in Multiple Matching a text can be the answer to several different questions."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What is the best way to start a Multiple Matching task?"
      options={[
        "Read all the texts first",
        "Read the questions first",
        "Count how many texts there are",
        "Start with the longest text"
      ]}
      correctAnswer={1}
      explanation="Read the questions first so you know what to look for in the texts."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Every text must be used as an answer at least once.",
          isTrue: false,
          explanation: "Incorrect. Some texts may not answer any question in Multiple Matching."
        },
        {
          text: "Answers in the texts often use synonyms of words in the questions.",
          isTrue: true,
          explanation: "Correct. You rarely find identical wording; look for synonyms and paraphrase."
        },
        {
          text: "You must read each text fully before you search for answers.",
          isTrue: false,
          explanation: "Incorrect. It is more efficient to read strategically for information tied to the questions."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="If a question is about a 'high price', which words might you find in the text?"
      options={[
        "Only the word 'expensive'",
        "Luxury, premium, costly, pricey",
        "Only numbers with currency symbols",
        "Only the phrase 'high price'"
      ]}
      correctAnswer={1}
      explanation="Look for synonyms such as 'luxury', 'premium', 'costly', and 'pricey' that signal high price."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What should you do while reading each text?"
      options={[
        "Memorise everything",
        "Translate every word",
        "Underline relevant information and mark possible answers",
        "Read aloud"
      ]}
      correctAnswer={2}
      explanation="Underline relevant information and mark question numbers where you find possible answers."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "If a text has already answered one question, it cannot answer another.",
          isTrue: false,
          explanation: "Incorrect. Texts can be reused as answers to several different questions."
        },
        {
          text: "You should look for both explicit and implicit information.",
          isTrue: true,
          explanation: "Correct. Sometimes the answer is implied and you must infer it from context."
        },
        {
          text: "It helps to group similar questions by topic before reading.",
          isTrue: true,
          explanation: "Correct. Grouping similar questions makes it easier to find related answers."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="How can you tell a restaurant is 'suitable for families' if it does not say so directly?"
      options={[
        "Only if it says 'family restaurant'",
        "By mentions of children's menu, playground, high chairs",
        "By counting tables",
        "By the type of food only"
      ]}
      correctAnswer={1}
      explanation="Clues such as 'children's menu', 'playground', or 'high chairs' imply it is family-friendly."
    />,

    <MultipleChoiceExercise
      key="8"
      question="What should you do if you still have no answer after reading all the texts?"
      options={[
        "Leave it blank",
        "Pick a random text",
        "Reread looking for implicit information or synonyms you missed",
        "Change the question"
      ]}
      correctAnswer={2}
      explanation="Reread for implied meaning or synonyms you may have overlooked."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "In Multiple Matching there are always as many questions as texts.",
          isTrue: false,
          explanation: "Incorrect. There are usually more questions than texts, so some texts answer several questions."
        },
        {
          text: "You should check that your answers are logical and consistent at the end.",
          isTrue: true,
          explanation: "Correct. Review that each answer makes sense and is well supported."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="What is the key to success in Multiple Matching?"
      options={[
        "Reading very fast",
        "Memorising all the texts",
        "Recognising synonyms and paraphrase effectively",
        "Using only the first answers you find"
      ]}
      correctAnswer={2}
      explanation="The key is recognising synonyms and paraphrase, since answers rarely copy the question wording."
    />
  ];

  return (
    <TheoryLayout
      title="Multiple Matching"
      description="Master Multiple Matching tasks. Learn to match questions to texts, recognise synonyms, and find specific information efficiently."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced reading skills", "Vocabulary recognition", "Inference abilities"]}
      estimatedTime="80 min"
    />
  );
};

export default MultipleMatchingPage;
