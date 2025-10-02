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

const RelativeClausesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="Cláusulas Relativas (Relative Clauses)" icon="🔗">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las <strong>cláusulas relativas</strong> son oraciones subordinadas que proporcionan información adicional 
          sobre un sustantivo. Nos permiten combinar oraciones y crear textos más sofisticados y fluidos, 
          esenciales para niveles B1 y superiores.
        </p>
        
        <QuickReference items={[
          "Defining clauses: información esencial (sin comas)",
          "Non-defining clauses: información extra (con comas)",
          "Relative pronouns: who, which, that, whose, where, when",
          "Se pueden omitir en ciertos casos",
          "Preposiciones pueden ir al final o antes del pronombre"
        ]} />
      </TheorySection>

      <TheorySection title="Pronombres Relativos" icon="👥">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los pronombres relativos conectan la cláusula relativa con el sustantivo que modifican.
        </p>

        <GrammarTable
          caption="Pronombres Relativos y sus Usos"
          headers={["Pronombre", "Se refiere a", "Función", "Ejemplo"]}
          rows={[
            ["who", "Personas", "Sujeto u objeto", "The man who lives next door"],
            ["whom", "Personas (formal)", "Objeto", "The person whom I met"],
            ["which", "Cosas/animales", "Sujeto u objeto", "The book which I read"],
            ["that", "Personas/cosas", "Sujeto u objeto", "The car that I bought"],
            ["whose", "Posesión", "Posesivo", "The woman whose car broke down"],
            ["where", "Lugares", "Adverbial", "The place where we met"],
            ["when", "Tiempo", "Adverbial", "The day when it happened"],
            ["why", "Razón", "Adverbial", "The reason why I left"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="El hombre que vive al lado es médico."
            english="The man who lives next door is a doctor."
            translation="'Who' se refiere a persona (sujeto)"
          />
          
          <Example 
            spanish="El libro que leí era interesante."
            english="The book that/which I read was interesting."
            translation="'That/which' se refiere a cosa (objeto)"
          />
        </div>

        <Tip type="info">
          <strong>Diferencia:</strong> 'Who' para personas, 'which' para cosas, 'that' para ambos (más informal).
        </Tip>
      </TheorySection>

      <TheorySection title="Defining vs Non-defining Clauses" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La diferencia entre cláusulas defining y non-defining afecta el significado y la puntuación.
        </p>

        <GrammarTable
          caption="Tipos de Cláusulas Relativas"
          headers={["Tipo", "Función", "Puntuación", "Ejemplo"]}
          rows={[
            ["Defining", "Información esencial para identificar", "Sin comas", "The students who study hard pass exams"],
            ["Non-defining", "Información extra, no esencial", "Con comas", "My brother, who lives in London, is a doctor"],
            ["Defining", "Especifica cuál exactamente", "Sin comas", "The car that I bought is red"],
            ["Non-defining", "Añade información adicional", "Con comas", "This car, which cost £20,000, is very reliable"]
          ]}
        />

        <Rule 
          title="Reglas importantes para Defining vs Non-defining"
          description="Diferencias clave entre ambos tipos:"
          examples={[
            "Defining: NO uses comas, información necesaria",
            "Non-defining: SÍ uses comas, información opcional",
            "Defining: Puedes usar 'that'",
            "Non-defining: NO puedes usar 'that', solo who/which",
            "Defining: Puedes omitir el pronombre (objeto)",
            "Non-defining: NUNCA omitas el pronombre"
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Los estudiantes que estudian mucho aprueban. (defining - especifica qué estudiantes)"
            english="The students who study hard pass."
            translation="Sin comas - información esencial"
          />
          
          <Example 
            spanish="Los estudiantes, que estudian mucho, aprueban. (non-defining - todos los estudiantes)"
            english="The students, who study hard, pass."
            translation="Con comas - información adicional"
          />
        </div>
      </TheorySection>

      <TheorySection title="Omisión de Pronombres Relativos" icon="👻">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          En cláusulas defining, a veces podemos omitir el pronombre relativo para un inglés más natural.
        </p>

        <Rule 
          title="Cuándo omitir pronombres relativos"
          description="Solo en cláusulas defining cuando el pronombre es objeto:"
          examples={[
            "The book (that/which) I read → The book I read",
            "The person (who/that) I met → The person I met",
            "The car (that/which) he bought → The car he bought"
          ]}
        />

        <GrammarTable
          caption="Omisión de Pronombres"
          headers={["Función", "Se puede omitir", "Ejemplo con pronombre", "Ejemplo sin pronombre"]}
          rows={[
            ["Objeto", "✅ Sí", "The book that I read", "The book I read"],
            ["Sujeto", "❌ No", "The man who called", "❌ The man called"],
            ["Con preposición", "✅ Sí (informal)", "The house that I live in", "The house I live in"],
            ["Posesivo (whose)", "❌ No", "The woman whose car...", "❌ The woman car..."]
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Si puedes quitar el pronombre y la oración sigue teniendo sentido, 
          entonces era objeto y se puede omitir.
        </Tip>
      </TheorySection>

      <TheorySection title="Preposiciones en Cláusulas Relativas" icon="🌉">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las preposiciones pueden ir al final de la cláusula (informal) o antes del pronombre (formal).
        </p>

        <GrammarTable
          caption="Posición de Preposiciones"
          headers={["Estilo", "Estructura", "Ejemplo", "Registro"]}
          rows={[
            ["Informal", "Preposición al final", "The house (that) I live in", "Conversacional"],
            ["Formal", "Preposición + whom/which", "The house in which I live", "Académico/escrito"],
            ["Informal", "Preposición al final", "The person (who) I talked to", "Conversacional"],
            ["Formal", "Preposición + whom", "The person to whom I talked", "Académico/escrito"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="La casa en la que vivo es antigua. (informal)"
            english="The house I live in is old."
            translation="Preposición al final, pronombre omitido"
          />
          
          <Example 
            spanish="La casa en la que vivo es antigua. (formal)"
            english="The house in which I live is old."
            translation="Preposición antes del pronombre"
          />
        </div>

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Con preposiciones al inicio, usa 'whom' (personas) o 'which' (cosas), 
          nunca 'who' o 'that'.
        </Tip>
      </TheorySection>

      <TheorySection title="Cláusulas con Where, When, Why" icon="📍⏰❓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estos pronombres relativos se refieren a lugar, tiempo y razón respectivamente.
        </p>

        <GrammarTable
          caption="Where, When, Why en Cláusulas Relativas"
          headers={["Pronombre", "Reemplaza", "Ejemplo", "Alternativa formal"]}
          rows={[
            ["where", "in/at/on + which", "The place where we met", "The place at which we met"],
            ["when", "in/on/at + which", "The day when it happened", "The day on which it happened"],
            ["why", "for which", "The reason why I left", "The reason for which I left"],
            ["where", "in/at + which", "The school where I studied", "The school at which I studied"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Esta es la ciudad donde nací."
            english="This is the city where I was born."
            translation="'Where' = in which"
          />
          
          <Example 
            spanish="¿Recuerdas el día cuando nos conocimos?"
            english="Do you remember the day when we met?"
            translation="'When' = on which"
          />
          
          <Example 
            spanish="No entiendo la razón por la que se fue."
            english="I don't understand the reason why he left."
            translation="'Why' = for which"
          />
        </div>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "The man, that lives next door, is nice" ❌<br/>
            <strong>Correcto:</strong> "The man, who lives next door, is nice" ✅<br/>
            <em>En non-defining clauses no uses 'that'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "The book what I read" ❌<br/>
            <strong>Correcto:</strong> "The book that/which I read" ✅<br/>
            <em>'What' no es pronombre relativo en este contexto</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "The woman whose I met" ❌<br/>
            <strong>Correcto:</strong> "The woman who I met" o "The woman whose husband I met" ✅<br/>
            <em>'Whose' es solo para posesión</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "The place where I went to" ❌<br/>
            <strong>Correcto:</strong> "The place where I went" o "The place I went to" ✅<br/>
            <em>No uses preposición extra con 'where'</em>
          </Tip>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'The woman _____ lives next door is a teacher.'"
      options={[
        "who",
        "which",
        "where",
        "whose"
      ]}
      correctAnswer={0}
      explanation="Para personas como sujeto usamos 'who': 'The woman who lives next door'."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Which sentence is correct?"
      options={[
        "The students, that study hard, pass exams.",
        "The students, who study hard, pass exams.",
        "The students who study hard pass exams.",
        "Both B and C are correct."
      ]}
      correctAnswer={3}
      explanation="B es non-defining (información extra), C es defining (información esencial). Ambas son correctas pero tienen significados diferentes."
    />,

    <MultipleChoiceExercise
      key="3"
      question="In which sentence can you omit the relative pronoun?"
      options={[
        "The man who called you is here.",
        "The book that I bought is expensive.",
        "The woman whose car broke down needs help.",
        "The students who study hard succeed."
      ]}
      correctAnswer={1}
      explanation="En 'The book that I bought', 'that' es objeto y se puede omitir: 'The book I bought'."
    />,

    <TrueFalseExercise
      key="4"
      statements={[
        {
          text: "You can use 'that' in non-defining relative clauses.",
          isTrue: false,
          explanation: "Falso. En non-defining clauses solo puedes usar who, which, whose, etc., pero no 'that'."
        },
        {
          text: "You can omit relative pronouns when they are the subject of the clause.",
          isTrue: false,
          explanation: "Falso. Solo puedes omitir pronombres relativos cuando son objeto, no sujeto."
        },
        {
          text: "'Where' can replace 'in which', 'at which', or 'on which'.",
          isTrue: true,
          explanation: "Correcto. 'Where' es una forma más simple de expresar lugar."
        },
        {
          text: "Non-defining relative clauses are always separated by commas.",
          isTrue: true,
          explanation: "Correcto. Las non-defining clauses siempre van entre comas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="5"
      question="What's the formal way to say: 'The person I was talking to'?"
      options={[
        "The person to who I was talking",
        "The person to whom I was talking",
        "The person to which I was talking",
        "The person to that I was talking"
      ]}
      correctAnswer={1}
      explanation="En estilo formal, la preposición va antes del pronombre: 'to whom' (para personas)."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: 'The girl _____ mother is a doctor studies medicine.'"
      options={[
        "who",
        "which",
        "whose",
        "where"
      ]}
      correctAnswer={2}
      explanation="Para expresar posesión usamos 'whose': 'The girl whose mother is a doctor'."
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'The movie _____ we watched last night was boring.'"
      options={[
        "who",
        "which",
        "where",
        "Both A and B are correct"
      ]}
      correctAnswer={1}
      explanation="Para cosas usamos 'which' o 'that'. En este caso 'which' es la mejor opción."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which sentence needs commas?"
      options={[
        "The students who study hard will pass.",
        "My brother who lives in London is a doctor.",
        "The book that you lent me was interesting.",
        "The car which I bought is red."
      ]}
      correctAnswer={1}
      explanation="'My brother, who lives in London, is a doctor' necesita comas (non-defining clause)."
    />,

    <MultipleChoiceExercise
      key="9"
      question="Complete: 'This is the restaurant _____ we had dinner.'"
      options={[
        "which",
        "where",
        "that",
        "who"
      ]}
      correctAnswer={1}
      explanation="Para lugares usamos 'where': 'the restaurant where we had dinner'."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Which is the most formal way to say: 'The company I work for'?"
      options={[
        "The company I work for",
        "The company for which I work",
        "The company that I work for",
        "The company where I work"
      ]}
      correctAnswer={1}
      explanation="'The company for which I work' es la forma más formal con preposición al inicio."
    />
  ];

  return (
    <TheoryLayout
      title="Relative Clauses"
      description="Domina las cláusulas relativas para crear oraciones más sofisticadas. Aprende sobre pronombres relativos, defining vs non-defining clauses y cuándo omitir pronombres."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Pronombres", "Estructura básica de oraciones", "Tiempos verbales"]}
      estimatedTime="55 min"
    />
  );
};

export default RelativeClausesPage;

