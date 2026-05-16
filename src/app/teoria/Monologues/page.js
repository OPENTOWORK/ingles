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

const MonologuesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are Monologues?" icon="🎤">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Monologues</strong> are single-speaker talks that appear often in listening exams. They are longer than dialogues and need different comprehension strategies.
        </p>
        
        <QuickReference items={[
          "Duration: 2–5 minutes",
          "One speaker only",
          "Contexts: presentations, lectures, narratives",
          "Goal: detailed, specific information",
          "Level: A2–B1 (elementary to intermediate)"
        ]} />
      </TheorySection>

      <TheorySection title="Features of Monologues" icon="📋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Monologues have specific features that set them apart from other listening tasks.
        </p>

        <GrammarTable
          caption="Features of Monologues"
          headers={["Feature", "Description", "Benefit", "Example"]}
          rows={[
            ["Long duration", "2–5 continuous minutes", "Rich detail", "Full presentation"],
            ["Single voice", "Only one speaker", "Single point of view", "Lecture or talk"],
            ["Clear structure", "Introduction, body, conclusion", "Easier to follow", "Structured presentation"],
            ["Specific vocabulary", "Topic terms", "Vocabulary building", "Technical terms"],
            ["Specific purpose", "Information on one topic", "Deeper understanding", "Detailed explanation"],
            ["Moderate pace", "Clear, measured speech", "Time to process", "Presentation rhythm"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Context: Presentation about technology"
          />
          <Example 
            english="Duration: 4 minutes"
          />
          <Example 
            english="Objective: Explain the benefits of technology"
          />
        </div>

        <Rule 
          title="Why Monologues Help Learning"
          description="Why they are useful for learning:"
          examples={[
            "They give detailed information on one topic",
            "You hear topic-specific vocabulary in context",
            "They build extended listening stamina",
            "They improve understanding of presentation structure"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Monologues are excellent for building listening endurance and topic vocabulary.
        </Tip>
      </TheorySection>

      <TheorySection title="Types of Monologues" icon="🗂️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Monologues vary by purpose and context.
        </p>

        <GrammarTable
          caption="Types of Monologues"
          headers={["Type", "Context", "Structure", "Key Information"]}
          rows={[
            ["Presentation", "Lecture, talk", "Introduction, main points, conclusion", "Ideas, arguments, conclusions"],
            ["Narrative", "Story, personal experience", "Beginning, middle, end", "Events, people, places, time"],
            ["Explanation", "Instructions, process", "Problem, solution, steps", "Steps, procedures, results"],
            ["Description", "Place, person, object", "Features, details", "Appearance, traits, location"],
            ["Opinion", "Analysis, evaluation", "Thesis, arguments, conclusion", "Opinions, reasons, examples"],
            ["Information", "News, report", "Facts, data, analysis", "Data, statistics, conclusions"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Presentation: 'The benefits of technology in education'"
          />
          <Example 
            english="Narration: 'My experience studying abroad'"
          />
          <Example 
            english="Explanation: 'How the public transport system works'"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Identify the monologue type so you know what information to listen for.
        </Tip>
      </TheorySection>

      <TheorySection title="Strategies for Monologues" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Monologues need specific strategies because of their length and complexity.
        </p>

        <GrammarTable
          caption="Strategies for Monologues"
          headers={["Strategy", "Description", "When to Use", "Benefit"]}
          rows={[
            ["Extended pre-reading", "Read every question carefully", "Before the audio", "Know what to listen for"],
            ["Advanced prediction", "Predict content from the questions", "Before the audio", "Prime your attention"],
            ["Active listening", "Focus on specific information", "During the audio", "Catch important details"],
            ["Note-taking", "Write down key information", "During the audio", "Retain information"],
            ["Track structure", "Spot introduction, body, conclusion", "During the audio", "Stay oriented"],
            ["Full verification", "Check answers afterward", "After the audio", "Improve accuracy"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Pre-reading: 'Read all questions to spot topics'"
          />
          <Example 
            english="Prediction: 'From the questions, predict content'"
          />
          <Example 
            english="Note-taking: 'Jot dates, names, important numbers'"
          />
        </div>

        <Rule 
          title="Step-by-Step Process"
          description="Follow this process for monologues:"
          examples={[
            "1. Read every question carefully",
            "2. Predict what the monologue will cover",
            "3. Listen to the introduction to confirm the topic",
            "4. Take notes during the main section",
            "5. Listen closely to the conclusion",
            "6. Check all your answers"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Do not get lost in minor details—stay focused on the information you need.
        </Tip>
      </TheorySection>

      <TheorySection title="Structure of Monologues" icon="🏗️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Knowing the typical structure helps you follow the content more effectively.
        </p>

        <GrammarTable
          caption="Typical Monologue Structure"
          headers={["Part", "Function", "Content", "Duration"]}
          rows={[
            ["Introduction", "Introduce the topic", "Title, aim, overview", "10–15% of total"],
            ["Body", "Develop the content", "Main points, examples, details", "70–80% of total"],
            ["Conclusion", "Summarize and close", "Summary, final view, recommendation", "10–15% of total"],
            ["Transitions", "Link ideas", "Connectors, linking phrases", "Throughout"],
            ["Pauses", "Allow processing", "Silence, rhythm changes", "Strategically placed"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Introduction: 'Today I'm going to talk about the benefits of technology'"
          />
          <Example 
            english="Body: 'First of all, it improves communication...'"
          />
          <Example 
            english="Conclusion: 'In summary, technology is very beneficial'"
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Structure helps you anticipate what kind of information comes next.
        </Tip>
      </TheorySection>

      <TheorySection title="Question Types in Monologues" icon="❓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Monologues often use specific question types that need different strategies.
        </p>

        <GrammarTable
          caption="Question Types in Monologues"
          headers={["Type", "Typical Question", "What to Listen For", "Strategy"]}
          rows={[
            ["Specific information", "What is the main topic?", "Main topic, purpose", "Listen to the introduction"],
            ["Details", "What are the three benefits?", "Lists, enumeration", "Catch numbers and lists"],
            ["Opinion", "What does the speaker think?", "Opinions, evaluations", "Opinion language"],
            ["Facts", "What happened in 2020?", "Dates, events, data", "Numbers, dates, names"],
            ["Cause and effect", "Why did this happen?", "Reasons, explanations", "Causal language"],
            ["Summary", "What is the conclusion?", "Final summary, recommendation", "Listen to the conclusion"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Specific information: 'What is the main topic?'"
          />
          <Example 
            english="Details: 'What are the three benefits?'"
          />
          <Example 
            english="Opinion: 'What does the speaker think?'"
          />
        </div>

        <Rule 
          title="Strategies by Question Type"
          description="For each question type:"
          examples={[
            "Specific information: listen to the introduction",
            "Details: notice lists and enumeration",
            "Opinion: listen for evaluative language",
            "Facts: watch for numbers and dates"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Spot the question type so you know where to find the answer.
        </Tip>
      </TheorySection>

      <TheorySection title="Effective Note-Taking" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Note-taking is crucial for long monologues when you must retain a lot of information.
        </p>

        <GrammarTable
          caption="Note-Taking Techniques"
          headers={["Technique", "Description", "When to Use", "Benefit"]}
          rows={[
            ["Abbreviations", "Use symbols and short forms", "Repeated ideas", "Faster writing"],
            ["Keywords", "Write only important words", "Main concepts", "Stay on essentials"],
            ["Numbers and dates", "Write figures clearly", "Specific data", "Accurate recall"],
            ["Structure", "Section your notes", "Long monologues", "Easier review"],
            ["Symbols", "Mark relationships visually", "Cause-effect, lists", "Clear at a glance"],
            ["White space", "Leave gaps to add more", "Extra details later", "Flexibility"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Abbreviations: 'technology → tech, communication → comm'"
          />
          <Example 
            english="Keywords: 'benefits, communication, education, work'"
          />
          <Example 
            english="Numbers: '2020, 75%, 3 benefits, 10 years'"
          />
        </div>

        <Tip type="warning">
          <strong>Watch out!</strong> Do not try to write everything—focus on what you need for the questions.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Not reading all questions before the audio ❌<br/>
            <strong>Better:</strong> Read every question first ✅<br/>
            <em>Knowing what to listen for is crucial on long monologues</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Trying to understand every word ❌<br/>
            <strong>Better:</strong> Focus on the specific information you need ✅<br/>
            <em>Monologues carry a lot of information—select what matters</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Taking no notes ❌<br/>
            <strong>Better:</strong> Note key information ✅<br/>
            <em>Notes are essential on longer monologues</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Losing focus ❌<br/>
            <strong>Better:</strong> Stay attentive for the whole monologue ✅<br/>
            <em>Sustained attention is key</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Thorough preparation"
            description="Prepare well before you listen."
            examples={[
              "Read every question carefully",
              "Identify what information you need",
              "Predict the content of the monologue",
              "Set up your note-taking system"
            ]}
          />

          <Rule 
            title="2. Sustained concentration"
            description="Keep your attention through the whole monologue."
            examples={[
              "Do not drift into unrelated thoughts",
              "Focus on the information you need",
              "Use structure to stay oriented",
              "Use natural pauses for brief mental resets"
            ]}
          />

          <Rule 
            title="3. Strategic note-taking"
            description="Take notes efficiently and purposefully."
            examples={[
              "Use abbreviations and symbols",
              "Focus on task-relevant information",
              "Organize notes by section",
              "Do not try to transcribe everything"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="How long do monologues typically last?"
      options={[
        "30 seconds–2 minutes",
        "2–5 minutes",
        "5–10 minutes",
        "More than 10 minutes"
      ]}
      correctAnswer={1}
      explanation="Monologues usually last 2–5 minutes, which allows a full treatment of one topic with a single speaker."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What is the best strategy for monologues?"
      options={[
        "Listen with no preparation",
        "Read all questions before the audio",
        "Note everything that is said",
        "Ignore structure"
      ]}
      correctAnswer={1}
      explanation="Reading all questions first is crucial for monologues so you know what to listen for in a longer recording."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Monologues require sustained concentration for the whole recording.",
          isTrue: true,
          explanation: "Correct. Monologues are long; you need to stay focused to catch all necessary information."
        },
        {
          text: "You should note everything said in a monologue.",
          isTrue: false,
          explanation: "Incorrect. Note only information relevant to the questions, not every word."
        },
        {
          text: "Understanding monologue structure helps you anticipate content.",
          isTrue: true,
          explanation: "Correct. A typical introduction–body–conclusion pattern tells you what kind of detail comes next."
        },
        {
          text: "Monologues are easier than dialogues because there is only one voice.",
          isTrue: false,
          explanation: "Incorrect. They can be harder because they are longer and denser with information to process."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which part of the monologue usually has the most detail?"
      options={[
        "Introduction",
        "Body",
        "Conclusion",
        "Transitions"
      ]}
      correctAnswer={1}
      explanation="The body carries most of the detail (about 70–80%); introduction and conclusion are shorter."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What is the most effective note-taking approach for monologues?"
      options={[
        "Write down everything",
        "Use abbreviations and keywords",
        "Take no notes",
        "Write only at the end"
      ]}
      correctAnswer={1}
      explanation="Abbreviations and keywords let you capture important information without wasting time on full sentences."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Monologues are easier than dialogues because there's only one speaker.",
          isTrue: false,
          explanation: "Incorrect. Monologues can be harder because they require sustained focus without different voices breaking up the input."
        },
        {
          text: "Predicting content before listening helps with monologue comprehension.",
          isTrue: true,
          explanation: "Correct. Prediction from title or questions primes you for the topic."
        },
        {
          text: "You should write down everything the speaker says in a monologue.",
          isTrue: false,
          explanation: "Incorrect. Strategic notes on key points and structure work better than full transcription."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="What matters most for following an academic monologue?"
      options={[
        "The speaker’s personality",
        "Content structure and organization",
        "The speaker’s accent",
        "Speech rate"
      ]}
      correctAnswer={1}
      explanation="Structure and organization matter most for following academic monologues effectively."
    />,

    <MultipleChoiceExercise
      key="8"
      question="When are you most likely to lose concentration in a monologue?"
      options={[
        "At the start",
        "In the middle",
        "At the end",
        "Never"
      ]}
      correctAnswer={1}
      explanation="You often dip in the middle, after the novelty fades but before the end."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Signposting language is more important in monologues than in dialogues.",
          isTrue: true,
          explanation: "Correct. Signposting guides the listener through a single long turn."
        },
        {
          text: "Brief mental breaks during natural pauses can help maintain focus.",
          isTrue: true,
          explanation: "Correct. Using pauses can help you reset attention without missing key content."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Which monologue type needs the closest attention to specific details?"
      options={[
        "Personal narrative",
        "Academic presentation with data",
        "General description",
        "Personal opinion"
      ]}
      correctAnswer={1}
      explanation="Academic talks with data require close tracking of numbers, dates, and statistics."
    />
  ];

  return (
    <TheoryLayout
      title="Monologues"
      description="Master understanding monologues in English. Learn strategies for longer single-speaker recordings: presentations, lectures, and narratives."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic listening skills", "Experience with short dialogues"]}
      estimatedTime="75 min"
    />
  );
};

export default MonologuesPage;
