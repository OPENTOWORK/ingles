'use client';
import { buildNoteTakingTechniquesExercises } from './noteTakingTechniquesExercises';
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


const NoteTakingTechniquesPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Note-Taking Techniques?" icon="📝">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Note-taking techniques</strong> are systematic ways to capture important information while you listen. They are essential in longer exams and recordings.
        </p>
        
        <QuickReference items={[
          "Ways to capture key information",
          "Systems for organizing notes",
          "Efficient abbreviations and symbols",
          "Strategies by listening task type",
          "Review and checking techniques"
        ]} />
      </TheorySection>

      <TheorySection title="Why Note-Taking Matters" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Notes are crucial for listening success, especially on long audio.
        </p>

        <GrammarTable
          caption="Benefits of Note-Taking"
          headers={["Benefit", "Description", "When It Helps", "Example"]}
          rows={[
            ["Retention", "Helps you remember", "Long recordings", "Recall detail after 5 minutes"],
            ["Organization", "Structures information", "Complex content", "Group by topic or speaker"],
            ["Focus", "Keeps attention on task", "Dry or dense audio", "Track what questions need"],
            ["Verification", "Lets you check answers", "After the audio", "Confirm before you choose"],
            ["Processing", "Supports deeper processing", "Difficult input", "Work through complex ideas"],
            ["Confidence", "Reduces anxiety", "High-stakes tests", "Feel ready to answer"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Retention: 'Remember details after a 5-minute recording'" />
          <Example english="Organization: 'Sort information by topic'" />
          <Example english="Verification: 'Check facts before answering'" />
        </div>

        <Rule 
          title="When to Take Notes"
          description="Take notes when:"
          examples={[
            "The recording is long (over about 2 minutes)",
            "There is a lot of specific information",
            "There are several speakers",
            "Numbers, dates, or names matter",
            "The content is complex or technical"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Notes matter most in monologues and long conversations.
        </Tip>
      </TheorySection>

      <TheorySection title="Organization Systems" icon="📋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Different systems help you structure notes effectively.
        </p>

        <GrammarTable
          caption="Note Organization Systems"
          headers={["System", "Description", "When to Use", "Advantage"]}
          rows={[
            ["Linear", "Sequential lines", "Chronological flow", "Easy time order"],
            ["By topic", "Grouped by main theme", "Several topics", "Quick topic lookup"],
            ["By speaker", "Separated by who speaks", "Multiple speakers", "Track who said what"],
            ["Cornell-style", "Page split into zones", "Dense content", "Clear layout"],
            ["Mind map", "Visual branches", "Linked concepts", "See relationships"],
            ["Table", "Columns", "Comparison", "Easy side-by-side"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Linear: '1. Introduction, 2. Body, 3. Conclusion'" />
          <Example english="By topic: 'Topic A: Benefits; Topic B: Challenges; Topic C: Solutions'" />
          <Example english="By speaker: 'Manager: decisions; Designer: proposals; Developer: concerns'" />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Pick the system that fits the audio structure and question focus.
        </Tip>
      </TheorySection>

      <TheorySection title="Abbreviations and Symbols" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Abbreviations and symbols let you write faster.
        </p>

        <GrammarTable
          caption="Common Abbreviations and Symbols"
          headers={["Category", "Example", "Meaning", "When to Use"]}
          rows={[
            ["Common words", "w/ (with), w/o (without)", "With / without", "Very often"],
            ["Time", "AM, PM, Mon, Tue", "Time slots, days", "Schedules and dates"],
            ["Order", "1st, 2nd, 3rd", "Sequence", "Lists and order"],
            ["Symbols", "→ (leads to), ↑ (increase)", "Links, change", "Relations and trends"],
            ["Titles", "Dr., Prof.", "Professional roles", "Identifying people"],
            ["Places", "US, UK, NY", "Countries, cities", "Locations"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Common words: 'w/ (with), w/o (without)'" />
          <Example english="Symbols: '→ (leads to), ↑ (increase)'" />
          <Example english="Time: 'AM, PM, Mon, Tue'" />
        </div>

        <Rule 
          title="Abbreviation Tips"
          description="To use abbreviations well:"
          examples={[
            "Build a consistent personal set",
            "Use forms you will recognize later",
            "Practice until they are automatic",
            "Avoid overly cryptic codes"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Make sure you can read your own abbreviations afterward.
        </Tip>
      </TheorySection>

      <TheorySection title="Techniques by Listening Type" icon="🎧">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Different tasks call for different note-taking approaches.
        </p>

        <GrammarTable
          caption="Techniques by Listening Type"
          headers={["Type", "Technique", "Focus", "Example"]}
          rows={[
            ["Short dialogues", "Minimal notes", "Specific fact", "Price: $25; Time: 3 PM"],
            ["Monologues", "Structured notes", "Structure and detail", "Intro: topic; Body: 3 points"],
            ["Long conversations", "Per-speaker notes", "Who said what", "A: option 1; B: option 2"],
            ["Multi-speaker", "Voice map", "Systematic ID", "Voice 1: manager; Voice 2: designer"],
            ["Lectures", "Academic style", "Concepts and examples", "Concept: definition; Example: case"],
            ["Interviews", "Q&A layout", "Questions and answers", "Q: experience; A: 5 years"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Short dialogues: 'Price: $25; Time: 3 PM'" />
          <Example english="Monologues: 'Intro: topic; Body: 3 points'" />
          <Example english="Multi-speaker: 'Voice 1: manager; Voice 2: designer'" />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Adapt your style to the listening type for best results.
        </Tip>
      </TheorySection>

      <TheorySection title="Fast Writing Strategies" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Writing fast helps you avoid missing important content.
        </p>

        <GrammarTable
          caption="Fast Writing Strategies"
          headers={["Strategy", "Description", "When to Use", "Benefit"]}
          rows={[
            ["Keywords", "Only important words", "Specific targets", "Speed"],
            ["Drop articles", "Skip a, an, the", "When echoing phrases", "Saves space and time"],
            ["Symbols", "Replace frequent words", "Common ideas", "Speed"],
            ["Phonetic jot", "Spell as it sounds", "Unknown words", "No slowdown from spelling"],
            ["Arrows", "Link ideas visually", "Relations", "Quick clarity"],
            ["Blank space", "Leave gaps", "Incomplete points", "Fill in later"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Keywords: 'benefits technology communication'" />
          <Example english="Symbols: '↑ benefits; ↓ costs'" />
          <Example english="Phonetic jot: 'teknoloji' (technology)" />
        </div>

        <Rule 
          title="Fast Writing Tips"
          description="To write quickly:"
          examples={[
            "Prioritize speed over neatness",
            "Use consistent short forms",
            "Write only essential information",
            "Do not chase perfect spelling",
            "Prefer symbols where they help"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> In exams, speed usually beats perfect form in raw notes.
        </Tip>
      </TheorySection>

      <TheorySection title="Review and Checking" icon="🔍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Reviewing notes helps ensure accuracy.
        </p>

        <GrammarTable
          caption="Review Strategies"
          headers={["Strategy", "Description", "When to Use", "Benefit"]}
          rows={[
            ["Immediate review", "Skim notes right after", "After the audio", "Fill gaps"],
            ["Cross-check", "Match to questions", "Before answering", "Reduce errors"],
            ["Fill blanks", "Complete missing bits", "During review", "Round out notes"],
            ["Decode abbreviations", "Confirm what you meant", "During review", "Avoid misreads"],
            ["Re-order", "Tidy layout if needed", "During review", "Clearer picture"],
            ["Mark priorities", "Highlight key facts", "During review", "Focus answers"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example english="Immediate review: 'Fill in missing information'" />
          <Example english="Cross-check: 'Compare with the questions'" />
          <Example english="Fill gaps: 'Add what you almost missed'" />
        </div>

        <Tip type="warning">
          <strong>Watch out!</strong> Do not spend so long reviewing that you run out of time to answer.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Trying to write everything ❌<br/>
            <strong>Better:</strong> Write only key points ✅<br/>
            <em>Full transcription makes you miss later content</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Unclear abbreviations ❌<br/>
            <strong>Better:</strong> Use clear, consistent short forms ✅<br/>
            <em>You must recognize your own notes later</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Never reviewing notes ❌<br/>
            <strong>Better:</strong> Brief review and check ✅<br/>
            <em>Review catches gaps and errors</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> One rigid system for every task ❌<br/>
            <strong>Better:</strong> Match system to task type ✅<br/>
            <em>Different formats need different approaches</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Speed over perfection"
            description="Prioritize capturing content."
            examples={[
              "Write only essential points",
              "Use abbreviations and symbols",
              "Do not slow down for perfect spelling",
              "Capture information before layout beauty"
            ]}
          />

          <Rule 
            title="2. Consistent system"
            description="Keep a stable personal code."
            examples={[
              "Reuse the same abbreviations",
              "Keep a familiar layout",
              "Practice until it feels automatic",
              "Avoid changing systems mid-test"
            ]}
          />

          <Rule 
            title="3. Adapt to context"
            description="Match technique to listening type."
            examples={[
              "Short dialogues: light notes",
              "Monologues: clear structure",
              "Multi-speaker: voice labels",
              "Lectures: concepts plus examples"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Note-Taking Techniques"
      description="Master note-taking for English listening. Learn organization systems, abbreviations, fast-writing tactics, and checking strategies."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildNoteTakingTechniquesExercises}
      prerequisites={["Basic listening skills", "Understanding of different listening types"]}
      estimatedTime="75 min"
    />
  );
};

export default NoteTakingTechniquesPage;
