'use client';
import { buildSkimmingScanningTechniquesExercises } from './skimmingScanningTechniquesExercises';
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


const SkimmingScanningPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What are Skimming and Scanning?" icon="👀">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Skimming</strong> and <strong>Scanning</strong> are two essential fast-reading techniques for 
          English exams. They help you find specific information and understand main ideas 
          without reading every word.
        </p>
        
        <QuickReference items={[
          "Skimming: fast read for general idea",
          "Scanning: search for specific information",
          "Both save valuable time",
          "Essential for timed exams",
          "They work alongside detailed reading"
        ]} />
      </TheorySection>

      <TheorySection title="Skimming — reading for the main idea" icon="🌊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Skimming helps you get a general sense of a text in a short time.
        </p>

        <Rule 
          title="How to skim effectively"
          description="Follow these steps for efficient fast reading:"
          examples={[
            "Read the title and subheadings",
            "Read the first and last sentence of each paragraph",
            "Look for key words and highlighted phrases",
            "Ignore specific detail and examples",
            "Focus on connectors and transition words"
          ]}
        />

        <GrammarTable
          caption="Key elements for skimming"
          headers={["Element", "Why it matters", "Example"]}
          rows={[
            ["Title", "Summarises the main topic", "'Climate Change Effects'"],
            ["First sentence", "Introduces the paragraph idea", "'Recent studies show that...'"],
            ["Last sentence", "Concludes or links ideas", "'This leads us to consider...'"],
            ["Key words", "Signal important themes", "'however, therefore, importantly'"],
            ["Numbers and dates", "Relevant concrete data", "'In 2020, 75% of...'"]
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Practise skimming with online newspapers. Read only titles and opening sentences 
          to catch the main stories in five minutes.
        </Tip>
      </TheorySection>

      <TheorySection title="Scanning — searching for specifics" icon="🔍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Scanning lets you find specific information quickly—names, dates, numbers, or keywords.
        </p>

        <Rule 
          title="Effective scanning"
          description="Steps to locate specific information:"
          examples={[
            "Identify exactly what you need",
            "Move your eyes quickly over the text",
            "Look for keywords or synonyms",
            "Stop only when you find the target",
            "Read the immediate context to confirm"
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Pregunta: ¿Cuándo fue fundada la empresa?"
            english="Scanning target: dates, numbers, 'founded', 'established', 'created'"
          />
          
          <Example 
            spanish="Pregunta: ¿Quién es el director de marketing?"
            english="Scanning target: names, titles, 'director', 'manager', 'marketing'"
          />
        </div>

        <Tip type="info">
          <strong>Remember:</strong> In scanning you do not need to understand the whole text—only the specific fact you need.
        </Tip>
      </TheorySection>

      <TheorySection title="Key differences" icon="⚖️">
        <GrammarTable
          caption="Skimming vs scanning"
          headers={["Aspect", "Skimming", "Scanning"]}
          rows={[
            ["Goal", "General idea of the text", "Specific information"],
            ["Speed", "Fast but broad", "Very fast and selective"],
            ["Focus", "Structure and main themes", "Concrete data"],
            ["Eye movement", "Linear, skipping detail", "Irregular, hunting targets"],
            ["Outcome", "Overall understanding", "Specific facts found"],
            ["When to use", "First pass through a text", "Answering detail questions"]
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Do not mix them up. Skimming is for the big picture; 
          scanning is for specific details.
        </Tip>
      </TheorySection>

      <TheorySection title="Using them in exams" icon="📝">
        <Rule 
          title="A three-step exam strategy"
          description="Combine both techniques for maximum efficiency:"
          examples={[
            "1. SKIMMING: read the whole text quickly (2–3 minutes)",
            "2. READ the questions and decide what to find",
            "3. SCANNING: hunt for specific answers in the text"
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Paso 1: Skimming del artículo sobre energía renovable"
            english="Result: 'The article discusses solar and wind energy benefits and challenges'"
          />
          
          <Example 
            spanish="Paso 2: Pregunta - '¿Qué porcentaje de energía solar se usa en España?'"
            english="Scanning target: 'Spain', 'Spanish', percentages, numbers, 'solar'"
          />
        </div>

        <Tip type="success">
          <strong>Time tip:</strong> Spend no more than about three minutes on the first skim. It saves time later when you scan with purpose.
        </Tip>
      </TheorySection>

      <TheorySection title="Important signal words" icon="🚦">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Certain words help you move through texts quickly.
        </p>

        <GrammarTable
          caption="Signal words by function"
          headers={["Function", "Key words", "What they show"]}
          rows={[
            ["Contrast", "however, but, although, despite", "A turn in the argument"],
            ["Cause-effect", "because, therefore, as a result", "Causal relations"],
            ["Sequence", "first, then, finally, meanwhile", "Time or logical order"],
            ["Emphasis", "importantly, significantly, notably", "Key information"],
            ["Examples", "for instance, such as, including", "Supporting detail"],
            ["Conclusion", "in conclusion, overall, to summarize", "Final ideas"]
          ]}
        />

        <Tip type="info">
          <strong>Practice:</strong> When you skim, pay special attention to signal words. 
          They guide you to the most important information.
        </Tip>
      </TheorySection>

      <TheorySection title="Common mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Reading every word while skimming<br/>
            <strong>Fix:</strong> Train your eye to skip and catch only essentials
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Scanning without knowing your target<br/>
            <strong>Fix:</strong> Read the question first and note keywords
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Stopping on unknown words<br/>
            <strong>Fix:</strong> Keep going—context will often help
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Not practising these techniques regularly<br/>
            <strong>Fix:</strong> Practise daily with news articles
          </Tip>
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Skimming and Scanning Techniques"
      description="Master essential speed-reading techniques for exams. Learn when and how to use skimming and scanning to work efficiently."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildSkimmingScanningTechniquesExercises}
      prerequisites={["Basic reading vocabulary", "Understanding of text structure"]}
      estimatedTime="45 min"
    />
  );
};

export default SkimmingScanningPage;
