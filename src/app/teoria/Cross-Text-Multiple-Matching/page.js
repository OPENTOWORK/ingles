'use client';
import { buildCrossTextMultipleMatchingExercises } from './crossTextMultipleMatchingExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const CrossTextMultipleMatchingPage = () => {
  const theoryContent = (
    <>
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
    </>
  );

    return (
    <TheoryLayout
      title="Cross-text Multiple Matching"
      description="Master comparative reading across texts. Learn to spot links, contrasts, and patterns between different sources on related topics."
      level="C2"
      theoryContent={theoryContent}
      getExercises={buildCrossTextMultipleMatchingExercises}
      prerequisites={["Advanced reading comprehension", "Critical analysis skills", "Synthesis abilities"]}
      estimatedTime="90 min"
    />
  );
};

export default CrossTextMultipleMatchingPage;
