'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const InferenceAndImplicationPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What are Inference and Implication?" icon="🔍">
        <p>
          <strong>Inference</strong> is understanding information that is not directly stated. 
          <strong>Implication</strong> is what the author suggests without saying it outright. 
          Together they mean "reading between the lines" to catch unstated meaning.
        </p>
        
        <Example 
          title="Inference and implication example"
          content="Text: 'Sarah looked at her watch for the third time and tapped her foot impatiently.' 
          Inference: Sarah is waiting for someone who is late.
          Implication: The author suggests Sarah is frustrated or anxious."
          explanation="The text never says she is waiting or upset, but you can infer it from the actions."
        />
      </TheorySection>

      <TheorySection title="Types of inference" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Inferences about emotions and attitudes"
            description="Work out how characters or the author feel."
            examples={[
              "Actions that signal mood: 'slammed the door' suggests anger",
              "Word choice: 'magnificent' vs 'adequate' shows different attitudes",
              "Described body language: 'crossed arms' suggests defensiveness",
              "Implicit tone: sarcasm, irony, enthusiasm"
            ]}
          />

          <Tip 
            title="2. Inferences about relationships"
            description="Deduce links between people, events, or ideas."
            examples={[
              "Family ties not spelled out",
              "Professional or social hierarchy",
              "Implied cause and effect",
              "Suggested time order"
            ]}
          />

          <Tip 
            title="3. Inferences about setting"
            description="Deduce time, place, or situation."
            examples={[
              "Historical period from context clues",
              "Location from descriptions",
              "Social class from lifestyle details",
              "Job from specialised vocabulary"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="How to infer well" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Study word choice"
            description="Specific words reveal attitude."
            examples={[
              "Positive vs negative words: 'determined' vs 'stubborn'",
              "Formality level: can show relationships between people",
              "Intensity: 'whispered' vs 'shouted' signals emotion",
              "Connotation: 'home' vs 'house' carries different feeling"
            ]}
          />

          <Rule 
            title="2. Notice what is NOT said"
            description="Sometimes omissions matter most."
            examples={[
              "Information deliberately left out",
              "Questions left hanging",
              "Details downplayed or avoided",
              "Meaningful silence in dialogue"
            ]}
          />

          <Rule 
            title="3. Join scattered clues"
            description="Combine information from different places."
            examples={[
              "Details in separate paragraphs",
              "Repeated patterns of behaviour",
              "Gaps between words and actions",
              "Gradual shifts in tone or stance"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Important rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Ground inferences in evidence"
            description="Conclusions must be supported by the text."
            examples={[
              "What exact evidence backs your inference?",
              "Do several clues point the same way?",
              "Is your inference consistent with the rest?",
              "Are you importing your own ideas?"
            ]}
          />

          <Rule 
            title="2. Consider cultural and social context"
            description="Implications may depend on background norms."
            examples={[
              "Social norms of the period described",
              "Relevant cultural conventions",
              "Expectations about gender, class, or age",
              "Implicit rules of behaviour"
            ]}
          />

          <Rule 
            title="3. Tell inference from speculation"
            description="Valid inferences rest on textual evidence."
            examples={[
              "Valid inference: clearly supported by clues",
              "Speculation: goes beyond what the text implies",
              "Would another reasonable reader agree?",
              "Is your reading the most likely from the evidence?"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="What is an inference in reading?"
      options={[
        "Information stated directly",
        "Information you work out though it is not directly stated",
        "The title of the text",
        "Words you do not know"
      ]}
      correctAnswer={1}
      explanation="Inference is what you conclude from clues without direct statement."
    />,

    <MultipleChoiceExercise
      key="2"
      question="If a text says 'John slammed the door and stormed out', what can you infer?"
      options={[
        "John is happy",
        "John is angry or upset",
        "John is in a hurry to get somewhere",
        "John does not know how to close doors gently"
      ]}
      correctAnswer={1}
      explanation="'Slammed' and 'stormed out' suggest anger or strong frustration without naming it."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Inferences should be based on evidence from the text.",
          isTrue: true,
          explanation: "Correct. Sound inferences need support from specific clues."
        },
        {
          text: "You may infer anything that comes to mind.",
          isTrue: false,
          explanation: "Incorrect. Inferences must be justified by the text, not free speculation."
        },
        {
          text: "The author's word choice can reveal unstated attitudes.",
          isTrue: true,
          explanation: "Correct. Word choice often signals views that are never stated outright."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the difference between 'He's determined' and 'He's stubborn'?"
      options={[
        "No difference—they mean the same",
        "'Determined' is more positive; 'stubborn' more negative",
        "'Stubborn' is more formal",
        "They differ only in pronunciation"
      ]}
      correctAnswer={1}
      explanation="'Determined' is positive (persistent); 'stubborn' is negative (unreasonably inflexible)."
    />,

    <MultipleChoiceExercise
      key="5"
      question="If a character 'whispers' instead of 'speaks', what might you infer?"
      options={[
        "They have voice problems",
        "The situation needs secrecy or discretion",
        "They cannot speak loudly",
        "They are reading aloud"
      ]}
      correctAnswer={1}
      explanation="'Whisper' suggests secrecy, confidentiality, or not wanting to be overheard."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Sometimes what the author does NOT say matters as much as what they do.",
          isTrue: true,
          explanation: "Correct. Deliberate gaps and silence can be highly meaningful."
        },
        {
          text: "You can only infer emotions if the text names them.",
          isTrue: false,
          explanation: "Incorrect. You infer emotion from actions, dialogue, body language, and wording."
        },
        {
          text: "Cultural context can change how you read implications.",
          isTrue: true,
          explanation: "Correct. Cultural norms shape how we interpret behaviour."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which strategy best supports valid inferences?"
      options={[
        "Imagination alone",
        "Combining several clues from the text",
        "Personal experience only",
        "Ignoring small details"
      ]}
      correctAnswer={1}
      explanation="Several supporting clues from the text make an inference stronger."
    />,

    <MultipleChoiceExercise
      key="8"
      question="If a text describes a house with 'peeling paint, broken windows, and overgrown garden', what can you infer?"
      options={[
        "It is a new house",
        "It is neglected or poorly maintained",
        "It is very expensive",
        "It is well maintained"
      ]}
      correctAnswer={1}
      explanation="Those details suggest neglect or lack of upkeep."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "A sound inference is one another reasonable reader could make from the same evidence.",
          isTrue: true,
          explanation: "Correct. Valid inferences should be reasonable and evidence-based."
        },
        {
          text: "You must infer something about every detail.",
          isTrue: false,
          explanation: "Incorrect. Infer only when there is enough evidence and it matters for understanding."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="What separates valid inference from speculation?"
      options={[
        "How long your conclusion is",
        "How much textual evidence supports it",
        "Whether you like the conclusion",
        "Whether others agree with you"
      ]}
      correctAnswer={1}
      explanation="Strong textual support marks inference; speculation goes beyond what the text implies."
    />
  ];

  return (
    <TheoryLayout
      title="Inference and Implication"
      description="Master reading between the lines. Learn to draw justified inferences and spot implications from textual evidence and context."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced reading comprehension", "Critical thinking skills", "Cultural awareness"]}
      estimatedTime="80 min"
    />
  );
};

export default InferenceAndImplicationPage;
