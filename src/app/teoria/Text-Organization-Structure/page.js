'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const TextOrganizationStructurePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What is Text Organization and Structure?" icon="🏗️">
        <p>
          <strong>Text Organization and Structure</strong> is how a text is arranged: 
          the logical order of ideas, paragraphing, use of connectors, and how the parts 
          combine into a clear, effective message.
        </p>
        
        <Example 
          title="Text organization example"
          content="A typical argument essay: 1) Introduction with thesis, 2) Body paragraph with supporting points, 3) Body paragraph with counterarguments, 4) Body paragraph refuting counterarguments, 5) Conclusion reinforcing the thesis."
          explanation="Each section has a role and follows an order that guides the reader."
        />
      </TheorySection>

      <TheorySection title="Common patterns" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Chronological / sequential"
            description="Organised by time or step order."
            examples={[
              "Biographies and historical accounts",
              "Step-by-step instructions",
              "Scientific or technical processes",
              "Stories and narratives"
            ]}
          />

          <Tip 
            title="2. Problem–solution"
            description="Present a problem, then answers."
            examples={[
              "Articles on social issues",
              "Business proposals",
              "Academic essays",
              "Technical reports"
            ]}
          />

          <Tip 
            title="3. Cause–effect"
            description="Explore causes and consequences."
            examples={[
              "Analysis of natural phenomena",
              "Sociological studies",
              "Economic analysis",
              "Scientific investigations"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Structural building blocks" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Effective introduction"
            description="Sets topic, context, and purpose."
            examples={[
              "Hook: question, statistic, striking quote",
              "Context: background the reader needs",
              "Thesis: main claim or purpose",
              "Preview: outline of what follows"
            ]}
          />

          <Rule 
            title="2. Coherent development"
            description="Paragraphs that build ideas logically."
            examples={[
              "Each paragraph has one clear main idea",
              "Supporting points back the main idea",
              "Smooth transitions between paragraphs",
              "Relevant evidence and examples"
            ]}
          />

          <Rule 
            title="3. Effective conclusion"
            description="Closes the text in a satisfying way."
            examples={[
              "Summary of main points",
              "Restatement of the thesis",
              "Implications or consequences",
              "Call to action or closing reflection"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Connectors and transitions" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Sequence connectors"
            description="Show time or logical order."
            examples={[
              "First: First, Initially, To begin with",
              "Continuation: Then, Next, Subsequently, Furthermore",
              "End: Finally, Lastly, In conclusion",
              "Same time: Meanwhile, At the same time, While"
            ]}
          />

          <Rule 
            title="2. Contrast connectors"
            description="Show difference or opposition."
            examples={[
              "Strong contrast: However, Nevertheless, On the contrary",
              "Softer contrast: Although, While, Whereas",
              "Concession: Despite, In spite of, Admittedly",
              "Alternative: Instead, Rather, Alternatively"
            ]}
          />

          <Rule 
            title="3. Cause–effect connectors"
            description="Show causal relations."
            examples={[
              "Cause: Because, Since, Due to, As a result of",
              "Effect: Therefore, Consequently, Thus, Hence",
              "Purpose: In order to, So that, With the aim of",
              "Condition: If, Unless, Provided that, In case"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="What is the main purpose of text organisation?"
      options={[
        "Make the text longer",
        "Create a clear, effective message",
        "Use complex vocabulary",
        "Impress the reader"
      ]}
      correctAnswer={1}
      explanation="Organisation guides the reader logically toward a coherent message."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which pattern fits best for explaining how to follow a recipe?"
      options={[
        "Problem–solution",
        "Cause–effect",
        "Chronological / sequential",
        "Comparison–contrast"
      ]}
      correctAnswer={2}
      explanation="Recipes follow steps in order, so a chronological / sequential pattern fits."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Each paragraph should have one clear main idea.",
          isTrue: true,
          explanation: "Correct. Each paragraph should focus on one central point that supports the whole."
        },
        {
          text: "Connectors are only used at paragraph openings.",
          isTrue: false,
          explanation: "Incorrect. Connectors appear within and between sentences for flow."
        },
        {
          text: "The introduction should state the text's purpose.",
          isTrue: true,
          explanation: "Correct. It orientates the reader about what to expect."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which transition best introduces a counterargument?"
      options={[
        "Furthermore",
        "However",
        "Therefore",
        "In addition"
      ]}
      correctAnswer={1}
      explanation="'However' signals contrast—ideal before an opposing point."
    />,

    <MultipleChoiceExercise
      key="5"
      question="In a problem–solution text, what typically follows stating the problem?"
      options={[
        "The conclusion",
        "More unrelated problems",
        "Causes of the problem or possible solutions",
        "A new introduction"
      ]}
      correctAnswer={2}
      explanation="After the problem, texts often explore causes or present solutions."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "A good paragraph may contain several unrelated main ideas.",
          isTrue: false,
          explanation: "Incorrect. One main idea per paragraph works best, with supporting detail."
        },
        {
          text: "The conclusion should introduce completely new ideas.",
          isTrue: false,
          explanation: "Incorrect. The conclusion should wrap up what was already discussed."
        },
        {
          text: "Connectors help readers follow logical flow.",
          isTrue: true,
          explanation: "Correct. They show how ideas relate."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which is NOT typical of a strong introduction?"
      options={[
        "A hook to gain attention",
        "Topic context",
        "Specific conclusion details",
        "Presentation of the thesis"
      ]}
      correctAnswer={2}
      explanation="Conclusion-level detail belongs at the end, not in the introduction."
    />,

    <MultipleChoiceExercise
      key="8"
      question="What does 'Meanwhile' do in a text?"
      options={[
        "Signal contrast",
        "Show cause–effect",
        "Show simultaneous events",
        "Open a conclusion"
      ]}
      correctAnswer={2}
      explanation="'Meanwhile' shows something happening at the same time as something else."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Cause–effect organisation helps analyse complex phenomena.",
          isTrue: true,
          explanation: "Correct. It explains why things happen and what follows."
        },
        {
          text: "Every text must follow the same organisational pattern.",
          isTrue: false,
          explanation: "Incorrect. Purpose and audience shape which pattern to use."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="What is the key to strong organisation?"
      options={[
        "Using many complex connectors",
        "Writing very long paragraphs",
        "Building a logical sequence for the reader",
        "Repeating the same idea in every paragraph"
      ]}
      correctAnswer={2}
      explanation="A clear, logical order carries the reader naturally to the main message."
    />
  ];

  return (
    <TheoryLayout
      title="Text Organization and Structure"
      description="Master how texts are built. Learn common patterns, structural parts, and effective connectors for coherent writing and reading."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced writing skills", "Understanding of text types", "Knowledge of connectors"]}
      estimatedTime="80 min"
    />
  );
};

export default TextOrganizationStructurePage;
