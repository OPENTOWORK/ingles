'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const KeyWordTransformationsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son Key Word Transformations?" icon="🔄">
        <p>
          <strong>Key Word Transformations</strong> es la Parte 4 del Use of English en First Certificate (B2) y Advanced (C1). 
          Debes completar 6 transformaciones usando una palabra clave dada, manteniendo el significado exacto. 
          Puedes usar 2-5 palabras (B2) o 3-6 palabras (C1) incluyendo la palabra clave sin cambiarla.
        </p>
        
        <Example 
          title="Ejemplo de Key Word Transformation"
          content="1. 'I haven't seen him for ages.' KEY WORD: since
          2. 'It's ages _____ him.' 
          Respuesta: 'It's ages since I saw him.'"
          explanation="Transformas la estructura manteniendo el significado, usando la palabra clave 'since'."
        />
      </TheorySection>

      <TheorySection title="Tipos Comunes de Transformaciones" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Cambios de tiempo verbal"
            description="Transformar entre diferentes tiempos verbales."
            examples={[
              "Present Perfect → Past Simple con 'ago'",
              "Past Simple → Present Perfect con 'since/for'",
              "Future → Present con 'about to'",
              "Conditional → Past con 'wish'"
            ]}
          />

          <Tip 
            title="2. Voz activa/pasiva"
            description="Cambiar entre voz activa y pasiva."
            examples={[
              "They built the house → The house was built",
              "Someone stole my bike → My bike was stolen",
              "People say he is rich → He is said to be rich",
              "We must finish this → This must be finished"
            ]}
          />

          <Tip 
            title="3. Estructuras con verbos modales"
            description="Transformaciones con can, could, must, should, etc."
            examples={[
              "It's possible → might/could/may",
              "It's necessary → must/have to",
              "It's not necessary → don't have to/needn't",
              "It's forbidden → mustn't/can't"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Patrones Frecuentes" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Expresiones con 'make' y 'let'"
            description="Transformaciones con causativos."
            examples={[
              "He forced me to go → made me go",
              "She allowed me to leave → let me leave",
              "They didn't allow smoking → wouldn't let people smoke",
              "The teacher made us study → forced us to study"
            ]}
          />

          <Rule 
            title="2. Condicionales y 'wish'"
            description="Estructuras hipotéticas y deseos."
            examples={[
              "I regret not studying → wish I had studied",
              "It's a pity you can't come → wish you could come",
              "If only I were taller → wish I were taller",
              "I should have listened → wish I had listened"
            ]}
          />

          <Rule 
            title="3. Comparaciones y superlativos"
            description="Diferentes formas de expresar comparaciones."
            examples={[
              "No one is taller → the tallest person",
              "Nothing is more important → the most important thing",
              "I've never seen anything better → the best thing I've ever seen",
              "She's not as tall as → shorter than"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Estrategias de Resolución" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Analiza el significado"
            description="Entiende exactamente qué significa la primera oración."
            examples={[
              "Identifica el sujeto y el objeto",
              "Reconoce el tiempo verbal",
              "Nota el registro (formal/informal)",
              "Observa negaciones o énfasis"
            ]}
          />

          <Rule 
            title="2. Identifica la transformación necesaria"
            description="Determina qué tipo de cambio estructural necesitas."
            examples={[
              "¿Cambio de tiempo verbal?",
              "¿Activa a pasiva o viceversa?",
              "¿Diferente estructura gramatical?",
              "¿Expresión idiomática equivalente?"
            ]}
          />

          <Rule 
            title="3. Construye alrededor de la palabra clave"
            description="Usa la palabra clave como centro de tu respuesta."
            examples={[
              "¿Qué estructura requiere esta palabra?",
              "¿Qué preposiciones van con ella?",
              "¿Qué tiempo verbal necesita?",
              "¿Cómo encaja en el contexto?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Patrones Frecuentes en Cambridge" icon="📋">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="Transformaciones más comunes (B2/C1)"
            description="Estructuras que aparecen regularmente en los exámenes."
            examples={[
              "Wish + past perfect: 'I regret...' → 'I wish I had...'",
              "So/such + that: 'very tired' → 'so tired that'",
              "Have something done: 'Someone repaired' → 'had it repaired'",
              "It's time + past simple: 'should go' → 'it's time we went'"
            ]}
          />

          <Rule 
            title="Palabras clave frecuentes"
            description="Palabras que aparecen a menudo como key words."
            examples={[
              "WISH (arrepentimiento, situaciones hipotéticas)",
              "RATHER (preferencias: would rather, rather than)",
              "POINT (there's no point, what's the point)",
              "SOONER (no sooner, would sooner)"
            ]}
          />

          <Rule 
            title="Gestión del tiempo (15-20 minutos)"
            description="Estrategia de tiempo para esta sección."
            examples={[
              "2-3 minutos por transformación máximo",
              "Si no sabes una, pasa a la siguiente",
              "Deja 3-4 minutos para revisar al final",
              "Escribe algo aunque no estés seguro"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="En Key Word Transformations, ¿cuántas palabras debes usar generalmente?"
      options={[
        "Exactamente 3 palabras",
        "Entre 2-5 palabras incluyendo la palabra clave",
        "Tantas como necesites",
        "Solo la palabra clave"
      ]}
      correctAnswer={1}
      explanation="Debes usar entre 2-5 palabras incluyendo la palabra clave dada, manteniendo el mismo significado."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Transform: 'I haven't been to Paris for years.' KEY: since. 'It's years _____ to Paris.'"
      options={[
        "since I went",
        "since I have been",
        "since I go",
        "since going"
      ]}
      correctAnswer={0}
      explanation="'Since' requiere un punto específico en el tiempo, por lo que necesitas Past Simple: 'since I went'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "En Key Word Transformations debes mantener exactamente el mismo significado.",
          isTrue: true,
          explanation: "Correcto. La segunda oración debe tener exactamente el mismo significado que la primera."
        },
        {
          text: "Puedes cambiar la palabra clave dada.",
          isTrue: false,
          explanation: "Incorrecto. Debes usar la palabra clave exactamente como se da, sin cambiarla."
        },
        {
          text: "Las contracciones cuentan como una palabra.",
          isTrue: true,
          explanation: "Correcto. Contracciones como 'don't', 'I'll', 'we've' cuentan como una sola palabra."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Transform: 'They made me wait for an hour.' KEY: forced. 'I _____ wait for an hour.'"
      options={[
        "was forced to",
        "was forced for",
        "forced to",
        "was forcing to"
      ]}
      correctAnswer={0}
      explanation="'Force' en voz pasiva requiere 'was forced to + infinitive': 'I was forced to wait'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Transform: 'It's possible that it will rain.' KEY: might. 'It _____ rain.'"
      options={[
        "might be",
        "might to",
        "might",
        "might have"
      ]}
      correctAnswer={2}
      explanation="'Might' expresa posibilidad y va seguido directamente del verbo base: 'It might rain'."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Siempre debes usar exactamente 5 palabras en tu respuesta.",
          isTrue: false,
          explanation: "Incorrecto. Puedes usar entre 2-5 palabras, no necesariamente 5 exactas."
        },
        {
          text: "La palabra clave siempre va al principio de tu respuesta.",
          isTrue: false,
          explanation: "Incorrecto. La palabra clave puede ir en cualquier posición dentro de tu respuesta."
        },
        {
          text: "Debes considerar el tiempo verbal de la oración original.",
          isTrue: true,
          explanation: "Correcto. El tiempo verbal puede cambiar en la transformación, pero debes mantener el significado temporal."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Transform: 'I regret not studying harder.' KEY: wish. 'I _____ studied harder.'"
      options={[
        "wish I",
        "wish I had",
        "wish I have",
        "wish to have"
      ]}
      correctAnswer={1}
      explanation="Para expresar arrepentimiento sobre el pasado usamos 'wish + past perfect': 'I wish I had studied'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Transform: 'No one in the class is taller than John.' KEY: tallest. 'John _____ in the class.'"
      options={[
        "is the tallest",
        "is tallest",
        "the tallest is",
        "is the taller"
      ]}
      correctAnswer={0}
      explanation="Para superlativo necesitas el artículo 'the': 'John is the tallest in the class'."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Puedes cambiar el sujeto de la oración en las transformaciones.",
          isTrue: true,
          explanation: "Correcto. A menudo cambias de voz activa a pasiva, lo que cambia el sujeto de la oración."
        },
        {
          text: "Las transformaciones siempre mantienen la misma estructura gramatical.",
          isTrue: false,
          explanation: "Incorrecto. Las transformaciones frecuentemente cambian la estructura gramatical manteniendo el significado."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Transform: 'She didn't let me go to the party.' KEY: allowed. 'I _____ to the party.'"
      options={[
        "wasn't allowed to go",
        "wasn't allowed go",
        "didn't allow to go",
        "wasn't allowing to go"
      ]}
      correctAnswer={0}
      explanation="'Allow' en voz pasiva requiere 'wasn't allowed to + infinitive': 'I wasn't allowed to go'."
    />
  ];

  return (
    <TheoryLayout
      title="Key Word Transformations"
      description="Domina las transformaciones de palabras clave. Aprende a cambiar estructuras gramaticales manteniendo el significado usando palabras clave específicas."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced grammar", "Understanding of verb tenses", "Knowledge of sentence structures"]}
      estimatedTime="85 min"
    />
  );
};

export default KeyWordTransformationsPage;
