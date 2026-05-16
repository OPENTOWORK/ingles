'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const ReadingForDetailPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What is Reading for Detail?" icon="🔍">
        <p>
          <strong>Reading for Detail</strong> means reading carefully to find specific information, 
          exact data, particular facts, and concrete details. It is like using a magnifying glass on chosen parts of the text.
        </p>
        
        <Example 
          title="Reading for detail example"
          content="If you need: 'What time does the library open on Saturdays?' you search specifically for times and days of the week—not the whole history of the library."
          explanation="You aim for precise facts, not general understanding only."
        />
      </TheorySection>

      <TheorySection title="Main strategies" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Know what you are looking for"
            description="Before reading, define exactly what information you need."
            examples={[
              "Are you looking for numbers, dates, names?",
              "Do you need causes, effects, or steps?",
              "Which keywords might appear?",
              "Which part of the text might hold the answer?"
            ]}
          />

          <Rule 
            title="2. Use scanning"
            description="Sweep the text for specific keywords."
            examples={[
              "Look for numbers if you need statistics",
              "Look for proper nouns for people or places",
              "Look for time words for sequences",
              "Look for connectors for cause and effect"
            ]}
          />

          <Rule 
            title="3. Read the relevant stretch intensively"
            description="When you find the right section, read it closely."
            examples={[
              "Read word by word in that stretch",
              "Watch modifiers (very, quite, almost)",
              "Note negation (not, never, hardly)",
              "Check you understand exactly"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Types of detailed information" icon="📊">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Numbers and statistics"
            description="Exact figures, percentages, measures, quantities."
            examples={[
              "Dates: 15th March, 2023, last Tuesday",
              "Amounts: 50%, three quarters, majority",
              "Measures: 5 kilometers, 2 hours, €100",
              "Ranges: between 20–30, approximately 500"
            ]}
          />

          <Rule 
            title="2. Sequences and processes"
            description="Order of events, steps, instructions."
            examples={[
              "First, second, then, finally",
              "Before, after, while",
              "Next step, procedure",
              "Chronology of events"
            ]}
          />

          <Rule 
            title="3. Cause and effect"
            description="Why something happens and what follows."
            examples={[
              "Because, since, due to, as a result",
              "Therefore, consequently, thus, hence",
              "Leads to, causes, results in",
              "The reason why, the effect of"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Important rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Precision matters"
            description="In reading for detail, every word can count."
            examples={[
              "Difference between 'most' and 'all'",
              "Note 'usually' vs 'always'",
              "Distinguish 'increase' from 'decrease'",
              "Watch 'before' vs 'after'"
            ]}
          />

          <Rule 
            title="2. Immediate context"
            description="Read sentences before and after for full sense."
            examples={[
              "Information may be spread across sentences",
              "Pronouns may point to earlier detail",
              "Examples may clarify a point",
              "Definitions may follow the term"
            ]}
          />

          <Rule 
            title="3. Cross-check"
            description="Confirm information against other parts of the text."
            examples={[
              "Is the information consistent?",
              "Are there apparent contradictions?",
              "Is the same point repeated?",
              "Do examples support the claim?"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="What is the main goal of reading for detail?"
      options={[
        "Read as fast as possible",
        "Find specific, exact information",
        "Understand only the general idea",
        "Memorise every word"
      ]}
      correctAnswer={1}
      explanation="Reading for detail targets specific facts, exact data, and particular points."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What should you do before you read for detail?"
      options={[
        "Read the whole text first",
        "State exactly what information you need",
        "Count the pages",
        "Look up every unknown word"
      ]}
      correctAnswer={1}
      explanation="First define clearly what specific information you are searching for."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "In reading for detail, every word can matter.",
          isTrue: true,
          explanation: "Correct. Modifiers, negation, and small words can completely change meaning."
        },
        {
          text: "You should read at the same speed as for gist.",
          isTrue: false,
          explanation: "Incorrect. Detail reading is slower and more careful than gist reading."
        },
        {
          text: "Scanning helps you find the right section.",
          isTrue: true,
          explanation: "Correct. Scanning locates the parts that likely contain your answer."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the difference between 'most students' and 'all students'?"
      options={[
        "There is no difference",
        "'Most' means a majority; 'all' means everyone",
        "'Most' is more formal than 'all'",
        "They mean exactly the same"
      ]}
      correctAnswer={1}
      explanation="'Most' means a majority (more than half but not everyone); 'all' means 100% with no exceptions."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which words help you find information about causes?"
      options={[
        "Numbers and dates",
        "Because, since, due to",
        "First, second, third",
        "Always, never, sometimes"
      ]}
      correctAnswer={1}
      explanation="Words like 'because', 'since', and 'due to' signal cause and help you find why something happens."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "You should read only the sentence that holds your answer.",
          isTrue: false,
          explanation: "Incorrect. Read the surrounding sentences too for full meaning."
        },
        {
          text: "Pronouns can refer to information in earlier sentences.",
          isTrue: true,
          explanation: "Correct. Pronouns like 'it', 'they', and 'this' often refer back to earlier content."
        },
        {
          text: "You do not need to check consistency when reading for detail.",
          isTrue: false,
          explanation: "Incorrect. Check that information is consistent across the text."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="What is the best strategy for information about time order?"
      options={[
        "Look only for numbers",
        "Look for time connectors like 'first', 'then', 'finally'",
        "Read only the first paragraph",
        "Ignore dates"
      ]}
      correctAnswer={1}
      explanation="Time connectors show the order of events and processes."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Why note words like 'not', 'never', and 'hardly'?"
      options={[
        "They are very common",
        "They can completely change sentence meaning",
        "They are hard to pronounce",
        "They always appear in exams"
      ]}
      correctAnswer={1}
      explanation="Negation such as 'not', 'never', and 'hardly' is crucial for exact understanding."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Reading for detail helps when you must follow precise instructions.",
          isTrue: true,
          explanation: "Correct. Instructions require exact understanding of each step."
        },
        {
          text: "You should use reading for detail for every text you read.",
          isTrue: false,
          explanation: "Incorrect. Use it when you need specifics; use gist reading for the overview."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="What is the best way to check you found the right information?"
      options={[
        "Read once more only",
        "Check consistency with other parts of the text",
        "Translate into Spanish",
        "Count the words in the answer"
      ]}
      correctAnswer={1}
      explanation="Cross-checking with the rest of the text helps confirm your interpretation."
    />
  ];

  return (
    <TheoryLayout
      title="Reading for Detail"
      description="Master careful reading for specifics. Learn how to locate exact facts, sequences, and cause–effect links in texts."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Reading for gist skills", "Basic vocabulary", "Grammar awareness"]}
      estimatedTime="75 min"
    />
  );
};

export default ReadingForDetailPage;
