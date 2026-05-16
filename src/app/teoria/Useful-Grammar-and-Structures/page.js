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

const UsefulGrammarAndStructuresPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are Useful Grammar and Structures?" icon="🔧">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Useful grammar and structures</strong> are patterns and constructions that help you express yourself 
          more naturally, precisely, and effectively in written English.
        </p>
        
        <QuickReference items={[
          "Advanced structures for formal writing",
          "Patterns for stating opinions and arguments",
          "Complex connectors and transitions",
          "Ways to compare and contrast",
          "Structures for introducing and concluding ideas"
        ]} />
      </TheorySection>

      <TheorySection title="Structures for Introducing Ideas" icon="🚪">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These structures help you present ideas clearly and professionally.
        </p>

        <GrammarTable
          caption="Structures for Introducing Ideas"
          headers={["Structure", "Use", "Example", "Gloss"]}
          rows={[
            ["It is widely believed that...", "General opinion", "It is widely believed that technology improves life", "Widely held view..."],
            ["There is growing evidence that...", "Growing evidence", "There is growing evidence that climate change is real", "Increasing evidence that..."],
            ["It cannot be denied that...", "Undisputed fact", "It cannot be denied that education is important", "It is undeniable that..."],
            ["One of the most significant...", "Emphasising importance", "One of the most significant issues is poverty", "One of the most significant..."],
            ["In recent years, there has been...", "Recent trend", "In recent years, there has been an increase in...", "In recent years there has been..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="It is widely believed that technology improves life"
            note="Opens with a shared, general belief."
          />
          <Example 
            english="There is growing evidence that climate change is real"
            note="Signals accumulating proof."
          />
          <Example 
            english="It cannot be denied that education is important"
            note="Frames the point as hard to dispute."
          />
        </div>

        <Rule 
          title="When to use each structure"
          description="Choose according to context:"
          examples={[
            "It is widely believed: general opinions",
            "There is growing evidence: scientific or research-based claims",
            "It cannot be denied: facts that are difficult to contest",
            "One of the most significant: highlighting importance"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> These structures add authority and credibility to your arguments.
        </Tip>
      </TheorySection>

      <TheorySection title="Structures for Developing Arguments" icon="💭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These patterns help you develop and explain your arguments convincingly.
        </p>

        <GrammarTable
          caption="Structures for Developing Arguments"
          headers={["Structure", "Function", "Example", "Gloss"]}
          rows={[
            ["This is due to the fact that...", "Explain cause", "This is due to the fact that people work more", "This is because..."],
            ["What is more important is...", "Emphasise a point", "What is more important is the long-term effects", "What matters more is..."],
            ["It should be noted that...", "Draw attention", "It should be noted that not everyone agrees", "It is worth noting that..."],
            ["This raises the question of...", "Introduce an issue", "This raises the question of responsibility", "This leads one to ask..."],
            ["Furthermore, it is essential to...", "Add an important point", "Furthermore, it is essential to consider costs", "Moreover, it is essential..."],
            ["In contrast to this...", "Show contrast", "In contrast to this, some believe...", "By contrast..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="This is due to the fact that people work more"
            note="Formal way to give a reason."
          />
          <Example 
            english="What is more important is the long-term effects"
            note="Highlights priority among points."
          />
          <Example 
            english="It should be noted that not everyone agrees"
            note="Flags an important caveat."
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Use these structures to make arguments more persuasive and professional.
        </Tip>
      </TheorySection>

      <TheorySection title="Structures for Comparison and Contrast" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These help you compare ideas and present contrasts effectively.
        </p>

        <GrammarTable
          caption="Structures for Comparison and Contrast"
          headers={["Structure", "Use", "Example", "Gloss"]}
          rows={[
            ["Similarly to...", "Similarity", "Similarly to the previous case, this shows...", "In a similar way to..."],
            ["Unlike the previous example...", "Contrast", "Unlike the previous example, this method is...", "As opposed to the previous example..."],
            ["In comparison with...", "Formal comparison", "In comparison with traditional methods...", "Compared with..."],
            ["Whereas the former...", "Formal contrast", "Whereas the former is expensive, the latter is...", "While the first..."],
            ["Both... and... share the characteristic of...", "Similarity", "Both approaches share the characteristic of...", "Both X and Y share..."],
            ["The fundamental difference lies in...", "Key difference", "The fundamental difference lies in approach", "The essential difference is..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Similarly to the previous case, this shows..."
            note="Links to something already mentioned."
          />
          <Example 
            english="In comparison with traditional methods..."
            note="Sets up a formal comparison."
          />
          <Example 
            english="Whereas the former is expensive, the latter is..."
            note="“Former” / “latter” refer to two items already named."
          />
        </div>

        <Rule 
          title="Advanced comparison structures"
          description="For sophisticated comparisons:"
          examples={[
            "Similarly to / Unlike: similarities and differences",
            "In comparison with: formal comparison",
            "Whereas: elegant contrast",
            "Both... and...: shared features"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out:</strong> Use “former” for the first of two items mentioned and “latter” for the second.
        </Tip>
      </TheorySection>

      <TheorySection title="Structures for Expressing Opinions" icon="💬">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These patterns help you state opinions in an academic, persuasive way.
        </p>

        <GrammarTable
          caption="Structures for Expressing Opinions"
          headers={["Structure", "Certainty level", "Example", "Gloss"]}
          rows={[
            ["I firmly believe that...", "Very confident", "I firmly believe that education is key", "I strongly believe..."],
            ["It seems to me that...", "Moderate", "It seems to me that this approach works", "In my view..."],
            ["I would argue that...", "Argumentative", "I would argue that technology helps", "I would contend that..."],
            ["There is reason to believe that...", "Cautious", "There is reason to believe that change is needed", "One may reasonably believe..."],
            ["It is my contention that...", "Formal", "It is my contention that this is wrong", "My view is that..."],
            ["I am convinced that...", "Confident", "I am convinced that this is the best solution", "I am sure that..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="I firmly believe that education is key"
            note="Strong personal stance."
          />
          <Example 
            english="It seems to me that this approach works"
            note="Softer, reflective tone."
          />
          <Example 
            english="I would argue that technology helps"
            note="Positions the claim as reasoned argument."
          />
        </div>

        <Tip type="info">
          <strong>Tip:</strong> Vary structures according to how certain you are about your claim.
        </Tip>
      </TheorySection>

      <TheorySection title="Structures for Concluding" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These help you close your arguments effectively.
        </p>

        <GrammarTable
          caption="Structures for Concluding"
          headers={["Structure", "Use", "Example", "Gloss"]}
          rows={[
            ["In conclusion, it can be said that...", "General conclusion", "In conclusion, it can be said that technology is beneficial", "To conclude, one can say..."],
            ["To sum up, the evidence suggests...", "Summary", "To sum up, the evidence suggests that change is needed", "In summary, the evidence suggests..."],
            ["All things considered...", "Taking everything into account", "All things considered, this is the best option", "Taking everything into account..."],
            ["It is therefore clear that...", "Logical conclusion", "It is therefore clear that action is required", "Thus it is clear that..."],
            ["The implications of this are...", "Implications", "The implications of this are far-reaching", "This implies that..."],
            ["This leads to the conclusion that...", "Logical close", "This leads to the conclusion that we must act", "From this we may conclude..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="In conclusion, it can be said that technology is beneficial"
            note="Classic academic closing move."
          />
          <Example 
            english="To sum up, the evidence suggests that change is needed"
            note="Summarises what the evidence shows."
          />
          <Example 
            english="All things considered, this is the best option"
            note="Weighs pros and cons before the verdict."
          />
        </div>

        <Rule 
          title="Effective conclusions"
          description="A strong conclusion should:"
          examples={[
            "Summarise the main points",
            "Reaffirm your position",
            "Leave a lasting impression",
            "Provide closure for the argument"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Strong conclusions reinforce your argument and persuade the reader.
        </Tip>
      </TheorySection>

      <TheorySection title="Advanced Conditional Structures" icon="🔀">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          These conditionals let you express hypotheses and conditions in a formal, precise way.
        </p>

        <GrammarTable
          caption="Advanced Conditional Structures"
          headers={["Structure", "Use", "Example", "Gloss"]}
          rows={[
            ["Were it not for...", "Without a specific thing", "Were it not for technology, we would be lost", "If it were not for..."],
            ["Had it not been for...", "Without something in the past", "Had it not been for the rain, we would have gone", "If it had not been for..."],
            ["Should this be the case...", "If this were true", "Should this be the case, we must act", "If this turns out to be so..."],
            ["In the event that...", "If something happens", "In the event that this happens, we are ready", "Should this occur..."],
            ["Provided that...", "As long as", "Provided that the conditions are met", "On condition that..."],
            ["Unless otherwise stated...", "Except if specified", "Unless otherwise stated, this applies to all", "If not stated differently..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            english="Were it not for technology, we would be lost"
            note="Formal inverted conditional."
          />
          <Example 
            english="Had it not been for the rain, we would have gone"
            note="Past counterfactual without “if”."
          />
          <Example 
            english="Provided that the conditions are met"
            note="Specifies a requirement for the result."
          />
        </div>

        <Tip type="warning">
          <strong>Watch out:</strong> These forms are formal and most common in academic writing.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> “It's important to mention that...” (overused) ❌<br/>
            <strong>Better:</strong> “It should be noted that...” ✅<br/>
            <em>Vary your openings to avoid repetition</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> “In my opinion, I think that...” ❌<br/>
            <strong>Better:</strong> “I believe that...” or “It is my contention that...” ✅<br/>
            <em>Avoid doubling opinion markers</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> “The former and the latter” with no clear referents ❌<br/>
            <strong>Better:</strong> Ensure two items are clearly named first ✅<br/>
            <em>Readers must know what “former” and “latter” point to</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Very formal structures in informal contexts ❌<br/>
            <strong>Better:</strong> Match register to the situation ✅<br/>
            <em>Choose structures suited to the text type</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Variety in structures"
            description="Use different patterns to avoid repetition."
            examples={[
              "Alternate formal and informal structures where appropriate",
              "Vary how you introduce ideas",
              "Change how you conclude",
              "Use synonyms and parallel wording"
            ]}
          />

          <Rule 
            title="2. Consistent register"
            description="Keep a stable level of formality."
            examples={[
              "Formal: academic essays",
              "Neutral: professional reports",
              "Informal: personal emails",
              "Stay consistent within the same text"
            ]}
          />

          <Rule 
            title="3. Clarity first"
            description="Structures should improve clarity."
            examples={[
              "Choose patterns that fit the point",
              "Avoid needlessly complex wording",
              "Make sure meaning is clear",
              "Prioritise effective communication"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: '_____ that technology improves life.'"
      options={[
        "It seems to me",
        "It is widely believed",
        "I think",
        "Maybe"
      ]}
      correctAnswer={1}
      explanation="“It is widely believed” is a formal structure for a widely shared or accepted view."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which structure best expresses a firm opinion?"
      options={[
        "It seems to me that...",
        "I firmly believe that...",
        "There is reason to believe that...",
        "It should be noted that..."
      ]}
      correctAnswer={1}
      explanation="“I firmly believe that...” shows strong conviction; the others signal weaker or different stances."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'Former' refers to the first item mentioned and 'latter' to the second.",
          isTrue: true,
          explanation: "Correct. Former = first; latter = second of two items already introduced."
        },
        {
          text: "Formal structures are appropriate in every context.",
          isTrue: false,
          explanation: "Incorrect. Use formal patterns in suitable contexts such as academic essays."
        },
        {
          text: "'Were it not for...' is an advanced conditional structure.",
          isTrue: true,
          explanation: "Correct. It is a formal, inverted way to express a hypothetical condition."
        },
        {
          text: "You should always use the same structures for consistency.",
          isTrue: false,
          explanation: "Incorrect. Vary structures to reduce repetition and keep the reader engaged."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which structure is most appropriate for a conclusion?"
      options={[
        "To begin with...",
        "In conclusion, it can be said that...",
        "Furthermore, it is essential...",
        "This is due to the fact that..."
      ]}
      correctAnswer={1}
      explanation="“In conclusion, it can be said that...” is a typical way to open a concluding section."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which structure would you use to show contrast formally?"
      options={[
        "Unlike the previous example...",
        "And also...",
        "What is more important is...",
        "It is widely believed that..."
      ]}
      correctAnswer={0}
      explanation="“Unlike the previous example...” signals contrast between two examples."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Passive voice is more formal than active voice.",
          isTrue: true,
          explanation: "Correct. Passive voice is common in academic and professional writing."
        },
        {
          text: "'It is important to note that' is a useful academic phrase.",
          isTrue: true,
          explanation: "Correct. It helps introduce important points in academic texts."
        },
        {
          text: "Complex sentences always sound better than simple ones.",
          isTrue: false,
          explanation: "Incorrect. Clarity matters more than complexity; match structure to context."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: '_____ the benefits, there are also disadvantages.'"
      options={[
        "Despite",
        "Because of",
        "Due to",
        "Thanks to"
      ]}
      correctAnswer={0}
      explanation="“Despite” introduces concession: even with the benefits, there are downsides."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which structure is best for formal suggestions?"
      options={[
        "You should",
        "I suggest that you",
        "Why don't you",
        "Maybe you can"
      ]}
      correctAnswer={1}
      explanation="“I suggest that you” is appropriate for polite, formal suggestions at work."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'It is worth noting that' is useful for emphasising important points.",
          isTrue: true,
          explanation: "Correct. It highlights key points in a formal, academic tone."
        },
        {
          text: "Conditional structures are only used for hypothetical situations.",
          isTrue: false,
          explanation: "Incorrect. Conditionals also express real conditions, politeness, and suggestions."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: '_____ research shows that exercise improves health.'"
      options={[
        "Recent",
        "Recently",
        "Recents",
        "Recenting"
      ]}
      correctAnswer={0}
      explanation="“Recent research” is correct: “recent” is an adjective modifying “research”."
    />
  ];

  return (
    <TheoryLayout
      title="Useful Grammar and Structures"
      description="Master advanced grammatical structures for writing in English. Learn sophisticated patterns for introducing ideas, developing arguments, and concluding effectively."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic grammar", "Understanding of formal writing"]}
      estimatedTime="75 min"
    />
  );
};

export default UsefulGrammarAndStructuresPage;
