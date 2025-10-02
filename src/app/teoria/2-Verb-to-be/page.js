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
      <TheorySection title="¿Qué es el Verb to Be?" icon="🔗">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El <strong>verb to be</strong> (ser/estar) es el verbo más importante en inglés. Se usa para describir estados, 
          características, ubicaciones y mucho más. Es la base de muchas estructuras gramaticales.
        </p>
        
        <QuickReference items={[
          "Am: I am (Yo soy/estoy)",
          "Is: He/She/It is (Él/Ella/Eso es/está)",
          "Are: You/We/They are (Tú/Nosotros/Ellos son/están)",
          "Se usa para describir, identificar y ubicar",
          "Es irregular - no sigue las reglas normales"
        ]} />
      </TheorySection>

      <TheorySection title="Formas del Verb to Be" icon="📝">
        <GrammarTable
          caption="Conjugación Completa del Verb to Be"
          headers={["Pronombre", "Presente", "Pasado", "Significado"]}
          rows={[
            ["I", "am", "was", "Yo soy/estoy"],
            ["You", "are", "were", "Tú eres/estás"],
            ["He/She/It", "is", "was", "Él/Ella/Eso es/está"],
            ["We", "are", "were", "Nosotros somos/estamos"],
            ["You (plural)", "are", "were", "Ustedes son/están"],
            ["They", "are", "were", "Ellos son/están"]
          ]}
        />

        <Tip type="info">
          <strong>Recuerda:</strong> El verb to be es irregular. No sigue el patrón normal de verbos regulares como "play" → "played".
        </Tip>
      </TheorySection>

      <TheorySection title="Usos Principales" icon="🎯">
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.75rem' }}>1. 🏷️ Identificación (Ser)</h4>
            <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
              Para decir quién o qué es alguien o algo.
            </p>
            
            <Example 
              spanish="Yo soy María"
              english="I am María"
              translation="Yo soy María"
            />
            <Example 
              spanish="Él es doctor"
              english="He is a doctor"
              translation="Él es doctor"
            />
            <Example 
              spanish="Esto es un libro"
              english="This is a book"
              translation="Esto es un libro"
            />
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.75rem' }}>2. 📍 Ubicación (Estar)</h4>
            <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
              Para decir dónde está alguien o algo.
            </p>
            
            <Example 
              spanish="Yo estoy en casa"
              english="I am at home"
              translation="Yo estoy en casa"
            />
            <Example 
              spanish="El libro está en la mesa"
              english="The book is on the table"
              translation="El libro está en la mesa"
            />
            <Example 
              spanish="Los niños están en el parque"
              english="The children are in the park"
              translation="Los niños están en el parque"
            />
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.75rem' }}>3. 🎨 Descripción (Ser/Estar)</h4>
            <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
              Para describir características, estados o condiciones.
            </p>
            
            <Example 
              spanish="Ella es muy inteligente"
              english="She is very intelligent"
              translation="Ella es muy inteligente"
            />
            <Example 
              spanish="Estoy cansado"
              english="I am tired"
              translation="Estoy cansado"
            />
            <Example 
              spanish="El clima está soleado"
              english="The weather is sunny"
              translation="El clima está soleado"
            />
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.75rem' }}>4. ⏰ Edad y Tiempo</h4>
            <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
              Para hablar de edad, fechas y hora.
            </p>
            
            <Example 
              spanish="Yo tengo 25 años"
              english="I am 25 years old"
              translation="Yo tengo 25 años"
            />
            <Example 
              spanish="Hoy es lunes"
              english="Today is Monday"
              translation="Hoy es lunes"
            />
            <Example 
              spanish="Son las 3 de la tarde"
              english="It is 3 o'clock in the afternoon"
              translation="Son las 3 de la tarde"
            />
          </div>
        </div>
      </TheorySection>

      <TheorySection title="Formas Contractas (Contracciones)" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          En inglés, es muy común usar contracciones (formas cortas) del verb to be, especialmente en conversaciones informales.
        </p>

        <GrammarTable
          caption="Contracciones del Presente"
          headers={["Forma Completa", "Contracción", "Pronunciación"]}
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
          <strong>¡Cuidado!</strong> No uses contracciones en escritura formal o cuando quieres enfatizar algo.
        </Tip>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Yo soy estudiante"
            english="I'm a student"
            translation="Yo soy estudiante (contracción informal)"
          />
          <Example 
            spanish="Ellos están aquí"
            english="They're here"
            translation="Ellos están aquí (contracción informal)"
          />
        </div>
      </TheorySection>

      <TheorySection title="Preguntas con Verb to Be" icon="❓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Para hacer preguntas con verb to be, simplemente invertimos el orden: ponemos el verbo antes del sujeto.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="¿Eres feliz?"
            english="Are you happy?"
            translation="¿Eres feliz?"
          />
          <Example 
            spanish="¿Es él doctor?"
            english="Is he a doctor?"
            translation="¿Es él doctor?"
          />
          <Example 
            spanish="¿Dónde está María?"
            english="Where is María?"
            translation="¿Dónde está María?"
          />
          <Example 
            spanish="¿Cómo están ustedes?"
            english="How are you?"
            translation="¿Cómo están ustedes?"
          />
        </div>

        <Tip type="success">
          <strong>Fácil:</strong> Las preguntas con verb to be son más fáciles que con otros verbos porque no necesitas "do" o "does".
        </Tip>
      </TheorySection>

      <TheorySection title="Negaciones con Verb to Be" icon="❌">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Para hacer negaciones, agregamos "not" después del verb to be.
        </p>

        <GrammarTable
          caption="Formas Negativas"
          headers={["Pronombre", "Forma Completa", "Contracción"]}
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
            translation="Yo no soy profesor"
          />
          <Example 
            spanish="No estoy en casa"
            english="I'm not at home"
            translation="No estoy en casa (contracción)"
          />
          <Example 
            spanish="Ellos no están aquí"
            english="They aren't here"
            translation="Ellos no están aquí (contracción)"
          />
        </div>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I are happy" ❌<br/>
            <strong>Correcto:</strong> "I am happy" ✅<br/>
            <em>Recuerda: I → am, no are</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "He are tall" ❌<br/>
            <strong>Correcto:</strong> "He is tall" ✅<br/>
            <em>Recuerda: He/She/It → is</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Do you are happy?" ❌<br/>
            <strong>Correcto:</strong> "Are you happy?" ✅<br/>
            <em>Con verb to be no usamos "do" para preguntas</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I not am tired" ❌<br/>
            <strong>Correcto:</strong> "I am not tired" ✅<br/>
            <em>"Not" va después del verb to be</em>
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
      explanation="Con 'I' usamos 'am' y con nombres propios (tercera persona singular) usamos 'is'."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la forma correcta para completar: '___ you happy?'"
      options={[
        "Is",
        "Are",
        "Am",
        "Do"
      ]}
      correctAnswer={1}
      explanation="Con 'you' usamos 'are'. Además, con verb to be no necesitamos 'do' para hacer preguntas."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "We can say 'I'm not' instead of 'I am not'.",
          isTrue: true,
          explanation: "Correcto. 'I'm not' es la contracción de 'I am not' y es muy común en inglés."
        },
        {
          text: "The question 'Do you are happy?' is correct.",
          isTrue: false,
          explanation: "Incorrecto. Con verb to be no usamos 'do' para preguntas. La forma correcta es 'Are you happy?'"
        },
        {
          text: "We use 'is' with he, she, and it.",
          isTrue: true,
          explanation: "Correcto. He/She/It siempre van con 'is' en presente."
        },
        {
          text: "'They're not' and 'They aren't' are both correct.",
          isTrue: true,
          explanation: "Correcto. Ambas formas son válidas: 'They're not' y 'They aren't'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la forma correcta para completar: 'Where ___ the books?'"
      options={[
        "is",
        "are",
        "am",
        "be"
      ]}
      correctAnswer={1}
      explanation="'Books' es plural, por lo que usamos 'are'. La pregunta es 'Where are the books?' (¿Dónde están los libros?)"
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la forma negativa correcta de 'She is tall'?"
      options={[
        "She not is tall",
        "She is not tall",
        "She not tall",
        "She isn't tall"
      ]}
      correctAnswer={1}
      explanation="Las opciones correctas son 'She is not tall' o 'She isn't tall'. La opción 4 también es correcta, pero la 2 es la forma completa."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "We can use 'am' with 'you'.",
          isTrue: false,
          explanation: "Incorrecto. 'Am' solo se usa con 'I'. Con 'you' usamos 'are'."
        },
        {
          text: "'It's' is the contraction of 'it is'.",
          isTrue: true,
          explanation: "Correcto. 'It's' es la contracción de 'it is'."
        },
        {
          text: "We can say 'I amn't' as a contraction.",
          isTrue: false,
          explanation: "Incorrecto. 'I amn't' no existe. Solo podemos decir 'I'm not'."
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
      explanation="'Parents' es plural, por lo que usamos 'are'. 'My parents are doctors' (Mis padres son doctores)."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Cuál es la pregunta correcta para obtener la respuesta 'I am fine'?"
      options={[
        "How you are?",
        "How are you?",
        "How is you?",
        "How do you are?"
      ]}
      correctAnswer={1}
      explanation="La pregunta correcta es 'How are you?' Con verb to be, invertimos el orden: are + you."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "The sentence 'The cat is in the garden' uses 'is' for location.",
          isTrue: true,
          explanation: "Correcto. Usamos 'is' para indicar ubicación (estar): el gato está en el jardín."
        },
        {
          text: "'We're' can mean both 'we are' and 'we were'.",
          isTrue: false,
          explanation: "Incorrecto. 'We're' solo es contracción de 'we are' (presente). 'We were' no tiene contracción."
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
      explanation="Con 'he' usamos 'is', por lo que la forma negativa es 'isn't' o 'is not'. 'No, he isn't' (No, él no está)."
    />
  ];

  return (
    <TheoryLayout
      title="Verb to Be"
      description="Domina el verbo más importante del inglés: to be (ser/estar). Aprende sus formas, usos, contracciones y cómo hacer preguntas y negaciones."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Nociones básicas de pronombres personales"]}
      estimatedTime="40 min"
    />
  );
};

export default VerbToBePage;






















