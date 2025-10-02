'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const CrossTextMultipleMatchingPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Cross-text Multiple Matching?" icon="🔄">
        <p>
          <strong>Cross-text Multiple Matching</strong> es un ejercicio avanzado donde debes relacionar información 
          entre múltiples textos diferentes. Comparas, contrastas y conectas ideas, opiniones o información 
          específica que aparece en varios textos sobre temas relacionados.
        </p>
        
        <Example 
          title="Ejemplo de Cross-text Multiple Matching"
          content="Tienes 4 textos sobre cambio climático de diferentes autores. Las preguntas pueden ser: '¿Qué textos mencionan soluciones tecnológicas?', '¿Cuáles expresan optimismo sobre el futuro?', '¿Qué autores están de acuerdo sobre las causas principales?'"
          explanation="Debes analizar múltiples textos simultáneamente para encontrar conexiones, similitudes y diferencias entre ellos."
        />
      </TheorySection>

      <TheorySection title="Tipos de Conexiones" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Similitudes de contenido"
            description="Textos que comparten información, ideas o enfoques similares."
            examples={[
              "Mismas causas mencionadas en diferentes textos",
              "Soluciones similares propuestas por varios autores",
              "Ejemplos parecidos usados en múltiples textos",
              "Datos o estadísticas coincidentes"
            ]}
          />

          <Tip 
            title="2. Contrastes y diferencias"
            description="Textos que presentan puntos de vista opuestos o información contradictoria."
            examples={[
              "Opiniones opuestas sobre el mismo tema",
              "Diferentes interpretaciones de los mismos datos",
              "Enfoques contrastantes para resolver problemas",
              "Conclusiones contradictorias"
            ]}
          />

          <Tip 
            title="3. Actitudes y tonos"
            description="Comparación de las posturas emocionales de diferentes autores."
            examples={[
              "Optimismo vs pesimismo sobre el futuro",
              "Crítica vs apoyo hacia políticas específicas",
              "Confianza vs escepticismo hacia soluciones",
              "Urgencia vs calma en el tratamiento del tema"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Estrategias Avanzadas" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Mapeo conceptual"
            description="Crea un mapa mental de ideas principales de cada texto."
            examples={[
              "Identifica el tema central de cada texto",
              "Lista los puntos principales de cada autor",
              "Nota las evidencias o ejemplos únicos",
              "Marca las conclusiones de cada texto"
            ]}
          />

          <Rule 
            title="2. Análisis comparativo"
            description="Compara sistemáticamente elementos entre textos."
            examples={[
              "¿Qué textos mencionan las mismas causas?",
              "¿Cuáles proponen soluciones similares?",
              "¿Qué autores comparten la misma actitud?",
              "¿Dónde hay acuerdo o desacuerdo explícito?"
            ]}
          />

          <Rule 
            title="3. Síntesis de información"
            description="Combina información de múltiples fuentes para responder."
            examples={[
              "Conecta ideas complementarias de diferentes textos",
              "Identifica patrones que emergen entre textos",
              "Reconoce cuando múltiples textos apoyan la misma idea",
              "Nota cuando un texto contradice a otros"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Precisión en las conexiones"
            description="Las conexiones deben ser exactas, no aproximadas."
            examples={[
              "Verifica que las ideas sean realmente similares, no solo relacionadas",
              "Distingue entre acuerdo parcial y acuerdo total",
              "No asumas conexiones que no están explícitas",
              "Cuidado con similitudes superficiales"
            ]}
          />

          <Rule 
            title="2. Múltiples respuestas posibles"
            description="Algunas preguntas pueden tener múltiples textos como respuesta."
            examples={[
              "Una pregunta puede aplicar a 2-3 textos diferentes",
              "Algunos textos pueden no ser respuesta a ninguna pregunta",
              "Lee cuidadosamente si pide 'uno', 'algunos' o 'todos'",
              "Verifica todas las posibilidades antes de decidir"
            ]}
          />

          <Rule 
            title="3. Niveles de análisis"
            description="Analiza tanto contenido explícito como implícito."
            examples={[
              "Información directamente declarada en los textos",
              "Actitudes y opiniones implícitas de los autores",
              "Suposiciones subyacentes en cada texto",
              "Implicaciones de las conclusiones presentadas"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Qué caracteriza principalmente a Cross-text Multiple Matching?"
      options={[
        "Analizar un solo texto muy detalladamente",
        "Relacionar información entre múltiples textos diferentes",
        "Traducir textos de un idioma a otro",
        "Memorizar contenido de varios textos"
      ]}
      correctAnswer={1}
      explanation="Cross-text Multiple Matching se caracteriza por relacionar, comparar y contrastar información entre múltiples textos diferentes."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la mejor estrategia inicial para este tipo de ejercicio?"
      options={[
        "Leer todos los textos sin tomar notas",
        "Crear un mapa mental de ideas principales de cada texto",
        "Memorizar el primer texto completamente",
        "Leer solo las primeras oraciones de cada texto"
      ]}
      correctAnswer={1}
      explanation="Crear un mapa mental te ayuda a organizar y comparar sistemáticamente las ideas principales de cada texto."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "En Cross-text Multiple Matching, algunos textos pueden no ser respuesta a ninguna pregunta.",
          isTrue: true,
          explanation: "Correcto. No todos los textos necesariamente serán respuesta a las preguntas planteadas."
        },
        {
          text: "Solo debes buscar información explícitamente declarada en los textos.",
          isTrue: false,
          explanation: "Incorrecto. También debes analizar actitudes implícitas, tonos y suposiciones subyacentes."
        },
        {
          text: "Una pregunta puede tener múltiples textos como respuesta correcta.",
          isTrue: true,
          explanation: "Correcto. Algunas preguntas pueden aplicar a varios textos que comparten características similares."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Qué tipo de conexión buscas cuando la pregunta es 'Which texts express optimism about the future?'"
      options={[
        "Similitudes de contenido",
        "Contrastes y diferencias",
        "Actitudes y tonos",
        "Información específica"
      ]}
      correctAnswer={2}
      explanation="Buscas actitudes y tonos, específicamente cuáles textos muestran una postura emocional optimista hacia el futuro."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cómo debes abordar las similitudes entre textos?"
      options={[
        "Asumir que ideas relacionadas son similares",
        "Verificar que las ideas sean realmente similares, no solo relacionadas",
        "Considerar solo las palabras exactas usadas",
        "Ignorar las diferencias sutiles"
      ]}
      correctAnswer={1}
      explanation="Debes verificar que las ideas sean genuinamente similares, no solo relacionadas o superficialmente parecidas."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Debes distinguir entre acuerdo parcial y acuerdo total entre textos.",
          isTrue: true,
          explanation: "Correcto. Es importante ser preciso sobre el grado de similitud o acuerdo entre los textos."
        },
        {
          text: "Las conexiones superficiales son suficientes para establecer similitudes.",
          isTrue: false,
          explanation: "Incorrecto. Debes buscar conexiones genuinas y sustanciales, no similitudes superficiales."
        },
        {
          text: "Puedes asumir conexiones que no están explícitas si parecen lógicas.",
          isTrue: false,
          explanation: "Incorrecto. Las conexiones deben estar basadas en evidencia clara de los textos, no en suposiciones."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Qué debes hacer cuando encuentras información contradictoria entre textos?"
      options={[
        "Ignorar las contradicciones",
        "Elegir el texto que prefieras",
        "Notar y analizar las diferencias como posibles respuestas",
        "Buscar un punto medio entre ambos"
      ]}
      correctAnswer={2}
      explanation="Las contradicciones son importantes y pueden ser la respuesta a preguntas sobre contrastes o diferencias de opinión."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Cuál es un error común en Cross-text Multiple Matching?"
      options={[
        "Leer todos los textos cuidadosamente",
        "Confundir similitudes superficiales con conexiones reales",
        "Tomar notas mientras lees",
        "Verificar las respuestas dos veces"
      ]}
      correctAnswer={1}
      explanation="Un error común es confundir similitudes superficiales (palabras parecidas, temas relacionados) con conexiones genuinas."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Debes analizar tanto el contenido explícito como las implicaciones de cada texto.",
          isTrue: true,
          explanation: "Correcto. Cross-text matching requiere análisis profundo de contenido explícito e implícito."
        },
        {
          text: "Todos los textos deben ser usados como respuesta al menos una vez.",
          isTrue: false,
          explanation: "Incorrecto. Algunos textos pueden no ser relevantes para ninguna de las preguntas planteadas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuál es la habilidad más importante para Cross-text Multiple Matching?"
      options={[
        "Velocidad de lectura",
        "Memoria fotográfica",
        "Capacidad de síntesis y análisis comparativo",
        "Conocimiento de vocabulario avanzado"
      ]}
      correctAnswer={2}
      explanation="La capacidad de síntesis y análisis comparativo es crucial para conectar y contrastar información entre múltiples textos."
    />
  ];

  return (
    <TheoryLayout
      title="Cross-text Multiple Matching"
      description="Domina el análisis comparativo entre múltiples textos. Aprende a identificar conexiones, contrastes y patrones de información entre diferentes fuentes sobre temas relacionados."
      level="C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced reading comprehension", "Critical analysis skills", "Synthesis abilities"]}
      estimatedTime="90 min"
    />
  );
};

export default CrossTextMultipleMatchingPage;
