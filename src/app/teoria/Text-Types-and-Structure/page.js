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

const TextTypesAndStructurePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are Text Types and Structure?" icon="📝">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Text types</strong> and <strong>structure</strong> are essential for writing well in English. 
          Each type has its own structure, purpose, and conventions—you need them to communicate clearly.
        </p>
        
        <QuickReference items={[
          "Formal vs informal: tone and register",
          "Structure: introduction, body, conclusion",
          "Paragraphs: one main idea per paragraph",
          "Cohesion: linking words and transitions",
          "Purpose: inform, persuade, narrate, describe"
        ]} />
      </TheorySection>

      <TheorySection title="Main Text Types" icon="📚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Texts differ by purpose, features, and what readers expect.
        </p>

        <GrammarTable
          caption="Text Types and Their Features"
          headers={["Type", "Purpose", "Structure", "Example"]}
          rows={[
            ["Descriptive", "Describe people, places, objects", "Introduction + details + closing", "A description of a city"],
            ["Narrative", "Tell a story or sequence of events", "Beginning + middle + ending", "A holiday story"],
            ["Expository", "Explain or inform", "Thesis + supporting points + conclusion", "Essay about the environment"],
            ["Argumentative", "Persuade or convince", "Thesis + counterarguments + conclusion", "Opinion on technology"],
            ["Instructional", "Give directions or steps", "Goal + steps + result", "A recipe"],
            ["Correspondence", "Communicate with someone directly", "Greeting + body + closing", "Formal/informal email"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Description: \"My hometown is a beautiful place…\"" />
          <Example english="Narrative: \"Last summer I went to…\"" />
          <Example english="Argumentative: \"I believe technology is…\"" />
        </div>

        <Rule 
          title="Choosing a Text Type"
          description="Choose according to:"
          examples={[
            "The purpose of your writing",
            "Your target audience",
            "Whether the context is formal or informal",
            "Any specific assignment requirements"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Identify the text type before you start drafting.
        </Tip>
      </TheorySection>

      <TheorySection title="General Structure of Texts" icon="🏗️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Most English texts follow a basic three-part structure.
        </p>

        <GrammarTable
          caption="Three-part Structure"
          headers={["Part", "Role", "Content", "Length"]}
          rows={[
            ["Introduction", "Present the topic", "Thesis, background, aims", "About 10–15% of the text"],
            ["Body / development", "Develop your ideas", "Paragraphs with arguments or examples", "About 70–80%"],
            ["Conclusion", "Summarize and close", "Summary, final view, suggestion", "About 10–15%"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Introduction: \"In this essay I will analyse the benefits of technology…\"" />
          <Example english="Body: \"First, technology improves communication…\"" />
          <Example english="Conclusion: \"In conclusion, technology is beneficial…\"" />
        </div>

        <Rule 
          title="What Each Part Does"
          description="Each section has typical jobs:"
          examples={[
            "Introduction: engage the reader, present the topic",
            "Body: argue, illustrate, explain",
            "Conclusion: summarise, express a final viewpoint"
          ]}
        />

        <Tip type="success">
          <strong>Remember:</strong> Clear, logical structure makes reading easier for your audience.
        </Tip>
      </TheorySection>

      <TheorySection title="Paragraphs: Structure and Development" icon="📄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Paragraphs are the basic organising unit—each paragraph should develop one controlling idea.
        </p>

        <GrammarTable
          caption="Paragraph Structure"
          headers={["Part", "Role", "Example"]}
          rows={[
            ["Topic sentence", "Introduce the main idea", "Technology has revolutionized communication."],
            ["Supporting sentences", "Explain and expand the idea", "First, it allows instant messaging…"],
            ["Examples / evidence", "Illustrate the point", "For example, social media platforms…"],
            ["Closing sentence", "Round off the paragraph", "Therefore, communication is now faster."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english='Topic sentence: "Technology has revolutionized communication."' />
          <Example english='Development: "First of all, it allows instant messaging…"' />
          <Example english='Example: "For example, social media platforms…"' />
        </div>

        <Rule 
          title="Paragraph Rules"
          description="Every paragraph should:"
          examples={[
            "Express one central idea",
            "Stay coherent and linked together",
            "Be an appropriate length (often about 3–7 sentences)",
            "Connect to the paragraph before and after"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Do not mix unrelated ideas in the same paragraph.
        </Tip>
      </TheorySection>

      <TheorySection title="Formal vs Informal Register" icon="🎭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Register sets the tone—it should suit the situation and who will read your text.
        </p>

        <GrammarTable
          caption="Formal and Informal Register Compared"
          headers={["Feature", "Formal", "Informal"]}
          rows={[
            ["Vocabulary", "More precise or formal wording", "Simpler, everyday wording"],
            ["Contractions", "Avoid them (e.g. I will, do not)", "Often use them (I'll, don't)"],
            ["Sentence patterns", "Longer or more complex sentences", "Often shorter sentences"],
            ["Pronouns", "Sometimes limit direct I/you", "I and you are common"],
            ["Connectors", "However, moreover", "But, plus, too"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Formal: \"I would like to express my gratitude…\"" />
          <Example english="Informal: \"Thanks a lot for everything!\"" />
          <Example english="Formal: \"Furthermore, it is important to note…\"" />
          <Example english="Informal: \"Also, you should know…\"" />
        </div>

        <Rule 
          title="When to Use Each Register"
          description="Adapt to:"
          examples={[
            "Formal: academic essays, job letters, formal reports",
            "Informal: personal emails to friends, informal blogs, messages",
            "Context: workplace vs social setting",
            "Audience: for example supervisors vs peers"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Match register to context and readers throughout the text.
        </Tip>
      </TheorySection>

      <TheorySection title="Linkers and Transitions" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Linking words help readers follow your argument smoothly.
        </p>

        <GrammarTable
          caption="Common Linkers"
          headers={["Function", "Linkers", "Example"]}
          rows={[
            ["Adding ideas", "Furthermore, moreover, in addition", "Furthermore, technology improves education."],
            ["Contrast", "However, nevertheless, on the other hand", "However, there are disadvantages too."],
            ["Cause", "Because, due to, as a result of", "Because of technology, communication is faster."],
            ["Result", "Therefore, consequently, thus", "Therefore, we should use it wisely."],
            ["Sequence / time", "First, then, finally, meanwhile", "First, I will discuss the advantages."],
            ["Example", "For example, for instance, such as", "For example, smartphones are very useful."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english='Addition: "Furthermore, technology improves education."' />
          <Example english='Contrast: "However, there are some disadvantages."' />
          <Example english='Result: "Therefore, we should use technology thoughtfully."' />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Good linkers make your writing clearer and sound more polished.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Mixing several unrelated ideas in one paragraph ❌<br/>
            <strong>Better:</strong> One main idea per paragraph ✅<br/>
            <em>Each paragraph needs a clear focus</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> No links between paragraphs ❌<br/>
            <strong>Better:</strong> Use transitions where needed ✅<br/>
            <em>Transitions improve flow between ideas</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Wrong tone for the task ❌<br/>
            <strong>Better:</strong> Adapt register to situation ✅<br/>
            <em>Formal essays need formal language; chats with friends can be informal</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Weak overall structure ❌<br/>
            <strong>Better:</strong> Clear introduction, body, conclusion ✅<br/>
            <em>Structure helps readers follow your line of thought</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Principles" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Plan before you write"
            description="Spend time organising ideas before drafting."
            examples={[
              "Identify text type",
              "Define your readers",
              "Order your main points",
              "Decide overall structure"
            ]}
          />

          <Rule 
            title="2. One idea per paragraph"
            description="Each paragraph should unpack a single controlling idea."
            examples={[
              "Clear topic sentence",
              "Supporting explanation",
              "Examples or proof",
              "Short closing tie-back"
            ]}
          />

          <Rule 
            title="3. Cohesion and coherence"
            description="Readers should understand how ideas fit together."
            examples={[
              "Choose appropriate linkers",
              "Keep to one thread per paragraph",
              "Use a sensible order overall",
              "Smooth transitions between sections"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: '_____, technology has many benefits.'"
      options={[
        "But",
        "Furthermore",
        "Finally",
        "However"
      ]}
      correctAnswer={1}
      explanation="'Furthermore' adds supporting information related to benefits already introduced."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which structure describes a paragraph best?"
      options={[
        "Topic sentence + examples + concluding sentence tied to one idea",
        "Introduction + body + conclusion of the whole composition",
        "Topic sentence + supporting sentences + closing sentence",
        "Examples only, with no controlling sentence"
      ]}
      correctAnswer={2}
      explanation="A paragraph usually opens with the main idea, develops it, then wraps up within the same paragraph."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "In formal writing you can freely use contractions like 'I'll' and 'don't'.",
          isTrue: false,
          explanation: "Incorrect. Formal writing usually avoids contractions; prefer 'I will' and 'do not' unless quoting speech."
        },
        {
          text: "Each paragraph should mainly develop one controlling idea.",
          isTrue: true,
          explanation: "Correct—that keeps paragraphs clear and readable."
        },
        {
          text: "Words like 'however' and 'furthermore' help make a text smoother.",
          isTrue: true,
          explanation: "Correct—they signal relationships between ideas across sentences and paragraphs."
        },
        {
          text: "The introduction should normally be roughly 70% of the essay length.",
          isTrue: false,
          explanation: "Incorrect—the introduction is often about 10–15%; the bulk is the body paragraphs."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which register best fits a typical university essay?"
      options={[
        "Very informal tone with slang",
        "Formal style without contractions",
        "Mixed informally sentence by sentence with no warning",
        "Only very short slang sentences"
      ]}
      correctAnswer={1}
      explanation="Academic essays usually expect precise vocabulary and full forms instead of contractions."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What is the conclusion mainly for?"
      options={[
        "Introducing brand-new points not mentioned earlier",
        "Building the longest body section possible",
        "Summarising and closing your points",
        "Listing random examples unrelated to earlier claims"
      ]}
      correctAnswer={2}
      explanation="A conclusion gathers the thread of the discussion and closes—without dumping major new topics."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Narratives are often clearer when events follow chronological order.",
          isTrue: true,
          explanation: "Correct—it helps listeners or readers reconstruct the timeline."
        },
        {
          text: "Descriptive texts mainly explain mechanisms step-by-step.",
          isTrue: false,
          explanation: "Incorrect—that role fits procedural or explanatory texts better; descriptive writing highlights qualities."
        },
        {
          text: "A healthy paragraph sticks to one main idea.",
          isTrue: true,
          explanation: "Correct—it prevents rambling mixes of unrelated points."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which text type balances pros and cons of technology most naturally?"
      options={[
        "Pure narrative folklore only",
        "Argumentative exposition",
        "Short weather forecast",
        "Instruction manual for assembling furniture"
      ]}
      correctAnswer={1}
      explanation="Argumentative writing weighs evidence and viewpoints on opposing sides."
    />,

    <MultipleChoiceExercise
      key="8"
      question="In an essay, a conclusion primarily should _____."
      options={[
        "Launch fresh arguments never outlined before",
        "Summarise key points and provide closure",
        "Insert long raw data dumps",
        "Duplicate the introduction word-for-word automatically"
      ]}
      correctAnswer={1}
      explanation="The conclusion reinforces what was argued—without pretending to reopen the thesis from scratch."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Formal English usually avoids contractions like 'don't'.",
          isTrue: true,
          explanation: "Correct—you expand to 'do not' or 'cannot' unless context allows contractions."
        },
        {
          text: "The introduction ought to swallow half your total word budget.",
          isTrue: false,
          explanation: "Incorrect—you normally invest most words in developmental paragraphs supporting the thesis."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Which overall structure suits expository texts well?"
      options={[
        "Problem → stray poem verse",
        "Introduction → Body → Conclusion",
        "Bullet list disconnected from headings",
        "Only comparison adjectives stacked without thesis"
      ]}
      correctAnswer={1}
      explanation="A three-move arc flexibly accommodates explanation: set context, elaborate, summarise."
    />
  ];

  return (
    <TheoryLayout
      title="Text Types and Structure"
      description="Understand text types and structure in English. Organise paragraphs, manage register, link ideas smoothly, and build texts readers can follow."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic grammar", "Understanding of sentence structure"]}
      estimatedTime="60 min"
    />
  );
};

export default TextTypesAndStructurePage;