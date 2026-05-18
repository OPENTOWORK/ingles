'use client';
import { buildTextOrganizationStructureExercises } from './textOrganizationStructureExercises';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';


const TextOrganizationStructurePage = () => {
  const theoryContent = (
    <>
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
    </>
  );

    return (
    <TheoryLayout
      title="Text Organization and Structure"
      description="Master how texts are built. Learn common patterns, structural parts, and effective connectors for coherent writing and reading."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildTextOrganizationStructureExercises}
      prerequisites={["Advanced writing skills", "Understanding of text types", "Knowledge of connectors"]}
      estimatedTime="80 min"
    />
  );
};

export default TextOrganizationStructurePage;
