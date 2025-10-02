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

const QuestionFormationPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="Formación de Preguntas en Inglés" icon="❓">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La <strong>formación de preguntas</strong> en inglés sigue patrones específicos que varían según el tipo 
          de pregunta y el tiempo verbal. Dominar estas estructuras es esencial para la comunicación efectiva 
          y los exámenes de inglés.
        </p>
        
        <QuickReference items={[
          "Yes/No questions: auxiliar + sujeto + verbo principal",
          "Wh-questions: palabra interrogativa + auxiliar + sujeto + verbo",
          "Subject questions: no necesitan auxiliar",
          "Question tags: confirmar información",
          "Indirect questions: más formales y educadas"
        ]} />
      </TheorySection>

      <TheorySection title="Yes/No Questions" icon="✅❌">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las preguntas de sí/no requieren un auxiliar y se responden con yes o no.
        </p>

        <GrammarTable
          caption="Estructura de Yes/No Questions"
          headers={["Tiempo Verbal", "Estructura", "Ejemplo", "Respuesta"]}
          rows={[
            ["Present Simple", "Do/Does + sujeto + verbo base", "Do you like coffee?", "Yes, I do / No, I don't"],
            ["Past Simple", "Did + sujeto + verbo base", "Did she call you?", "Yes, she did / No, she didn't"],
            ["Present Continuous", "Am/Is/Are + sujeto + verb-ing", "Are you working?", "Yes, I am / No, I'm not"],
            ["Present Perfect", "Have/Has + sujeto + past participle", "Have you finished?", "Yes, I have / No, I haven't"],
            ["Future Simple", "Will + sujeto + verbo base", "Will they come?", "Yes, they will / No, they won't"],
            ["Modal Verbs", "Modal + sujeto + verbo base", "Can you swim?", "Yes, I can / No, I can't"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="¿Hablas español?"
            english="Do you speak Spanish?"
            translation="Auxiliar 'do' + sujeto + verbo base"
          />
          
          <Example 
            spanish="¿Está lloviendo?"
            english="Is it raining?"
            translation="Auxiliar 'is' + sujeto + gerundio"
          />
        </div>

        <Tip type="info">
          <strong>Recuerda:</strong> Con el verbo 'to be' no necesitas auxiliar: "Are you happy?" (no "Do you are happy?")
        </Tip>
      </TheorySection>

      <TheorySection title="Wh-Questions" icon="🔍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las preguntas con palabras interrogativas (wh-words) piden información específica.
        </p>

        <GrammarTable
          caption="Palabras Interrogativas"
          headers={["Wh-word", "Pregunta sobre", "Ejemplo", "Respuesta típica"]}
          rows={[
            ["What", "Cosas, acciones", "What do you do?", "I'm a teacher"],
            ["Where", "Lugar", "Where do you live?", "In Madrid"],
            ["When", "Tiempo", "When did you arrive?", "Yesterday"],
            ["Who", "Personas (sujeto)", "Who called you?", "My mother"],
            ["Whom", "Personas (objeto, formal)", "Whom did you see?", "The manager"],
            ["Why", "Razón", "Why are you late?", "Traffic was bad"],
            ["How", "Manera, método", "How do you cook this?", "In the oven"],
            ["Which", "Elección entre opciones", "Which car is yours?", "The blue one"]
          ]}
        />

        <Rule 
          title="Estructura de Wh-Questions"
          description="Patrón general: Wh-word + auxiliar + sujeto + verbo principal"
          examples={[
            "What do you want? (¿Qué quieres?)",
            "Where did she go? (¿Dónde fue?)",
            "When will they arrive? (¿Cuándo llegarán?)",
            "How are you feeling? (¿Cómo te sientes?)"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Cuando 'who' es el sujeto, no uses auxiliar: 
          "Who lives here?" ✅ (no "Who does live here?" ❌)
        </Tip>
      </TheorySection>

      <TheorySection title="Subject vs Object Questions" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La diferencia entre preguntas sobre el sujeto y el objeto afecta la estructura gramatical.
        </p>

        <GrammarTable
          caption="Subject vs Object Questions"
          headers={["Tipo", "Estructura", "Ejemplo", "Explicación"]}
          rows={[
            ["Subject Question", "Who/What + verbo + objeto", "Who broke the window?", "Pregunta sobre quién hizo la acción"],
            ["Object Question", "Who/What + auxiliar + sujeto + verbo", "Who did you see?", "Pregunta sobre el receptor de la acción"],
            ["Subject Question", "What + verbo + objeto", "What happened?", "Pregunta sobre qué ocurrió"],
            ["Object Question", "What + auxiliar + sujeto + verbo", "What did you buy?", "Pregunta sobre qué compraste"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="¿Quién rompió la ventana? (sujeto)"
            english="Who broke the window?"
            translation="No auxiliar - 'who' es el sujeto"
          />
          
          <Example 
            spanish="¿A quién viste? (objeto)"
            english="Who did you see?"
            translation="Con auxiliar - 'who' es el objeto"
          />
        </div>
      </TheorySection>

      <TheorySection title="Question Tags" icon="🏷️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los question tags se añaden al final de las oraciones para confirmar información o pedir acuerdo.
        </p>

        <Rule 
          title="Reglas para Question Tags"
          description="Patrones básicos para formar question tags:"
          examples={[
            "Oración positiva → tag negativo: 'You like coffee, don't you?'",
            "Oración negativa → tag positivo: 'You don't smoke, do you?'",
            "Usa el mismo auxiliar de la oración principal",
            "Si no hay auxiliar, usa do/does/did",
            "Con 'I am' → 'aren't I?' (excepción)"
          ]}
        />

        <GrammarTable
          caption="Question Tags Comunes"
          headers={["Oración Principal", "Question Tag", "Ejemplo Completo"]}
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
          <strong>Entonación:</strong> Si esperas confirmación, usa entonación descendente. 
          Si realmente no sabes, usa entonación ascendente.
        </Tip>
      </TheorySection>

      <TheorySection title="Indirect Questions" icon="🎭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las preguntas indirectas son más educadas y formales, especialmente útiles en situaciones profesionales.
        </p>

        <GrammarTable
          caption="Estructuras para Preguntas Indirectas"
          headers={["Frase Introductoria", "Estructura", "Ejemplo"]}
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
            translation="Más informal y directa"
          />
          
          <Example 
            spanish="Pregunta indirecta: ¿Podrías decirme dónde está el banco?"
            english="Indirect: Could you tell me where the bank is?"
            translation="Más educada y formal"
          />
        </div>

        <Tip type="info">
          <strong>Orden de palabras:</strong> En preguntas indirectas, usa orden de oración afirmativa después 
          de la palabra interrogativa: "where the bank is" (no "where is the bank").
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "Do you are happy?" ❌<br/>
            <strong>Correcto:</strong> "Are you happy?" ✅<br/>
            <em>Con 'to be' no uses auxiliar 'do'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Who does live here?" ❌<br/>
            <strong>Correcto:</strong> "Who lives here?" ✅<br/>
            <em>En subject questions no uses auxiliar</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Where do you come from?" vs "Where are you from?" <br/>
            <strong>Ambas correctas:</strong> Pero "Where are you from?" es más común ✅<br/>
            <em>Algunas preguntas tienen formas alternativas</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Could you tell me where is the bank?" ❌<br/>
            <strong>Correcto:</strong> "Could you tell me where the bank is?" ✅<br/>
            <em>En preguntas indirectas usa orden afirmativo</em>
          </Tip>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: '_____ you speak French?'"
      options={[
        "Do",
        "Does",
        "Are",
        "Is"
      ]}
      correctAnswer={0}
      explanation="Con 'you' y el verbo principal 'speak' usamos el auxiliar 'Do' para hacer preguntas."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which question is grammatically correct?"
      options={[
        "Who does live in that house?",
        "Who lives in that house?",
        "Who do live in that house?",
        "Who is live in that house?"
      ]}
      correctAnswer={1}
      explanation="En subject questions con 'who', no usamos auxiliar. 'Who lives...' es correcto."
    />,

    <MultipleChoiceExercise
      key="3"
      question="What's the correct question tag for: 'She doesn't like coffee'?"
      options={[
        "doesn't she?",
        "does she?",
        "isn't she?",
        "is she?"
      ]}
      correctAnswer={1}
      explanation="Oración negativa necesita question tag positivo: 'does she?'"
    />,

    <TrueFalseExercise
      key="4"
      statements={[
        {
          text: "In indirect questions, we use the same word order as in statements.",
          isTrue: true,
          explanation: "Correcto. Las preguntas indirectas usan orden de oración afirmativa."
        },
        {
          text: "Question tags always use the same auxiliary as the main sentence.",
          isTrue: true,
          explanation: "Correcto. El question tag debe usar el mismo auxiliar que la oración principal."
        },
        {
          text: "We always need an auxiliary verb in wh-questions.",
          isTrue: false,
          explanation: "Falso. Las subject questions no necesitan auxiliar: 'Who called?'"
        },
        {
          text: "'Do you are tired?' is correct English.",
          isTrue: false,
          explanation: "Falso. Con 'to be' no usamos auxiliar 'do': 'Are you tired?'"
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which is the most polite way to ask for directions?"
      options={[
        "Where is the station?",
        "Tell me where the station is.",
        "Could you tell me where the station is?",
        "Where's the station at?"
      ]}
      correctAnswer={2}
      explanation="'Could you tell me...' es la forma más educada de hacer una pregunta indirecta."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: '_____ old are you?'"
      options={[
        "What",
        "How",
        "Where",
        "When"
      ]}
      correctAnswer={1}
      explanation="Para preguntar sobre edad usamos 'How old are you?'"
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: '_____ did you see at the party?'"
      options={[
        "Who",
        "Whom", 
        "Which",
        "What"
      ]}
      correctAnswer={0}
      explanation="'Who' es correcto para preguntar sobre personas en contexto informal."
    />,

    <MultipleChoiceExercise
      key="8"
      question="What's the correct question tag for: 'I am late'?"
      options={[
        "am I?",
        "aren't I?",
        "isn't I?",
        "don't I?"
      ]}
      correctAnswer={1}
      explanation="Con 'I am', el question tag es 'aren't I?' (forma especial)."
    />,

    <MultipleChoiceExercise
      key="9"
      question="Complete: '_____ you help me?' (most polite)"
      options={[
        "Can",
        "Could",
        "Will",
        "Do"
      ]}
      correctAnswer={1}
      explanation="'Could you help me?' es la forma más educada de pedir ayuda."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Which is the correct indirect question form of 'Where does she work?'"
      options={[
        "Do you know where does she work?",
        "Do you know where she works?",
        "Do you know where works she?",
        "Do you know she works where?"
      ]}
      correctAnswer={1}
      explanation="En preguntas indirectas usamos orden afirmativo: 'where she works'."
    />
  ];

  return (
    <TheoryLayout
      title="Question Formation"
      description="Domina la formación de preguntas en inglés: yes/no questions, wh-questions, question tags y preguntas indirectas para comunicarte con precisión."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Tiempos verbales básicos", "Auxiliares", "Pronombres"]}
      estimatedTime="50 min"
    />
  );
};

export default QuestionFormationPage;

