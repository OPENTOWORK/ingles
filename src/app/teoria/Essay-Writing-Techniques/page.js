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

const EssayWritingPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="Essay Writing Techniques" icon="✍️">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          In Cambridge main-suite exams (B2 First, C1 Advanced, C2 Proficiency), the <strong>essay</strong> 
          is a required task in the Writing paper. You write 140–190 words (B2), 220–260 words (C1), 
          or 280–320 words (C2) in response to a set question, showing argument skills and an academic style.
        </p>
        
        <QuickReference items={[
          "Clear structure: introduction, development, conclusion",
          "Strong, specific thesis statement",
          "Body paragraphs with clear topic sentences",
          "Supporting evidence and examples",
          "Connectors for cohesion and flow"
        ]} />
      </TheorySection>

      <TheorySection title="Essay Structure" icon="🏗️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          A well-structured essay follows a logical pattern that guides the reader through your argument.
        </p>

        <GrammarTable
          caption="Basic Essay Structure"
          headers={["Section", "Purpose", "Typical content", "Length"]}
          rows={[
            ["Introduction", "Present topic and thesis", "Hook, context, thesis statement", "10–15% of the essay"],
            ["Body", "Argue and support", "Topic sentences, evidence, analysis", "70–80% of the essay"],
            ["Conclusion", "Summarise and close", "Summary, implications, final reflection", "10–15% of the essay"]
          ]}
        />

        <Rule 
          title="Elements of an effective introduction"
          description="Include these components:"
          examples={[
            "Hook: question, statistic, or quote that grabs attention",
            "Context: background the reader needs",
            "Thesis statement: your main, specific claim",
            "Preview: brief mention of main points (optional)"
          ]}
        />

        <Example 
          english="In an era where digital devices dominate daily life, the integration of technology in classrooms has become inevitable. While some educators argue that traditional methods remain superior, evidence suggests that when properly implemented, educational technology significantly enhances student engagement and learning outcomes."
          note="Hook (digital era) → context (debate) → thesis (technology can improve learning when used well)"
        />
      </TheorySection>

      <TheorySection title="An Effective Thesis Statement" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The thesis statement is the heart of your essay. It should be specific, arguable, and clear.
        </p>

        <GrammarTable
          caption="Features of a Strong Thesis Statement"
          headers={["Feature", "Description", "Weak example", "Strong example"]}
          rows={[
            ["Specific", "Avoid vague generalisations", "Social media is bad", "Social media addiction among teenagers leads to weaker face-to-face communication skills"],
            ["Arguable", "Allows debate", "London is in England", "London's congestion charge has effectively reduced traffic while improving air quality"],
            ["Clear", "Easy to understand", "Education has many aspects", "Standardised testing undermines creativity and critical thinking in primary education"],
            ["Focused", "One main claim", "Many things affect climate", "Deforestation in the Amazon is the primary driver of regional climate change"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Weak thesis: 'Video games are popular.'"
            note="Not really arguable—it reports a fact."
          />
          
          <Example 
            english="Strong thesis: 'Educational video games improve problem-solving skills in children aged 8–12.'"
            note="Specific, debatable, and testable."
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Draft your thesis after planning. Once you know your evidence, your main claim will be clearer.
        </Tip>
      </TheorySection>

      <TheorySection title="Body Paragraphs" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Each body paragraph should follow PEEL: Point, Evidence, Explanation, Link.
        </p>

        <Rule 
          title="PEEL paragraph structure"
          description="Organise each paragraph like this:"
          examples={[
            "Point: topic sentence stating the main idea",
            "Evidence: facts, examples, or quotes that support the point",
            "Explanation: show how the evidence supports your argument",
            "Link: tie back to the thesis or transition to the next paragraph"
          ]}
        />

        <Example 
          english="[Point] Regular physical exercise significantly improves mental health outcomes. [Evidence] A 2019 study by Harvard Medical School found that individuals who exercised for 30 minutes daily showed 25% lower rates of depression and anxiety. [Explanation] This improvement occurs because exercise releases endorphins and reduces cortisol levels, creating natural mood stabilisation. [Link] This evidence supports the wider claim that lifestyle changes can be as effective as medication for some mental health issues."
          note="Clear move: point → evidence → explanation → link."
        />

        <Tip type="info">
          <strong>Length:</strong> Aim for roughly 100–150 words per body paragraph. Shorter can feel thin; longer can lose focus.
        </Tip>
      </TheorySection>

      <TheorySection title="Connectors and Cohesion" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Connectors improve flow and show logical relationships between ideas.
        </p>

        <GrammarTable
          caption="Connectors by Function"
          headers={["Function", "Connectors", "Example in context"]}
          rows={[
            ["Adding information", "Furthermore, Moreover, Additionally, In addition", "Furthermore, recent studies confirm this trend"],
            ["Contrasting", "However, Nevertheless, On the other hand, Conversely", "However, critics argue the opposite"],
            ["Cause and effect", "Therefore, Consequently, As a result, Thus", "Therefore, immediate action is necessary"],
            ["Giving examples", "For instance, For example, Namely, Such as", "For instance, countries like Denmark have..."],
            ["Sequencing", "Firstly, Subsequently, Finally, Meanwhile", "Firstly, we must consider the economic impact"],
            ["Emphasising", "Indeed, Certainly, Undoubtedly, Clearly", "Indeed, the evidence is overwhelming"]
          ]}
        />

        <Tip type="warning">
          <strong>Watch out:</strong> Do not overuse connectors. Use them when they genuinely improve clarity and flow.
        </Tip>
      </TheorySection>

      <TheorySection title="Types of Essays" icon="📚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Different essay types call for different approaches and structures.
        </p>

        <GrammarTable
          caption="Common Essay Types"
          headers={["Type", "Purpose", "Typical structure", "Sample thesis"]}
          rows={[
            ["Argumentative", "Persuade with evidence", "Introduction, support, refutation, conclusion", "Renewable energy is more cost-effective than fossil fuels"],
            ["Comparative", "Analyse similarities and differences", "Introduction, point-by-point or block", "Online learning offers greater flexibility than traditional education"],
            ["Cause and effect", "Explain causal links", "Introduction, causes, effects, conclusion", "Social media has fundamentally changed interpersonal relationships"],
            ["Problem–solution", "Identify and address problems", "Problem, causes, solutions, evaluation", "Urban pollution requires immediate government intervention"],
            ["Descriptive / expository", "Explain or inform", "Introduction, main aspects, conclusion", "Artificial intelligence is transforming modern healthcare"]
          ]}
        />

        <Tip type="success">
          <strong>Adaptation:</strong> Adjust your approach to the task. Argumentative essays need strong evidence; expository essays need clear explanation.
        </Tip>
      </TheorySection>

      <TheorySection title="Academic Style" icon="🎓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Academic style requires formality, objectivity, and precision.
        </p>

        <GrammarTable
          caption="Features of Academic Style"
          headers={["Aspect", "Avoid", "Prefer"]}
          rows={[
            ["Contractions", "don't, can't, won't", "do not, cannot, will not"],
            ["Informal words", "stuff, things, lots of", "matters, issues, numerous"],
            ["Heavy first person", "I think, I believe (sometimes)", "It can be argued, Evidence suggests"],
            ["Over-emotional", "amazing, terrible, awful", "significant, problematic, concerning"],
            ["Absolutes", "always, never, all", "generally, rarely, most"],
            ["Rhetorical questions", "Why should we care?", "This raises important questions"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Informal: 'I think social media is really bad for kids because it's super addictive.'"
            note="Formal rewrite: 'Research indicates that social media platforms may negatively affect adolescent development because of potentially addictive design features.'"
          />
        </div>

        <Tip type="info">
          <strong>Passive voice:</strong> Use it in moderation for objectivity, e.g. “Studies have been conducted” rather than “We conducted studies”.
        </Tip>
      </TheorySection>

      <TheorySection title="Effective Conclusions" icon="🏁">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          A good conclusion summarises without simply repeating and leaves a strong final impression.
        </p>

        <Rule 
          title="Elements of a strong conclusion"
          description="Include:"
          examples={[
            "Restatement: rephrase your thesis in new words",
            "Summary: brief recap of main points",
            "Implication: why it matters in a wider context",
            "Call to action or closing reflection (optional)"
          ]}
        />

        <Example 
          english="While online education presents challenges, the evidence shows its potential to widen access and offer flexible, personalised learning. As technology evolves, institutions must adapt to capture these benefits while addressing limitations. The future lies not in choosing between traditional and digital methods but in hybrid models that combine the best of both."
          note="Restates position → sums up → looks ahead."
        />

        <Tip type="warning">
          <strong>Avoid:</strong> Brand-new arguments in the conclusion. Close the discussion, do not open a new one.
        </Tip>
      </TheorySection>
      <TheorySection title="Exam essay task types" icon="📚">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Opinion essay (common at B2/C1)"
            description="State and justify your view on a topic."
            examples={[
              "Typical prompt: 'Some people think... Do you agree?'",
              "Structure: introduction + two body paragraphs + conclusion",
              "Useful phrases: In my opinion, I believe, From my perspective",
              "Support your view with general or personal examples"
            ]}
          />

          <Rule 
            title="2. For and against essay (B2/C1/C2)"
            description="Present arguments on both sides."
            examples={[
              "Typical prompt: 'Discuss the advantages and disadvantages of...'",
              "Structure: intro + paragraph for + paragraph against + conclusion",
              "Useful phrases: On the one hand / On the other hand, However, Nevertheless",
              "Keep a balance between the two sides"
            ]}
          />

          <Rule 
            title="3. Discursive essay (C1/C2)"
            description="Analyse different angles of a complex topic."
            examples={[
              "Typical prompt: 'Evaluate the impact of... on modern society'",
              "More flexible structure, deeper analysis",
              "Useful phrases: Furthermore, Moreover, In addition, Consequently",
              "Requires critical analysis and a mature tone"
            ]}
          />

          <Rule 
            title="Writing assessment criteria"
            description="How official exams typically mark writing."
            examples={[
              "Content: relevance and development of ideas (25%)",
              "Communicative achievement: task purpose and audience (25%)",
              "Organisation: structure and cohesion (25%)",
              "Language: grammar, vocabulary, accuracy (25%)"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Which of the following is the strongest thesis statement?"
      options={[
        "Social media is popular among young people.",
        "Social media has both positive and negative effects.",
        "Social media platforms exploit user data to maximise advertising revenue at the expense of user privacy.",
        "Many people use social media every day."
      ]}
      correctAnswer={2}
      explanation="This option is specific, arguable, and can be defended with evidence."
    />,

    <MultipleChoiceExercise
      key="2"
      question="In the PEEL structure, what does the 'E' in 'Evidence' refer to?"
      options={[
        "Examples only",
        "Emotional appeals",
        "Facts, data, examples, or quotes that support your point",
        "Explanations of your personal opinion"
      ]}
      correctAnswer={2}
      explanation="Evidence includes any factual support: data, statistics, examples, expert views, etc."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Academic writing should avoid contractions like 'don't' and 'can't'.",
          isTrue: true,
          explanation: "Correct. Full forms such as “do not” and “cannot” suit academic style."
        },
        {
          text: "It's acceptable to introduce completely new ideas in the conclusion.",
          isTrue: false,
          explanation: "Incorrect. The conclusion should close the argument, not start a new one."
        },
        {
          text: "Each body paragraph should focus on one main point.",
          isTrue: true,
          explanation: "Correct. One clear topic sentence per paragraph."
        },
        {
          text: "Using first person (I, my, me) is always inappropriate in academic essays.",
          isTrue: false,
          explanation: "Incorrect. Some tasks allow a measured use of first person (e.g. reflective writing)."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which connector introduces a contrasting idea: '_____, some educators argue that traditional methods remain superior.'"
      options={[
        "Furthermore",
        "However",
        "Therefore",
        "Moreover"
      ]}
      correctAnswer={1}
      explanation="“However” signals contrast with the previous sentence."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which connector would be most appropriate to introduce a contrasting viewpoint?"
      options={[
        "Furthermore",
        "Consequently", 
        "Nevertheless",
        "In addition"
      ]}
      correctAnswer={2}
      explanation="“Nevertheless” concedes a point but presents a contrasting view."
    />,

    <MultipleChoiceExercise
      key="6"
      question="What is the main purpose of a topic sentence?"
      options={[
        "To conclude the paragraph",
        "To introduce the main idea of the paragraph",
        "To provide evidence",
        "To connect to the next paragraph"
      ]}
      correctAnswer={1}
      explanation="The topic sentence introduces the paragraph's main idea."
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which is the most formal way to express opinion?"
      options={[
        "I think that...",
        "In my opinion...",
        "It can be argued that...",
        "I believe that..."
      ]}
      correctAnswer={2}
      explanation="“It can be argued that...” is relatively objective and formal."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which sequencing word comes first: '_____, the introduction should capture the reader's attention.'"
      options={[
        "Finally",
        "Secondly",
        "Firstly",
        "Moreover"
      ]}
      correctAnswer={2}
      explanation="“Firstly” introduces the first point in a sequence."
    />,

    <MultipleChoiceExercise
      key="9"
      question="What should you avoid in academic writing?"
      options={[
        "Complex sentences",
        "Contractions and informal language",
        "Evidence and examples",
        "Clear thesis statements"
      ]}
      correctAnswer={1}
      explanation="Contractions and informal wording are usually avoided in academic writing."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Which best describes the PEEL structure?"
      options={[
        "Point, Evidence, Explanation, Link",
        "Problem, Example, Evaluation, Logic",
        "Purpose, Evidence, Emphasis, Length",
        "Plan, Execute, Evaluate, Learn"
      ]}
      correctAnswer={0}
      explanation="PEEL stands for Point, Evidence, Explanation, Link—a strong model for body paragraphs."
    />
  ];

  return (
    <TheoryLayout
      title="Essay Writing Techniques"
      description="Master essential techniques for effective academic essays: structure, argumentation, formal style, and cohesion."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Intermediate–advanced grammar", "Academic vocabulary", "Basic connectors"]}
      estimatedTime="70 min"
    />
  );
};

export default EssayWritingPage;
