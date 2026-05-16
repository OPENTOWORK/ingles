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

const AdvancedConditionalsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="Advanced Conditionals" icon="🎭">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Advanced conditionals</strong> go beyond basic structures (if + will, if + would). 
          They include mixed conditionals, inversion, and alternative structures that express more sophisticated 
          nuances of possibility, probability, and regret.
        </p>
        
        <QuickReference items={[
          "Mixed conditionals: combine different tenses",
          "Inversion: formal structures without 'if'",
          "Alternatives: unless, provided that, supposing",
          "Express complex shades of meaning",
          "Essential for C1–C2 levels"
        ]} />
      </TheorySection>

      <TheorySection title="Mixed Conditionals" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Mixed conditionals combine different time frames to express complex relationships between cause and effect.
        </p>

        <GrammarTable
          caption="Types of Mixed Conditionals"
          headers={["Type", "Structure", "Use", "Example"]}
          rows={[
            ["Past → Present", "If + past perfect, would + infinitive", "Past cause, present effect", "If I had studied medicine, I would be a doctor now"],
            ["Present → Past", "If + past simple, would have + past participle", "Present/general cause, past effect", "If I were more careful, I wouldn't have broken it"],
            ["Past → Future", "If + past perfect, would + infinitive", "Past cause, future effect", "If I had saved money, I would travel next year"],
            ["Present → Future", "If + past simple, will + infinitive", "Present cause, probable future effect", "If you are late, you will miss the train"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si hubiera nacido en Francia, hablaría francés perfectamente ahora."
            english="If I had been born in France, I would speak French perfectly now."
            translation="Past cause (being born in France) → present effect (speaking French)"
          />
          
          <Example 
            spanish="Si fuera más organizado, no habría perdido las llaves ayer."
            english="If I were more organized, I wouldn't have lost my keys yesterday."
            translation="Present/general cause (being organized) → past effect (losing keys)"
          />
        </div>

        <Tip type="info">
          <strong>Key point:</strong> Mixed conditionals reflect how actions in different time frames 
          relate to each other in real life.
        </Tip>
      </TheorySection>

      <TheorySection title="Inversion in Conditionals" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          In formal English, we can omit 'if' and invert the subject and auxiliary. This is common in academic and formal writing.
        </p>

        <GrammarTable
          caption="Inversion Structures"
          headers={["Normal Conditional", "With Inversion", "Auxiliary Used"]}
          rows={[
            ["If I were you...", "Were I you...", "were"],
            ["If I had known...", "Had I known...", "had"],
            ["If you should need help...", "Should you need help...", "should"],
            ["If it were not for...", "Were it not for...", "were"],
            ["If I had not been there...", "Had I not been there...", "had"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si hubiera sabido sobre el problema..."
            english="Had I known about the problem, I would have acted differently."
            translation="Formal structure equivalent to 'If I had known...'"
          />
          
          <Example 
            spanish="Si necesitaras ayuda..."
            english="Should you need any assistance, please don't hesitate to contact us."
            translation="Formal structure for polite offers"
          />
        </div>

        <Tip type="success">
          <strong>Register:</strong> Inversion is very formal. Use it in academic writing, formal letters, 
          and professional presentations.
        </Tip>
      </TheorySection>

      <TheorySection title="Alternatives to 'If'" icon="🚪">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          There are many alternatives to 'if' that add specific nuances to conditional meaning.
        </p>

        <GrammarTable
          caption="Alternative Conditional Connectors"
          headers={["Connector", "Meaning", "Example", "Register"]}
          rows={[
            ["unless", "if not / except if", "Unless it rains, we'll go out", "Neutral"],
            ["provided (that)", "on condition that", "I'll help, provided you pay me", "Formal"],
            ["as long as", "while / on condition that", "You can stay as long as you're quiet", "Informal"],
            ["supposing", "supposing that", "Supposing he doesn't come, what then?", "Neutral"],
            ["on condition that", "on condition that", "I'll agree on condition that you sign", "Formal"],
            ["in case", "in case / just in case", "Take an umbrella in case it rains", "Neutral"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="No iré a menos que me invites."
            english="I won't go unless you invite me."
            translation="'Unless' = 'if not' (if you don't invite me)"
          />
          
          <Example 
            spanish="Puedes quedarte con tal de que ayudes."
            english="You can stay as long as you help out."
            translation="'As long as' expresses a condition with a sense of duration"
          />
        </div>

        <Tip type="warning">
          <strong>Watch out!</strong> 'Unless' already means 'if not', so don't use double negation: 
          "Unless you don't study" ❌ → "Unless you study" ✅
        </Tip>
      </TheorySection>

      <TheorySection title="Implicit Conditionals" icon="🎭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Sometimes we express conditions without using explicit conditional structures.
        </p>

        <Rule 
          title="Ways to express implicit conditions"
          description="Structures that imply a condition without 'if':"
          examples={[
            "Otherwise / Or else: 'Hurry up, otherwise you'll be late'",
            "But for: 'But for your help, I would have failed'",
            "With/Without: 'With more practice, you'd improve'",
            "Gerunds: 'Studying harder, you would pass'",
            "Participles: 'Given more time, I could finish'"
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Sin tu ayuda, habría fracasado."
            english="But for your help, I would have failed."
            translation="'But for' = 'If it weren't for'"
          />
          
          <Example 
            spanish="Con más tiempo, podría terminarlo."
            english="Given more time, I could finish it."
            translation="Participle that implies a condition"
          />
        </div>
      </TheorySection>

      <TheorySection title="Conditionals in Academic Context" icon="🎓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          In academic writing, conditionals express hypotheses, possibilities, and complex arguments.
        </p>

        <GrammarTable
          caption="Academic Functions of Conditionals"
          headers={["Function", "Structure", "Academic Example"]}
          rows={[
            ["Hypothesis", "If + were to", "If we were to increase funding, research would improve"],
            ["Speculation", "Should + happen to", "Should the experiment fail, we would need new data"],
            ["Contrast", "If... whereas if", "If theory A is correct, then X. Whereas if theory B applies, then Y"],
            ["Recommendation", "If I were you", "If I were the researcher, I would replicate the study"],
            ["Consequence", "Unless... will", "Unless we address this issue, the problem will persist"]
          ]}
        />

        <Tip type="success">
          <strong>Academic writing:</strong> Use conditionals to explore different scenarios, 
          present hypotheses, and discuss theoretical implications.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Advanced Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "If I would have known..." ❌<br/>
            <strong>Correct:</strong> "If I had known..." or "Had I known..." ✅<br/>
            <em>Don't use 'would' in the if-clause</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Unless you won't come..." ❌<br/>
            <strong>Correct:</strong> "Unless you come..." ✅<br/>
            <em>'Unless' already implies negation</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Mixing tenses incorrectly in mixed conditionals ❌<br/>
            <strong>Correct:</strong> Ensure clear temporal logic ✅<br/>
            <em>The time relationship must make sense</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using inversion in informal context ❌<br/>
            <strong>Correct:</strong> Reserve inversion for formal writing ✅<br/>
            <em>Know the appropriate register</em>
          </Tip>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: '_____ I been born in a different era, I would be living differently now.'"
      options={[
        "If",
        "Had",
        "Were",
        "Should"
      ]}
      correctAnswer={1}
      explanation="'Had I been born' is the formal inversion of 'If I had been born' in mixed conditionals."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which sentence correctly expresses a mixed conditional (past cause, present effect)?"
      options={[
        "If I studied harder, I would have passed the exam.",
        "If I had studied harder, I would pass all my exams now.",
        "If I had studied harder, I would have passed the exam.",
        "If I study harder, I will pass the exam."
      ]}
      correctAnswer={1}
      explanation="This structure combines a past cause (had studied) with a present effect (would pass now)."
    />,

    <MultipleChoiceExercise
      key="3"
      question="What is the formal inversion equivalent of 'If you should have any questions'?"
      options={[
        "Should you have any questions",
        "Would you have any questions", 
        "Had you any questions",
        "Were you to have questions"
      ]}
      correctAnswer={0}
      explanation="'Should you have' is the correct formal inversion of 'If you should have'."
    />,

    <TrueFalseExercise
      key="4"
      statements={[
        {
          text: "'Unless' means the same as 'if not'.",
          isTrue: true,
          explanation: "Correct. 'Unless' is equivalent to 'if not'."
        },
        {
          text: "Mixed conditionals can combine different time periods.",
          isTrue: true,
          explanation: "Correct. Mixed conditionals relate different time frames."
        },
        {
          text: "Inversion in conditionals is commonly used in informal speech.",
          isTrue: false,
          explanation: "False. Inversion is a formal structure, not informal."
        },
        {
          text: "'But for' can be used to express implicit conditions.",
          isTrue: true,
          explanation: "Correct. 'But for' expresses implicit conditions."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="5"
      question="Complete: 'I'll lend you the money _____ you promise to pay me back next week.'"
      options={[
        "unless",
        "provided that",
        "in case",
        "supposing"
      ]}
      correctAnswer={1}
      explanation="'Provided that' expresses a specific condition that must be met."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: '_____ it not for the rain, we would go to the beach.'"
      options={[
        "If",
        "Were",
        "Had",
        "Should"
      ]}
      correctAnswer={1}
      explanation="'Were it not for' is the formal inversion of 'If it were not for'."
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which expresses a present cause with a past effect?"
      options={[
        "If I were more careful, I wouldn't have broken it.",
        "If I had been more careful, I wouldn't break things.",
        "If I am more careful, I won't break it.",
        "If I were more careful, I wouldn't break it."
      ]}
      correctAnswer={0}
      explanation="Present (were more careful) → past (wouldn't have broken) is a mixed conditional."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: '_____ the circumstances been different, the outcome would have changed.'"
      options={[
        "If",
        "Had",
        "Were",
        "Should"
      ]}
      correctAnswer={1}
      explanation="'Had the circumstances been different' is the formal inversion of 'If the circumstances had been different'."
    />,

    <MultipleChoiceExercise
      key="9"
      question="Complete: 'I'd rather you _____ told me earlier.'"
      options={[
        "have",
        "had",
        "would have",
        "will have"
      ]}
      correctAnswer={1}
      explanation="'I'd rather you had told me' expresses a preference about something that didn't happen in the past."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Which sentence uses 'unless' correctly?"
      options={[
        "Unless you won't study, you'll fail.",
        "Unless you don't study, you'll pass.",
        "Unless you study, you'll fail.",
        "Unless you will study, you'll fail."
      ]}
      correctAnswer={2}
      explanation="'Unless' already implies negation, so you don't need 'don't' or 'won't'."
    />
  ];

  return (
    <TheoryLayout
      title="Advanced Conditionals"
      description="Master advanced conditional structures: mixed conditionals, inversion, alternatives to 'if', and implicit conditionals to express complex ideas."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic conditionals", "Advanced verb tenses", "Subjunctive"]}
      estimatedTime="60 min"
    />
  );
};

export default AdvancedConditionalsPage;
