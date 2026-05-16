'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const ReadingForGistPage = () => {
  const theoryContent = (
    <div>
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
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="What is the main goal of reading for gist?"
      options={[
        "Understand every word",
        "Get the general idea of the text",
        "Memorise specific details",
        "Translate the whole text"
      ]}
      correctAnswer={1}
      explanation="Reading for gist focuses on the general idea or topic, not every detail."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What should you do when you meet an unknown word in gist reading?"
      options={[
        "Stop and look it up",
        "Keep reading without stopping",
        "Ask someone what it means",
        "Stop reading the text"
      ]}
      correctAnswer={1}
      explanation="In gist reading, keep going and focus on overall meaning rather than every unknown word."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "In gist reading you need to understand 100% of the vocabulary.",
          isTrue: false,
          explanation: "Incorrect. About 70–80% understanding is often enough to get the general idea."
        },
        {
          text: "The title is an important clue in gist reading.",
          isTrue: true,
          explanation: "Correct. The title hints at the main topic and helps you predict content."
        },
        {
          text: "You should read more slowly for effective gist reading.",
          isTrue: false,
          explanation: "Incorrect. Gist reading means reading faster and focusing on general ideas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which technique best helps you find the main idea?"
      options={[
        "Read only the first sentence",
        "Read the whole text quickly",
        "Count the words",
        "Read only bold words"
      ]}
      correctAnswer={1}
      explanation="A quick read of the whole text gives an overview and helps you see the main idea."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which parts of the text matter most for gist reading?"
      options={[
        "Every adjective and adverb",
        "Title, first and last sentences of paragraphs",
        "Only the longest words",
        "Only numbers and dates"
      ]}
      correctAnswer={1}
      explanation="Titles and first/last sentences of paragraphs usually carry the main ideas."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Words that repeat often are usually important to the topic.",
          isTrue: true,
          explanation: "Correct. Frequent words often relate to the central theme."
        },
        {
          text: "Gist reading is only useful for very short texts.",
          isTrue: false,
          explanation: "Incorrect. Gist reading is especially helpful for long texts when you need the big picture quickly."
        },
        {
          text: "You should use gist reading before reading for specific detail.",
          isTrue: true,
          explanation: "Correct. Gist reading gives background that makes detailed reading easier."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="What is the minimum level of understanding needed for effective gist reading?"
      options={[
        "100%",
        "90–95%",
        "70–80%",
        "50–60%"
      ]}
      correctAnswer={2}
      explanation="With about 70–80% understanding you can usually grasp the general idea without every detail."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which questions are most useful during gist reading?"
      options={[
        "How many words are in each sentence?",
        "Who, what, when, where, why?",
        "What are all the adjectives?",
        "Which words do I not know?"
      ]}
      correctAnswer={1}
      explanation="Basic 5W questions help you pick out essential information for general understanding."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Gist reading is useful in timed exams.",
          isTrue: true,
          explanation: "Correct. It helps you get essential information quickly when time is short."
        },
        {
          text: "You should avoid gist reading if the text has technical vocabulary.",
          isTrue: false,
          explanation: "Incorrect. Gist reading is especially useful with technical texts to get the overview first."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="How fast should gist reading be compared with normal reading?"
      options={[
        "The same speed",
        "Slower than normal",
        "2–3 times faster",
        "One word per minute"
      ]}
      correctAnswer={2}
      explanation="For gist reading, read about 2–3 times faster than normal to get the overall picture."
    />
  ];

  return (
    <TheoryLayout
      title="Reading for Gist"
      description="Master reading for general ideas. Learn to identify main topics and purposes quickly without getting lost in detail."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic reading skills", "Basic vocabulary"]}
      estimatedTime="70 min"
    />
  );
};

export default ReadingForGistPage;
