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

const PassiveVoicePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Is the Passive Voice?" icon="🔄">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The <strong>passive voice</strong> is a grammatical structure where the object of the action 
          becomes the subject of the sentence. It is used when the agent (who performs the action) is unknown, 
          unimportant, or when we want to emphasise the action rather than who performs it.
        </p>
        
        <QuickReference items={[
          "Shifts the focus of the sentence",
          "Object becomes the subject",
          "Uses 'be' + past participle",
          "Optional agent with 'by'",
          "Common in academic texts"
        ]} />
      </TheorySection>

      <TheorySection title="Basic Structure" icon="🔧">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The passive voice is formed with the verb 'be' + past participle of the main verb.
        </p>

        <GrammarTable
          caption="Passive Voice Structure"
          headers={["Element", "Function", "Example"]}
          rows={[
            ["Subject", "Object of the active action", "The book"],
            ["Verb 'be'", "Matches the tense", "is/was/will be"],
            ["Past participle", "Main verb", "written"],
            ["Agent (optional)", "Who performs the action", "by the author"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="El libro fue escrito por el autor"
            english="The book was written by the author"
            translation="The book was written by the author"
          />
          <Example 
            spanish="La casa es construida por los trabajadores"
            english="The house is being built by the workers"
            translation="The house is being built by the workers"
          />
          <Example 
            spanish="El proyecto será terminado mañana"
            english="The project will be finished tomorrow"
            translation="The project will be finished tomorrow"
          />
        </div>

        <Rule 
          title="Basic Formation"
          description="To form the passive voice:"
          examples={[
            "Identify the object of the active sentence",
            "Turn it into the subject of the passive",
            "Use 'be' in the appropriate tense",
            "Add the past participle of the verb"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> The agent (who performs the action) is optional in the passive voice.
        </Tip>
      </TheorySection>

      <TheorySection title="Passive Voice in Different Tenses" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The passive voice can be used in all verb tenses.
        </p>

        <GrammarTable
          caption="Passive Voice in Different Tenses"
          headers={["Tense", "Structure", "Example"]}
          rows={[
            ["Present Simple", "am/is/are + participle", "The letter is written"],
            ["Past Simple", "was/were + participle", "The letter was written"],
            ["Future Simple", "will be + participle", "The letter will be written"],
            ["Present Perfect", "have/has been + participle", "The letter has been written"],
            ["Past Perfect", "had been + participle", "The letter had been written"],
            ["Present Continuous", "am/is/are being + participle", "The letter is being written"],
            ["Past Continuous", "was/were being + participle", "The letter was being written"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="La carta es escrita (presente)"
            english="The letter is written"
            translation="The letter is written (present)"
          />
          <Example 
            spanish="La carta fue escrita ayer (pasado)"
            english="The letter was written yesterday"
            translation="The letter was written yesterday (past)"
          />
          <Example 
            spanish="La carta será escrita mañana (futuro)"
            english="The letter will be written tomorrow"
            translation="The letter will be written tomorrow (future)"
          />
          <Example 
            spanish="La carta ha sido escrita (perfecto)"
            english="The letter has been written"
            translation="The letter has been written (perfect)"
          />
        </div>

        <Rule 
          title="Agreement of the Verb 'Be'"
          description="The verb 'be' must agree with:"
          examples={[
            "The subject (singular/plural)",
            "The verb tense",
            "The person (1st, 2nd, 3rd)",
            "The aspect (simple, continuous, perfect)"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Practise the passive voice in different tenses to master it fully.
        </Tip>
      </TheorySection>

      <TheorySection title="When to Use the Passive Voice" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          There are specific situations where the passive voice is more appropriate than the active voice.
        </p>

        <GrammarTable
          caption="Situations for Using the Passive Voice"
          headers={["Situation", "Reason", "Example"]}
          rows={[
            ["Unknown agent", "We don't know who did the action", "My car was stolen"],
            ["Irrelevant agent", "Who did it doesn't matter", "English is spoken here"],
            ["Focus on the action", "The action is more important", "The building was destroyed"],
            ["Avoid responsibility", "We don't want to mention who", "Mistakes were made"],
            ["Academic texts", "Formal, impersonal style", "The data was analyzed"],
            ["General processes", "Describing processes", "Coffee is grown in Brazil"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Mi coche fue robado (no sabemos quién)"
            english="My car was stolen"
            translation="My car was stolen (we don't know who)"
          />
          <Example 
            spanish="Se habla inglés aquí (no importa quién)"
            english="English is spoken here"
            translation="English is spoken here (who doesn't matter)"
          />
          <Example 
            spanish="El edificio fue destruido (enfoque en la acción)"
            english="The building was destroyed"
            translation="The building was destroyed (focus on the action)"
          />
        </div>

        <Rule 
          title="Advantages of the Passive Voice"
          description="The passive voice is useful for:"
          examples={[
            "Creating a more formal tone",
            "Focusing on the result",
            "Avoiding mentioning the agent",
            "Writing academic texts"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> In academic and scientific writing, the passive voice is very common because it sounds more objective.
        </Tip>
      </TheorySection>

      <TheorySection title="Passive Voice with Two Objects" icon="📦">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Some verbs can have two objects (direct and indirect). In the passive voice, either can be the subject.
        </p>

        <GrammarTable
          caption="Verbs with Two Objects"
          headers={["Verb", "Active Sentence", "Passive 1", "Passive 2"]}
          rows={[
            ["give", "He gave me a book", "I was given a book", "A book was given to me"],
            ["send", "She sent him an email", "He was sent an email", "An email was sent to him"],
            ["show", "They showed us the photos", "We were shown the photos", "The photos were shown to us"],
            ["tell", "She told me the truth", "I was told the truth", "The truth was told to me"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me dieron un libro"
            english="I was given a book"
            translation="I was given a book"
          />
          <Example 
            spanish="Un libro me fue dado"
            english="A book was given to me"
            translation="A book was given to me"
          />
          <Example 
            spanish="Nos mostraron las fotos"
            english="We were shown the photos"
            translation="We were shown the photos"
          />
        </div>

        <Rule 
          title="Choosing the Subject"
          description="To choose which object to use as the subject:"
          examples={[
            "Indirect object: more natural in conversation",
            "Direct object: more formal",
            "Consider the context",
            "Keep consistency throughout the text"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> When you use the direct object as the subject, add 'to' or 'for' before the indirect object.
        </Tip>
      </TheorySection>

      <TheorySection title="Passive Voice with Modals" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Modal verbs can also be used in the passive voice.
        </p>

        <GrammarTable
          caption="Passive Voice with Modals"
          headers={["Modal", "Structure", "Example"]}
          rows={[
            ["can", "can be + participle", "This can be done"],
            ["could", "could be + participle", "This could be done"],
            ["must", "must be + participle", "This must be done"],
            ["should", "should be + participle", "This should be done"],
            ["may", "may be + participle", "This may be done"],
            ["might", "might be + participle", "This might be done"],
            ["have to", "have to be + participle", "This has to be done"],
            ["be going to", "be going to be + participle", "This is going to be done"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Esto puede ser hecho"
            english="This can be done"
            translation="This can be done"
          />
          <Example 
            spanish="Esto debe ser terminado"
            english="This must be finished"
            translation="This must be finished"
          />
          <Example 
            spanish="Esto debería ser considerado"
            english="This should be considered"
            translation="This should be considered"
          />
        </div>

        <Rule 
          title="Structure with Modals"
          description="To form the passive voice with modals:"
          examples={[
            "Modal + be + past participle",
            "Does not change according to person",
            "Keeps the meaning of the modal",
            "Optional agent with 'by'"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> Passive voice with modals is very useful for expressing obligations, possibilities, and advice.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Forgetting the verb 'be' ❌<br/>
            <strong>Correct:</strong> Include 'be' in the appropriate tense ✅<br/>
            <em>The house built yesterday. → The house was built yesterday.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using the wrong participle form ❌<br/>
            <strong>Correct:</strong> Use the correct past participle ✅<br/>
            <em>The letter was write. → The letter was written.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Incorrect agreement of 'be' ❌<br/>
            <strong>Correct:</strong> 'Be' must agree with the subject ✅<br/>
            <em>The letters was sent. → The letters were sent.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using passive voice unnecessarily ❌<br/>
            <strong>Correct:</strong> Use active voice when it is clearer ✅<br/>
            <em>The teacher was hit by the student. → The student hit the teacher.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Confusing 'by' and 'with' ❌<br/>
            <strong>Correct:</strong> 'By' for agent, 'with' for instrument ✅<br/>
            <em>The door was opened with a key by John. → The door was opened by John with a key.</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Basic structure"
            description="The passive voice always includes:"
            examples={[
              "Subject (object of the active action)",
              "Verb 'be' in the appropriate tense",
              "Past participle of the main verb",
              "Optional agent with 'by'"
            ]}
          />

          <Rule 
            title="2. Agreement"
            description="The verb 'be' must agree:"
            examples={[
              "With the subject (singular/plural)",
              "With the verb tense",
              "With the person",
              "With the aspect (simple, continuous, perfect)"
            ]}
          />

          <Rule 
            title="3. When to use it"
            description="Use the passive voice when:"
            examples={[
              "The agent is unknown",
              "The agent is irrelevant",
              "You want to focus on the action",
              "You are writing academic texts"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'The house ___ last year.'"
      options={[
        "built",
        "was built",
        "was building",
        "has built"
      ]}
      correctAnswer={1}
      explanation="'Was built' is the correct past simple passive form of 'build'."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What is the passive voice structure?"
      options={[
        "Subject + verb + object",
        "Subject + be + past participle",
        "Object + verb + subject",
        "Be + past participle + subject"
      ]}
      correctAnswer={1}
      explanation="The passive voice structure is: Subject + be (in appropriate tense) + past participle + (by + agent)."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "The passive voice is used when the agent (who does the action) is unknown or unimportant.",
          isTrue: true,
          explanation: "Correct. Passive voice is commonly used when we don't know who performed the action or when it's not important."
        },
        {
          text: "In passive voice, the verb 'be' must agree with the subject in number and tense.",
          isTrue: true,
          explanation: "Correct. The verb 'be' must agree with the subject (singular/plural) and be in the appropriate tense."
        },
        {
          text: "You can only use the direct object as the subject in passive voice.",
          isTrue: false,
          explanation: "Incorrect. With verbs that have two objects (direct and indirect), either can become the subject of the passive sentence."
        },
        {
          text: "The agent is always required in passive voice sentences.",
          isTrue: false,
          explanation: "Incorrect. The agent (with 'by') is optional in passive voice. It's only included when it's relevant or known."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which sentence is in passive voice?"
      options={[
        "The teacher gave the students homework.",
        "The students were given homework by the teacher.",
        "The students gave homework to the teacher.",
        "The teacher is giving homework to students."
      ]}
      correctAnswer={1}
      explanation="'The students were given homework by the teacher' is passive voice because the object (students) becomes the subject, and it uses 'were given' (be + past participle)."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What is the correct passive form of 'They will finish the project tomorrow'?"
      options={[
        "The project will be finish tomorrow.",
        "The project will be finished tomorrow.",
        "The project will finish tomorrow.",
        "The project will have been finished tomorrow."
      ]}
      correctAnswer={1}
      explanation="The correct passive form is 'The project will be finished tomorrow' using 'will be' + past participle 'finished'."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: 'The house ___ by a famous architect.'"
      options={[
        "designed",
        "was designed",
        "is designed",
        "has designed"
      ]}
      correctAnswer={1}
      explanation="For a completed action in the past we use past simple passive: 'was designed'."
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which is correct?"
      options={[
        "The letter was written by me",
        "The letter was wrote by me",
        "The letter written by me",
        "The letter is wrote by me"
      ]}
      correctAnswer={0}
      explanation="The passive voice uses 'be' + past participle: 'was written' (not 'wrote')."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: 'English ___ all over the world.'"
      options={[
        "speaks",
        "is speaking",
        "is spoken",
        "has spoken"
      ]}
      correctAnswer={2}
      explanation="For general facts in the passive voice we use present simple: 'is spoken'."
    />,

    <MultipleChoiceExercise
      key="9"
      question="When do we NOT use 'by' in the passive voice?"
      options={[
        "When the agent is obvious",
        "When the agent is unknown",
        "When it doesn't matter who did the action",
        "All of the above"
      ]}
      correctAnswer={3}
      explanation="We omit 'by' when the agent is obvious, unknown, or unimportant."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'The car ___ right now.'"
      options={[
        "is repairing",
        "is being repaired",
        "is repaired",
        "repairs"
      ]}
      correctAnswer={1}
      explanation="For actions in progress in the passive voice we use 'is being' + past participle."
    />
  ];

  return (
    <TheoryLayout
      title="Passive Voice"
      description="Master the passive voice in English. Learn to shift the focus of a sentence, express actions without an agent, and use the passive in all tenses."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["All verb tenses", "Past participles", "Modal verbs"]}
      estimatedTime="80 min"
    />
  );
};

export default PassiveVoicePage;
