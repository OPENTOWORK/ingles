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

const PresentTensesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Present Tenses?" icon="⏰">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>present tenses</strong> (tiempos presentes) son formas verbales que se usan para hablar de acciones, 
          estados y situaciones que ocurren en el presente. Hay tres tiempos presentes principales en inglés.
        </p>
        
        <QuickReference items={[
          "Present Simple: rutinas, hechos generales",
          "Present Continuous: acciones en progreso",
          "Present Perfect: experiencias, acciones completadas",
          "Cada tiempo tiene usos específicos",
          "La elección del tiempo depende del contexto"
        ]} />
      </TheorySection>

      <TheorySection title="Present Simple (Presente Simple)" icon="📅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para hablar de rutinas, hechos generales, hábitos y verdades universales.
        </p>

        <GrammarTable
          caption="Estructura del Present Simple"
          headers={["Persona", "Afirmativa", "Negativa", "Interrogativa"]}
          rows={[
            ["I/You/We/They", "work", "don't work", "Do you work?"],
            ["He/She/It", "works", "doesn't work", "Does he work?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Yo trabajo todos los días"
            english="I work every day"
            translation="Yo trabajo todos los días"
          />
          <Example 
            spanish="El sol sale por el este"
            english="The sun rises in the east"
            translation="El sol sale por el este"
          />
          <Example 
            spanish="Ella no vive aquí"
            english="She doesn't live here"
            translation="Ella no vive aquí"
          />
        </div>

        <Rule 
          title="Usos del Present Simple"
          description="Cuándo usar el Present Simple:"
          examples={[
            "Rutinas diarias: I wake up at 7 AM",
            "Hechos generales: Water boils at 100°C",
            "Hábitos: She always drinks coffee",
            "Horarios: The train leaves at 8 PM"
          ]}
        />

        <Tip type="info">
          <strong>Recuerda:</strong> Con he/she/it agregamos -s/-es al verbo. Para negaciones e interrogaciones usamos "doesn't" y "does".
        </Tip>
      </TheorySection>

      <TheorySection title="Present Continuous (Presente Continuo)" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para hablar de acciones que están ocurriendo ahora mismo o alrededor del momento presente.
        </p>

        <GrammarTable
          caption="Estructura del Present Continuous"
          headers={["Persona", "Afirmativa", "Negativa", "Interrogativa"]}
          rows={[
            ["I", "am working", "am not working", "Am I working?"],
            ["You/We/They", "are working", "aren't working", "Are you working?"],
            ["He/She/It", "is working", "isn't working", "Is he working?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Estoy escribiendo una carta"
            english="I am writing a letter"
            translation="Estoy escribiendo una carta"
          />
          <Example 
            spanish="Los niños están jugando"
            english="The children are playing"
            translation="Los niños están jugando"
          />
          <Example 
            spanish="¿Qué estás haciendo?"
            english="What are you doing?"
            translation="¿Qué estás haciendo?"
          />
        </div>

        <Rule 
          title="Usos del Present Continuous"
          description="Cuándo usar el Present Continuous:"
          examples={[
            "Acciones ahora: I'm reading a book",
            "Acciones temporales: I'm living in London this year",
            "Planes futuros: We're meeting tomorrow",
            "Cambios en progreso: The weather is getting colder"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No uses Present Continuous con verbos de estado como "like", "know", "want", "need". 
          Usa Present Simple: "I like pizza" (no "I am liking pizza").
        </Tip>
      </TheorySection>

      <TheorySection title="Present Perfect (Presente Perfecto)" icon="✅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para hablar de experiencias, acciones completadas en un tiempo no específico, y acciones que comenzaron en el pasado y continúan en el presente.
        </p>

        <GrammarTable
          caption="Estructura del Present Perfect"
          headers={["Persona", "Afirmativa", "Negativa", "Interrogativa"]}
          rows={[
            ["I/You/We/They", "have worked", "haven't worked", "Have you worked?"],
            ["He/She/It", "has worked", "hasn't worked", "Has he worked?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="He visitado París"
            english="I have visited Paris"
            translation="He visitado París"
          />
          <Example 
            spanish="Ella ha vivido aquí por 5 años"
            english="She has lived here for 5 years"
            translation="Ella ha vivido aquí por 5 años"
          />
          <Example 
            spanish="¿Has terminado tu tarea?"
            english="Have you finished your homework?"
            translation="¿Has terminado tu tarea?"
          />
        </div>

        <Rule 
          title="Usos del Present Perfect"
          description="Cuándo usar el Present Perfect:"
          examples={[
            "Experiencias: I have been to Japan",
            "Acciones recientes: I have just finished eating",
            "Duración hasta ahora: I have lived here since 2020",
            "Resultado presente: I have lost my keys"
          ]}
        />

        <Tip type="success">
          <strong>Conectores comunes:</strong> "already", "just", "yet", "ever", "never", "since", "for".
        </Tip>
      </TheorySection>

      <TheorySection title="Comparación de Tiempos" icon="⚖️">
        <GrammarTable
          caption="Cuándo usar cada tiempo"
          headers={["Tiempo", "Cuándo usarlo", "Ejemplo"]}
          rows={[
            ["Present Simple", "Rutinas, hechos generales", "I drink coffee every morning"],
            ["Present Continuous", "Acciones ahora, planes futuros", "I'm drinking coffee now"],
            ["Present Perfect", "Experiencias, acciones completadas", "I have drunk 3 cups today"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Yo trabajo en una oficina (hecho general)"
            english="I work in an office"
            translation="Yo trabajo en una oficina"
          />
          <Example 
            spanish="Estoy trabajando en un proyecto (ahora mismo)"
            english="I am working on a project"
            translation="Estoy trabajando en un proyecto"
          />
          <Example 
            spanish="He trabajado aquí por 3 años (experiencia)"
            english="I have worked here for 3 years"
            translation="He trabajado aquí por 3 años"
          />
        </div>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I am liking pizza" ❌<br/>
            <strong>Correcto:</strong> "I like pizza" ✅<br/>
            <em>Los verbos de estado no usan Present Continuous</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I have 25 years old" ❌<br/>
            <strong>Correcto:</strong> "I am 25 years old" ✅<br/>
            <em>Para edad usamos 'to be', no 'to have'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I am go to school" ❌<br/>
            <strong>Correcto:</strong> "I go to school" ✅<br/>
            <em>No mezcles 'am' con verbos en infinitivo</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I have been to Paris yesterday" ❌<br/>
            <strong>Correcto:</strong> "I went to Paris yesterday" ✅<br/>
            <em>Present Perfect no se usa con tiempo específico del pasado</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Palabras Clave" icon="🔑">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Present Simple:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              always, usually, often, sometimes, rarely, never, every day, on Mondays
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Present Continuous:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              now, at the moment, currently, right now, today, this week
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Present Perfect:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              already, just, yet, ever, never, since, for, recently, lately
            </p>
          </div>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'I ___ in a hospital.'"
      options={[
        "am working",
        "work",
        "worked",
        "have worked"
      ]}
      correctAnswer={1}
      explanation="'Work' es presente simple para expresar un hecho general o rutina habitual."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la forma correcta para completar: 'She ___ to school every day'?"
      options={[
        "is going",
        "goes",
        "has gone",
        "go"
      ]}
      correctAnswer={1}
      explanation="Para rutinas diarias usamos Present Simple. Con 'she' agregamos -s al verbo: 'goes'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'I am liking this movie' is correct.",
          isTrue: false,
          explanation: "Incorrecto. 'Like' es un verbo de estado, no usamos Present Continuous. Correcto: 'I like this movie'."
        },
        {
          text: "'I have been to Paris' means I visited Paris at some point in my life.",
          isTrue: true,
          explanation: "Correcto. Present Perfect se usa para experiencias de vida, sin tiempo específico."
        },
        {
          text: "'I work here since 2020' is correct.",
          isTrue: false,
          explanation: "Incorrecto. Con 'since' usamos Present Perfect: 'I have worked here since 2020'."
        },
        {
          text: "'What are you doing now?' is correct.",
          isTrue: true,
          explanation: "Correcto. Para acciones en progreso ahora usamos Present Continuous."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la forma correcta para completar: 'I ___ this book for two hours'?"
      options={[
        "am reading",
        "read",
        "have been reading",
        "have read"
      ]}
      correctAnswer={2}
      explanation="Para acciones que comenzaron en el pasado y continúan en el presente usamos Present Perfect Continuous: 'have been reading'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la forma correcta para completar: 'She ___ never ___ to Japan'?"
      options={[
        "is, been",
        "has, been",
        "have, been",
        "was, been"
      ]}
      correctAnswer={1}
      explanation="Con 'never' y experiencias de vida usamos Present Perfect: 'She has never been to Japan'."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: 'I ___ my homework right now.'"
      options={[
        "do",
        "am doing",
        "have done",
        "did"
      ]}
      correctAnswer={1}
      explanation="'Right now' indica acción en progreso en este momento, por lo que usamos Present Continuous."
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Cuál es correcto?"
      options={[
        "He is having a car",
        "He has a car",
        "He is have a car",
        "He having a car"
      ]}
      correctAnswer={1}
      explanation="'Have' para posesión no se usa en continuous. Usamos Present Simple: 'He has a car'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: 'How long ___ you ___ English?'"
      options={[
        "do, study",
        "are, studying",
        "have, studied",
        "did, study"
      ]}
      correctAnswer={2}
      explanation="'How long' con una acción que empezó en el pasado y continúa requiere Present Perfect."
    />,

    <MultipleChoiceExercise
      key="9"
      question="¿Cuál es la forma correcta?"
      options={[
        "She always is complaining",
        "She is always complaining",
        "She always complains",
        "Both B and C are correct"
      ]}
      correctAnswer={3}
      explanation="Ambas son correctas: 'always complains' (hábito) y 'is always complaining' (irritación)."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'I ___ three cups of coffee today.'"
      options={[
        "drink",
        "am drinking",
        "have drunk",
        "drank"
      ]}
      correctAnswer={2}
      explanation="'Today' es un período que no ha terminado, por lo que usamos Present Perfect."
    />
  ];

  return (
    <TheoryLayout
      title="Present Tenses"
      description="Domina los tres tiempos presentes del inglés: Simple, Continuous y Perfect. Aprende cuándo usar cada uno y evita errores comunes."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Verb to be", "Pronouns", "Basic vocabulary"]}
      estimatedTime="60 min"
    />
  );
};

export default PresentTensesPage;






















