'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const MultipleMatchingPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Multiple Matching?" icon="🔗">
        <p>
          <strong>Multiple Matching</strong> es un ejercicio donde debes relacionar preguntas o declaraciones 
          con diferentes textos o secciones. Cada texto puede usarse más de una vez, y algunas opciones pueden no usarse.
        </p>
        
        <Example 
          title="Ejemplo de Multiple Matching"
          content="Tienes 4 textos sobre diferentes restaurantes (A, B, C, D) y 7 preguntas como: '¿Cuál menciona comida vegetariana?', '¿Cuál tiene el mejor servicio?', etc. Debes encontrar qué texto responde cada pregunta."
          explanation="Cada texto puede ser la respuesta a múltiples preguntas, y algunas preguntas pueden tener la misma respuesta."
        />
      </TheorySection>

      <TheorySection title="Estrategias Principales" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Lee las preguntas primero"
            description="Antes de leer los textos, estudia todas las preguntas."
            examples={[
              "Identifica palabras clave en cada pregunta",
              "Agrupa preguntas similares por tema",
              "Nota qué tipo de información buscas",
              "Predice qué vocabulario podrías encontrar"
            ]}
          />

          <Tip 
            title="2. Lectura estratégica de textos"
            description="Lee cada texto buscando respuestas específicas."
            examples={[
              "Subraya información relevante mientras lees",
              "Marca posibles respuestas con números de pregunta",
              "No te detengas en detalles irrelevantes",
              "Busca sinónimos de las palabras clave"
            ]}
          />

          <Tip 
            title="3. Verifica y revisa"
            description="Confirma tus respuestas y busca las que faltan."
            examples={[
              "¿Has usado todos los textos apropiadamente?",
              "¿Algún texto responde múltiples preguntas?",
              "¿Hay preguntas sin responder?",
              "¿Tus respuestas son lógicas y consistentes?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Tipos Comunes de Preguntas" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Información específica"
            description="Preguntas sobre datos concretos y detalles."
            examples={[
              "¿Cuál menciona un precio específico?",
              "¿Dónde se habla de horarios de apertura?",
              "¿Qué texto incluye información de contacto?",
              "¿Cuál describe una ubicación exacta?"
            ]}
          />

          <Rule 
            title="2. Opiniones y actitudes"
            description="Preguntas sobre puntos de vista y sentimientos."
            examples={[
              "¿Cuál expresa una opinión positiva?",
              "¿Dónde se muestra desacuerdo?",
              "¿Qué texto refleja entusiasmo?",
              "¿Cuál indica decepción o crítica?"
            ]}
          />

          <Rule 
            title="3. Comparaciones y contrastes"
            description="Preguntas que comparan diferentes aspectos."
            examples={[
              "¿Cuál es el más caro/barato?",
              "¿Qué opción es más conveniente?",
              "¿Cuál ofrece mejor calidad?",
              "¿Dónde hay más variedad de opciones?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Reutilización de textos"
            description="Los textos pueden ser respuesta a múltiples preguntas."
            examples={[
              "Un texto puede responder 2-3 preguntas diferentes",
              "No descartes un texto después de usarlo una vez",
              "Algunos textos pueden no ser respuesta a ninguna pregunta",
              "Lee cada texto pensando en todas las preguntas"
            ]}
          />

          <Rule 
            title="2. Sinónimos y paráfrasis"
            description="Las respuestas raramente usan las mismas palabras que las preguntas."
            examples={[
              "'Expensive' en la pregunta → 'costly, pricey' en el texto",
              "'Happy' en la pregunta → 'delighted, pleased' en el texto",
              "'Difficult' en la pregunta → 'challenging, tough' en el texto",
              "'Quick' en la pregunta → 'rapid, fast, speedy' en el texto"
            ]}
          />

          <Rule 
            title="3. Información implícita"
            description="A veces la respuesta está implícita, no explícita."
            examples={[
              "La pregunta sobre 'precio alto' puede responderse con 'luxury, premium'",
              "'Suitable for families' puede indicarse con 'children's menu, playground'",
              "'Popular' puede inferirse de 'always busy, book in advance'",
              "'Experienced' puede sugerirse con 'established since 1950'"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="En Multiple Matching, ¿pueden los textos ser respuesta a más de una pregunta?"
      options={[
        "No, cada texto responde solo una pregunta",
        "Sí, los textos pueden responder múltiples preguntas",
        "Solo si son textos muy largos",
        "Depende del número de preguntas"
      ]}
      correctAnswer={1}
      explanation="Sí, en Multiple Matching los textos pueden ser respuesta a múltiples preguntas diferentes."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la mejor estrategia para empezar un ejercicio de Multiple Matching?"
      options={[
        "Leer todos los textos primero",
        "Leer las preguntas primero",
        "Contar cuántos textos hay",
        "Empezar por el texto más largo"
      ]}
      correctAnswer={1}
      explanation="Es mejor leer las preguntas primero para saber qué información buscar en los textos."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Todos los textos deben ser usados como respuesta al menos una vez.",
          isTrue: false,
          explanation: "Incorrecto. Algunos textos pueden no ser respuesta a ninguna pregunta en Multiple Matching."
        },
        {
          text: "Las respuestas en los textos suelen usar sinónimos de las palabras en las preguntas.",
          isTrue: true,
          explanation: "Correcto. Raramente encontrarás las mismas palabras exactas; debes buscar sinónimos y paráfrasis."
        },
        {
          text: "Debes leer cada texto completamente antes de buscar respuestas.",
          isTrue: false,
          explanation: "Incorrecto. Es más eficiente leer estratégicamente buscando información específica relacionada con las preguntas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Si una pregunta busca información sobre 'precio alto', ¿qué palabras podrías encontrar en el texto?"
      options={[
        "Solo la palabra 'expensive'",
        "Luxury, premium, costly, pricey",
        "Únicamente números con símbolos de moneda",
        "Solo la frase 'high price'"
      ]}
      correctAnswer={1}
      explanation="Debes buscar sinónimos como 'luxury', 'premium', 'costly', 'pricey' que indican precio alto."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué debes hacer mientras lees cada texto?"
      options={[
        "Memorizar todo el contenido",
        "Traducir cada palabra",
        "Subrayar información relevante y marcar posibles respuestas",
        "Leer en voz alta"
      ]}
      correctAnswer={2}
      explanation="Debes subrayar información relevante y marcar con números de pregunta las posibles respuestas que encuentres."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Si un texto ya ha sido respuesta a una pregunta, no puede ser respuesta a otra.",
          isTrue: false,
          explanation: "Incorrecto. Los textos pueden ser reutilizados como respuesta a múltiples preguntas diferentes."
        },
        {
          text: "Debes buscar información tanto explícita como implícita en los textos.",
          isTrue: true,
          explanation: "Correcto. A veces la respuesta está implícita y debes inferirla del contexto."
        },
        {
          text: "Es importante agrupar preguntas similares por tema antes de leer.",
          isTrue: true,
          explanation: "Correcto. Agrupar preguntas similares te ayuda a ser más eficiente al buscar respuestas relacionadas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Cómo puedes identificar que un restaurante es 'suitable for families' sin que lo diga explícitamente?"
      options={[
        "Solo si dice 'family restaurant'",
        "Buscando menciones de children's menu, playground, high chairs",
        "Contando el número de mesas",
        "Por el tipo de comida que sirve"
      ]}
      correctAnswer={1}
      explanation="Pistas como 'children's menu', 'playground', 'high chairs' indican implícitamente que es adecuado para familias."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Qué hacer si no encuentras respuesta para una pregunta después de leer todos los textos?"
      options={[
        "Dejar la pregunta sin responder",
        "Elegir cualquier texto al azar",
        "Releer los textos buscando información implícita",
        "Cambiar la pregunta"
      ]}
      correctAnswer={2}
      explanation="Debes releer buscando información implícita o sinónimos que podrías haber pasado por alto."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "En Multiple Matching siempre hay el mismo número de preguntas que de textos.",
          isTrue: false,
          explanation: "Incorrecto. Generalmente hay más preguntas que textos, por eso algunos textos responden múltiples preguntas."
        },
        {
          text: "Debes verificar que tus respuestas sean lógicas y consistentes al final.",
          isTrue: true,
          explanation: "Correcto. Es importante revisar que todas tus respuestas tengan sentido y estén bien justificadas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuál es la clave para el éxito en Multiple Matching?"
      options={[
        "Leer muy rápidamente",
        "Memorizar todos los textos",
        "Reconocer sinónimos y paráfrasis efectivamente",
        "Usar solo las primeras respuestas que encuentres"
      ]}
      correctAnswer={2}
      explanation="La clave es reconocer sinónimos y paráfrasis, ya que las respuestas raramente usan las mismas palabras que las preguntas."
    />
  ];

  return (
    <TheoryLayout
      title="Multiple Matching"
      description="Domina los ejercicios de Multiple Matching. Aprende a relacionar preguntas con textos, reconocer sinónimos y encontrar información específica eficientemente."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced reading skills", "Vocabulary recognition", "Inference abilities"]}
      estimatedTime="80 min"
    />
  );
};

export default MultipleMatchingPage;
