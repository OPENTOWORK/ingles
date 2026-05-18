'use client';
import { buildInferenceAndImplicationExercises } from './inferenceAndImplicationExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const InferenceAndImplicationPage = () => {
  const theoryContent = (
    <>
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
    </>
  );

    return (
    <TheoryLayout
      title="Inference and Implication"
      description="Master reading between the lines. Learn to draw justified inferences and spot implications from textual evidence and context."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildInferenceAndImplicationExercises}
      prerequisites={["Advanced reading comprehension", "Critical thinking skills", "Cultural awareness"]}
      estimatedTime="80 min"
    />
  );
};

export default InferenceAndImplicationPage;
