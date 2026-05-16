'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const CrossTextMultipleMatchingPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What is Cross-text Multiple Matching?" icon="🔄">
        <p>
          <strong>Cross-text Multiple Matching</strong> is an advanced task where you relate information 
          across several different texts. You compare, contrast, and connect ideas, opinions, or specific 
          details that appear in multiple texts on related topics.
        </p>
        
        <Example 
          title="Cross-text Multiple Matching example"
          content="You have 4 texts on climate change by different authors. Questions might be: 'Which texts mention technological solutions?', 'Which express optimism about the future?', 'Which authors agree on the main causes?'"
          explanation="You must read several texts together to spot connections, similarities, and differences."
        />
      </TheorySection>

      <TheorySection title="Types of links" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Similarities of content"
            description="Texts that share information, ideas, or approaches."
            examples={[
              "Same causes mentioned in different texts",
              "Similar solutions proposed by several authors",
              "Parallel examples used in more than one text",
              "Matching data or statistics"
            ]}
          />

          <Tip 
            title="2. Contrasts and differences"
            description="Texts with opposing views or conflicting information."
            examples={[
              "Opposite opinions on the same issue",
              "Different readings of the same data",
              "Contrasting ways to solve a problem",
              "Contradictory conclusions"
            ]}
          />

          <Tip 
            title="3. Attitudes and tone"
            description="Comparing the emotional stance of different authors."
            examples={[
              "Optimism vs pessimism about the future",
              "Criticism vs support for particular policies",
              "Confidence vs scepticism about solutions",
              "Urgency vs calm in how the topic is handled"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Advanced strategies" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Concept mapping"
            description="Build a mental map of each text's main ideas."
            examples={[
              "Identify the central theme of each text",
              "List each author's main points",
              "Note unique evidence or examples",
              "Mark each text's conclusion"
            ]}
          />

          <Rule 
            title="2. Comparative analysis"
            description="Compare elements across texts systematically."
            examples={[
              "Which texts mention the same causes?",
              "Which propose similar solutions?",
              "Which authors share the same attitude?",
              "Where is there clear agreement or disagreement?"
            ]}
          />

          <Rule 
            title="3. Synthesising information"
            description="Combine material from several sources to answer."
            examples={[
              "Link complementary ideas from different texts",
              "Spot patterns that appear across texts",
              "See when several texts support the same idea",
              "Notice when one text contradicts others"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Important rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Precision in links"
            description="Connections must be exact, not vague."
            examples={[
              "Check ideas are really similar, not just related",
              "Distinguish partial agreement from full agreement",
              "Do not assume unstated connections",
              "Beware of superficial similarities"
            ]}
          />

          <Rule 
            title="2. Multiple correct texts"
            description="Some questions may have more than one text as an answer."
            examples={[
              "One question may apply to 2–3 texts",
              "Some texts may answer no question",
              "Read carefully if it asks for 'one', 'some', or 'all'",
              "Consider every possibility before deciding"
            ]}
          />

          <Rule 
            title="3. Levels of analysis"
            description="Analyse both explicit and implicit meaning."
            examples={[
              "Information stated directly",
              "Implicit attitudes and opinions",
              "Underlying assumptions in each text",
              "Implications of the conclusions"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="What best characterises Cross-text Multiple Matching?"
      options={[
        "Analysing one text in great detail",
        "Relating information across several different texts",
        "Translating between languages",
        "Memorising content from several texts"
      ]}
      correctAnswer={1}
      explanation="Cross-text Multiple Matching is about linking, comparing, and contrasting information across different texts."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What is the best first step for this task type?"
      options={[
        "Read all the texts without notes",
        "Create a mental map of each text's main ideas",
        "Memorise the first text completely",
        "Read only the first sentence of each text"
      ]}
      correctAnswer={1}
      explanation="A mental map helps you organise and systematically compare each text's main ideas."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "In Cross-text Multiple Matching, some texts may not answer any question.",
          isTrue: true,
          explanation: "Correct. Not every text has to be used for the questions given."
        },
        {
          text: "You should only look for information that is explicitly stated.",
          isTrue: false,
          explanation: "Incorrect. You should also analyse implicit attitudes, tone, and underlying assumptions."
        },
        {
          text: "One question may have several texts as correct answers.",
          isTrue: true,
          explanation: "Correct. Several texts may share the feature the question asks about."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="When the question is 'Which texts express optimism about the future?', what kind of link are you looking for?"
      options={[
        "Content similarities",
        "Contrasts and differences",
        "Attitudes and tone",
        "Specific factual information"
      ]}
      correctAnswer={2}
      explanation="You are comparing attitudes and tone—specifically which texts show an optimistic stance."
    />,

    <MultipleChoiceExercise
      key="5"
      question="How should you treat similarities between texts?"
      options={[
        "Assume related ideas are the same",
        "Check that ideas are truly similar, not just related",
        "Focus only on identical wording",
        "Ignore subtle differences"
      ]}
      correctAnswer={1}
      explanation="Verify that ideas are genuinely similar, not merely related or superficially alike."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "You should distinguish partial agreement from full agreement between texts.",
          isTrue: true,
          explanation: "Correct. Be precise about how far the texts really agree."
        },
        {
          text: "Superficial similarities are enough to claim texts align.",
          isTrue: false,
          explanation: "Incorrect. Look for substantive links, not surface-level matches."
        },
        {
          text: "You may assume logical connections that the texts never state.",
          isTrue: false,
          explanation: "Incorrect. Links must rest on clear evidence from the texts, not on guesswork."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="What should you do when texts contradict each other?"
      options={[
        "Ignore the contradictions",
        "Choose the text you prefer",
        "Note and analyse the differences as possible answers",
        "Aim for a compromise between them"
      ]}
      correctAnswer={2}
      explanation="Contradictions matter and may be the answer to questions about contrast or differing views."
    />,

    <MultipleChoiceExercise
      key="8"
      question="What is a common mistake in Cross-text Multiple Matching?"
      options={[
        "Reading all texts carefully",
        "Confusing surface similarity with a real connection",
        "Taking notes while reading",
        "Checking answers twice"
      ]}
      correctAnswer={1}
      explanation="A common error is mixing up superficial similarity (similar words, related topics) with a real substantive link."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "You should analyse both explicit content and implications in each text.",
          isTrue: true,
          explanation: "Correct. Cross-text matching needs both surface meaning and deeper implication."
        },
        {
          text: "Every text must be used as an answer at least once.",
          isTrue: false,
          explanation: "Incorrect. Some texts may not match any of the questions."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="What is the most important skill for Cross-text Multiple Matching?"
      options={[
        "Reading speed",
        "Photographic memory",
        "Synthesis and comparative analysis",
        "Advanced vocabulary alone"
      ]}
      correctAnswer={2}
      explanation="Synthesis and comparative analysis are essential to connect and contrast information across texts."
    />
  ];

  return (
    <TheoryLayout
      title="Cross-text Multiple Matching"
      description="Master comparative reading across texts. Learn to spot links, contrasts, and patterns between different sources on related topics."
      level="C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced reading comprehension", "Critical analysis skills", "Synthesis abilities"]}
      estimatedTime="90 min"
    />
  );
};

export default CrossTextMultipleMatchingPage;
