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

const KeyResourcesToImprovePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are Key Resources to Improve?" icon="📚">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Key resources to improve</strong> are tools, materials, and strategies 
          that help you build your English effectively and sustainably.
        </p>
        
        <QuickReference items={[
          "Digital resources: apps, websites, podcasts",
          "Traditional materials: books, dictionaries, grammar references",
          "Active practice: speaking, writing, reading",
          "Study strategies: techniques and habits",
          "Assessment and tracking: tests and self-review"
        ]} />
      </TheorySection>

      <TheorySection title="Digital Resources" icon="💻">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Digital resources give immediate access to up-to-date content and interactive tools.
        </p>

        <GrammarTable
          caption="Types of Digital Resources"
          headers={["Type", "Examples", "Benefits", "Level"]}
          rows={[
            ["Language-learning apps", "Duolingo, Babbel, Rosetta Stone", "Gamification, daily practice", "A2–C2"],
            ["Podcasts", "BBC Learning English, ESL Podcast", "Listening comprehension, vocabulary", "A2–C2"],
            ["Online videos", "YouTube channels, TED Talks", "Visual input, pronunciation", "A2–C2"],
            ["Online courses", "Coursera, edX, Khan Academy", "Structure, certification", "B1–C2"],
            ["Writing tools", "Grammarly, Hemingway Editor", "Correction, clearer style", "B1–C2"],
            ["Online dictionaries", "Oxford, Merriam-Webster, Collins", "Definitions, pronunciation", "A2–C2"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Language app: 'Duolingo for daily bite-sized practice'" />
          <Example english="Podcast: 'BBC Learning English for news-led lessons'" />
          <Example english="Writing support: 'Grammarly to review drafts'" />
        </div>

        <Rule 
          title="Using Digital Resources Effectively"
          description="To get more from digital tools:"
          examples={[
            "Build a daily routine",
            "Mix different formats (audio, reading, quizzes)",
            "Choose content suited to your level",
            "Use interactive features when available"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Digital tools pay off most when you use them regularly, not occasionally.
        </Tip>
      </TheorySection>

      <TheorySection title="Traditional Materials" icon="📖">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Printed and reference-based materials remain essential for thorough, structured learning.
        </p>

        <GrammarTable
          caption="Essential Traditional Materials"
          headers={["Material", "Purpose", "When to Use", "Benefits"]}
          rows={[
            ["Dictionaries", "Definitions, pronunciation", "When reading or writing", "Accuracy, depth"],
            ["Grammar references", "Rules and structures", "When studying grammar", "Solid foundations"],
            ["Textbooks", "Structured learning paths", "Systematic courses", "Clear progression"],
            ["Novels and short stories", "Extensive reading", "Free time", "Vocabulary, flow"],
            ["Newspapers and magazines", "Current topics", "Day to day", "Up-to-date language"],
            ["Style guides", "Formal writing", "When drafting essays", "Appropriate register"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Dictionary: Oxford Advanced Learner's Dictionary" />
          <Example english="Grammar: English Grammar in Use" />
          <Example english="Reading: The New York Times for daily news articles" />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Combine traditional materials with digital resources for well-rounded progress.
        </Tip>
      </TheorySection>

      <TheorySection title="Active Practice" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Active practice is key to gaining fluency and confidence in English.
        </p>

        <GrammarTable
          caption="Kinds of Active Practice"
          headers={["Skill", "Activities", "How Often", "Benefits"]}
          rows={[
            ["Speaking", "Conversation, short talks, debates", "Daily if possible", "Fluency, pronunciation"],
            ["Writing", "Journals, essays, emails", "Regularly", "Structure, vocabulary"],
            ["Reading", "Books, articles, news", "Daily if possible", "Vocabulary, comprehension"],
            ["Listening", "Podcasts, music, films", "Daily if possible", "Comprehension, pronunciation"],
            ["Grammar", "Exercises, short translations", "Regularly", "Accuracy, structures"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Speaking: Conversation with fluent or native speakers" />
          <Example english="Writing: Keep a diary in English" />
          <Example english="Reading: Read English news every day" />
        </div>

        <Rule 
          title="Effective Practice Habits"
          description="To practise effectively:"
          examples={[
            "Set specific goals",
            "Study little and often rather than occasional marathons",
            "Mix listening, speaking, reading, and writing",
            "Seek feedback from others where you can",
            "Reflect on your progress"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Practice without reflection rarely fixes mistakes—notice patterns and adjust.
        </Tip>
      </TheorySection>

      <TheorySection title="Learning Strategies" icon="🧠">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Learning strategies help you study more efficiently and remember more.
        </p>

        <GrammarTable
          caption="Effective Learning Strategies"
          headers={["Strategy", "Description", "When to Use", "Benefits"]}
          rows={[
            ["Spaced repetition", "Review at increasing intervals", "Vocabulary and grammar", "Better long-term memory"],
            ["Active recall", "Try to remember without looking first", "Review sessions", "Stronger retrieval"],
            ["Interleaving", "Alternate topics within a study session", "General study periods", "Helps transfer to new tasks"],
            ["Elaboration", "Explain ideas in your own words", "When you want deep understanding", "Clearer mental models"],
            ["Dual coding", "Combine words and images", "Vocabulary and concepts", "More ways to recall material"],
            ["Metacognition", "Reflect on how you learn", "Ongoing reflection", "Self-awareness as a learner"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Spaced repetition: review vocabulary on days 1, 3, and 7" />
          <Example english="Active recall: try to recall yesterday's lesson before reopening notes" />
          <Example english="Metacognition: note which strategies help you most each week" />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Try several strategies and keep the ones that work best for you.
        </Tip>
      </TheorySection>

      <TheorySection title="Assessment and Tracking" icon="📊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Checking progress regularly highlights strengths, gaps, and next steps.
        </p>

        <GrammarTable
          caption="Ways to Assess Progress"
          headers={["Method", "Focus", "Frequency", "Tools"]}
          rows={[
            ["Self-assessment", "Your own progress over time", "Weekly", "Journals, checklists"],
            ["Practice tests", "Specific skills or exam formats", "Monthly", "Online tests, workbooks"],
            ["Peer feedback", "Speaking and writing in real communication", "Regularly", "Study groups, language exchanges"],
            ["Teacher feedback", "Accuracy and explanations", "As available", "Classes, tutoring"],
            ["Performance tasks", "Real-life use", "Occasionally", "Presentations, projects"],
            ["Portfolio assessment", "Overall development", "Quarterly", "Collected pieces of writing or recordings"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Self-assessment: short weekly progress review in a notebook or app" />
          <Example english="Practice tests: a monthly timed practice exam or section" />
          <Example english="Peer feedback: swap short written or spoken tasks with a partner" />
        </div>

        <Rule 
          title="Making Assessment Useful"
          description="Assessment works best when you:"
          examples={[
            "Use clear criteria (what ‘good’ looks like)",
            "Use more than one type of evidence",
            "Check in regularly, not once a year",
            "Respond to results by adjusting your plan"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Treat assessment as guidance for improvement, not as punishment.
        </Tip>
      </TheorySection>

      <TheorySection title="Building a Study Plan" icon="📅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          A clear study plan supports consistency and visible progress over time.
        </p>

        <GrammarTable
          caption="Parts of a Study Plan"
          headers={["Element", "Description", "Example", "Why It Matters"]}
          rows={[
            ["Goals", "Specific aims you can track", "Move from B1 to B2 in six months", "Direction"],
            ["Schedule", "Time set aside routinely", "30 minutes every day", "Habits"],
            ["Activities", "Concrete tasks each week", "Read one article, write one paragraph", "Variety"],
            ["Resources", "What you will use", "An app, a textbook, one podcast series", "Access to input"],
            ["Review", "How you check progress", "Monthly test plus weekly self-review", "Course correction"],
            ["Adjustments", "Changes when plans stall", "Swap an activity if it is not helping", "Realistic flexibility"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Goal: improve writing from B1 to B2 in six months" />
          <Example english="Schedule: 30 minutes daily—15 reading, 15 writing" />
          <Example english="Review: monthly test plus a short weekly self-check" />
        </div>

        <Tip type="warning">
          <strong>Watch out!</strong> Overloading your plan causes burnout—set targets you can actually keep.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Using only one type of resource ❌<br/>
            <strong>Better:</strong> Combine several kinds (digital + print, input + practice) ✅<br/>
            <em>Variety supports balanced skills</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Intense cramming with no steady routine ❌<br/>
            <strong>Better:</strong> Short, regular sessions ✅<br/>
            <em>Consistency usually beats occasional long marathons</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Never reviewing progress ❌<br/>
            <strong>Better:</strong> Check progress and tweak your methods ✅<br/>
            <em>Review shows what to focus on next</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Choosing materials far above or below your level ❌<br/>
            <strong>Better:</strong> Aim for texts and tasks suited to where you are now ✅<br/>
            <em>Right-level input keeps motivation and growth balanced</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Principles" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Consistency over intensity"
            description="Daily short sessions often beat rare long cram sessions."
            examples={[
              "30 minutes a day beats one 3-hour block per week—when you sustain it",
              "Regular study builds routines",
              "Review helps learning stick",
              "Very long cram sessions often lead to fatigue"
            ]}
          />

          <Rule 
            title="2. Use a variety of resources"
            description="Combine different tools for more complete development."
            examples={[
              "Digital + printed materials",
              "Active speaking/writing plus passive listening/reading where appropriate",
              "Formal lessons + informal immersion",
              "Solo practice + partner or group tasks"
            ]}
          />

          <Rule 
            title="3. Keep evaluating"
            description="Notice what is working and change what is not."
            examples={[
              "Quick weekly reflection",
              "Monthly level check or timed practice section",
              "Feedback from partners or teachers",
              "Adjust goals or activities when progress stalls"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Which type of resources typically offers quick, on-demand access?"
      options={[
        "Printed-only archives",
        "Digital",
        "Handwritten manuscripts only",
        "Resources with no electronic version"
      ]}
      correctAnswer={1}
      explanation="Digital resources are available almost anytime online or on devices, supporting flexible routines."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What is the main benefit of consistent practice?"
      options={[
        "Memorizing more words in isolation",
        "Developing fluency and confidence",
        "Avoiding grammar study entirely",
        "Reading unrelated material faster without understanding"
      ]}
      correctAnswer={1}
      explanation="Steady practice builds fluency and confidence—what you rely on when you actually use the language."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Studying three hours once a week is usually better than 30 minutes every day.",
          isTrue: false,
          explanation: "Incorrect. Regular short sessions normally support retention and habits better than one long cram block per week."
        },
        {
          text: "Using different kinds of resources supports learning.",
          isTrue: true,
          explanation: "Correct. Mixing digital tools, printed texts, receptive and productive work gives a fuller training effect."
        },
        {
          text: "Periodic assessment helps you adjust how you study.",
          isTrue: true,
          explanation: "Correct. Checking progress shows strengths and gaps so you can change focus or methods."
        },
        {
          text: "Study materials should match the learner's approximate level.",
          isTrue: true,
          explanation: "Correct. Material that is too easy or unrealistically difficult makes progress harder to sustain."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which approach is strongest for remembering vocabulary over the long term?"
      options={[
        "Cramming once with no review",
        "Spaced repetition (reviews spread over time)",
        "Reading a list once silently",
        "Studying only on weekends with no weekdays"
      ]}
      correctAnswer={1}
      explanation="Spaced repetition—coming back to items after gaps—typically beats one-off cramming for long-term memory."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What matters most in a study plan?"
      options={[
        "How exhausting each session feels",
        "How consistently you stick to your schedule",
        "How many unused apps are installed",
        "How difficult the hardest book you own looks on the shelf"
      ]}
      correctAnswer={1}
      explanation="A plan you repeat beats a perfect-looking plan you abandon; consistency anchors improvement."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Free resources are always lower quality than paid resources.",
          isTrue: false,
          explanation: "Incorrect. Many free resources (BBC Learning English, podcasts, curated YouTube lessons) are high quality."
        },
        {
          text: "Combining several types of resources often improves outcomes.",
          isTrue: true,
          explanation: "Correct. Digital, printed, formal, and informal resources each support different aspects of proficiency."
        },
        {
          text: "You should only use materials labelled exactly at your current level.",
          isTrue: false,
          explanation: "Incorrect. Challenges slightly beyond your comfort zone—when scaffolded—can also help growth."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="What is a typical advantage of interactive digital tools?"
      options={[
        "They guarantee perfect scores instantly",
        "They often provide quick feedback",
        "They eliminate the need to speak or write",
        "They replace dictionaries completely"
      ]}
      correctAnswer={1}
      explanation="Many interactive exercises give immediate feedback, which speeds up correction and learning."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which resource tends to help pronunciation most?"
      options={[
        "Grammar rules with no listening input",
        "Audio and video with fluent or native speakers",
        "Silent reading only",
        "Word lists never heard aloud"
      ]}
      correctAnswer={1}
      explanation="Hearing authentic models in audio or video improves stress, rhythm, and individual sounds."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Self-assessment is a useful part of language learning.",
          isTrue: true,
          explanation: "Correct. Reflecting on what you understood or produced helps prioritise weak areas."
        },
        {
          text: "You should use exactly one textbook until nothing in it feels new.",
          isTrue: false,
          explanation: "Incorrect. Exposure to varied formats and accents keeps motivation and skills broader."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="How often should you realistically review overall progress?"
      options={[
        "Only once a year informally",
        "Regularly (for example weekly or monthly)",
        "Only when you feel stuck for months",
        "Never; progress checks are pointless"
      ]}
      correctAnswer={1}
      explanation="Short, recurring reviews catch problems early and help you celebrate improvements without long gaps."
    />
  ];

  return (
    <TheoryLayout
      title="Key Resources to Improve"
      description="Discover key resources for English improvement: digital and traditional tools, active practice, study strategies, and progress checks—then outline a workable study plan."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic English skills", "Motivation to improve"]}
      estimatedTime="75 min"
    />
  );
};

export default KeyResourcesToImprovePage;
