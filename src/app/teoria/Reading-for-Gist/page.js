'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const ReadingForGistPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Reading for Gist?" icon="👁️">
        <p>
          <strong>Reading for Gist</strong> significa leer para obtener la idea general o el tema principal de un texto, 
          sin preocuparse por entender cada palabra o detalle específico. Es como obtener una "fotografía general" del contenido.
        </p>
        
        <Example 
          title="Ejemplo de Reading for Gist"
          content="Al leer un artículo de periódico, primero identificas: ¿Es sobre política, deportes, tecnología? ¿Cuál es el mensaje principal? ¿Qué está pasando en general?"
          explanation="No necesitas entender cada palabra, solo la idea central y el propósito del texto."
        />
      </TheorySection>

      <TheorySection title="Estrategias Principales" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Lectura rápida inicial"
            description="Lee el texto completo rápidamente sin detenerte."
            examples={[
              "No uses diccionario en la primera lectura",
              "No te preocupes por palabras desconocidas",
              "Mantén un ritmo constante de lectura",
              "Enfócate en palabras que reconoces"
            ]}
          />

          <Rule 
            title="2. Identifica elementos clave"
            description="Busca pistas que te den la idea general."
            examples={[
              "Título y subtítulos",
              "Primera y última oración de párrafos",
              "Palabras repetidas frecuentemente",
              "Nombres propios y fechas importantes"
            ]}
          />

          <Rule 
            title="3. Pregúntate sobre el propósito"
            description="¿Para qué fue escrito este texto?"
            examples={[
              "¿Informar sobre algo?",
              "¿Persuadir o convencer?",
              "¿Entretener al lector?",
              "¿Explicar un proceso?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Técnicas Específicas" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Técnica del título expandido"
            description="Usa el título como guía para predecir el contenido."
            examples={[
              "¿Qué esperas encontrar basándote en el título?",
              "¿Qué preguntas podría responder el texto?",
              "¿Qué vocabulario relacionado podrías encontrar?",
              "¿Qué tipo de información será relevante?"
            ]}
          />

          <Rule 
            title="2. Mapeo mental rápido"
            description="Crea un mapa mental de las ideas principales."
            examples={[
              "Tema central en el medio",
              "Ideas principales como ramas",
              "Conecta conceptos relacionados",
              "Ignora detalles específicos por ahora"
            ]}
          />

          <Rule 
            title="3. Técnica de las 5 W"
            description="Busca respuestas básicas: Who, What, When, Where, Why."
            examples={[
              "Who: ¿Quién está involucrado?",
              "What: ¿Qué está pasando?",
              "When: ¿Cuándo ocurre?",
              "Where: ¿Dónde sucede?",
              "Why: ¿Por qué es importante?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Velocidad sobre precisión"
            description="En gist reading, la velocidad es más importante que entender cada detalle."
            examples={[
              "Lee 2-3 veces más rápido que normalmente",
              "No te detengas en palabras desconocidas",
              "Salta secciones muy técnicas en la primera lectura",
              "Confía en tu comprensión general"
            ]}
          />

          <Rule 
            title="2. Contexto sobre vocabulario"
            description="Usa el contexto para inferir significados generales."
            examples={[
              "Una palabra desconocida no arruina la comprensión",
              "El 80% de comprensión es suficiente para gist",
              "Las palabras clave se repiten en el texto",
              "El contexto te da pistas sobre el significado"
            ]}
          />

          <Rule 
            title="3. Estructura del texto"
            description="Reconoce patrones comunes de organización textual."
            examples={[
              "Introducción → Desarrollo → Conclusión",
              "Problema → Solución",
              "Causa → Efecto",
              "Comparación → Contraste"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Cuál es el objetivo principal de reading for gist?"
      options={[
        "Entender cada palabra del texto",
        "Obtener la idea general del texto",
        "Memorizar detalles específicos",
        "Traducir el texto completo"
      ]}
      correctAnswer={1}
      explanation="Reading for gist se enfoca en obtener la idea general o tema principal, no en entender cada detalle."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Qué debes hacer cuando encuentras una palabra desconocida en gist reading?"
      options={[
        "Parar y buscarla en el diccionario",
        "Continuar leyendo sin detenerte",
        "Preguntarle a alguien su significado",
        "Dejar de leer el texto"
      ]}
      correctAnswer={1}
      explanation="En gist reading debes continuar sin detenerte en palabras desconocidas, enfocándote en la comprensión general."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "En gist reading necesitas entender el 100% del vocabulario.",
          isTrue: false,
          explanation: "Incorrecto. Con 70-80% de comprensión es suficiente para obtener la idea general del texto."
        },
        {
          text: "El título del texto es una pista importante para gist reading.",
          isTrue: true,
          explanation: "Correcto. El título te da una idea del tema principal y te ayuda a predecir el contenido."
        },
        {
          text: "Debes leer más lentamente para hacer gist reading efectivo.",
          isTrue: false,
          explanation: "Incorrecto. En gist reading debes leer más rápidamente, enfocándote en ideas generales."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la mejor técnica para identificar la idea principal?"
      options={[
        "Leer solo la primera oración",
        "Leer el texto completo rápidamente",
        "Contar las palabras del texto",
        "Leer solo las palabras en negrita"
      ]}
      correctAnswer={1}
      explanation="Leer todo el texto rápidamente te da una visión completa y te permite identificar la idea principal."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué elementos del texto son más importantes para gist reading?"
      options={[
        "Cada adjetivo y adverbio",
        "Título, primera y última oración de párrafos",
        "Solo las palabras más largas",
        "Únicamente los números y fechas"
      ]}
      correctAnswer={1}
      explanation="El título y las primeras/últimas oraciones de párrafos contienen las ideas principales del texto."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Las palabras repetidas frecuentemente suelen ser importantes para el tema.",
          isTrue: true,
          explanation: "Correcto. Las palabras que se repiten a menudo están relacionadas con el tema principal del texto."
        },
        {
          text: "Gist reading es útil solo para textos muy cortos.",
          isTrue: false,
          explanation: "Incorrecto. Gist reading es especialmente útil para textos largos donde necesitas la idea general rápidamente."
        },
        {
          text: "Debes hacer gist reading antes de leer para detalles específicos.",
          isTrue: true,
          explanation: "Correcto. Gist reading te da el contexto general que facilita la comprensión detallada posterior."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Cuál es el porcentaje mínimo de comprensión necesario para gist reading efectivo?"
      options={[
        "100%",
        "90-95%",
        "70-80%",
        "50-60%"
      ]}
      correctAnswer={2}
      explanation="Con 70-80% de comprensión puedes obtener la idea general efectivamente sin entender cada detalle."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Qué preguntas son más útiles durante gist reading?"
      options={[
        "¿Cuántas palabras tiene cada oración?",
        "¿Quién, qué, cuándo, dónde, por qué?",
        "¿Cuáles son todos los adjetivos?",
        "¿Qué palabras no entiendo?"
      ]}
      correctAnswer={1}
      explanation="Las preguntas básicas (5 W) te ayudan a identificar la información esencial para la comprensión general."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Gist reading es una habilidad útil para exámenes con tiempo limitado.",
          isTrue: true,
          explanation: "Correcto. Te permite obtener información esencial rápidamente cuando el tiempo es limitado."
        },
        {
          text: "No debes usar gist reading si el texto tiene vocabulario técnico.",
          isTrue: false,
          explanation: "Incorrecto. Gist reading es especialmente útil con textos técnicos para obtener la idea general primero."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuál es la mejor velocidad para gist reading comparada con lectura normal?"
      options={[
        "La misma velocidad",
        "Más lenta que la lectura normal",
        "2-3 veces más rápida",
        "Solo leer una palabra por minuto"
      ]}
      correctAnswer={2}
      explanation="En gist reading debes leer 2-3 veces más rápido que la lectura normal para obtener la visión general."
    />
  ];

  return (
    <TheoryLayout
      title="Reading for Gist"
      description="Domina la técnica de lectura para obtener ideas generales. Aprende a identificar temas principales y propósitos de textos rápidamente sin perderte en detalles."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic reading skills", "Basic vocabulary"]}
      estimatedTime="70 min"
    />
  );
};

export default ReadingForGistPage;
