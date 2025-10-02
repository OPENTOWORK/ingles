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

const CollocationsandPhrasalVerbsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Collocations and Phrasal Verbs?" icon="📝">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>collocations and phrasal verbs</strong> son elementos fundamentales de la gramática inglesa que 
          nos ayudan a expresar ideas de manera precisa y efectiva.
        </p>
        
        <QuickReference items={[
          "Conceptos básicos y avanzados",
          "Ejemplos prácticos",
          "Reglas de uso",
          "Errores comunes",
          "Ejercicios interactivos"
        ]} />
      </TheorySection>

      <TheorySection title="Conceptos Básicos" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Comencemos con los conceptos fundamentales que necesitas dominar.
        </p>

        <GrammarTable
          caption="Conceptos Principales"
          headers={["Concepto", "Definición", "Ejemplo"]}
          rows={[
            ["Concepto 1", "Definición básica", "Ejemplo práctico"],
            ["Concepto 2", "Definición básica", "Ejemplo práctico"],
            ["Concepto 3", "Definición básica", "Ejemplo práctico"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Ejemplo en español"
            english="Example in English"
            translation="Traducción al español"
          />
          <Example 
            spanish="Otro ejemplo en español"
            english="Another example in English"
            translation="Otra traducción al español"
          />
        </div>

        <Rule 
          title="Regla Principal"
          description="Descripción de la regla principal:"
          examples={[
            "Ejemplo de uso correcto 1",
            "Ejemplo de uso correcto 2",
            "Ejemplo de uso correcto 3"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Tip importante para recordar.
        </Tip>
      </TheorySection>

      <TheorySection title="Conceptos Avanzados" icon="🚀">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Ahora exploremos conceptos más avanzados y casos especiales.
        </p>

        <GrammarTable
          caption="Casos Especiales"
          headers={["Caso", "Uso", "Ejemplo"]}
          rows={[
            ["Caso especial 1", "Cuándo usarlo", "Ejemplo específico"],
            ["Caso especial 2", "Cuándo usarlo", "Ejemplo específico"],
            ["Caso especial 3", "Cuándo usarlo", "Ejemplo específico"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Ejemplo avanzado en español"
            english="Advanced example in English"
            translation="Traducción del ejemplo avanzado"
          />
        </div>

        <Rule 
          title="Reglas Avanzadas"
          description="Reglas para casos especiales:"
          examples={[
            "Ejemplo de caso especial 1",
            "Ejemplo de caso especial 2"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Advertencia sobre errores comunes.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Error común ❌<br/>
            <strong>Correcto:</strong> Forma correcta ✅<br/>
            <em>Explicación del error y cómo corregirlo.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Otro error común ❌<br/>
            <strong>Correcto:</strong> Otra forma correcta ✅<br/>
            <em>Explicación del segundo error.</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Regla fundamental"
            description="Descripción de la regla fundamental."
            examples={[
              "Ejemplo de aplicación 1",
              "Ejemplo de aplicación 2",
              "Ejemplo de aplicación 3"
            ]}
          />

          <Rule 
            title="2. Segunda regla importante"
            description="Descripción de la segunda regla."
            examples={[
              "Ejemplo de segunda regla 1",
              "Ejemplo de segunda regla 2"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'I need to _____ up early tomorrow.'"
      options={[
        "get",
        "take",
        "make",
        "do"
      ]}
      correctAnswer={0}
      explanation="'Get up' es un phrasal verb que significa levantarse/despertarse."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Choose the correct collocation: 'I need to ___ a decision about my future.'"
      options={[
        "do",
        "make",
        "take",
        "have"
      ]}
      correctAnswer={1}
      explanation="'Make a decision' es la colocación correcta. Usamos 'make' con decisiones, planes, y elecciones."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'Turn on' and 'turn off' are separable phrasal verbs.",
          isTrue: true,
          explanation: "Correcto. Podemos decir 'turn on the light' o 'turn the light on'."
        },
        {
          text: "'Look after' means 'to search for something'.",
          isTrue: false,
          explanation: "Incorrecto. 'Look after' significa cuidar de alguien o algo. 'Look for' significa buscar."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Complete: 'She ___ her job last month.'"
      options={[
        "gave up",
        "gave in",
        "gave out",
        "gave away"
      ]}
      correctAnswer={0}
      explanation="'Give up' significa abandonar o renunciar a algo: 'She gave up her job' (Ella renunció a su trabajo)."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Choose the correct collocation: 'I ___ a mistake in my homework.'"
      options={[
        "did",
        "made",
        "took",
        "had"
      ]}
      correctAnswer={1}
      explanation="'Make a mistake' es la colocación correcta. Usamos 'make' con errores y equivocaciones."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "'Put off' means to postpone something.",
          isTrue: true,
          explanation: "Correcto. 'Put off' significa posponer o retrasar algo: 'I put off the meeting'."
        },
        {
          text: "We say 'do homework' not 'make homework'.",
          isTrue: true,
          explanation: "Correcto. 'Do homework' es la colocación correcta en inglés."
        },
        {
          text: "'Run into' means to exercise by running.",
          isTrue: false,
          explanation: "Incorrecto. 'Run into' significa encontrarse con alguien por casualidad o chocar con algo."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'I ___ my old friend at the supermarket yesterday.'"
      options={[
        "ran into",
        "ran out of",
        "ran away",
        "ran over"
      ]}
      correctAnswer={0}
      explanation="'Run into' significa encontrarse con alguien por casualidad: 'I ran into my old friend'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Choose the correct collocation: 'Can you ___ me a favor?'"
      options={[
        "make",
        "do",
        "take",
        "give"
      ]}
      correctAnswer={1}
      explanation="'Do someone a favor' es la colocación correcta para pedir un favor."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Break down' can mean both 'to stop working' and 'to become emotional'.",
          isTrue: true,
          explanation: "Correcto. 'Break down' tiene múltiples significados: una máquina se descompone o una persona se quiebra emocionalmente."
        },
        {
          text: "We say 'take a photo' not 'make a photo'.",
          isTrue: true,
          explanation: "Correcto. En inglés decimos 'take a photo/picture', no 'make'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'I need to ___ early tomorrow for my flight.'"
      options={[
        "get up",
        "get on",
        "get off",
        "get over"
      ]}
      correctAnswer={0}
      explanation="'Get up' significa levantarse de la cama: 'I need to get up early' (Necesito levantarme temprano)."
    />
  ];

  return (
    <TheoryLayout
      title="Collocations and Phrasal Verbs"
      description="Domina las colocaciones y verbos frasales en inglés. Aprende combinaciones naturales de palabras y verbos con partículas para sonar más natural."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic grammar knowledge", "Understanding of sentence structure"]}
      estimatedTime="90 min"
    />
  );
};

export default CollocationsandPhrasalVerbsPage;