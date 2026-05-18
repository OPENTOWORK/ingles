'use client';
import { buildReportedSpeechExercises } from './reportedSpeechExercises';
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


const ReportedSpeechPage = () => {
  const theoryContent = (
    <>
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
          />
          <Example 
            spanish="Dijo: 'Estoy estudiando' → Dijo que estaba estudiando"
            english="'I am studying' → He said he was studying"
          />
          <Example 
            spanish="Dijo: 'He terminado' → Dijo que había terminado"
            english="'I have finished' → He said he had finished"
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
          />
          <Example 
            spanish="Dijo: '¿Puedes ayudarme?' → Preguntó si podía ayudarle"
            english="'Can you help me?' → He asked if I could help him"
          />
          <Example 
            spanish="Dijo: 'Nuestro proyecto está listo' → Dijo que su proyecto estaba listo"
            english="'Our project is ready' → He said their project was ready"
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
          />
          <Example 
            spanish="Dijo: 'Vine ayer' → Dijo que había venido el día anterior"
            english="'I came yesterday' → He said he had come the day before"
          />
          <Example 
            spanish="Dijo: 'Estoy aquí' → Dijo que estaba allí"
            english="'I'm here' → He said he was there"
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
          />
          <Example 
            spanish="Preguntó si venía"
            english="He asked if I was coming"
          />
          <Example 
            spanish="Me dijo que viniera"
            english="He told me to come"
          />
          <Example 
            spanish="Me aconsejó estudiar"
            english="He advised me to study"
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
          />
          <Example 
            spanish="Preguntó: '¿Dónde vives?' → Preguntó dónde vivía"
            english="'Where do you live?' → He asked where I lived"
          />
          <Example 
            spanish="Preguntó: '¿Cómo estás?' → Preguntó cómo estaba"
            english="'How are you?' → He asked how I was"
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
    </>
  );

    return (
    <TheoryLayout
      title="Reported Speech"
      description="Master reported speech in English. Learn how to report what others said, shift verb tenses, and use reporting verbs correctly."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={buildReportedSpeechExercises}
      prerequisites={["All verb tenses", "Question forms", "Modal verbs"]}
      estimatedTime="85 min"
    />
  );
};

export default ReportedSpeechPage;
