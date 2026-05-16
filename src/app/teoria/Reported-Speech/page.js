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

const ReportedSpeechPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Is Reported Speech?" icon="💬">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Reported speech</strong> (indirect speech) is used to report or repeat what someone else 
          said without using their exact words. It involves changes to verb tenses, pronouns, time and place 
          adverbs, and sentence structure.
        </p>
        
        <QuickReference items={[
          "Report what other people said",
          "Change verb tenses",
          "Change pronouns and adverbs",
          "Use reporting verbs",
          "Do not use quotation marks"
        ]} />
      </TheorySection>

      <TheorySection title="Verb Tense Changes" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Verb tenses shift back when we report something that was said in the past.
        </p>

        <GrammarTable
          caption="Verb Tense Changes"
          headers={["Direct Speech", "Reported Speech", "Example"]}
          rows={[
            ["Present Simple", "Past Simple", "I work → He said he worked"],
            ["Present Continuous", "Past Continuous", "I am working → He said he was working"],
            ["Present Perfect", "Past Perfect", "I have worked → He said he had worked"],
            ["Past Simple", "Past Perfect", "I worked → He said he had worked"],
            ["Will", "Would", "I will work → He said he would work"],
            ["Can", "Could", "I can work → He said he could work"],
            ["May", "Might", "I may work → He said he might work"],
            ["Must", "Had to", "I must work → He said he had to work"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Dijo: 'Trabajo en una oficina' → Dijo que trabajaba en una oficina"
            english="'I work in an office' → He said he worked in an office"
            translation="He said: 'I work in an office' → He said he worked in an office"
          />
          <Example 
            spanish="Dijo: 'Estoy estudiando' → Dijo que estaba estudiando"
            english="'I am studying' → He said he was studying"
            translation="He said: 'I'm studying' → He said he was studying"
          />
          <Example 
            spanish="Dijo: 'He terminado' → Dijo que había terminado"
            english="'I have finished' → He said he had finished"
            translation="He said: 'I've finished' → He said he had finished"
          />
        </div>

        <Rule 
          title="The 'Backshift' Rule"
          description="Verb tenses move further into the past:"
          examples={[
            "Present → Past",
            "Past → Past Perfect",
            "Future → Conditional",
            "Modals → Past forms"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> If the reporting verb is in the present (says, tells), do not change the verb tenses.
        </Tip>
      </TheorySection>

      <TheorySection title="Pronoun Changes" icon="👤">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Pronouns change to reflect the perspective of the person reporting.
        </p>

        <GrammarTable
          caption="Pronoun Changes"
          headers={["Direct Speech", "Reported Speech", "Explanation"]}
          rows={[
            ["I", "he/she", "Changes depending on who spoke"],
            ["you", "I/he/she/they", "Changes depending on context"],
            ["my", "his/her", "Possessive changes with the pronoun"],
            ["your", "my/his/her", "Possessive changes with context"],
            ["we", "they", "The group that spoke"],
            ["our", "their", "Group possessive"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Dijo: 'Mi coche está roto' → Dijo que su coche estaba roto"
            english="'My car is broken' → He said his car was broken"
            translation="He said: 'My car is broken' → He said his car was broken"
          />
          <Example 
            spanish="Dijo: '¿Puedes ayudarme?' → Preguntó si podía ayudarle"
            english="'Can you help me?' → He asked if I could help him"
            translation="He said: 'Can you help me?' → He asked if I could help him"
          />
          <Example 
            spanish="Dijo: 'Nuestro proyecto está listo' → Dijo que su proyecto estaba listo"
            english="'Our project is ready' → He said their project was ready"
            translation="He said: 'Our project is ready' → He said their project was ready"
          />
        </div>

        <Rule 
          title="Rules for Pronouns"
          description="Keep these rules in mind:"
          examples={[
            "Change pronouns based on who originally spoke",
            "Consider the context of the conversation",
            "Stay consistent throughout the report",
            "If unclear, keep the original pronoun"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Pronouns can be tricky. Always think about who said what to whom.
        </Tip>
      </TheorySection>

      <TheorySection title="Adverb Changes" icon="📍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Time and place adverbs change to reflect the new time perspective.
        </p>

        <GrammarTable
          caption="Time Adverb Changes"
          headers={["Direct Speech", "Reported Speech", "Explanation"]}
          rows={[
            ["now", "then", "Current moment → Past moment"],
            ["today", "that day", "Current day → Specific day"],
            ["yesterday", "the day before", "Yesterday → The previous day"],
            ["tomorrow", "the next day", "Tomorrow → The following day"],
            ["last week", "the week before", "Last week → The week before"],
            ["next month", "the following month", "Next month → The following month"],
            ["here", "there", "Here → There"],
            ["this", "that", "This → That"],
            ["these", "those", "These → Those"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Dijo: 'Voy ahora' → Dijo que iba entonces"
            english="'I'm going now' → He said he was going then"
            translation="He said: 'I'm going now' → He said he was going then"
          />
          <Example 
            spanish="Dijo: 'Vine ayer' → Dijo que había venido el día anterior"
            english="'I came yesterday' → He said he had come the day before"
            translation="He said: 'I came yesterday' → He said he had come the day before"
          />
          <Example 
            spanish="Dijo: 'Estoy aquí' → Dijo que estaba allí"
            english="'I'm here' → He said he was there"
            translation="He said: 'I'm here' → He said he was there"
          />
        </div>

        <Rule 
          title="Rules for Adverbs"
          description="Keep these rules in mind:"
          examples={[
            "Shift time adverbs toward the past",
            "Change place adverbs to match perspective",
            "Some adverbs do not change (always, never)",
            "Context decides whether a change is needed"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> If you report what was said immediately afterward, some changes may not be necessary.
        </Tip>
      </TheorySection>

      <TheorySection title="Reporting Verbs" icon="🗣️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Different verbs are used to report speech depending on the type of statement.
        </p>

        <GrammarTable
          caption="Common Reporting Verbs"
          headers={["Type", "Verbs", "Structure", "Example"]}
          rows={[
            ["Statements", "say, tell, mention", "say/tell + that", "He said that he was tired"],
            ["Questions", "ask, wonder, inquire", "ask + if/whether", "He asked if I was coming"],
            ["Orders", "tell, order, command", "tell + to + infinitive", "He told me to come"],
            ["Advice", "advise, recommend", "advise + to + infinitive", "He advised me to study"],
            ["Promises", "promise, agree", "promise + to + infinitive", "He promised to help"],
            ["Refusals", "refuse, deny", "refuse + to + infinitive", "He refused to go"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Dijo que estaba cansado"
            english="He said he was tired"
            translation="He said he was tired"
          />
          <Example 
            spanish="Preguntó si venía"
            english="He asked if I was coming"
            translation="He asked if I was coming"
          />
          <Example 
            spanish="Me dijo que viniera"
            english="He told me to come"
            translation="He told me to come"
          />
          <Example 
            spanish="Me aconsejó estudiar"
            english="He advised me to study"
            translation="He advised me to study"
          />
        </div>

        <Rule 
          title="Structures with Reporting Verbs"
          description="Different structures depending on the verb:"
          examples={[
            "say + that + clause",
            "tell + person + that + clause",
            "ask + if/whether + clause",
            "tell/ask + person + to + infinitive"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> 'Tell' always needs an indirect object (tell me, tell him), but 'say' does not.
        </Tip>
      </TheorySection>

      <TheorySection title="Reported Questions" icon="❓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Reported questions change the structure and use 'if' or 'whether' for yes/no questions.
        </p>

        <GrammarTable
          caption="Types of Reported Questions"
          headers={["Type", "Direct Speech", "Reported Speech"]}
          rows={[
            ["Yes/No", "'Are you coming?'", "He asked if I was coming"],
            ["Yes/No", "'Do you like coffee?'", "He asked whether I liked coffee"],
            ["Wh-", "'Where do you live?'", "He asked where I lived"],
            ["Wh-", "'What time is it?'", "He asked what time it was"],
            ["Wh-", "'How are you?'", "He asked how I was"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Preguntó: '¿Vienes?' → Preguntó si venía"
            english="'Are you coming?' → He asked if I was coming"
            translation="He asked: 'Are you coming?' → He asked if I was coming"
          />
          <Example 
            spanish="Preguntó: '¿Dónde vives?' → Preguntó dónde vivía"
            english="'Where do you live?' → He asked where I lived"
            translation="He asked: 'Where do you live?' → He asked where I lived"
          />
          <Example 
            spanish="Preguntó: '¿Cómo estás?' → Preguntó cómo estaba"
            english="'How are you?' → He asked how I was"
            translation="He asked: 'How are you?' → He asked how I was"
          />
        </div>

        <Rule 
          title="Rules for Reported Questions"
          description="Important changes:"
          examples={[
            "Do not use question marks",
            "Use 'if' or 'whether' for yes/no questions",
            "Keep question words (where, what, how)",
            "Switch to affirmative word order"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Reported questions do not use question marks or do/does/did auxiliaries.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Mistake:</strong> Not changing verb tenses ❌<br/>
            <strong>Correct:</strong> Apply backshift ✅<br/>
            <em>He said he is tired. → He said he was tired.</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Using quotation marks in reported speech ❌<br/>
            <strong>Correct:</strong> Do not use quotation marks ✅<br/>
            <em>He said "I am tired". → He said he was tired.</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Confusing say and tell ❌<br/>
            <strong>Correct:</strong> Tell needs an indirect object ✅<br/>
            <em>He told he was tired. → He said he was tired. / He told me he was tired.</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Keeping question marks ❌<br/>
            <strong>Correct:</strong> Remove question marks ✅<br/>
            <em>He asked if I was coming? → He asked if I was coming.</em>
          </Tip>

          <Tip type="error">
            <strong>Mistake:</strong> Not changing pronouns ❌<br/>
            <strong>Correct:</strong> Change them to match perspective ✅<br/>
            <em>He said I am tired. → He said he was tired.</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Key Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Tense backshift"
            description="Verb tenses move further into the past:"
            examples={[
              "Present → Past",
              "Past → Past Perfect",
              "Future → Conditional",
              "Exception: if the reporting verb is in the present"
            ]}
          />

          <Rule 
            title="2. Perspective changes"
            description="Change pronouns and adverbs:"
            examples={[
              "Pronouns based on who spoke",
              "Time adverbs shift toward the past",
              "Place adverbs match perspective",
              "Consider context"
            ]}
          />

          <Rule 
            title="3. Question structure"
            description="Reported questions change structure:"
            examples={[
              "Use 'if' or 'whether' for yes/no",
              "Keep question words",
              "Affirmative word order",
              "No question marks"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete the reported speech: He said: 'I am tired' → He said he _____ tired."
      options={[
        "is",
        "was",
        "will be",
        "has been"
      ]}
      correctAnswer={1}
      explanation="In reported speech, 'am' becomes 'was' when we report in the past."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What is the reported speech of 'I will come tomorrow'?"
      options={[
        "He said he will come tomorrow.",
        "He said he would come the next day.",
        "He said he would come tomorrow.",
        "He said he comes tomorrow."
      ]}
      correctAnswer={1}
      explanation="The correct reported speech changes 'will' to 'would' and 'tomorrow' to 'the next day': 'He said he would come the next day.'"
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "In reported speech, you should use quotation marks to show the exact words.",
          isTrue: false,
          explanation: "Incorrect. Reported speech does not use quotation marks because you are not quoting the exact words, but reporting what was said."
        },
        {
          text: "When reporting questions, you should keep the question mark.",
          isTrue: false,
          explanation: "Incorrect. Reported questions do not use question marks because they become statements in reported speech."
        },
        {
          text: "The verb 'tell' requires an indirect object, but 'say' does not.",
          isTrue: true,
          explanation: "Correct. 'Tell' always needs an indirect object (tell me, tell him), while 'say' can be used without one."
        },
        {
          text: "If the reporting verb is in present tense, you don't need to change the verb tenses in reported speech.",
          isTrue: true,
          explanation: "Correct. When the reporting verb is in present tense (says, tells), the verb tenses in reported speech usually remain the same."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the correct reported speech of 'Where do you live?'"
      options={[
        "He asked where do I live?",
        "He asked where I lived.",
        "He asked where did I live?",
        "He asked where I live."
      ]}
      correctAnswer={1}
      explanation="The correct reported speech is 'He asked where I lived' - it uses the word order of a statement and changes the tense to past."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which sentence correctly reports 'I can't come to the party'?"
      options={[
        "He said he can't come to the party.",
        "He said he couldn't come to the party.",
        "He said he won't come to the party.",
        "He said he doesn't come to the party."
      ]}
      correctAnswer={1}
      explanation="The correct reported speech changes 'can't' to 'couldn't': 'He said he couldn't come to the party.'"
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "'Today' changes to 'that day' in reported speech.",
          isTrue: true,
          explanation: "Correct. Time adverbs change: today → that day, yesterday → the day before."
        },
        {
          text: "We use 'if' or 'whether' for yes/no questions in reported speech.",
          isTrue: true,
          explanation: "Correct. 'Are you coming?' → 'He asked if/whether I was coming.'"
        },
        {
          text: "Modal verbs never change in reported speech.",
          isTrue: false,
          explanation: "Incorrect. Some modals change: will → would, can → could, may → might."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'I will help you' → He said he _____ help me."
      options={[
        "will",
        "would",
        "can",
        "could"
      ]}
      correctAnswer={1}
      explanation="'Will' becomes 'would' in reported speech: 'He said he would help me.'"
    />,

    <MultipleChoiceExercise
      key="8"
      question="Transform: 'Don't be late!' → She told me ______."
      options={[
        "don't be late",
        "not to be late",
        "to not be late",
        "not be late"
      ]}
      correctAnswer={1}
      explanation="Negative imperatives are reported with 'told + object + not to + infinitive'."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Here' changes to 'there' in reported speech.",
          isTrue: true,
          explanation: "Correct. Place adverbs change with perspective: here → there."
        },
        {
          text: "Present Perfect changes to Past Perfect in reported speech.",
          isTrue: true,
          explanation: "Correct. 'I have finished' → 'He said he had finished.'"
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'Are you ready?' → She asked me ______."
      options={[
        "am I ready",
        "if I was ready",
        "if am I ready",
        "was I ready"
      ]}
      correctAnswer={1}
      explanation="Yes/no questions are reported with 'if/whether' + affirmative order: 'if I was ready'."
    />
  ];

  return (
    <TheoryLayout
      title="Reported Speech"
      description="Master reported speech in English. Learn how to report what others said, shift verb tenses, and use reporting verbs correctly."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["All verb tenses", "Question forms", "Modal verbs"]}
      estimatedTime="85 min"
    />
  );
};

export default ReportedSpeechPage;
