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
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'This book is _____ than that one.'"
      options={[
        "more interesting",
        "most interesting",
        "interestinger",
        "interestingest"
      ]}
      correctAnswer={0}
      explanation="Para adjetivos largos (3+ sílabas) usamos 'more + adjective' para comparativo."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Complete: 'She is the ___ student in the class.'"
      options={[
        "more intelligent",
        "most intelligent",
        "intelligenter",
        "intelligentest"
      ]}
      correctAnswer={1}
      explanation="Para superlativos de adjetivos largos (3+ sílabas) usamos 'the most + adjective': 'the most intelligent'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "We say 'more better' for emphasis.",
          isTrue: false,
          explanation: "Incorrecto. 'Better' ya es comparativo. No podemos decir 'more better', solo 'better'."
        },
        {
          text: "One-syllable adjectives usually add -er for comparative.",
          isTrue: true,
          explanation: "Correcto. Adjetivos de una sílaba añaden -er: tall → taller, fast → faster."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Complete: 'Today is ___ than yesterday.'"
      options={[
        "more hot",
        "hotter",
        "hoter",
        "most hot"
      ]}
      correctAnswer={1}
      explanation="'Hot' es un adjetivo corto, duplicamos la consonante final y añadimos -er: 'hotter'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es el superlativo de 'bad'?"
      options={[
        "baddest",
        "most bad",
        "worst",
        "worse"
      ]}
      correctAnswer={2}
      explanation="'Bad' tiene forma irregular: bad → worse → worst. 'Worst' es el superlativo."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "'Far' has two comparative forms: 'farther' and 'further'.",
          isTrue: true,
          explanation: "Correcto. 'Farther' para distancia física, 'further' para distancia abstracta o adicional."
        },
        {
          text: "We can say 'This is the most good book'.",
          isTrue: false,
          explanation: "Incorrecto. 'Good' es irregular: good → better → best. Decimos 'This is the best book'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'This exercise is ___ difficult than the previous one.'"
      options={[
        "more",
        "most",
        "much",
        "many"
      ]}
      correctAnswer={0}
      explanation="Para adjetivos largos usamos 'more + adjective' en comparativo: 'more difficult'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: 'John is ___ his brother.'"
      options={[
        "as tall than",
        "as tall as",
        "so tall as",
        "tall as"
      ]}
      correctAnswer={1}
      explanation="Para igualdad usamos 'as + adjective + as': 'John is as tall as his brother'."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Less' is the opposite of 'more' in comparisons.",
          isTrue: true,
          explanation: "Correcto. 'Less' se usa para comparativos negativos: 'less expensive' = 'cheaper'."
        },
        {
          text: "We can use 'much' to emphasize comparatives.",
          isTrue: true,
          explanation: "Correcto. 'Much better', 'much more expensive', 'much taller' enfatizan la diferencia."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'This is ___ movie I've ever seen.'"
      options={[
        "the worse",
        "the worst",
        "the baddest",
        "the most bad"
      ]}
      correctAnswer={1}
      explanation="'Bad' es irregular: bad → worse → worst. 'The worst' es el superlativo correcto."
    />
  ];

  return (
    <TheoryLayout
      title="Comparatives and Superlatives"
      description="Domina los comparativos y superlativos en inglés. Aprende a comparar personas, cosas y situaciones usando -er, -est, more, most y estructuras especiales."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic grammar knowledge", "Understanding of sentence structure"]}
      estimatedTime="70 min"
    />
  );
};

export default ComparativesandSuperlativesPage;