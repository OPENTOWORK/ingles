'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const MultipleChoiceQuestionsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son Multiple Choice Questions?" icon="✅">
        <p>
          <strong>Multiple Choice Questions</strong> son preguntas con varias opciones de respuesta donde debes elegir 
          la correcta. En exámenes de inglés, evalúan comprensión lectora, gramática, vocabulario y uso del idioma 
          a través de textos seguidos de preguntas con 3-4 opciones.
        </p>
        
        <Example 
          title="Ejemplo de Multiple Choice Question"
          content="Texto: 'The company's profits increased dramatically last year due to innovative marketing strategies.'
          Pregunta: What was the main reason for the company's success?
          A) Better employees  B) Innovative marketing  C) Lower prices  D) New location"
          explanation="Debes identificar la información específica del texto que responde directamente a la pregunta."
        />
      </TheorySection>

      <TheorySection title="Tipos de Preguntas" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Información específica"
            description="Preguntas sobre detalles concretos mencionados en el texto."
            examples={[
              "¿Cuándo ocurrió el evento?",
              "¿Quién hizo qué acción?",
              "¿Dónde tuvo lugar la situación?",
              "¿Qué cantidad o número se menciona?"
            ]}
          />

          <Tip 
            title="2. Idea principal"
            description="Preguntas sobre el tema central o propósito del texto."
            examples={[
              "¿Cuál es el tema principal del párrafo?",
              "¿Cuál es el propósito del autor?",
              "¿Qué resume mejor el texto?",
              "¿Cuál es el mensaje central?"
            ]}
          />

          <Tip 
            title="3. Inferencia y actitud"
            description="Preguntas sobre información implícita y opiniones del autor."
            examples={[
              "¿Qué se puede inferir sobre...?",
              "¿Cuál es la actitud del autor hacia...?",
              "¿Qué sugiere el texto sobre...?",
              "¿Cómo se siente el personaje?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Estrategias de Resolución" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Lee la pregunta primero"
            description="Antes de leer el texto, lee la pregunta para saber qué buscar."
            examples={[
              "Identifica palabras clave en la pregunta",
              "Determina qué tipo de información necesitas",
              "Predice dónde podría estar la respuesta",
              "Nota si busca información específica o general"
            ]}
          />

          <Rule 
            title="2. Elimina opciones incorrectas"
            description="Usa el proceso de eliminación para reducir opciones."
            examples={[
              "Descarta opciones que contradicen el texto",
              "Elimina opciones demasiado extremas",
              "Quita opciones que no se mencionan",
              "Evita opciones que son parcialmente correctas"
            ]}
          />

          <Rule 
            title="3. Busca evidencia textual"
            description="La respuesta correcta debe estar apoyada por el texto."
            examples={[
              "Encuentra la parte específica que apoya tu respuesta",
              "Verifica que la opción refleje exactamente lo que dice el texto",
              "Cuidado con sinónimos y paráfrasis",
              "No uses conocimiento externo, solo el texto"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Trampas Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Distractores obvios"
            description="Opciones diseñadas para confundir con información parcial."
            examples={[
              "Opciones que usan palabras del texto pero en contexto incorrecto",
              "Información verdadera pero que no responde la pregunta",
              "Detalles mencionados pero no relevantes para la pregunta",
              "Generalizaciones excesivas de información específica"
            ]}
          />

          <Rule 
            title="2. Información no mencionada"
            description="Opciones que parecen lógicas pero no están en el texto."
            examples={[
              "Suposiciones basadas en conocimiento general",
              "Conclusiones lógicas pero no declaradas",
              "Información que 'debería' estar pero no está",
              "Extrapolaciones más allá de lo que dice el texto"
            ]}
          />

          <Rule 
            title="3. Opciones extremas"
            description="Respuestas con palabras absolutas que raramente son correctas."
            examples={[
              "Palabras como 'always', 'never', 'all', 'none'",
              "Superlativos extremos sin justificación",
              "Afirmaciones categóricas sin matices",
              "Generalizaciones absolutas"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Cuál es la mejor estrategia para abordar Multiple Choice Questions?"
      options={[
        "Leer todas las opciones antes que el texto",
        "Leer la pregunta primero, luego el texto buscando la respuesta",
        "Leer el texto completo sin mirar las preguntas",
        "Elegir la opción más larga"
      ]}
      correctAnswer={1}
      explanation="Es mejor leer la pregunta primero para saber qué información específica buscar en el texto."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Qué debes hacer cuando no estás seguro entre dos opciones?"
      options={[
        "Elegir al azar",
        "Elegir la primera que viste",
        "Buscar evidencia específica en el texto para cada opción",
        "Elegir la más corta"
      ]}
      correctAnswer={2}
      explanation="Debes buscar evidencia textual específica que apoye cada opción y elegir la que tenga mejor respaldo."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Las opciones con palabras como 'always' o 'never' suelen ser incorrectas.",
          isTrue: true,
          explanation: "Correcto. Las opciones con términos absolutos raramente son correctas porque la realidad suele tener matices."
        },
        {
          text: "Puedes usar tu conocimiento general para responder aunque no esté en el texto.",
          isTrue: false,
          explanation: "Incorrecto. Solo debes usar la información proporcionada en el texto, no conocimiento externo."
        },
        {
          text: "El proceso de eliminación es una estrategia útil en multiple choice.",
          isTrue: true,
          explanation: "Correcto. Eliminar opciones claramente incorrectas aumenta tus posibilidades de elegir la respuesta correcta."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Qué tipo de pregunta es esta? 'What can be inferred about the author's opinion?'"
      options={[
        "Información específica",
        "Idea principal",
        "Inferencia y actitud",
        "Vocabulario en contexto"
      ]}
      correctAnswer={2}
      explanation="Es una pregunta de inferencia y actitud porque pide que deduzcas la opinión del autor basándote en pistas implícitas."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es una trampa común en las opciones incorrectas?"
      options={[
        "Usar sinónimos del texto",
        "Ser demasiado específicas",
        "Usar palabras del texto en contexto incorrecto",
        "Ser muy cortas"
      ]}
      correctAnswer={2}
      explanation="Una trampa común es usar palabras que aparecen en el texto pero en un contexto diferente al de la pregunta."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Debes leer todo el texto antes de mirar cualquier pregunta.",
          isTrue: false,
          explanation: "Incorrecto. Es más eficiente leer las preguntas primero para saber qué información buscar."
        },
        {
          text: "La respuesta correcta siempre debe tener apoyo directo en el texto.",
          isTrue: true,
          explanation: "Correcto. Cada respuesta debe estar respaldada por evidencia específica encontrada en el texto."
        },
        {
          text: "Las opciones más largas suelen ser las correctas.",
          isTrue: false,
          explanation: "Incorrecto. La longitud de la opción no indica si es correcta; debes basarte en el contenido y la evidencia textual."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Qué debes hacer si una opción es parcialmente correcta pero no responde completamente la pregunta?"
      options={[
        "Elegirla porque tiene algo correcto",
        "Descartarla y buscar una respuesta más completa",
        "Combinarla mentalmente con otra opción",
        "Preguntar al examinador"
      ]}
      correctAnswer={1}
      explanation="Debes descartarla. La respuesta correcta debe responder completamente la pregunta, no solo parcialmente."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Cuándo es apropiado usar inferencia en multiple choice questions?"
      options={[
        "Nunca, solo información explícita",
        "Solo cuando la pregunta específicamente pide inferir algo",
        "Siempre que no encuentres respuesta directa",
        "Cuando todas las opciones parecen incorrectas"
      ]}
      correctAnswer={1}
      explanation="Solo debes inferir cuando la pregunta específicamente lo pide (ej: 'What can be inferred...', 'The author suggests...')."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Si dos opciones parecen correctas, probablemente una es una trampa.",
          isTrue: true,
          explanation: "Correcto. Los examinadores diseñan distractores que parecen correctos pero tienen diferencias sutiles con la respuesta real."
        },
        {
          text: "Debes cambiar tu primera respuesta si tienes dudas.",
          isTrue: false,
          explanation: "Incorrecto. Generalmente tu primera impresión es correcta, solo cambia si encuentras evidencia clara de error."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuál es la clave del éxito en Multiple Choice Questions?"
      options={[
        "Memorizar muchas palabras de vocabulario",
        "Leer muy rápidamente",
        "Encontrar evidencia textual específica para cada respuesta",
        "Confiar en la intuición"
      ]}
      correctAnswer={2}
      explanation="La clave es encontrar evidencia textual específica que apoye tu respuesta y verificar que responde exactamente lo que pregunta."
    />
  ];

  return (
    <TheoryLayout
      title="Multiple Choice Questions"
      description="Domina las preguntas de opción múltiple. Aprende estrategias para identificar respuestas correctas, evitar trampas comunes y usar evidencia textual efectivamente."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Reading comprehension", "Critical thinking", "Text analysis skills"]}
      estimatedTime="75 min"
    />
  );
};

export default MultipleChoiceQuestionsPage;
