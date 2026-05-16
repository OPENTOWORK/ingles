'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const OpinionAndAttitudePage = () => {
  const theoryContent = (
    <div>
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
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="What is the difference between opinion and attitude?"
      options={[
        "None—they are synonyms",
        "Opinion is a viewpoint; attitude is emotional stance",
        "Opinion is formal; attitude is informal",
        "Opinion is for facts; attitude is for feelings"
      ]}
      correctAnswer={1}
      explanation="Opinion is what the author thinks; attitude is how they feel (positive, negative, neutral) toward the topic."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which phrase clearly signals a personal opinion?"
      options={[
        "Statistics show that...",
        "Research indicates that...",
        "I firmly believe that...",
        "The data demonstrates that..."
      ]}
      correctAnswer={2}
      explanation="'I firmly believe that...' is clearly subjective; the others sound more neutral."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Evaluative adjectives like 'excellent' or 'terrible' reveal attitude.",
          isTrue: true,
          explanation: "Correct. They show positive or negative judgement."
        },
        {
          text: "An objective text never contains author opinion.",
          isTrue: false,
          explanation: "Incorrect. Even 'neutral' texts can hide bias in selection or emphasis."
        },
        {
          text: "Irony and sarcasm can mean the opposite of the literal words.",
          isTrue: true,
          explanation: "Correct. The real meaning can reverse the surface wording."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="If an author writes 'What a brilliant solution!' about something clearly bad, what attitude is shown?"
      options={[
        "Positive and enthusiastic",
        "Neutral and objective",
        "Negative and sarcastic",
        "Confused and unsure"
      ]}
      correctAnswer={2}
      explanation="Calling something 'brilliant' when it is problematic is sarcasm—negative attitude."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What does it suggest if an author gives far more space to negatives than positives?"
      options={[
        "Complete objectivity",
        "A negative stance or critical bias",
        "Poor understanding of the topic",
        "Neutrality"
      ]}
      correctAnswer={1}
      explanation="Heavy focus on negatives versus positives often signals criticism or negative bias."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Words like 'claim' and 'assert' are more neutral than 'prove' and 'demonstrate'.",
          isTrue: true,
          explanation: "Correct. 'Claim' suggests a position; 'prove' suggests settled evidence."
        },
        {
          text: "Author attitude never changes through a text.",
          isTrue: false,
          explanation: "Incorrect. Stance can shift, especially in complex argument."
        },
        {
          text: "Quotation marks can signal distance or sarcasm.",
          isTrue: true,
          explanation: "Correct. Quotes may show the author rejects or doubts a label."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which structure suggests a more balanced presentation?"
      options={[
        "Only supporters believe...",
        "On one hand... on the other hand...",
        "Everyone knows that...",
        "It's obvious that..."
      ]}
      correctAnswer={1}
      explanation="'On one hand... on the other hand...' presents multiple sides—more balanced."
    />,

    <MultipleChoiceExercise
      key="8"
      question="If an author uses mostly passive voice and avoids first-person pronouns, what stance is suggested?"
      options={[
        "Very emotional and personal",
        "Objective and detached",
        "Confused and unsure",
        "Aggressive and confrontational"
      ]}
      correctAnswer={1}
      explanation="Passive voice and no 'I' often aim for objectivity and distance."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Connectors like 'however' and 'unfortunately' can signal a shift in attitude.",
          isTrue: true,
          explanation: "Correct. They often mark a turn toward something more negative or critical."
        },
        {
          text: "Only explicit opinions (with 'I think', 'I believe') count as author opinion.",
          isTrue: false,
          explanation: "Incorrect. Opinion can be implicit through word choice, selection, and emphasis."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="What is the best way to identify overall author attitude in a long text?"
      options={[
        "Read only the introduction",
        "Count positive vs negative words",
        "Track evaluative language and patterns of emphasis",
        "Search only for 'I think'"
      ]}
      correctAnswer={2}
      explanation="Look at the overall pattern: evaluative language, information chosen, emphasis, and how the argument develops."
    />
  ];

  return (
    <TheoryLayout
      title="Opinion and Attitude"
      description="Master spotting author opinion and attitude. Learn to recognise viewpoint, bias, irony, and emotional stance in complex texts."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced reading comprehension", "Critical thinking", "Understanding of tone and style"]}
      estimatedTime="75 min"
    />
  );
};

export default OpinionAndAttitudePage;
