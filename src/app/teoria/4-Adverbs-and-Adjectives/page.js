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

const AdverbsAndAdjectivesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Adverbs y Adjectives?" icon="📝">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>adjectives</strong> (adjetivos) describen sustantivos, mientras que los <strong>adverbs</strong> (adverbios) 
          modifican verbos, adjetivos u otros adverbios. Son fundamentales para dar detalles y matices a nuestras oraciones.
        </p>
        
        <QuickReference items={[
          "Adjectives: describen sustantivos (big house)",
          "Adverbs: modifican verbos (run quickly)",
          "Posición: adjetivos antes del sustantivo",
          "Formación: muchos adverbios terminan en -ly",
          "Comparativos y superlativos para ambos"
        ]} />
      </TheorySection>

      <TheorySection title="Adjectives (Adjetivos)" icon="🎨">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los adjetivos describen cualidades, características o estados de los sustantivos.
        </p>

        <GrammarTable
          caption="Tipos de Adjetivos"
          headers={["Tipo", "Función", "Ejemplo", "Significado"]}
          rows={[
            ["Descriptivos", "Describen cualidades", "big house", "casa grande"],
            ["Colores", "Indican color", "red car", "coche rojo"],
            ["Números", "Indican cantidad", "three books", "tres libros"],
            ["Posesivos", "Indican posesión", "my book", "mi libro"],
            ["Demostrativos", "Señalan específico", "this book", "este libro"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Tengo un coche grande y rojo"
            english="I have a big red car"
            translation="Tengo un coche grande y rojo"
          />
          <Example 
            spanish="Ella es muy inteligente"
            english="She is very intelligent"
            translation="Ella es muy inteligente"
          />
          <Example 
            spanish="Los estudiantes están contentos"
            english="The students are happy"
            translation="Los estudiantes están contentos"
          />
        </div>

        <Rule 
          title="Posición de los Adjetivos"
          description="Los adjetivos van antes del sustantivo en inglés:"
          examples={[
            "A beautiful flower (una flor hermosa)",
            "An old house (una casa vieja)",
            "Big red apples (manzanas rojas grandes)"
          ]}
        />

        <Tip type="info">
          <strong>Orden de adjetivos:</strong> opinión, tamaño, edad, forma, color, origen, material, propósito + sustantivo.
        </Tip>
      </TheorySection>

      <TheorySection title="Adverbs (Adverbios)" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los adverbios modifican verbos, adjetivos u otros adverbios para dar más información sobre cómo, cuándo, dónde o con qué frecuencia ocurre algo.
        </p>

        <GrammarTable
          caption="Tipos de Adverbios"
          headers={["Tipo", "Función", "Ejemplo", "Pregunta"]}
          rows={[
            ["Modo (How)", "Cómo se hace algo", "quickly", "How?"],
            ["Tiempo (When)", "Cuándo ocurre", "yesterday", "When?"],
            ["Lugar (Where)", "Dónde ocurre", "here", "Where?"],
            ["Frecuencia (How often)", "Con qué frecuencia", "always", "How often?"],
            ["Grado (How much)", "En qué grado", "very", "How much?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Corre rápidamente"
            english="He runs quickly"
            translation="Corre rápidamente"
          />
          <Example 
            spanish="Siempre estudio por la noche"
            english="I always study at night"
            translation="Siempre estudio por la noche"
          />
          <Example 
            spanish="Ella es muy hermosa"
            english="She is very beautiful"
            translation="Ella es muy hermosa"
          />
        </div>

        <Rule 
          title="Formación de Adverbios"
          description="Muchos adverbios se forman agregando -ly al adjetivo:"
          examples={[
            "Quick → Quickly (rápido → rápidamente)",
            "Beautiful → Beautifully (hermoso → hermosamente)",
            "Careful → Carefully (cuidadoso → cuidadosamente)"
          ]}
        />

        <Tip type="warning">
          <strong>Excepciones:</strong> Algunos adjetivos ya son adverbios: fast, hard, late, early, daily.
        </Tip>
      </TheorySection>

      <TheorySection title="Comparativos y Superlativos" icon="📊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los comparativos y superlativos nos permiten comparar cualidades entre dos o más elementos.
        </p>

        <GrammarTable
          caption="Formación de Comparativos y Superlativos"
          headers={["Tipo", "Comparativo", "Superlativo", "Ejemplo"]}
          rows={[
            ["Corta (1 sílaba)", "adjective + er", "adjective + est", "big → bigger → biggest"],
            ["Larga (2+ sílabas)", "more + adjective", "most + adjective", "beautiful → more beautiful → most beautiful"],
            ["Termina en -y", "adjective -y + ier", "adjective -y + iest", "happy → happier → happiest"],
            ["Irregulares", "Formas especiales", "Formas especiales", "good → better → best"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Mi hermano es más alto que yo"
            english="My brother is taller than me"
            translation="Mi hermano es más alto que yo"
          />
          <Example 
            spanish="Esta película es más interesante"
            english="This movie is more interesting"
            translation="Esta película es más interesante"
          />
          <Example 
            spanish="Es el estudiante más inteligente"
            english="He is the most intelligent student"
            translation="Es el estudiante más inteligente"
          />
        </div>

        <Rule 
          title="Uso de Comparativos y Superlativos"
          description="Cuándo usar cada uno:"
          examples={[
            "Comparativo: comparar 2 cosas (than)",
            "Superlativo: comparar 3+ cosas (the)",
            "As...as: igualdad (as tall as)",
            "Not as...as: desigualdad (not as tall as)"
          ]}
        />

        <Tip type="success">
          <strong>Palabras clave:</strong> than (que), the (el/la/los/las), as...as (tan...como).
        </Tip>
      </TheorySection>

      <TheorySection title="Adverbios de Frecuencia" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los adverbios de frecuencia indican con qué frecuencia ocurre una acción.
        </p>

        <GrammarTable
          caption="Adverbios de Frecuencia Comunes"
          headers={["Adverbio", "Frecuencia", "Posición", "Ejemplo"]}
          rows={[
            ["Always", "100%", "Antes del verbo principal", "I always eat breakfast"],
            ["Usually", "80-90%", "Antes del verbo principal", "I usually go to bed early"],
            ["Often", "60-70%", "Antes del verbo principal", "I often read books"],
            ["Sometimes", "30-50%", "Antes del verbo principal", "I sometimes watch TV"],
            ["Rarely", "10-20%", "Antes del verbo principal", "I rarely eat fast food"],
            ["Never", "0%", "Antes del verbo principal", "I never smoke"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Siempre desayuno en casa"
            english="I always have breakfast at home"
            translation="Siempre desayuno en casa"
          />
          <Example 
            spanish="A veces voy al cine"
            english="I sometimes go to the cinema"
            translation="A veces voy al cine"
          />
          <Example 
            spanish="Nunca llego tarde"
            english="I never arrive late"
            translation="Nunca llego tarde"
          />
        </div>

        <Tip type="info">
          <strong>Posición:</strong> Los adverbios de frecuencia van después del verbo "to be" pero antes de otros verbos.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I am good in English" ❌<br/>
            <strong>Correcto:</strong> "I am good at English" ✅<br/>
            <em>Usamos 'at' con 'good' para habilidades</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "She runs quick" ❌<br/>
            <strong>Correcto:</strong> "She runs quickly" ✅<br/>
            <em>Para describir verbos usamos adverbios, no adjetivos</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I am very tiredly" ❌<br/>
            <strong>Correcto:</strong> "I am very tired" ✅<br/>
            <em>Después de 'be' usamos adjetivos, no adverbios</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "This is more better" ❌<br/>
            <strong>Correcto:</strong> "This is better" ✅<br/>
            <em>No usamos 'more' con comparativos cortos</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Adjetivos después de 'be'"
            description="Después del verbo 'to be' usamos adjetivos, no adverbios."
            examples={[
              "She is beautiful (ella es hermosa)",
              "The food is delicious (la comida está deliciosa)"
            ]}
          />

          <Rule 
            title="2. Adverbios con verbos de acción"
            description="Para describir cómo se hace una acción, usamos adverbios."
            examples={[
              "She sings beautifully (ella canta hermosamente)",
              "He drives carefully (él maneja cuidadosamente)"
            ]}
          />

          <Rule 
            title="3. Orden de adjetivos"
            description="Cuando hay varios adjetivos, siguen un orden específico."
            examples={[
              "A beautiful big red car (un hermoso coche rojo grande)",
              "An expensive Italian leather bag (una cara bolsa de cuero italiana)"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="She is a ___ (beautiful) girl who sings ___ (beautiful). She ___ (always) practices and is ___ (good) at music. Her voice is ___ (sweet) than her sister's voice."
      blanks={[
        { answer: "beautiful" },
        { answer: "beautifully" },
        { answer: "always" },
        { answer: "good" },
        { answer: "sweeter" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la forma correcta para completar: 'She runs ___'?"
      options={[
        "quick",
        "quickly",
        "quicklyly",
        "quicklyer"
      ]}
      correctAnswer={1}
      explanation="Para describir cómo corre (verbo), usamos el adverbio 'quickly'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'I am very tiredly' is correct.",
          isTrue: false,
          explanation: "Incorrecto. Después de 'be' usamos adjetivos: 'I am very tired'."
        },
        {
          text: "'She sings beautifully' is correct.",
          isTrue: true,
          explanation: "Correcto. Para describir cómo canta usamos el adverbio 'beautifully'."
        },
        {
          text: "'This car is more expensive than that one' is correct.",
          isTrue: true,
          explanation: "Correcto. Para adjetivos largos usamos 'more + adjective + than'."
        },
        {
          text: "'I always am happy' is correct.",
          isTrue: false,
          explanation: "Incorrecto. Con 'be', el adverbio va después: 'I am always happy'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la forma correcta para completar: 'He is ___ student in the class'?"
      options={[
        "the most intelligent",
        "the intelligentest",
        "the more intelligent",
        "the intelligenter"
      ]}
      correctAnswer={0}
      explanation="Para superlativos de adjetivos largos usamos 'the most + adjective': 'the most intelligent'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la forma correcta para completar: 'I am ___ at mathematics'?"
      options={[
        "good",
        "well",
        "goodly",
        "goods"
      ]}
      correctAnswer={0}
      explanation="Después de 'be' usamos adjetivos. 'Good' es el adjetivo correcto aquí."
    />
  ];

  return (
    <TheoryLayout
      title="Adverbs and Adjectives"
      description="Domina los adjetivos y adverbios en inglés. Aprende sus usos, posiciones, comparativos y superlativos para expresarte con precisión."
      level="A1-A2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic vocabulary", "Understanding of nouns and verbs"]}
      estimatedTime="55 min"
    />
  );
};

export default AdverbsAndAdjectivesPage;

