'use client';
import { build2VerbToBeExercises } from './verbToBeExercises';
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


const VerbToBePage = () => {
  const theoryContent = (
    <>
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
            />
            <Example 
              spanish="Él es doctor"
              english="He is a doctor"
            />
            <Example 
              spanish="Esto es un libro"
              english="This is a book"
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
            />
            <Example 
              spanish="El libro está en la mesa"
              english="The book is on the table"
            />
            <Example 
              spanish="Los niños están en el parque"
              english="The children are in the park"
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
            />
            <Example 
              spanish="Estoy cansado"
              english="I am tired"
            />
            <Example 
              spanish="El clima está soleado"
              english="The weather is sunny"
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
            />
            <Example 
              spanish="Hoy es lunes"
              english="Today is Monday"
            />
            <Example 
              spanish="Son las 3 de la tarde"
              english="It is 3 o'clock in the afternoon"
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
          />
          <Example 
            spanish="Ellos están aquí"
            english="They're here"
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
          />
          <Example 
            spanish="¿Es él doctor?"
            english="Is he a doctor?"
          />
          <Example 
            spanish="¿Dónde está María?"
            english="Where is María?"
          />
          <Example 
            spanish="¿Cómo están ustedes?"
            english="How are you?"
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
          />
          <Example 
            spanish="No estoy en casa"
            english="I'm not at home"
          />
          <Example 
            spanish="Ellos no están aquí"
            english="They aren't here"
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
    </>
  );

    return (
    <TheoryLayout
      title="Verb to Be"
      description="Master the most important verb in English: to be. Learn its forms, uses, contractions, and how to form questions and negatives."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      getExercises={build2VerbToBeExercises}
      prerequisites={["Basic understanding of personal pronouns"]}
      estimatedTime="40 min"
    />
  );
};

export default VerbToBePage;






















