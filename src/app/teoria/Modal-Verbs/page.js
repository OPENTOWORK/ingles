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
      <TheorySection title="¿Qué son los Modal Verbs?" icon="⚡">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>modal verbs</strong> (verbos modales) son verbos auxiliares que expresan actitud, posibilidad, 
          obligación, permiso, habilidad o consejo. No tienen infinitivo, gerundio ni participio pasado, y se usan 
          con el verbo principal en infinitivo sin 'to'.
        </p>
        
        <QuickReference items={[
          "Expresan actitud y opinión",
          "No tienen formas de tiempo",
          "Van seguidos de infinitivo sin 'to'",
          "No necesitan auxiliares do/does/did",
          "Can, could, may, might, must, should, will, would"
        ]} />
      </TheorySection>

      <TheorySection title="Modal Verbs Básicos" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los modal verbs principales y sus usos más comunes.
        </p>

        <GrammarTable
          caption="Modal Verbs Principales"
          headers={["Modal", "Uso Principal", "Ejemplo", "Significado"]}
          rows={[
            ["can", "habilidad, permiso", "I can swim", "Puedo nadar"],
            ["could", "habilidad pasada, posibilidad", "I could help you", "Podría ayudarte"],
            ["may", "permiso formal, posibilidad", "May I go?", "¿Puedo ir?"],
            ["might", "posibilidad débil", "It might rain", "Podría llover"],
            ["must", "obligación fuerte", "You must study", "Debes estudiar"],
            ["should", "consejo, obligación débil", "You should rest", "Deberías descansar"],
            ["will", "futuro, voluntad", "I will help you", "Te ayudaré"],
            ["would", "condicional, cortesía", "I would like coffee", "Me gustaría café"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Puedo hablar inglés"
            english="I can speak English"
            translation="Puedo hablar inglés"
          />
          <Example 
            spanish="Debes hacer tu tarea"
            english="You must do your homework"
            translation="Debes hacer tu tarea"
          />
          <Example 
            spanish="¿Puedo usar tu teléfono?"
            english="May I use your phone?"
            translation="¿Puedo usar tu teléfono?"
          />
        </div>

        <Rule 
          title="Reglas Básicas"
          description="Todos los modal verbs siguen estas reglas:"
          examples={[
            "Van seguidos de infinitivo sin 'to'",
            "No añaden -s en tercera persona",
            "No usan do/does/did en negativas e interrogativas",
            "Se colocan antes del verbo principal"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Los modal verbs no cambian según la persona. Siempre mantienen la misma forma.
        </Tip>
      </TheorySection>

      <TheorySection title="Ability (Habilidad)" icon="💪">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Para expresar habilidad física o mental, capacidad o posibilidad.
        </p>

        <GrammarTable
          caption="Modal Verbs para Habilidad"
          headers={["Modal", "Tiempo", "Uso", "Ejemplo"]}
          rows={[
            ["can", "presente", "habilidad actual", "I can drive"],
            ["could", "pasado", "habilidad pasada", "I could swim when I was 5"],
            ["be able to", "todos", "habilidad específica", "I was able to finish the project"],
            ["cannot/can't", "presente", "falta de habilidad", "I can't speak French"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Puedo tocar el piano"
            english="I can play the piano"
            translation="Puedo tocar el piano"
          />
          <Example 
            spanish="Cuando era niño, podía correr muy rápido"
            english="When I was a child, I could run very fast"
            translation="Cuando era niño, podía correr muy rápido"
          />
          <Example 
            spanish="No pude terminar el trabajo a tiempo"
            english="I wasn't able to finish the work on time"
            translation="No pude terminar el trabajo a tiempo"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Usa 'be able to' cuando necesites formas específicas de tiempo que 'can' no puede expresar.
        </Tip>
      </TheorySection>

      <TheorySection title="Permission (Permiso)" icon="🖐️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Para pedir, dar o negar permiso de manera formal o informal.
        </p>

        <GrammarTable
          caption="Modal Verbs para Permiso"
          headers={["Modal", "Formalidad", "Uso", "Ejemplo"]}
          rows={[
            ["can", "informal", "permiso cotidiano", "Can I go to the bathroom?"],
            ["may", "formal", "permiso formal", "May I leave early?"],
            ["could", "cortés", "pedir permiso cortésmente", "Could I borrow your pen?"],
            ["cannot/can't", "informal", "negar permiso", "You can't smoke here"],
            ["may not", "formal", "negar permiso formal", "You may not enter"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="¿Puedo salir temprano?"
            english="May I leave early?"
            translation="¿Puedo salir temprano?"
          />
          <Example 
            spanish="¿Podrías prestarme tu libro?"
            english="Could you lend me your book?"
            translation="¿Podrías prestarme tu libro?"
          />
          <Example 
            spanish="No puedes usar tu teléfono aquí"
            english="You cannot use your phone here"
            translation="No puedes usar tu teléfono aquí"
          />
        </div>

        <Rule 
          title="Niveles de Formalidad"
          description="Orden de formalidad para pedir permiso:"
          examples={[
            "Más formal: May I...?",
            "Cortés: Could I...?",
            "Informal: Can I...?",
            "Elige según el contexto"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> 'May' es más formal que 'can'. En contextos académicos o profesionales, usa 'may'.
        </Tip>
      </TheorySection>

      <TheorySection title="Possibility (Posibilidad)" icon="🎲">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Para expresar diferentes grados de posibilidad o probabilidad.
        </p>

        <GrammarTable
          caption="Modal Verbs para Posibilidad"
          headers={["Modal", "Grado", "Uso", "Ejemplo"]}
          rows={[
            ["must", "muy alto (90%)", "deducción lógica", "You must be tired"],
            ["may", "medio (50%)", "posibilidad real", "It may rain tomorrow"],
            ["might", "bajo (30%)", "posibilidad débil", "I might come to the party"],
            ["could", "posible", "posibilidad teórica", "It could be true"],
            ["can't", "imposible", "imposibilidad", "That can't be right"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Debe estar cansado (muy probable)"
            english="He must be tired"
            translation="Debe estar cansado"
          />
          <Example 
            spanish="Puede que llueva mañana"
            english="It may rain tomorrow"
            translation="Puede que llueva mañana"
          />
          <Example 
            spanish="Podría venir a la fiesta"
            english="I might come to the party"
            translation="Podría venir a la fiesta"
          />
        </div>

        <Rule 
          title="Grados de Posibilidad"
          description="Orden de probabilidad (de mayor a menor):"
          examples={[
            "must (casi seguro)",
            "may (posible)",
            "might (menos probable)",
            "could (teóricamente posible)"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Usa 'must' para deducciones lógicas basadas en evidencia, no para obligación en este contexto.
        </Tip>
      </TheorySection>

      <TheorySection title="Obligation (Obligación)" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Para expresar diferentes tipos y grados de obligación.
        </p>

        <GrammarTable
          caption="Modal Verbs para Obligación"
          headers={["Modal", "Tipo", "Grado", "Ejemplo"]}
          rows={[
            ["must", "obligación personal", "fuerte", "I must finish this today"],
            ["have to", "obligación externa", "fuerte", "I have to work tomorrow"],
            ["should", "consejo/recomendación", "débil", "You should exercise more"],
            ["ought to", "consejo moral", "débil", "You ought to apologize"],
            ["don't have to", "no obligación", "ninguna", "You don't have to come"],
            ["mustn't", "prohibición", "fuerte", "You mustn't smoke here"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Debo terminar este trabajo hoy"
            english="I must finish this work today"
            translation="Debo terminar este trabajo hoy"
          />
          <Example 
            spanish="Tengo que trabajar mañana"
            english="I have to work tomorrow"
            translation="Tengo que trabajar mañana"
          />
          <Example 
            spanish="Deberías hacer más ejercicio"
            english="You should exercise more"
            translation="Deberías hacer más ejercicio"
          />
        </div>

        <Rule 
          title="Must vs Have to"
          description="Diferencias importantes:"
          examples={[
            "Must: obligación personal, interna",
            "Have to: obligación externa, reglas",
            "Must: más subjetivo",
            "Have to: más objetivo"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> 'Must' expresa obligación personal, mientras que 'have to' expresa obligación externa o reglas.
        </Tip>
      </TheorySection>

      <TheorySection title="Advice (Consejo)" icon="💡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Para dar consejos, sugerencias y recomendaciones.
        </p>

        <GrammarTable
          caption="Modal Verbs para Consejo"
          headers={["Modal", "Intensidad", "Uso", "Ejemplo"]}
          rows={[
            ["should", "recomendación", "consejo general", "You should see a doctor"],
            ["ought to", "moral", "consejo moral", "You ought to help them"],
            ["had better", "urgente", "consejo fuerte", "You'd better hurry"],
            ["could", "sugerencia", "opción suave", "You could try yoga"],
            ["might want to", "sugerencia", "opción muy suave", "You might want to call her"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Deberías ver a un doctor"
            english="You should see a doctor"
            translation="Deberías ver a un doctor"
          />
          <Example 
            spanish="Deberías ayudarlos"
            english="You ought to help them"
            translation="Deberías ayudarlos"
          />
          <Example 
            spanish="Mejor te apuras"
            english="You'd better hurry"
            translation="Mejor te apuras"
          />
        </div>

        <Tip type="warning">
          <strong>¡Cuidado!</strong> 'Had better' implica advertencia. Se usa para consejos urgentes o con consecuencias.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Usar 'to' después de modales ❌<br/>
            <strong>Correcto:</strong> Infinitivo sin 'to' ✅<br/>
            <em>I can to swim. → I can swim.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Añadir -s en tercera persona ❌<br/>
            <strong>Correcto:</strong> Los modales no cambian ✅<br/>
            <em>He cans swim. → He can swim.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar do/does en negativas ❌<br/>
            <strong>Correcto:</strong> Añadir 'not' directamente ✅<br/>
            <em>I don't can swim. → I can't swim.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Confundir must y have to ❌<br/>
            <strong>Correcto:</strong> Entender la diferencia ✅<br/>
            <em>I must work (personal) vs I have to work (regla externa)</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar may en contextos informales ❌<br/>
            <strong>Correcto:</strong> Usar can en contextos informales ✅<br/>
            <em>May I go? (formal) vs Can I go? (informal)</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Estructura básica"
            description="Los modal verbs siguen una estructura específica."
            examples={[
              "Sujeto + modal + infinitivo (sin 'to')",
              "No cambian según la persona",
              "No usan auxiliares do/does/did",
              "La negativa se forma con 'not'"
            ]}
          />

          <Rule 
            title="2. No tienen formas de tiempo"
            description="Los modales no tienen pasado, presente o futuro."
            examples={[
              "Usa 'could' para pasado de 'can'",
              "Usa 'would' para pasado de 'will'",
              "Para otros tiempos, usa 'be able to'",
              "O usa perífrasis verbales"
            ]}
          />

          <Rule 
            title="3. Contexto y formalidad"
            description="Elige el modal según el contexto."
            examples={[
              "Formal: may, ought to",
              "Informal: can, should",
              "Cortés: could, might",
              "Considera la situación"
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
      explanation="'Should' expresa consejo o recomendación, lo más apropiado en este contexto."
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
      explanation="'Mustn't' expresa prohibición fuerte. Es una regla que no se puede romper."
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Cuál expresa posibilidad en el pasado?"
      options={[
        "He can be at home",
        "He could be at home",
        "He might have been at home",
        "He must be at home"
      ]}
      correctAnswer={2}
      explanation="'Might have been' expresa posibilidad sobre algo que ocurrió en el pasado."
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
      explanation="Para habilidades generales en el pasado, tanto 'could' como 'was able to' son correctos."
    />,

    <MultipleChoiceExercise
      key="9"
      question="¿Cuál es más educado?"
      options={[
        "Can you help me?",
        "Could you help me?",
        "Will you help me?",
        "Do you help me?"
      ]}
      correctAnswer={1}
      explanation="'Could you...?' es más educado y formal que 'Can you...?'"
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
      explanation="'Can', 'could' y 'may' pueden expresar posibilidad presente. 'Could' y 'may' son más formales."
    />
  ];

  return (
    <TheoryLayout
      title="Modal Verbs"
      description="Domina los verbos modales en inglés. Aprende a expresar habilidad, posibilidad, obligación, permiso y consejos con can, could, must, should, may, might."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic verb tenses", "Understanding of auxiliary verbs"]}
      estimatedTime="85 min"
    />
  );
};

export default ModalVerbsPage;