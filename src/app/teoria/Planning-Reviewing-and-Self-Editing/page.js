'use client';
import { buildPlanningReviewingAndSelfEditingExercises } from './planningReviewingAndSelfEditingExercises';
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


const PlanningReviewingAndSelfEditingPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="What Are Planning, Reviewing, and Self-Editing?" icon="📋">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Planning</strong>, <strong>reviewing</strong>, and <strong>self-editing</strong> are essential stages for producing high-quality texts. 
          Each stage has its own goals and strategies.
        </p>
        
        <QuickReference items={[
          "Planning: organise ideas before you write",
          "Reviewing: evaluate content and structure",
          "Self-editing: fix errors and improve style",
          "A cyclical process of continuous improvement",
          "Specific tools and strategies for each stage"
        ]} />
      </TheorySection>

      <TheorySection title="Planning" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Planning is how you organise ideas before drafting. Good planning makes writing and revision easier.
        </p>

        <GrammarTable
          caption="Planning Strategies"
          headers={["Strategy", "Description", "Tools", "Benefits"]}
          rows={[
            ["Brainstorming", "Generate ideas freely", "Lists, mind maps", "Creativity, range of ideas"],
            ["Outlining", "Order ideas hierarchically", "Numbered outlines", "Clear structure, coherence"],
            ["Mind mapping", "Connect ideas visually", "Diagrams, links", "See relationships between ideas"],
            ["Freewriting", "Write without stopping", "Free text, timer", "Fluency, spontaneous ideas"],
            ["Clustering", "Group related ideas", "Clusters, circles", "Thematic organisation"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Brainstorming: list every idea you have about “technology”"
            note="Get ideas down before you judge them."
          />
          <Example 
            english="Outline: I. Introduction, II. Body, III. Conclusion"
            note="Simple skeleton for longer pieces."
          />
          <Example 
            english="Mind map: Technology → Communication → Social media → Facebook"
            note="Shows branches from general to specific."
          />
        </div>

        <Rule 
          title="Effective planning process"
          description="Follow these steps:"
          examples={[
            "1. Identify purpose and audience",
            "2. Generate ideas (brainstorming)",
            "3. Organise ideas (outlining)",
            "4. Define the main structure",
            "5. Set goals for each section"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Spend about 20% of your time planning—it often saves time when drafting and revising.
        </Tip>
      </TheorySection>

      <TheorySection title="Reviewing" icon="🔍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Reviewing means evaluating content, structure, and organisation so the text meets its purpose.
        </p>

        <GrammarTable
          caption="What to Review"
          headers={["Aspect", "Key questions", "Look for", "Tools"]}
          rows={[
            ["Content", "Does it fulfil the brief?", "Clear ideas, strong arguments", "Checklist"],
            ["Structure", "Is it well organised?", "Introduction, body, conclusion", "Outline of the draft"],
            ["Coherence", "Do ideas connect?", "Transitions, connectors", "Read for flow"],
            ["Audience", "Is it right for the reader?", "Register, vocabulary", "Reader's perspective"],
            ["Completeness", "Is anything missing?", "All required parts", "Task requirements list"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Content review: 'Is my argument convincing?'"
            note="Focus on substance before small details."
          />
          <Example 
            english="Structure review: 'Does my introduction set up the topic clearly?'"
            note="Check macro-level organisation."
          />
          <Example 
            english="Audience review: 'Is my vocabulary right for my readers?'"
            note="Match register to who will read it."
          />
        </div>

        <Rule 
          title="Effective reviewing strategies"
          description="To review well:"
          examples={[
            "Read the whole draft first",
            "Review one focus at a time",
            "Use a checklist",
            "Take breaks between passes",
            "Read aloud to spot problems"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Review in several short sessions—each time focus on a different aspect.
        </Tip>
      </TheorySection>

      <TheorySection title="Self-editing" icon="✏️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Self-editing targets specific errors and improves style and clarity.
        </p>

        <GrammarTable
          caption="Levels of Self-Editing"
          headers={["Level", "Focus", "What to fix", "Examples"]}
          rows={[
            ["Macro-editing", "Overall structure", "Organisation, flow, purpose", "Moving whole paragraphs"],
            ["Meso-editing", "Paragraphs and sentences", "Coherence, transitions", "Improving connectors"],
            ["Micro-editing", "Words and grammar", "Errors, precision", "Verbs, prepositions"],
            ["Proofreading", "Final surface issues", "Spelling, punctuation", "Typos, commas, capitals"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Macro-editing: reorder paragraphs for better flow"
            note="Big-picture changes first."
          />
          <Example 
            english="Meso-editing: improve transitions between paragraphs"
            note="Strengthen links between ideas."
          />
          <Example 
            english="Micro-editing: correct specific grammar mistakes"
            note="Sentence-level accuracy."
          />
        </div>

        <Rule 
          title="Self-editing order"
          description="Work in this sequence:"
          examples={[
            "1. Macro-editing: structure and organisation",
            "2. Meso-editing: paragraphs and coherence",
            "3. Micro-editing: sentences and vocabulary",
            "4. Proofreading: final surface checks"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out:</strong> Do not try to fix everything at once—handle one level per pass.
        </Tip>
      </TheorySection>

      <TheorySection title="Tools and Techniques" icon="🛠️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Many tools and techniques support each stage of the writing process.
        </p>

        <GrammarTable
          caption="Tools by Stage"
          headers={["Stage", "Tools", "Techniques", "Benefits"]}
          rows={[
            ["Planning", "Mind maps, outlines", "Freewriting, clustering", "Organisation, ideas"],
            ["Reviewing", "Checklists", "Reading aloud", "Systematic evaluation"],
            ["Self-editing", "Dictionaries, grammar references", "Reading backwards", "Accuracy, correction"],
            ["Proofreading", "Spell checkers", "Printing on paper", "Final surface errors"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Planning tool: 'MindMeister for mind maps'"
            note="Digital mapping for brainstorming."
          />
          <Example 
            english="Review technique: 'Read the text aloud'"
            note="Hear rhythm and awkward phrasing."
          />
          <Example 
            english="Editing technique: 'Read the text backwards'"
            note="Isolate words for spelling checks."
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Combine digital tools with paper-based techniques for best results.
        </Tip>
      </TheorySection>

      <TheorySection title="Checklist" icon="✅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          A checklist helps you avoid skipping important points.
        </p>

        <GrammarTable
          caption="Complete Checklist"
          headers={["Category", "Questions", "Yes/No", "Notes"]}
          rows={[
            ["Content", "Does the text fulfil its purpose?", "☐", "Check against the brief"],
            ["Structure", "Does it have introduction, body, and conclusion?", "☐", "Check organisation"],
            ["Coherence", "Do ideas connect logically?", "☐", "Check transitions"],
            ["Register", "Is vocabulary appropriate?", "☐", "Match audience"],
            ["Grammar", "Are there grammar errors?", "☐", "Check verbs, agreement"],
            ["Spelling", "Are there spelling mistakes?", "☐", "Use spell check + human read"],
            ["Punctuation", "Is punctuation correct?", "☐", "Check commas, full stops"],
            ["Length", "Does it meet length requirements?", "☐", "Word count"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Content check: 'Is my argument convincing and complete?'"
            note="Holistic read for the main message."
          />
          <Example 
            english="Grammar check: 'Are all verbs in the right tense?'"
            note="Systematic grammar pass."
          />
          <Example 
            english="Final check: 'Is the text ready to submit?'"
            note="Last look before hand-in."
          />
        </div>

        <Rule 
          title="Using the checklist"
          description="To use it effectively:"
          examples={[
            "Go through each item in order",
            "Tick off completed items",
            "Note changes still needed",
            "Run through the list once more at the end"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Adapt the checklist to your own strengths and weaknesses.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Skipping planning ❌<br/>
            <strong>Better:</strong> Always plan before drafting ✅<br/>
            <em>Planning saves time and improves quality</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Only one quick read-through ❌<br/>
            <strong>Better:</strong> Review in several sessions ✅<br/>
            <em>Multiple passes catch more issues</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Fixing every kind of error at once ❌<br/>
            <strong>Better:</strong> Focus on one level per pass ✅<br/>
            <em>Systematic editing is more effective</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Relying only on automated checkers ❌<br/>
            <strong>Better:</strong> Combine tools with careful human reading ✅<br/>
            <em>Software misses style, register, and meaning errors</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Cyclical process"
            description="Planning, reviewing, and self-editing repeat in cycles."
            examples={[
              "Plan → Write → Review → Revise",
              "Each cycle improves the draft",
              "Do not expect perfection on the first try",
              "Iterate until the quality is right"
            ]}
          />

          <Rule 
            title="2. Time and breaks"
            description="Allow enough time and rest between passes."
            examples={[
              "Planning: about 20% of total time",
              "Drafting: about 50%",
              "Review and editing: about 30%",
              "Break between writing and editing when you can"
            ]}
          />

          <Rule 
            title="3. Reader perspective"
            description="Try to read as your audience would."
            examples={[
              "Read as if you were the intended reader",
              "Spot possible confusion",
              "Check that the purpose is clear",
              "Check appropriateness for the audience"
            ]}
          />
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Planning, Reviewing, and Self-Editing"
      description="Master planning, reviewing, and self-editing to produce high-quality writing. Learn practical strategies and tools for each stage."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildPlanningReviewingAndSelfEditingExercises}
      prerequisites={["Basic writing skills", "Understanding of text structure"]}
      estimatedTime="80 min"
    />
  );
};

export default PlanningReviewingAndSelfEditingPage;
