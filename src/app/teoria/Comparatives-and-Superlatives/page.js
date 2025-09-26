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

const ComparativesandSuperlativesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Comparatives and Superlatives?" icon="📝">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>comparatives and superlatives</strong> son elementos fundamentales de la gramática inglesa que 
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
    <FillBlanksExercise
      key="1"
      text="Ejemplo de ejercicio de completar espacios: ___ (palabra) ___ (palabra)."
      blanks={[
        { answer: "Respuesta1" },
        { answer: "Respuesta2" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la pregunta del ejercicio de opción múltiple?"
      options={[
        "Opción incorrecta 1",
        "Opción correcta",
        "Opción incorrecta 2",
        "Opción incorrecta 3"
      ]}
      correctAnswer={1}
      explanation="Explicación de por qué la opción correcta es la respuesta."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Esta afirmación es verdadera.",
          isTrue: true,
          explanation: "Explicación de por qué esta afirmación es verdadera."
        },
        {
          text: "Esta afirmación es falsa.",
          isTrue: false,
          explanation: "Explicación de por qué esta afirmación es falsa."
        }
      ]}
    />
  ];

  return (
    <TheoryLayout
      title="Comparatives and Superlatives"
      description="Domina los comparativos y superlativos en inglés. Aprende a comparar personas, cosas y situaciones usando -er, -est, more, most y estructuras especiales."
      level="A2-B1"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic grammar knowledge", "Understanding of sentence structure"]}
      estimatedTime="70 min"
    />
  );
};

export default ComparativesandSuperlativesPage;