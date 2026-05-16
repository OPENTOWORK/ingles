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

const VerbToBePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="What is the Verb to Be?" icon="🔗">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          The <strong>verb to be</strong> is the most important verb in English. It is used to describe states, 
          characteristics, locations and much more. It is the foundation of many grammatical structures.
        </p>
        
        <QuickReference items={[
          "Am: I am",
          "Is: He/She/It is",
          "Are: You/We/They are",
          "Used to describe, identify and locate",
          "It is irregular - it does not follow normal rules"
        ]} />
      </TheorySection>

      <TheorySection title="Forms of the Verb to Be" icon="📝">
        <GrammarTable
          caption="Full Conjugation of the Verb to Be"
          headers={["Pronoun", "Present", "Past", "Meaning"]}
          rows={[
            ["I", "am", "was", "I am"],
            ["You", "are", "were", "You are"],
            ["He/She/It", "is", "was", "He/She/It is"],
            ["We", "are", "were", "We are"],
            ["You (plural)", "are", "were", "You are (plural)"],
            ["They", "are", "were", "They are"]
          ]}
        />

        <Tip type="info">
          <strong>Remember:</strong> The verb to be is irregular. It does not follow the normal pattern of regular verbs like &quot;play&quot; → &quot;played&quot;.
        </Tip>
      </TheorySection>

      <TheorySection title="Main Uses" icon="🎯">
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.75rem' }}>1. 🏷️ Identification (Be)</h4>
            <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
              To say who or what someone or something is.
            </p>
            
            <Example 
              spanish="Yo soy María"
              english="I am María"
              translation="I am María"
            />
            <Example 
              spanish="Él es doctor"
              english="He is a doctor"
              translation="He is a doctor"
            />
            <Example 
              spanish="Esto es un libro"
              english="This is a book"
              translation="This is a book"
            />
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.75rem' }}>2. 📍 Location (Be)</h4>
            <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
              To say where someone or something is.
            </p>
            
            <Example 
              spanish="Yo estoy en casa"
              english="I am at home"
              translation="I am at home"
            />
            <Example 
              spanish="El libro está en la mesa"
              english="The book is on the table"
              translation="The book is on the table"
            />
            <Example 
              spanish="Los niños están en el parque"
              english="The children are in the park"
              translation="The children are in the park"
            />
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.75rem' }}>3. 🎨 Description (Be)</h4>
            <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
              To describe characteristics, states, or conditions.
            </p>
            
            <Example 
              spanish="Ella es muy inteligente"
              english="She is very intelligent"
              translation="She is very intelligent"
            />
            <Example 
              spanish="Estoy cansado"
              english="I am tired"
              translation="I am tired"
            />
            <Example 
              spanish="El clima está soleado"
              english="The weather is sunny"
              translation="The weather is sunny"
            />
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.75rem' }}>4. ⏰ Age and Time</h4>
            <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
              To talk about age, dates, and time.
            </p>
            
            <Example 
              spanish="Yo tengo 25 años"
              english="I am 25 years old"
              translation="I am 25 years old"
            />
            <Example 
              spanish="Hoy es lunes"
              english="Today is Monday"
              translation="Today is Monday"
            />
            <Example 
              spanish="Son las 3 de la tarde"
              english="It is 3 o'clock in the afternoon"
              translation="It is 3 o'clock in the afternoon"
            />
          </div>
        </div>
      </TheorySection>

      <TheorySection title="Contractions" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          In English, it is very common to use contractions (short forms) of the verb to be, especially in informal conversation.
        </p>

        <GrammarTable
          caption="Present Tense Contractions"
          headers={["Full Form", "Contraction", "Pronunciation"]}
          rows={[
            ["I am", "I'm", "/aɪm/"],
            ["You are", "You're", "/jʊər/"],
            ["He is", "He's", "/hiːz/"],
            ["She is", "She's", "/ʃiːz/"],
            ["It is", "It's", "/ɪts/"],
            ["We are", "We're", "/wɪər/"],
            ["They are", "They're", "/ðeər/"]
          ]}
        />

        <Tip type="warning">
          <strong>Watch out!</strong> Do not use contractions in formal writing or when you want to emphasize something.
        </Tip>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Yo soy estudiante"
            english="I'm a student"
            translation="I'm a student (informal contraction)"
          />
          <Example 
            spanish="Ellos están aquí"
            english="They're here"
            translation="They're here (informal contraction)"
          />
        </div>
      </TheorySection>

      <TheorySection title="Questions with Verb to Be" icon="❓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          To make questions with the verb to be, we simply invert the order: we put the verb before the subject.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="¿Eres feliz?"
            english="Are you happy?"
            translation="Are you happy?"
          />
          <Example 
            spanish="¿Es él doctor?"
            english="Is he a doctor?"
            translation="Is he a doctor?"
          />
          <Example 
            spanish="¿Dónde está María?"
            english="Where is María?"
            translation="Where is María?"
          />
          <Example 
            spanish="¿Cómo están ustedes?"
            english="How are you?"
            translation="How are you?"
          />
        </div>

        <Tip type="success">
          <strong>Easy:</strong> Questions with the verb to be are easier than with other verbs because you do not need "do" or "does".
        </Tip>
      </TheorySection>

      <TheorySection title="Negatives with Verb to Be" icon="❌">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          To make negatives, we add "not" after the verb to be.
        </p>

        <GrammarTable
          caption="Negative Forms"
          headers={["Pronoun", "Full Form", "Contraction"]}
          rows={[
            ["I", "I am not", "I'm not"],
            ["You", "You are not", "You're not / You aren't"],
            ["He/She/It", "He/She/It is not", "He's not / He isn't"],
            ["We", "We are not", "We're not / We aren't"],
            ["They", "They are not", "They're not / They aren't"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Yo no soy profesor"
            english="I am not a teacher"
            translation="I am not a teacher"
          />
          <Example 
            spanish="No estoy en casa"
            english="I'm not at home"
            translation="I'm not at home (contraction)"
          />
          <Example 
            spanish="Ellos no están aquí"
            english="They aren't here"
            translation="They aren't here (contraction)"
          />
        </div>
      </TheorySection>

      <TheorySection title="Common Mistakes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I are happy" ❌<br/>
            <strong>Correct:</strong> "I am happy" ✅<br/>
            <em>Remember: I → am, not are</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "He are tall" ❌<br/>
            <strong>Correct:</strong> "He is tall" ✅<br/>
            <em>Remember: He/She/It → is</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Do you are happy?" ❌<br/>
            <strong>Correct:</strong> "Are you happy?" ✅<br/>
            <em>With the verb to be we do not use "do" for questions</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I not am tired" ❌<br/>
            <strong>Correct:</strong> "I am not tired" ✅<br/>
            <em>"Not" goes after the verb to be</em>
          </Tip>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'I _____ a student. My name _____ María.'"
      options={[
        "am, is",
        "is, am",
        "are, is",
        "am, are"
      ]}
      correctAnswer={0}
      explanation="With 'I' we use 'am', and with proper names (third person singular) we use 'is'."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which is the correct form to complete: '___ you happy?'"
      options={[
        "Is",
        "Are",
        "Am",
        "Do"
      ]}
      correctAnswer={1}
      explanation="With 'you' we use 'are'. Also, with the verb to be we do not need 'do' to make questions."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "We can say 'I'm not' instead of 'I am not'.",
          isTrue: true,
          explanation: "Correct. 'I'm not' is the contraction of 'I am not' and is very common in English."
        },
        {
          text: "The question 'Do you are happy?' is correct.",
          isTrue: false,
          explanation: "Incorrect. With the verb to be we do not use 'do' for questions. The correct form is 'Are you happy?'"
        },
        {
          text: "We use 'is' with he, she, and it.",
          isTrue: true,
          explanation: "Correct. He/She/It always go with 'is' in the present tense."
        },
        {
          text: "'They're not' and 'They aren't' are both correct.",
          isTrue: true,
          explanation: "Correct. Both forms are valid: 'They're not' and 'They aren't'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which is the correct form to complete: 'Where ___ the books?'"
      options={[
        "is",
        "are",
        "am",
        "be"
      ]}
      correctAnswer={1}
      explanation="'Books' is plural, so we use 'are'. The question is 'Where are the books?'"
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which is the correct negative form of 'She is tall'?"
      options={[
        "She not is tall",
        "She is not tall",
        "She not tall",
        "She isn't tall"
      ]}
      correctAnswer={1}
      explanation="The correct options are 'She is not tall' or 'She isn't tall'. Option 4 is also correct, but option 2 is the full form."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "We can use 'am' with 'you'.",
          isTrue: false,
          explanation: "Incorrect. 'Am' is only used with 'I'. With 'you' we use 'are'."
        },
        {
          text: "'It's' is the contraction of 'it is'.",
          isTrue: true,
          explanation: "Correct. 'It's' is the contraction of 'it is'."
        },
        {
          text: "We can say 'I amn't' as a contraction.",
          isTrue: false,
          explanation: "Incorrect. 'I amn't' does not exist. We can only say 'I'm not'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'My parents ___ doctors.'"
      options={[
        "is",
        "are",
        "am",
        "be"
      ]}
      correctAnswer={1}
      explanation="'Parents' is plural, so we use 'are'. 'My parents are doctors'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which is the correct question to get the answer 'I am fine'?"
      options={[
        "How you are?",
        "How are you?",
        "How is you?",
        "How do you are?"
      ]}
      correctAnswer={1}
      explanation="The correct question is 'How are you?' With the verb to be, we invert the order: are + you."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "The sentence 'The cat is in the garden' uses 'is' for location.",
          isTrue: true,
          explanation: "Correct. We use 'is' to indicate location: the cat is in the garden."
        },
        {
          text: "'We're' can mean both 'we are' and 'we were'.",
          isTrue: false,
          explanation: "Incorrect. 'We're' is only a contraction of 'we are' (present). 'We were' has no contraction."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete the dialogue: 'Is John at home?' - 'No, he ___.'"
      options={[
        "isn't",
        "aren't",
        "am not",
        "not is"
      ]}
      correctAnswer={0}
      explanation="With 'he' we use 'is', so the negative form is 'isn't' or 'is not'. 'No, he isn't'."
    />
  ];

  return (
    <TheoryLayout
      title="Verb to Be"
      description="Master the most important verb in English: to be. Learn its forms, uses, contractions, and how to form questions and negatives."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic understanding of personal pronouns"]}
      estimatedTime="40 min"
    />
  );
};

export default VerbToBePage;






















