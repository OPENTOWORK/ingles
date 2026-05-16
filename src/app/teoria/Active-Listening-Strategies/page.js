'use client';
import React from 'react';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { 
  TheorySection, 
  Example, 
  Rule, 
  Tip, 
  GrammarTable, 
  QuickReference 
} from '@/components/theory/TheoryContent';
import { 
  MultipleChoiceExercise, 
  FillBlanksExercise, 
  TrueFalseExercise 
} from '@/components/theory/ExerciseComponents';

const ActiveListeningStrategiesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are Active Listening Strategies?" icon="🎧">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Active listening strategies</strong> are techniques that engage you in understanding what you hear. They significantly improve comprehension.
        </p>
        
        <QuickReference items={[
          "Ways to engage actively with listening",
          "Prediction and anticipation tactics",
          "Checking and confirming understanding",
          "Inference and reasoning skills",
          "Managing attention and focus"
        ]} />
      </TheorySection>

      <TheorySection title="Passive vs Active Listening" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Knowing the difference is key to improving listening.
        </p>

        <GrammarTable
          caption="Passive vs Active Listening"
          headers={["Aspect", "Passive", "Active", "Outcome"]}
          rows={[
            ["Engagement", "Receives input only", "Takes part mentally", "Stronger understanding"],
            ["Attention", "Limited focus", "Full focus", "Better recall"],
            ["Prediction", "Does not anticipate", "Predicts content", "Better readiness"],
            ["Checking", "Does not verify", "Checks understanding", "Greater accuracy"],
            ["Inference", "Literal only", "Active inference", "Deeper meaning"],
            ["Management", "No plan", "Uses strategies", "More control"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Passive: 'Just hearing without engaging'" />
          <Example english="Active: 'Predict, check, infer'" />
          <Example english="Result: 'Better comprehension and memory'" />
        </div>

        <Rule 
          title="Traits of Active Listening"
          description="Active listening includes:"
          examples={[
            "Predicting content",
            "Checking understanding as you go",
            "Inferring implied meaning",
            "Managing attention",
            "Applying task-specific strategies"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Active listening turns listening from a passive into a controlled process.
        </Tip>
      </TheorySection>

      <TheorySection title="Prediction Strategies" icon="🔮">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Prediction mentally primes you for what comes next.
        </p>

        <GrammarTable
          caption="Prediction Strategies"
          headers={["Strategy", "Description", "When to Use", "Example"]}
          rows={[
            ["From questions", "Guess from prompts", "Before audio", "Price question → expect numbers"],
            ["From context", "Guess from situation", "Before audio", "Airport → times, gates"],
            ["From title", "Guess from heading", "Before audio", "Tech topic → technical words"],
            ["From visuals", "Guess from pictures", "Before audio", "Restaurant scene → food, prices"],
            ["From vocabulary", "Guess from key words", "During audio", "Hear 'benefits' → listen for advantages"],
            ["From structure", "Guess from markers", "During audio", "Hear 'first' → expect a list"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="From questions: 'Question about price → look for numbers'" />
          <Example english="From context: 'Airport → times, gates'" />
          <Example english="From vocabulary: 'Hear benefits → listen for advantages'" />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Prediction primes your mind for specific information.
        </Tip>
      </TheorySection>

      <TheorySection title="Checking Strategies" icon="✅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Ongoing checking confirms understanding and fixes mistakes early.
        </p>

        <GrammarTable
          caption="Checking Strategies"
          headers={["Strategy", "Description", "When to Use", "Benefit"]}
          rows={[
            ["Immediate check", "Confirm right away", "During audio", "Fix errors early"],
            ["Cross-check", "Compare with earlier info", "During audio", "Stay consistent"],
            ["Context check", "Use setting to confirm", "During audio", "Validate guesses"],
            ["Coherence check", "Test internal logic", "During audio", "Spot contradictions"],
            ["Question check", "Match to items", "After audio", "Validate answers"],
            ["Prediction check", "Compare to guesses", "After audio", "Gauge accuracy"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Immediate check: 'Confirm understanding while listening'" />
          <Example english="Cross-check: 'Compare with earlier information'" />
          <Example english="Context check: 'Use context to confirm meaning'" />
        </div>

        <Rule 
          title="Checking Tips"
          description="To check effectively:"
          examples={[
            "Monitor understanding throughout",
            "Use more than one check when possible",
            "Be willing to revise your interpretation",
            "Correct misunderstandings as soon as you spot them"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Over-checking can distract you—balance monitoring with following the flow.
        </Tip>
      </TheorySection>

      <TheorySection title="Inference Strategies" icon="🧠">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Inference helps with implied meaning and gaps in what you hear.
        </p>

        <GrammarTable
          caption="Inference Strategies"
          headers={["Type", "Description", "Example", "When to Use"]}
          rows={[
            ["Contextual", "Infer from setting", "Hospital → surgery likely means operation", "Unknown words"],
            ["Logical", "Infer by reasoning", "Rain → event may be cancelled", "Implicit information"],
            ["Cultural", "Infer from background", "Thanksgiving → turkey", "Cultural references"],
            ["Temporal", "Infer from time cues", "Tomorrow → future event", "Time relations"],
            ["Causal", "Infer cause-effect", "Accident → traffic", "Cause and effect"],
            ["Emotional", "Infer feeling", "Sad tone → bad news", "Attitude and mood"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Contextual: 'Hospital → surgery may mean an operation'" />
          <Example english="Logical: 'Rain → event may be cancelled'" />
          <Example english="Cultural: 'Thanksgiving → turkey'" />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Inference lets you understand more than the exact words spoken.
        </Tip>
      </TheorySection>

      <TheorySection title="Attention and Focus Management" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Managing attention supports active listening throughout.
        </p>

        <GrammarTable
          caption="Attention Management"
          headers={["Strategy", "Description", "When to Use", "Benefit"]}
          rows={[
            ["Selective focus", "Target relevant information", "Whole recording", "Reduce distraction"],
            ["Fatigue control", "Handle mental tiredness", "Long audio", "Sustain performance"],
            ["Recovery", "Regain lost focus", "When you drift", "Miss less content"],
            ["Distractor prep", "Expect interruptions", "Before audio", "Reduce impact"],
            ["Relaxation", "Stay calm", "Before audio", "Lower anxiety"],
            ["Time use", "Use moments well", "During audio", "Maximize efficiency"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Selective focus: 'Lock onto relevant information'" />
          <Example english="Fatigue control: 'Manage mental tiredness'" />
          <Example english="Recovery: 'Bring attention back when it slips'" />
        </div>

        <Rule 
          title="Attention Tips"
          description="To manage attention:"
          examples={[
            "Reduce avoidable distractions",
            "Use breathing to steady yourself",
            "Take brief mental resets when possible",
            "Stay constructive and confident"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Attention control improves with practice.
        </Tip>
      </TheorySection>

      <TheorySection title="Processing Strategies" icon="⚙️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Active processing turns sound into meaningful understanding.
        </p>

        <GrammarTable
          caption="Processing Strategies"
          headers={["Strategy", "Description", "Example", "Benefit"]}
          rows={[
            ["Parallel", "Handle several subtasks", "Listen + note + infer", "High efficiency"],
            ["Sequential", "Step by step", "Listen → grasp → recall", "Deep clarity"],
            ["Chunking", "Group related bits", "Cluster related facts", "Better structure"],
            ["Priority", "Rank importance", "Key points first", "Stay on target"],
            ["Pattern", "Spot familiar shapes", "Common layouts", "Anticipation"],
            ["Connection", "Link ideas", "Relate points", "Holistic view"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Parallel: 'Listen + take notes + infer'" />
          <Example english="Chunking: 'Group related information'" />
          <Example english="Priority: 'Key information first'" />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Active processing turns raw audio into meaningful understanding.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Listening passively ❌<br/>
            <strong>Better:</strong> Engage mentally ✅<br/>
            <em>Active engagement improves comprehension</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> No prediction ❌<br/>
            <strong>Better:</strong> Predict from context ✅<br/>
            <em>Prediction prepares your processing</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Never checking understanding ❌<br/>
            <strong>Better:</strong> Monitor as you go ✅<br/>
            <em>Checking improves accuracy</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Ignoring implied meaning ❌<br/>
            <strong>Better:</strong> Use inference ✅<br/>
            <em>Inference fills what is not spelled out</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Active participation"
            description="Take an active role in listening."
            examples={[
              "Predict before and during listening",
              "Check understanding continuously",
              "Infer implied information",
              "Manage attention and focus"
            ]}
          />

          <Rule 
            title="2. Combine strategies"
            description="Layer strategies for best effect."
            examples={[
              "Prediction + checking + inference",
              "Attention control + active processing",
              "Match tactics to task type",
              "Adjust to context"
            ]}
          />

          <Rule 
            title="3. Regular practice"
            description="Practice strategies until they feel natural."
            examples={[
              "Use varied audio types",
              "Build skills step by step",
              "Reflect on progress",
              "Refine what you use"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Which type of listening most improves comprehension?"
      options={[
        "Passive listening",
        "Active listening",
        "Fast listening",
        "Silent listening"
      ]}
      correctAnswer={1}
      explanation="Active listening involves mental engagement and usually boosts comprehension most."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What is the main difference between passive and active listening?"
      options={[
        "Speed of hearing",
        "Level of participation in the process",
        "Volume of the recording",
        "Length of the recording"
      ]}
      correctAnswer={1}
      explanation="The key difference is participation: active listening adds prediction, checking, and inference."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Prediction prepares your mind to process specific information.",
          isTrue: true,
          explanation: "Correct. Prediction from questions, context, or vocabulary aims your attention."
        },
        {
          text: "Continuous checking always harms comprehension.",
          isTrue: false,
          explanation: "Incorrect. Light, ongoing checking usually helps by catching errors early."
        },
        {
          text: "Inference helps with information that is not stated directly.",
          isTrue: true,
          explanation: "Correct. Contextual, logical, and cultural clues fill implied meaning."
        },
        {
          text: "Attention management is unimportant for active listening.",
          isTrue: false,
          explanation: "Incorrect. Managing focus is central to staying active and avoiding drift."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the main benefit of inference in listening?"
      options={[
        "Better pronunciation",
        "Understanding implied information",
        "Faster playback",
        "Needing less vocabulary"
      ]}
      correctAnswer={1}
      explanation="Inference mainly helps with meaning that is suggested rather than stated word for word."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which strategy matters most for long recordings?"
      options={[
        "Listening faster",
        "Attention and focus management",
        "Writing more notes",
        "Ignoring distractions without a plan"
      ]}
      correctAnswer={1}
      explanation="Managing attention—including fatigue and recovery—supports endurance on long input."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Taking notes while listening improves comprehension.",
          isTrue: true,
          explanation: "Correct. Notes can sustain focus and accuracy."
        },
        {
          text: "You must understand every word to be a good listener.",
          isTrue: false,
          explanation: "Incorrect. Good listeners track the message and use context and inference."
        },
        {
          text: "Predicting content before listening is useful.",
          isTrue: true,
          explanation: "Correct. Prediction activates prior knowledge and supports understanding."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="What should you do when you miss an important word?"
      options={[
        "Stop listening",
        "Use context to infer meaning",
        "Ask the recording a question",
        "Ignore the rest"
      ]}
      correctAnswer={1}
      explanation="Contextual inference keeps the flow going better than stopping."
    />,

    <MultipleChoiceExercise
      key="8"
      question="What is the main benefit of active listening?"
      options={[
        "Memorize all vocabulary",
        "Improve comprehension and retention",
        "Speak faster",
        "Avoid grammar mistakes"
      ]}
      correctAnswer={1}
      explanation="Active listening improves how much you grasp and remember by engaging mental processes."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Background knowledge helps with listening comprehension.",
          isTrue: true,
          explanation: "Correct. Topic knowledge supports prediction and understanding."
        },
        {
          text: "Exposure to different accents is unimportant for learning.",
          isTrue: false,
          explanation: "Incorrect. Varied accents build flexible real-world listening."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="What is the best way to build listening strategies?"
      options={[
        "Only music",
        "Regular practice with varied audio",
        "Only reading",
        "Avoid difficult audio"
      ]}
      correctAnswer={1}
      explanation="Regular practice across talk types (conversations, news, podcasts) builds flexible strategies."
    />
  ];

  return (
    <TheoryLayout
      title="Active Listening Strategies"
      description="Master active listening in English. Learn prediction, checking, inference, and attention strategies to improve comprehension."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic listening skills", "Understanding of listening process"]}
      estimatedTime="80 min"
    />
  );
};

export default ActiveListeningStrategiesPage;
