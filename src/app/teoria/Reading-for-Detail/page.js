'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const ReadingForDetailPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Reading for Detail?" icon="🔍">
        <p>
          <strong>Reading for Detail</strong> significa leer cuidadosamente para encontrar información específica, 
          datos exactos, detalles particulares y hechos concretos. Es como usar una lupa para examinar partes específicas del texto.
        </p>
        
        <Example 
          title="Ejemplo de Reading for Detail"
          content="Si necesitas encontrar: '¿A qué hora abre la biblioteca los sábados?' debes buscar específicamente información sobre horarios y días de la semana, no la historia de la biblioteca."
          explanation="Te enfocas en encontrar datos específicos y precisos, no en la comprensión general."
        />
      </TheorySection>

      <TheorySection title="Estrategias Principales" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Identifica qué buscas primero"
            description="Antes de leer, define exactamente qué información necesitas."
            examples={[
              "¿Buscas números, fechas, nombres?",
              "¿Necesitas causas, efectos, procesos?",
              "¿Qué palabras clave podrían aparecer?",
              "¿En qué sección del texto podría estar?"
            ]}
          />

          <Rule 
            title="2. Usa técnicas de scanning"
            description="Escanea el texto buscando palabras clave específicas."
            examples={[
              "Busca números si necesitas datos estadísticos",
              "Busca nombres propios para personas o lugares",
              "Busca palabras de tiempo para secuencias",
              "Busca conectores para relaciones causa-efecto"
            ]}
          />

          <Rule 
            title="3. Lee intensivamente la sección relevante"
            description="Una vez que encuentres la sección, léela cuidadosamente."
            examples={[
              "Lee palabra por palabra en esa sección",
              "Presta atención a modificadores (very, quite, almost)",
              "Nota negaciones (not, never, hardly)",
              "Verifica que entiendes exactamente"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Tipos de Información Detallada" icon="📊">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Datos numéricos y estadísticas"
            description="Números exactos, porcentajes, medidas, cantidades."
            examples={[
              "Fechas: 15th March, 2023, last Tuesday",
              "Cantidades: 50%, three quarters, majority",
              "Medidas: 5 kilometers, 2 hours, €100",
              "Rangos: between 20-30, approximately 500"
            ]}
          />

          <Rule 
            title="2. Secuencias y procesos"
            description="Orden de eventos, pasos, instrucciones."
            examples={[
              "Primero, segundo, luego, finalmente",
              "Antes de, después de, mientras",
              "Siguiente paso, procedimiento",
              "Cronología de eventos"
            ]}
          />

          <Rule 
            title="3. Relaciones causa-efecto"
            description="Por qué sucede algo y cuáles son las consecuencias."
            examples={[
              "Because, since, due to, as a result",
              "Therefore, consequently, thus, hence",
              "Leads to, causes, results in",
              "The reason why, the effect of"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Precisión es clave"
            description="En reading for detail, cada palabra cuenta."
            examples={[
              "Diferencia entre 'most' y 'all'",
              "Nota 'usually' vs 'always'",
              "Distingue 'increase' de 'decrease'",
              "Observa 'before' vs 'after'"
            ]}
          />

          <Rule 
            title="2. Contexto inmediato"
            description="Lee las oraciones antes y después para contexto completo."
            examples={[
              "La información puede estar distribuida",
              "Pronombres pueden referirse a información anterior",
              "Ejemplos pueden aclarar conceptos",
              "Definiciones pueden aparecer después"
            ]}
          />

          <Rule 
            title="3. Verificación cruzada"
            description="Confirma la información con otras partes del texto."
            examples={[
              "¿La información es consistente?",
              "¿Hay contradicciones aparentes?",
              "¿Se repite la misma información?",
              "¿Los ejemplos apoyan la información?"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Cuál es el objetivo principal de reading for detail?"
      options={[
        "Leer lo más rápido posible",
        "Encontrar información específica y exacta",
        "Entender solo la idea general",
        "Memorizar todo el vocabulario"
      ]}
      correctAnswer={1}
      explanation="Reading for detail se enfoca en encontrar información específica, datos exactos y detalles particulares."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Qué debes hacer antes de empezar a leer para detalles?"
      options={[
        "Leer todo el texto primero",
        "Identificar exactamente qué información necesitas",
        "Contar las páginas del texto",
        "Buscar todas las palabras desconocidas"
      ]}
      correctAnswer={1}
      explanation="Antes de leer para detalles, debes definir claramente qué información específica estás buscando."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "En reading for detail, cada palabra es importante.",
          isTrue: true,
          explanation: "Correcto. En lectura detallada, modificadores, negaciones y palabras específicas pueden cambiar completamente el significado."
        },
        {
          text: "Debes leer a la misma velocidad que para obtener la idea general.",
          isTrue: false,
          explanation: "Incorrecto. Reading for detail requiere lectura más lenta y cuidadosa que reading for gist."
        },
        {
          text: "Es útil usar técnicas de scanning para encontrar secciones relevantes.",
          isTrue: true,
          explanation: "Correcto. Scanning te ayuda a localizar rápidamente las secciones que contienen la información que buscas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la diferencia entre 'most students' y 'all students'?"
      options={[
        "No hay diferencia",
        "'Most' significa la mayoría, 'all' significa todos",
        "'Most' es más formal que 'all'",
        "Significan exactamente lo mismo"
      ]}
      correctAnswer={1}
      explanation="'Most' significa la mayoría (más del 50% pero no todos), mientras que 'all' significa el 100%, todos sin excepción."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué tipo de palabras debes buscar para encontrar información sobre causas?"
      options={[
        "Números y fechas",
        "Because, since, due to",
        "First, second, third",
        "Always, never, sometimes"
      ]}
      correctAnswer={1}
      explanation="Palabras como 'because', 'since', 'due to' indican relaciones de causa y te ayudan a encontrar por qué sucede algo."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Debes leer solo la oración que contiene la información que buscas.",
          isTrue: false,
          explanation: "Incorrecto. Debes leer el contexto inmediato (oraciones antes y después) para entender completamente."
        },
        {
          text: "Los pronombres pueden referirse a información en oraciones anteriores.",
          isTrue: true,
          explanation: "Correcto. Pronombres como 'it', 'they', 'this' a menudo se refieren a información mencionada anteriormente."
        },
        {
          text: "En reading for detail no necesitas verificar la consistencia de la información.",
          isTrue: false,
          explanation: "Incorrecto. Es importante verificar que la información sea consistente en todo el texto."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Cuál es la mejor estrategia para encontrar información sobre secuencias temporales?"
      options={[
        "Buscar solo números",
        "Buscar conectores temporales como 'first', 'then', 'finally'",
        "Leer solo el primer párrafo",
        "Ignorar las fechas"
      ]}
      correctAnswer={1}
      explanation="Los conectores temporales te indican el orden de eventos y procesos en secuencias temporales."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Por qué es importante prestar atención a palabras como 'not', 'never', 'hardly'?"
      options={[
        "Son palabras muy comunes",
        "Cambian completamente el significado de la oración",
        "Son difíciles de pronunciar",
        "Siempre aparecen en exámenes"
      ]}
      correctAnswer={1}
      explanation="Las negaciones como 'not', 'never', 'hardly' cambian completamente el significado y son cruciales para la comprensión exacta."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Reading for detail es útil cuando necesitas seguir instrucciones específicas.",
          isTrue: true,
          explanation: "Correcto. Para seguir instrucciones necesitas entender cada paso exactamente, lo que requiere lectura detallada."
        },
        {
          text: "Debes usar reading for detail para todos los textos que leas.",
          isTrue: false,
          explanation: "Incorrecto. Reading for detail se usa solo cuando necesitas información específica; para comprensión general usa gist reading."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuál es la mejor manera de verificar que has encontrado la información correcta?"
      options={[
        "Leer solo una vez más",
        "Verificar consistencia con otras partes del texto",
        "Traducir al español",
        "Contar las palabras de la respuesta"
      ]}
      correctAnswer={1}
      explanation="Verificar la consistencia con otras partes del texto te asegura que has interpretado correctamente la información."
    />
  ];

  return (
    <TheoryLayout
      title="Reading for Detail"
      description="Domina la lectura detallada para encontrar información específica. Aprende técnicas para localizar datos exactos, secuencias y relaciones causa-efecto en textos."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Reading for gist skills", "Basic vocabulary", "Grammar awareness"]}
      estimatedTime="75 min"
    />
  );
};

export default ReadingForDetailPage;
