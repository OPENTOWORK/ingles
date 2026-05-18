'use client';
import { buildReadingForDetailExercises } from './readingForDetailExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const ReadingForDetailPage = () => {
  const theoryContent = (
    <>
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
    </>
  );

    return (
    <TheoryLayout
      title="Reading for Detail"
      description="Master careful reading for specifics. Learn how to locate exact facts, sequences, and cause–effect links in texts."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildReadingForDetailExercises}
      prerequisites={["Reading for gist skills", "Basic vocabulary", "Grammar awareness"]}
      estimatedTime="75 min"
    />
  );
};

export default ReadingForDetailPage;
