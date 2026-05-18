'use client';
import { buildOpinionAndAttitudeExercises } from './opinionAndAttitudeExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const OpinionAndAttitudePage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What are Opinion and Attitude?" icon="💭">
        <p>
          <strong>Opinion</strong> is the author's personal view on a topic. 
          <strong>Attitude</strong> is the author's emotional or mental stance (positive, negative, neutral). 
          Spotting both helps you see where the author stands.
        </p>
        
        <Example 
          title="Opinion and attitude example"
          content="Text: 'While some argue that social media connects people, I believe it actually isolates us from genuine human interaction.'
          Opinion: The author thinks social media isolates people.
          Attitude: Critical / negative toward social media."
          explanation="The author states a clear personal view and a critical stance toward the topic."
        />
      </TheorySection>

      <TheorySection title="Spotting opinions" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Explicit opinion markers"
            description="Phrases that flag a personal view."
            examples={[
              "I believe, I think, In my opinion, I feel",
              "It seems to me, From my perspective",
              "I would argue that, I maintain that",
              "Personally, I consider, I'm convinced that"
            ]}
          />

          <Tip 
            title="2. Opinion verbs"
            description="Verbs that express belief, judgement, or evaluation."
            examples={[
              "Suggest, imply, indicate, demonstrate",
              "Prove, show, reveal, confirm",
              "Argue, claim, assert, contend",
              "Recommend, propose, advocate, support"
            ]}
          />

          <Tip 
            title="3. Evaluative adjectives"
            description="Adjectives that carry value judgements."
            examples={[
              "Excellent, terrible, wonderful, awful",
              "Effective, ineffective, successful, failed",
              "Important, trivial, significant, irrelevant",
              "Reasonable, absurd, logical, ridiculous"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Spotting attitudes" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Positive attitude"
            description="Approval, enthusiasm, or support."
            examples={[
              "Positive words: excellent, brilliant, outstanding",
              "Optimistic tone: promising, encouraging, hopeful",
              "Explicit support: I fully support, I strongly recommend",
              "Stress on benefits: advantages, benefits, strengths"
            ]}
          />

          <Rule 
            title="2. Negative attitude"
            description="Disapproval, criticism, or rejection."
            examples={[
              "Negative words: terrible, disastrous, appalling",
              "Pessimistic tone: concerning, alarming, worrying",
              "Explicit criticism: I strongly oppose, I disagree",
              "Stress on problems: disadvantages, flaws, weaknesses"
            ]}
          />

          <Rule 
            title="3. Neutral / objective stance"
            description="Information presented without clear personal preference."
            examples={[
              "Factual wording: statistics show, research indicates",
              "Balanced presentation: on one hand... on the other hand",
              "Few evaluative adjectives",
              "Passive voice to create distance"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Advanced points" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Irony and sarcasm"
            description="When the author means the opposite of the surface wording."
            examples={[
              "Mismatch between words and context",
              "Obvious exaggeration: 'What a brilliant idea!' (when it is awful)",
              "Sarcastic scare quotes: 'expert' opinion",
              "Tone that does not match content"
            ]}
          />

          <Rule 
            title="2. Implicit bias"
            description="Preferences shown indirectly."
            examples={[
              "Which information is selected",
              "Order of presentation (positive first or last)",
              "Space given to each side",
              "Sources cited and how credible they seem"
            ]}
          />

          <Rule 
            title="3. Shifts in attitude"
            description="The author's stance may change through the text."
            examples={[
              "Starts neutral, becomes critical",
              "Optimistic at first, darker by the end",
              "Connectors signalling change: however, but, unfortunately",
              "Gradual build of argument"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Opinion and Attitude"
      description="Master spotting author opinion and attitude. Learn to recognise viewpoint, bias, irony, and emotional stance in complex texts."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildOpinionAndAttitudeExercises}
      prerequisites={["Advanced reading comprehension", "Critical thinking", "Understanding of tone and style"]}
      estimatedTime="75 min"
    />
  );
};

export default OpinionAndAttitudePage;
