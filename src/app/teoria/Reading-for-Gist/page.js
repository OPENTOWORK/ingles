'use client';
import { buildReadingForGistExercises } from './readingForGistExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const ReadingForGistPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What is Reading for Gist?" icon="👁️">
        <p>
          <strong>Reading for Gist</strong> means reading to get the general idea or main topic of a text 
          without trying to understand every word or small detail. It is like taking a wide-angle picture of the content.
        </p>
        
        <Example 
          title="Reading for gist example"
          content="When you read a newspaper article, you first work out: Is it about politics, sport, technology? What is the main message? What is going on in general?"
          explanation="You do not need every word—only the central idea and the purpose of the text."
        />
      </TheorySection>

      <TheorySection title="Main strategies" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Fast first read"
            description="Skim the whole text without stopping."
            examples={[
              "Do not use a dictionary on the first read",
              "Do not worry about unknown words",
              "Keep a steady reading pace",
              "Focus on words you recognise"
            ]}
          />

          <Rule 
            title="2. Spot key features"
            description="Look for clues that give the general idea."
            examples={[
              "Title and subheadings",
              "First and last sentence of paragraphs",
              "Words that repeat often",
              "Important proper names and dates"
            ]}
          />

          <Rule 
            title="3. Ask about purpose"
            description="Why was this text written?"
            examples={[
              "To inform about something?",
              "To persuade?",
              "To entertain?",
              "To explain a process?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Specific techniques" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Expanded title technique"
            description="Use the title to predict content."
            examples={[
              "What do you expect to find from the title?",
              "What questions might the text answer?",
              "What related vocabulary might appear?",
              "What kind of information will matter?"
            ]}
          />

          <Rule 
            title="2. Quick mental map"
            description="Sketch the main ideas in your mind."
            examples={[
              "Central topic in the middle",
              "Main ideas as branches",
              "Link related concepts",
              "Ignore specific detail for now"
            ]}
          />

          <Rule 
            title="3. The 5 Ws"
            description="Look for basic answers: Who, What, When, Where, Why."
            examples={[
              "Who: Who is involved?",
              "What: What is happening?",
              "When: When does it occur?",
              "Where: Where does it happen?",
              "Why: Why does it matter?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Important rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Speed over fine detail"
            description="In gist reading, speed matters more than every small detail."
            examples={[
              "Read 2–3 times faster than usual",
              "Do not stop on unknown words",
              "Skip very technical sections on the first pass",
              "Trust your overall understanding"
            ]}
          />

          <Rule 
            title="2. Context over vocabulary"
            description="Use context to infer general meanings."
            examples={[
              "One unknown word does not destroy understanding",
              "About 80% understanding is enough for gist",
              "Key words often repeat",
              "Context gives clues to meaning"
            ]}
          />

          <Rule 
            title="3. Text structure"
            description="Recognise common patterns of organisation."
            examples={[
              "Introduction → Body → Conclusion",
              "Problem → Solution",
              "Cause → Effect",
              "Comparison → Contrast"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Reading for Gist"
      description="Master reading for general ideas. Learn to identify main topics and purposes quickly without getting lost in detail."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildReadingForGistExercises}
      prerequisites={["Basic reading skills", "Basic vocabulary"]}
      estimatedTime="70 min"
    />
  );
};

export default ReadingForGistPage;
