'use client';
import { buildQuestionFormationExercises } from './questionFormationExercises';
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


const QuestionFormationPage = () => {
  const theoryContent = (
    <>
      <TheorySection title="Question Formation in English" icon="❓">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Question formation</strong> in English follows specific patterns that vary depending on the type 
          of question and the verb tense. Mastering these structures is essential for effective communication 
          and English exams.
        </p>
        
        <QuickReference items={[
          "Yes/No questions: auxiliary + subject + main verb",
          "Wh-questions: question word + auxiliary + subject + verb",
          "Subject questions: no auxiliary needed",
          "Question tags: confirm information",
          "Indirect questions: more formal and polite"
        ]} />
      </TheorySection>

      <TheorySection title="Yes/No Questions" icon="✅❌">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Yes/no questions require an auxiliary and are answered with yes or no.
        </p>

        <GrammarTable
          caption="Yes/No Question Structure"
          headers={["Tense", "Structure", "Example", "Answer"]}
          rows={[
            ["Present Simple", "Do/Does + subject + base verb", "Do you like coffee?", "Yes, I do / No, I don't"],
            ["Past Simple", "Did + subject + base verb", "Did she call you?", "Yes, she did / No, she didn't"],
            ["Present Continuous", "Am/Is/Are + subject + verb-ing", "Are you working?", "Yes, I am / No, I'm not"],
            ["Present Perfect", "Have/Has + subject + past participle", "Have you finished?", "Yes, I have / No, I haven't"],
            ["Future Simple", "Will + subject + base verb", "Will they come?", "Yes, they will / No, they won't"],
            ["Modal Verbs", "Modal + subject + base verb", "Can you swim?", "Yes, I can / No, I can't"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="¿Hablas español?"
            english="Do you speak Spanish?"
          />
          
          <Example 
            spanish="¿Está lloviendo?"
            english="Is it raining?"
          />
        </div>

        <Tip type="info">
          <strong>Remember:</strong> With the verb &apos;to be&apos; you do not need an auxiliary: &quot;Are you happy?&quot; (not &quot;Do you are happy?&quot;)
        </Tip>
      </TheorySection>

      <TheorySection title="Wh-Questions" icon="🔍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Questions with wh-words ask for specific information.
        </p>

        <GrammarTable
          caption="Question Words"
          headers={["Wh-word", "Asks about", "Example", "Typical answer"]}
          rows={[
            ["What", "Things, actions", "What do you do?", "I'm a teacher"],
            ["Where", "Place", "Where do you live?", "In Madrid"],
            ["When", "Time", "When did you arrive?", "Yesterday"],
            ["Who", "People (subject)", "Who called you?", "My mother"],
            ["Whom", "People (object, formal)", "Whom did you see?", "The manager"],
            ["Why", "Reason", "Why are you late?", "Traffic was bad"],
            ["How", "Manner, method", "How do you cook this?", "In the oven"],
            ["Which", "Choice between options", "Which car is yours?", "The blue one"]
          ]}
        />

        <Rule 
          title="Wh-Question Structure"
          description="General pattern: Wh-word + auxiliary + subject + main verb"
          examples={[
            "What do you want?",
            "Where did she go?",
            "When will they arrive?",
            "How are you feeling?"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> When &apos;who&apos; is the subject, do not use an auxiliary: 
          &quot;Who lives here?&quot; ✅ (not &quot;Who does live here?&quot; ❌)
        </Tip>
      </TheorySection>

      <TheorySection title="Subject vs Object Questions" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The difference between subject and object questions affects grammatical structure.
        </p>

        <GrammarTable
          caption="Subject vs Object Questions"
          headers={["Type", "Structure", "Example", "Explanation"]}
          rows={[
            ["Subject Question", "Who/What + verb + object", "Who broke the window?", "Asks who performed the action"],
            ["Object Question", "Who/What + auxiliary + subject + verb", "Who did you see?", "Asks about the receiver of the action"],
            ["Subject Question", "What + verb + object", "What happened?", "Asks what occurred"],
            ["Object Question", "What + auxiliary + subject + verb", "What did you buy?", "Asks what you bought"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="¿Quién rompió la ventana? (sujeto)"
            english="Who broke the window?"
          />
          
          <Example 
            spanish="¿A quién viste? (objeto)"
            english="Who did you see?"
          />
        </div>
      </TheorySection>

      <TheorySection title="Question Tags" icon="🏷️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Question tags are added at the end of sentences to confirm information or seek agreement.
        </p>

        <Rule 
          title="Rules for Question Tags"
          description="Basic patterns for forming question tags:"
          examples={[
            "Positive sentence → negative tag: 'You like coffee, don't you?'",
            "Negative sentence → positive tag: 'You don't smoke, do you?'",
            "Use the same auxiliary as in the main sentence",
            "If there is no auxiliary, use do/does/did",
            "With 'I am' → 'aren't I?' (exception)"
          ]}
        />

        <GrammarTable
          caption="Common Question Tags"
          headers={["Main Sentence", "Question Tag", "Full Example"]}
          rows={[
            ["You are tired", "aren't you?", "You are tired, aren't you?"],
            ["She doesn't live here", "does she?", "She doesn't live here, does she?"],
            ["They have finished", "haven't they?", "They have finished, haven't they?"],
            ["He can swim", "can't he?", "He can swim, can't he?"],
            ["We should go", "shouldn't we?", "We should go, shouldn't we?"],
            ["I am right", "aren't I?", "I am right, aren't I?"]
          ]}
        />

        <Tip type="success">
          <strong>Intonation:</strong> If you expect confirmation, use falling intonation. 
          If you genuinely do not know, use rising intonation.
        </Tip>
      </TheorySection>

      <TheorySection title="Indirect Questions" icon="🎭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Indirect questions are more polite and formal, especially useful in professional situations.
        </p>

        <GrammarTable
          caption="Structures for Indirect Questions"
          headers={["Introductory Phrase", "Structure", "Example"]}
          rows={[
            ["Could you tell me", "...where the station is?", "Could you tell me where the station is?"],
            ["Do you know", "...what time it is?", "Do you know what time it is?"],
            ["I wonder", "...if you could help me", "I wonder if you could help me"],
            ["Would you mind telling me", "...how much this costs?", "Would you mind telling me how much this costs?"],
            ["I'd like to know", "...whether they're coming", "I'd like to know whether they're coming"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Pregunta directa: ¿Dónde está el banco?"
            english="Direct: Where is the bank?"
          />
          
          <Example 
            spanish="Pregunta indirecta: ¿Podrías decirme dónde está el banco?"
            english="Indirect: Could you tell me where the bank is?"
          />
        </div>

        <Tip type="info">
          <strong>Word order:</strong> In indirect questions, use affirmative word order after 
          the question word: &quot;where the bank is&quot; (not &quot;where is the bank&quot;).
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> &quot;Do you are happy?&quot; ❌<br/>
            <strong>Correct:</strong> &quot;Are you happy?&quot; ✅<br/>
            <em>With &apos;to be&apos; do not use the auxiliary &apos;do&apos;</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> &quot;Who does live here?&quot; ❌<br/>
            <strong>Correct:</strong> &quot;Who lives here?&quot; ✅<br/>
            <em>In subject questions do not use an auxiliary</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> &quot;Where do you come from?&quot; vs &quot;Where are you from?&quot; <br/>
            <strong>Both correct:</strong> But &quot;Where are you from?&quot; is more common ✅<br/>
            <em>Some questions have alternative forms</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> &quot;Could you tell me where is the bank?&quot; ❌<br/>
            <strong>Correct:</strong> &quot;Could you tell me where the bank is?&quot; ✅<br/>
            <em>In indirect questions use affirmative word order</em>
          </Tip>
        </div>
      </TheorySection>
    </>
  );

    return (
    <TheoryLayout
      title="Question Formation"
      description="Master question formation in English: yes/no questions, wh-questions, question tags, and indirect questions for precise communication."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildQuestionFormationExercises}
      prerequisites={["Basic verb tenses", "Auxiliaries", "Pronouns"]}
      estimatedTime="50 min"
    />
  );
};

export default QuestionFormationPage;
