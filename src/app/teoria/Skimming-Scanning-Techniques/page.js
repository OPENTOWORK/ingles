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

const SkimmingScanningPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son Skimming y Scanning?" icon="👀">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Skimming</strong> y <strong>Scanning</strong> son dos técnicas de lectura rápida esenciales para 
          los exámenes de inglés. Te permiten encontrar información específica y comprender ideas principales 
          sin leer cada palabra del texto.
        </p>
        
        <QuickReference items={[
          "Skimming: lectura rápida para idea general",
          "Scanning: búsqueda de información específica",
          "Ambas técnicas ahorran tiempo valioso",
          "Esenciales para exámenes con tiempo limitado",
          "Se complementan con lectura detallada"
        ]} />
      </TheorySection>

      <TheorySection title="Skimming - Lectura para Idea General" icon="🌊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El skimming te ayuda a obtener una comprensión general del texto en poco tiempo.
        </p>

        <Rule 
          title="Cómo hacer Skimming efectivo"
          description="Sigue estos pasos para una lectura rápida eficaz:"
          examples={[
            "Lee el título y subtítulos",
            "Lee la primera y última oración de cada párrafo",
            "Busca palabras clave y frases destacadas",
            "Ignora detalles específicos y ejemplos",
            "Enfócate en conectores y palabras de transición"
          ]}
        />

        <GrammarTable
          caption="Elementos clave para Skimming"
          headers={["Elemento", "Por qué es importante", "Ejemplo"]}
          rows={[
            ["Título", "Resume el tema principal", "'Climate Change Effects'"],
            ["Primera oración", "Introduce la idea del párrafo", "'Recent studies show that...'"],
            ["Última oración", "Concluye o conecta ideas", "'This leads us to consider...'"],
            ["Palabras clave", "Indican temas importantes", "'however, therefore, importantly'"],
            ["Números y fechas", "Datos específicos relevantes", "'In 2020, 75% of...'"]
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Practica skimming con periódicos online. Lee solo títulos y primeras oraciones 
          para captar las noticias principales en 5 minutos.
        </Tip>
      </TheorySection>

      <TheorySection title="Scanning - Búsqueda Específica" icon="🔍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El scanning te permite encontrar información específica rápidamente, como nombres, fechas, números o palabras clave.
        </p>

        <Rule 
          title="Técnica de Scanning efectiva"
          description="Pasos para encontrar información específica:"
          examples={[
            "Identifica exactamente qué buscas",
            "Mueve los ojos rápidamente por el texto",
            "Busca palabras clave o sinónimos",
            "Detente solo cuando encuentres la información",
            "Lee el contexto inmediato para confirmar"
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Pregunta: ¿Cuándo fue fundada la empresa?"
            english="Scanning target: dates, numbers, 'founded', 'established', 'created'"
            translation="Busca: fechas, números, palabras como 'fundada', 'establecida', 'creada'"
          />
          
          <Example 
            spanish="Pregunta: ¿Quién es el director de marketing?"
            english="Scanning target: names, titles, 'director', 'manager', 'marketing'"
            translation="Busca: nombres propios, títulos, 'director', 'gerente', 'marketing'"
          />
        </div>

        <Tip type="info">
          <strong>Recuerda:</strong> En scanning, no necesitas entender todo el texto. Solo busca la información 
          específica que necesitas.
        </Tip>
      </TheorySection>

      <TheorySection title="Diferencias Clave" icon="⚖️">
        <GrammarTable
          caption="Skimming vs Scanning"
          headers={["Aspecto", "Skimming", "Scanning"]}
          rows={[
            ["Objetivo", "Idea general del texto", "Información específica"],
            ["Velocidad", "Rápida pero comprensiva", "Muy rápida y selectiva"],
            ["Enfoque", "Estructura y temas principales", "Datos concretos"],
            ["Movimiento ocular", "Lineal, saltando detalles", "Errático, buscando objetivos"],
            ["Resultado", "Comprensión general", "Datos específicos encontrados"],
            ["Cuándo usar", "Primera lectura del texto", "Responder preguntas específicas"]
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No confundas las técnicas. Skimming es para el panorama general, 
          scanning es para detalles específicos.
        </Tip>
      </TheorySection>

      <TheorySection title="Aplicación en Exámenes" icon="📝">
        <Rule 
          title="Estrategia de 3 pasos para exámenes"
          description="Combina ambas técnicas para máxima eficiencia:"
          examples={[
            "1. SKIMMING: Lee rápidamente todo el texto (2-3 minutos)",
            "2. LEE las preguntas y identifica qué buscar",
            "3. SCANNING: Busca respuestas específicas en el texto"
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Paso 1: Skimming del artículo sobre energía renovable"
            english="Result: 'The article discusses solar and wind energy benefits and challenges'"
            translation="Resultado: 'El artículo habla de beneficios y desafíos de energía solar y eólica'"
          />
          
          <Example 
            spanish="Paso 2: Pregunta - '¿Qué porcentaje de energía solar se usa en España?'"
            english="Scanning target: 'Spain', 'Spanish', percentages, numbers, 'solar'"
            translation="Objetivo de scanning: 'España', 'español', porcentajes, números, 'solar'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo de tiempo:</strong> Dedica máximo 3 minutos al skimming inicial. Te ahorrará tiempo 
          después al hacer scanning dirigido.
        </Tip>
      </TheorySection>

      <TheorySection title="Palabras Señal Importantes" icon="🚦">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Ciertas palabras te ayudan a navegar rápidamente por los textos.
        </p>

        <GrammarTable
          caption="Palabras Señal por Función"
          headers={["Función", "Palabras Clave", "Qué Indican"]}
          rows={[
            ["Contraste", "however, but, although, despite", "Cambio de dirección en el argumento"],
            ["Causa-Efecto", "because, therefore, as a result", "Relaciones causales"],
            ["Secuencia", "first, then, finally, meanwhile", "Orden temporal o lógico"],
            ["Énfasis", "importantly, significantly, notably", "Información clave"],
            ["Ejemplos", "for instance, such as, including", "Detalles de apoyo"],
            ["Conclusión", "in conclusion, overall, to summarize", "Ideas finales"]
          ]}
        />

        <Tip type="info">
          <strong>Práctica:</strong> Cuando hagas skimming, presta especial atención a estas palabras señal. 
          Te guiarán hacia la información más importante.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Leer cada palabra durante el skimming<br/>
            <strong>Solución:</strong> Entrena tu ojo para saltar y captar solo lo esencial
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Hacer scanning sin saber qué buscar<br/>
            <strong>Solución:</strong> Lee la pregunta primero y identifica palabras clave
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Detenerse en palabras desconocidas<br/>
            <strong>Solución:</strong> Continúa leyendo, el contexto te ayudará
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No practicar estas técnicas regularmente<br/>
            <strong>Solución:</strong> Practica diariamente con artículos de noticias
          </Tip>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <TrueFalseExercise
      key="1"
      statements={[
        {
          text: "Skimming involves reading every word of the text carefully.",
          isTrue: false,
          explanation: "Falso. Skimming es lectura rápida para captar la idea general, no cada palabra."
        },
        {
          text: "Scanning is used to find specific information quickly.",
          isTrue: true,
          explanation: "Correcto. Scanning se usa para encontrar información específica rápidamente."
        },
        {
          text: "You should always do scanning before skimming.",
          isTrue: false,
          explanation: "Falso. Generalmente se hace skimming primero para entender el contexto general."
        },
        {
          text: "Signal words like 'however' and 'therefore' are important for skimming.",
          isTrue: true,
          explanation: "Correcto. Las palabras señal ayudan a entender la estructura y relaciones en el texto."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="When doing skimming, which part of a paragraph is MOST important to read?"
      options={[
        "The middle sentences",
        "Every single word",
        "The first and last sentences",
        "Only the examples"
      ]}
      correctAnswer={2}
      explanation="Las primeras y últimas oraciones de cada párrafo suelen contener las ideas principales."
    />,

    <MultipleChoiceExercise
      key="3"
      question="What should you do FIRST when you need to find someone's phone number in a text?"
      options={[
        "Read the entire text carefully",
        "Look for numbers and contact information",
        "Understand the main idea of the text",
        "Read only the first paragraph"
      ]}
      correctAnswer={1}
      explanation="Para scanning de información específica (número de teléfono), busca directamente números y información de contacto."
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which technique would be BEST for answering 'What is the main argument of this article?'"
      options={[
        "Scanning",
        "Skimming",
        "Detailed reading",
        "Reading backwards"
      ]}
      correctAnswer={1}
      explanation="Skimming es ideal para captar el argumento principal sin leer cada detalle."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Signal words like 'however', 'therefore', and 'in conclusion' are most useful for:"
      options={[
        "Scanning for specific facts",
        "Understanding text structure during skimming",
        "Memorizing vocabulary",
        "Checking spelling"
      ]}
      correctAnswer={1}
      explanation="Las palabras señal ayudan a entender la estructura y flujo de ideas durante el skimming."
    />,

    <MultipleChoiceExercise
      key="6"
      question="When skimming, you should pay most attention to:"
      options={[
        "Every single word",
        "Only the conclusion",
        "First and last sentences of paragraphs",
        "The middle of each paragraph"
      ]}
      correctAnswer={2}
      explanation="Las primeras y últimas oraciones de los párrafos contienen las ideas principales."
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which is NOT a good strategy for scanning?"
      options={[
        "Moving your eyes quickly across the text",
        "Looking for keywords and synonyms",
        "Reading every sentence carefully",
        "Stopping only when you find the target information"
      ]}
      correctAnswer={2}
      explanation="Scanning requiere movimiento rápido, no lectura cuidadosa de cada oración."
    />,

    <MultipleChoiceExercise
      key="8"
      question="What should you do BEFORE scanning for specific information?"
      options={[
        "Read the entire text",
        "Identify exactly what you're looking for",
        "Take detailed notes",
        "Memorize the text structure"
      ]}
      correctAnswer={1}
      explanation="Antes de hacer scanning, debes saber exactamente qué información buscas."
    />,

    <MultipleChoiceExercise
      key="9"
      question="Which technique is better for exam time management?"
      options={[
        "Reading everything in detail first",
        "Skimming first, then scanning for answers",
        "Only using detailed reading",
        "Guessing without reading"
      ]}
      correctAnswer={1}
      explanation="Combinar skimming inicial con scanning dirigido es la estrategia más eficiente."
    />,

    <MultipleChoiceExercise
      key="10"
      question="When scanning for a date, you should look for:"
      options={[
        "Only numbers",
        "Only words",
        "Numbers, months, and time expressions",
        "Only the first paragraph"
      ]}
      correctAnswer={2}
      explanation="Las fechas pueden expresarse con números, nombres de meses y expresiones temporales."
    />
  ];

  return (
    <TheoryLayout
      title="Skimming and Scanning Techniques"
      description="Domina las técnicas de lectura rápida esenciales para los exámenes. Aprende cuándo y cómo usar skimming y scanning para maximizar tu eficiencia."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Vocabulario básico de lectura", "Comprensión de estructura textual"]}
      estimatedTime="45 min"
    />
  );
};

export default SkimmingScanningPage;

