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

const ModalVerbsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What Are Modal Verbs?" icon="⚡">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Modal verbs</strong> are auxiliary verbs that express attitude, possibility, 
          obligation, permission, ability, or advice. They have no infinitive, gerund, or past participle forms, and they are used 
          with the main verb in the bare infinitive (without <em>to</em>).
        </p>
        
        <QuickReference items={[
          "Express attitude and opinion",
          "Do not have tense forms",
          "Are followed by the bare infinitive (without 'to')",
          "Do not need auxiliaries do/does/did",
          "Can, could, may, might, must, should, will, would"
        ]} />
      </TheorySection>

      <TheorySection title="Basic Modal Verbs" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The main modal verbs and their most common uses.
        </p>

        <GrammarTable
          caption="Main Modal Verbs"
          headers={["Modal", "Main Use", "Example", "Meaning"]}
          rows={[
            ["can", "ability, permission", "I can swim", "I can swim"],
            ["could", "past ability, possibility", "I could help you", "I could help you"],
            ["may", "formal permission, possibility", "May I go?", "May I go?"],
            ["might", "weak possibility", "It might rain", "It might rain"],
            ["must", "strong obligation", "You must study", "You must study"],
            ["should", "advice, weak obligation", "You should rest", "You should rest"],
            ["will", "future, willingness", "I will help you", "I will help you"],
            ["would", "conditional, politeness", "I would like coffee", "I would like coffee"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Puedo hablar inglés"
            english="I can speak English"
            translation="I can speak English"
          />
          <Example 
            spanish="Debes hacer tu tarea"
            english="You must do your homework"
            translation="You must do your homework"
          />
          <Example 
            spanish="¿Puedo usar tu teléfono?"
            english="May I use your phone?"
            translation="May I use your phone?"
          />
        </div>

        <Rule 
          title="Basic Rules"
          description="All modal verbs follow these rules:"
          examples={[
            "They are followed by the bare infinitive (without 'to')",
            "They do not take -s in the third person",
            "They do not use do/does/did in negatives and questions",
            "They come before the main verb"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Modal verbs do not change according to the person. They always keep the same form.
        </Tip>
      </TheorySection>

      <TheorySection title="Ability" icon="💪">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          To express physical or mental ability, capacity, or possibility.
        </p>

        <GrammarTable
          caption="Modal Verbs for Ability"
          headers={["Modal", "Tense", "Use", "Example"]}
          rows={[
            ["can", "present", "current ability", "I can drive"],
            ["could", "past", "past ability", "I could swim when I was 5"],
            ["be able to", "all tenses", "specific ability", "I was able to finish the project"],
            ["cannot/can't", "present", "lack of ability", "I can't speak French"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Puedo tocar el piano"
            english="I can play the piano"
            translation="I can play the piano"
          />
          <Example 
            spanish="Cuando era niño, podía correr muy rápido"
            english="When I was a child, I could run very fast"
            translation="When I was a child, I could run very fast"
          />
          <Example 
            spanish="No pude terminar el trabajo a tiempo"
            english="I wasn't able to finish the work on time"
            translation="I wasn't able to finish the work on time"
          />
        </div>

        <Tip type="success">
          <strong>Tip:</strong> Use <em>be able to</em> when you need specific tense forms that <em>can</em> cannot express.
        </Tip>
      </TheorySection>

      <TheorySection title="Permission" icon="🖐️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          To ask for, give, or deny permission in formal or informal situations.
        </p>

        <GrammarTable
          caption="Modal Verbs for Permission"
          headers={["Modal", "Formality", "Use", "Example"]}
          rows={[
            ["can", "informal", "everyday permission", "Can I go to the bathroom?"],
            ["may", "formal", "formal permission", "May I leave early?"],
            ["could", "polite", "asking politely", "Could I borrow your pen?"],
            ["cannot/can't", "informal", "denying permission", "You can't smoke here"],
            ["may not", "formal", "formal denial", "You may not enter"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="¿Puedo salir temprano?"
            english="May I leave early?"
            translation="May I leave early?"
          />
          <Example 
            spanish="¿Podrías prestarme tu libro?"
            english="Could you lend me your book?"
            translation="Could you lend me your book?"
          />
          <Example 
            spanish="No puedes usar tu teléfono aquí"
            english="You cannot use your phone here"
            translation="You cannot use your phone here"
          />
        </div>

        <Rule 
          title="Levels of Formality"
          description="Order of formality when asking for permission:"
          examples={[
            "Most formal: May I...?",
            "Polite: Could I...?",
            "Informal: Can I...?",
            "Choose according to context"
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> <em>May</em> is more formal than <em>can</em>. In academic or professional contexts, use <em>may</em>.
        </Tip>
      </TheorySection>

      <TheorySection title="Possibility" icon="🎲">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          To express different degrees of possibility or probability.
        </p>

        <GrammarTable
          caption="Modal Verbs for Possibility"
          headers={["Modal", "Degree", "Use", "Example"]}
          rows={[
            ["must", "very high (90%)", "logical deduction", "You must be tired"],
            ["may", "medium (50%)", "real possibility", "It may rain tomorrow"],
            ["might", "low (30%)", "weak possibility", "I might come to the party"],
            ["could", "possible", "theoretical possibility", "It could be true"],
            ["can't", "impossible", "impossibility", "That can't be right"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Debe estar cansado (muy probable)"
            english="He must be tired"
            translation="He must be tired (very likely)"
          />
          <Example 
            spanish="Puede que llueva mañana"
            english="It may rain tomorrow"
            translation="It may rain tomorrow"
          />
          <Example 
            spanish="Podría venir a la fiesta"
            english="I might come to the party"
            translation="I might come to the party"
          />
        </div>

        <Rule 
          title="Degrees of Possibility"
          description="Order of probability (from highest to lowest):"
          examples={[
            "must (almost certain)",
            "may (possible)",
            "might (less likely)",
            "could (theoretically possible)"
          ]}
        />

        <Tip type="info">
          <strong>Tip:</strong> Use <em>must</em> for logical deductions based on evidence, not for obligation in this context.
        </Tip>
      </TheorySection>

      <TheorySection title="Obligation" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          To express different types and degrees of obligation.
        </p>

        <GrammarTable
          caption="Modal Verbs for Obligation"
          headers={["Modal", "Type", "Degree", "Example"]}
          rows={[
            ["must", "personal obligation", "strong", "I must finish this today"],
            ["have to", "external obligation", "strong", "I have to work tomorrow"],
            ["should", "advice/recommendation", "weak", "You should exercise more"],
            ["ought to", "moral advice", "weak", "You ought to apologize"],
            ["don't have to", "no obligation", "none", "You don't have to come"],
            ["mustn't", "prohibition", "strong", "You mustn't smoke here"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Debo terminar este trabajo hoy"
            english="I must finish this work today"
            translation="I must finish this work today"
          />
          <Example 
            spanish="Tengo que trabajar mañana"
            english="I have to work tomorrow"
            translation="I have to work tomorrow"
          />
          <Example 
            spanish="Deberías hacer más ejercicio"
            english="You should exercise more"
            translation="You should exercise more"
          />
        </div>

        <Rule 
          title="Must vs Have to"
          description="Important differences:"
          examples={[
            "Must: personal, internal obligation",
            "Have to: external obligation, rules",
            "Must: more subjective",
            "Have to: more objective"
          ]}
        />

        <Tip type="success">
          <strong>Tip:</strong> <em>Must</em> expresses personal obligation, while <em>have to</em> expresses external obligation or rules.
        </Tip>
      </TheorySection>

      <TheorySection title="Advice" icon="💡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          To give advice, suggestions, and recommendations.
        </p>

        <GrammarTable
          caption="Modal Verbs for Advice"
          headers={["Modal", "Strength", "Use", "Example"]}
          rows={[
            ["should", "recommendation", "general advice", "You should see a doctor"],
            ["ought to", "moral", "moral advice", "You ought to help them"],
            ["had better", "urgent", "strong advice", "You'd better hurry"],
            ["could", "suggestion", "soft option", "You could try yoga"],
            ["might want to", "suggestion", "very soft option", "You might want to call her"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Deberías ver a un doctor"
            english="You should see a doctor"
            translation="You should see a doctor"
          />
          <Example 
            spanish="Deberías ayudarlos"
            english="You ought to help them"
            translation="You ought to help them"
          />
          <Example 
            spanish="Mejor te apuras"
            english="You'd better hurry"
            translation="You'd better hurry"
          />
        </div>

        <Tip type="warning">
          <strong>Watch out!</strong> <em>Had better</em> implies a warning. It is used for urgent advice or when there are consequences.
        </Tip>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Using <em>to</em> after modals ❌<br/>
            <strong>Correct:</strong> Bare infinitive without <em>to</em> ✅<br/>
            <em>I can to swim. → I can swim.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Adding -s in the third person ❌<br/>
            <strong>Correct:</strong> Modals do not change ✅<br/>
            <em>He cans swim. → He can swim.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using do/does in negatives ❌<br/>
            <strong>Correct:</strong> Add <em>not</em> directly ✅<br/>
            <em>I don't can swim. → I can't swim.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Confusing <em>must</em> and <em>have to</em> ❌<br/>
            <strong>Correct:</strong> Understand the difference ✅<br/>
            <em>I must work (personal) vs I have to work (external rule)</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Using <em>may</em> in informal contexts ❌<br/>
            <strong>Correct:</strong> Use <em>can</em> in informal contexts ✅<br/>
            <em>May I go? (formal) vs Can I go? (informal)</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Important Rules" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Basic structure"
            description="Modal verbs follow a specific structure."
            examples={[
              "Subject + modal + bare infinitive (without 'to')",
              "They do not change according to the person",
              "They do not use auxiliaries do/does/did",
              "The negative is formed with 'not'"
            ]}
          />

          <Rule 
            title="2. No tense forms"
            description="Modals do not have past, present, or future forms."
            examples={[
              "Use 'could' for the past of 'can'",
              "Use 'would' for the past of 'will'",
              "For other tenses, use 'be able to'",
              "Or use periphrastic verb forms"
            ]}
          />

          <Rule 
            title="3. Context and formality"
            description="Choose the modal according to context."
            examples={[
              "Formal: may, ought to",
              "Informal: can, should",
              "Polite: could, might",
              "Consider the situation"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'You ___ study harder if you want to pass the exam.'"
      options={[
        "must",
        "should",
        "can",
        "might"
      ]}
      correctAnswer={1}
      explanation="'Should' expresses advice or a recommendation, which fits best in this context."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which modal verb is used to express strong obligation?"
      options={[
        "should",
        "could",
        "must",
        "might"
      ]}
      correctAnswer={2}
      explanation="'Must' is used to express strong obligation or necessity. 'Should' is for advice, 'could' for possibility, and 'might' for weak possibility."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Modal verbs are followed by infinitive without 'to'.",
          isTrue: true,
          explanation: "Correct. Modal verbs are always followed by the base form of the verb (infinitive without 'to')."
        },
        {
          text: "Modal verbs change form according to the subject (I, you, he, she, etc.).",
          isTrue: false,
          explanation: "Incorrect. Modal verbs do not change form according to the subject. They remain the same for all persons."
        },
        {
          text: "'May' is more formal than 'can' when asking for permission.",
          isTrue: true,
          explanation: "Correct. 'May' is more formal and polite than 'can' when asking for permission."
        },
        {
          text: "You can use 'do' or 'does' with modal verbs in questions and negatives.",
          isTrue: false,
          explanation: "Incorrect. Modal verbs do not use auxiliary verbs like 'do' or 'does'. The modal itself forms questions and negatives."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the difference between 'must' and 'have to'?"
      options={[
        "There is no difference",
        "'Must' is for external obligation, 'have to' for personal",
        "'Must' is for personal obligation, 'have to' for external",
        "'Must' is only for past tense"
      ]}
      correctAnswer={2}
      explanation="'Must' expresses personal obligation (what you think is necessary), while 'have to' expresses external obligation (rules, laws, requirements)."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which modal verb is best for giving strong advice with a warning?"
      options={[
        "should",
        "ought to",
        "had better",
        "could"
      ]}
      correctAnswer={2}
      explanation="'Had better' is used for strong advice with an implied warning or consequence if the advice is not followed."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: 'You ___ smoke in the hospital.'"
      options={[
        "mustn't",
        "don't have to",
        "shouldn't",
        "can't"
      ]}
      correctAnswer={0}
      explanation="'Mustn't' expresses a strong prohibition. It is a rule that cannot be broken."
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which expresses possibility in the past?"
      options={[
        "He can be at home",
        "He could be at home",
        "He might have been at home",
        "He must be at home"
      ]}
      correctAnswer={2}
      explanation="'Might have been' expresses possibility about something that happened in the past."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: 'I ___ speak three languages when I was younger.'"
      options={[
        "can",
        "could",
        "was able to",
        "Both B and C"
      ]}
      correctAnswer={3}
      explanation="For general abilities in the past, both 'could' and 'was able to' are correct."
    />,

    <MultipleChoiceExercise
      key="9"
      question="Which is more polite?"
      options={[
        "Can you help me?",
        "Could you help me?",
        "Will you help me?",
        "Do you help me?"
      ]}
      correctAnswer={1}
      explanation="'Could you...?' is more polite and formal than 'Can you...?'"
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'She ___ have forgotten about the meeting.'"
      options={[
        "can",
        "could",
        "may",
        "All of the above"
      ]}
      correctAnswer={3}
      explanation="'Can', 'could', and 'may' can all express present possibility. 'Could' and 'may' are more formal."
    />
  ];

  return (
    <TheoryLayout
      title="Modal Verbs"
      description="Master modal verbs in English. Learn to express ability, possibility, obligation, permission, and advice with can, could, must, should, may, and might."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic verb tenses", "Understanding of auxiliary verbs"]}
      estimatedTime="85 min"
    />
  );
};

export default ModalVerbsPage;
