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

const MonologuesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Monologues?" icon="🎤">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>monologues</strong> (monólogos) son discursos hablados por una sola persona que aparecen frecuentemente 
          en exámenes de listening. Son más largos que los diálogos y requieren diferentes estrategias de comprensión.
        </p>
        
        <QuickReference items={[
          "Duración: 2-5 minutos",
          "Una sola persona hablando",
          "Contextos: presentaciones, conferencias, narraciones",
          "Objetivo: información detallada y específica",
          "Nivel: A2-B1 (elemental a intermedio)"
        ]} />
      </TheorySection>

      <TheorySection title="Características de los Monologues" icon="📋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los monólogos tienen características específicas que los distinguen de otros tipos de listening.
        </p>

        <GrammarTable
          caption="Características de Monologues"
          headers={["Característica", "Descripción", "Beneficio", "Ejemplo"]}
          rows={[
            ["Duración Larga", "2-5 minutos continuos", "Información detallada", "Presentación completa"],
            ["Una Voz", "Solo una persona hablando", "Enfoque en un punto de vista", "Conferencia o charla"],
            ["Estructura Clara", "Introducción, desarrollo, conclusión", "Fácil seguimiento", "Presentación estructurada"],
            ["Vocabulario Específico", "Términos del tema", "Aprendizaje de vocabulario", "Términos técnicos"],
            ["Objetivo Específico", "Información sobre un tema", "Comprensión profunda", "Explicación detallada"],
            ["Velocidad Moderada", "Habla clara y pausada", "Tiempo para procesar", "Ritmo de presentación"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Contexto: Presentación sobre tecnología"
            english="Context: Presentation about technology"
            translation="Contexto: Presentación sobre tecnología"
          />
          <Example 
            spanish="Duración: 4 minutos"
            english="Duration: 4 minutes"
            translation="Duración: 4 minutos"
          />
          <Example 
            spanish="Objetivo: Explicar beneficios de la tecnología"
            english="Objective: Explain benefits of technology"
            translation="Objetivo: Explicar beneficios de la tecnología"
          />
        </div>

        <Rule 
          title="Ventajas de los Monologues"
          description="Por qué son útiles para el aprendizaje:"
          examples={[
            "Proporcionan información detallada sobre un tema",
            "Permiten escuchar vocabulario específico en contexto",
            "Desarrollan habilidades de escucha prolongada",
            "Mejoran la comprensión de estructuras de presentación"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Los monólogos son excelentes para desarrollar resistencia auditiva y vocabulario específico.
        </Tip>
      </TheorySection>

      <TheorySection title="Tipos de Monologues" icon="🗂️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los monólogos pueden ser de diferentes tipos según su propósito y contexto.
        </p>

        <GrammarTable
          caption="Tipos de Monologues"
          headers={["Tipo", "Contexto", "Estructura", "Información Clave"]}
          rows={[
            ["Presentación", "Conferencia, charla", "Introducción, puntos principales, conclusión", "Ideas, argumentos, conclusiones"],
            ["Narración", "Historia, experiencia personal", "Inicio, desarrollo, final", "Eventos, personas, lugares, tiempo"],
            ["Explicación", "Instrucciones, proceso", "Problema, solución, pasos", "Pasos, procedimientos, resultados"],
            ["Descripción", "Lugar, persona, objeto", "Características, detalles", "Apariencia, características, ubicación"],
            ["Opinión", "Análisis, evaluación", "Tesis, argumentos, conclusión", "Opiniones, razones, ejemplos"],
            ["Información", "Noticias, reporte", "Hechos, datos, análisis", "Datos, estadísticas, conclusiones"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Presentación: 'Los beneficios de la tecnología en la educación'"
            english="Presentation: 'Benefits of technology in education'"
            translation="Presentación: 'Los beneficios de la tecnología en la educación'"
          />
          <Example 
            spanish="Narración: 'Mi experiencia estudiando en el extranjero'"
            english="Narration: 'My experience studying abroad'"
            translation="Narración: 'Mi experiencia estudiando en el extranjero'"
          />
          <Example 
            spanish="Explicación: 'Cómo funciona el sistema de transporte público'"
            english="Explanation: 'How the public transport system works'"
            translation="Explicación: 'Cómo funciona el sistema de transporte público'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Identifica el tipo de monólogo para saber qué información buscar.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias para Monologues" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los monólogos requieren estrategias específicas debido a su duración y complejidad.
        </p>

        <GrammarTable
          caption="Estrategias Específicas para Monologues"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Beneficio"]}
          rows={[
            ["Pre-lectura Extendida", "Leer todas las preguntas cuidadosamente", "Antes del audio", "Saber qué información buscar"],
            ["Predicción Avanzada", "Predecir contenido basado en preguntas", "Antes del audio", "Preparar la mente"],
            ["Escucha Activa", "Concentrarse en información específica", "Durante el audio", "Captar detalles importantes"],
            ["Toma de Notas", "Anotar información clave", "Durante el audio", "Retener información"],
            ["Seguimiento de Estructura", "Identificar introducción, desarrollo, conclusión", "Durante el audio", "Mantener orientación"],
            ["Verificación Completa", "Confirmar respuestas después", "Después del audio", "Asegurar precisión"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Pre-lectura: 'Leer todas las preguntas para identificar temas'"
            english="Pre-reading: 'Read all questions to identify topics'"
            translation="Pre-lectura: 'Leer todas las preguntas para identificar temas'"
          />
          <Example 
            spanish="Predicción: 'Basado en las preguntas, predecir contenido'"
            english="Prediction: 'Based on questions, predict content'"
            translation="Predicción: 'Basado en las preguntas, predecir contenido'"
          />
          <Example 
            spanish="Toma de notas: 'Anotar fechas, nombres, números importantes'"
            english="Note-taking: 'Write down dates, names, important numbers'"
            translation="Toma de notas: 'Anotar fechas, nombres, números importantes'"
          />
        </div>

        <Rule 
          title="Proceso Paso a Paso"
          description="Sigue este proceso para monólogos:"
          examples={[
            "1. Lee todas las preguntas cuidadosamente",
            "2. Predice el contenido del monólogo",
            "3. Escucha la introducción para confirmar el tema",
            "4. Toma notas durante el desarrollo",
            "5. Presta atención a la conclusión",
            "6. Verifica todas tus respuestas"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No te pierdas en detalles menores - mantén el enfoque en la información que necesitas.
        </Tip>
      </TheorySection>

      <TheorySection title="Estructura de Monologues" icon="🏗️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Entender la estructura típica de un monólogo te ayuda a seguir el contenido más efectivamente.
        </p>

        <GrammarTable
          caption="Estructura Típica de Monologues"
          headers={["Parte", "Función", "Contenido", "Duración"]}
          rows={[
            ["Introducción", "Presentar el tema", "Título, objetivo, resumen", "10-15% del total"],
            ["Desarrollo", "Explicar el contenido", "Puntos principales, ejemplos, detalles", "70-80% del total"],
            ["Conclusión", "Resumir y cerrar", "Resumen, opinión final, recomendación", "10-15% del total"],
            ["Transiciones", "Conectar ideas", "Conectores, frases de enlace", "A lo largo del monólogo"],
            ["Pausas", "Permitir procesamiento", "Silencios, cambios de ritmo", "Estratégicamente colocadas"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Introducción: 'Hoy voy a hablar sobre los beneficios de la tecnología'"
            english="Introduction: 'Today I'm going to talk about the benefits of technology'"
            translation="Introducción: 'Hoy voy a hablar sobre los beneficios de la tecnología'"
          />
          <Example 
            spanish="Desarrollo: 'En primer lugar, mejora la comunicación...'"
            english="Development: 'First of all, it improves communication...'"
            translation="Desarrollo: 'En primer lugar, mejora la comunicación...'"
          />
          <Example 
            spanish="Conclusión: 'En resumen, la tecnología es muy beneficiosa'"
            english="Conclusion: 'In summary, technology is very beneficial'"
            translation="Conclusión: 'En resumen, la tecnología es muy beneficiosa'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> La estructura te ayuda a anticipar qué tipo de información viene a continuación.
        </Tip>
      </TheorySection>

      <TheorySection title="Tipos de Preguntas en Monologues" icon="❓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los monólogos suelen tener tipos específicos de preguntas que requieren diferentes estrategias.
        </p>

        <GrammarTable
          caption="Tipos de Preguntas en Monologues"
          headers={["Tipo", "Pregunta Típica", "Qué Buscar", "Estrategia"]}
          rows={[
            ["Información Específica", "What is the main topic?", "Tema principal, objetivo", "Escuchar introducción"],
            ["Detalles", "What are the three benefits?", "Lista, enumeración", "Identificar números y listas"],
            ["Opinión", "What does the speaker think?", "Opiniones, evaluaciones", "Palabras de opinión"],
            ["Hechos", "What happened in 2020?", "Fechas, eventos, datos", "Números, fechas, nombres"],
            ["Causa y Efecto", "Why did this happen?", "Razones, explicaciones", "Palabras causales"],
            ["Resumen", "What is the conclusion?", "Resumen final, recomendación", "Escuchar conclusión"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Información específica: '¿Cuál es el tema principal?'"
            english="Specific information: 'What is the main topic?'"
            translation="Información específica: '¿Cuál es el tema principal?'"
          />
          <Example 
            spanish="Detalles: '¿Cuáles son los tres beneficios?'"
            english="Details: 'What are the three benefits?'"
            translation="Detalles: '¿Cuáles son los tres beneficios?'"
          />
          <Example 
            spanish="Opinión: '¿Qué piensa el hablante?'"
            english="Opinion: 'What does the speaker think?'"
            translation="Opinión: '¿Qué piensa el hablante?'"
          />
        </div>

        <Rule 
          title="Estrategias por Tipo de Pregunta"
          description="Para cada tipo de pregunta:"
          examples={[
            "Información específica: escuchar introducción",
            "Detalles: identificar listas y enumeraciones",
            "Opinión: buscar palabras de evaluación",
            "Hechos: prestar atención a números y fechas"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Identifica el tipo de pregunta para saber dónde buscar la información.
        </Tip>
      </TheorySection>

      <TheorySection title="Toma de Notas Efectiva" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La toma de notas es crucial para monólogos largos donde necesitas retener mucha información.
        </p>

        <GrammarTable
          caption="Técnicas de Toma de Notas"
          headers={["Técnica", "Descripción", "Cuándo Usar", "Beneficio"]}
          rows={[
            ["Abreviaciones", "Usar símbolos y abreviaciones", "Información repetitiva", "Velocidad de escritura"],
            ["Palabras Clave", "Anotar solo palabras importantes", "Conceptos principales", "Enfoque en lo esencial"],
            ["Números y Fechas", "Escribir números claramente", "Datos específicos", "Precisión en información"],
            ["Estructura", "Organizar notas por secciones", "Monólogos largos", "Fácil referencia posterior"],
            ["Símbolos", "Usar símbolos para relaciones", "Causa-efecto, listas", "Claridad visual"],
            ["Espacios", "Dejar espacios para agregar", "Información adicional", "Flexibilidad"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Abreviaciones: 'tecnología → tech, comunicación → comm'"
            english="Abbreviations: 'technology → tech, communication → comm'"
            translation="Abreviaciones: 'tecnología → tech, comunicación → comm'"
          />
          <Example 
            spanish="Palabras clave: 'beneficios, comunicación, educación, trabajo'"
            english="Keywords: 'benefits, communication, education, work'"
            translation="Palabras clave: 'beneficios, comunicación, educación, trabajo'"
          />
          <Example 
            spanish="Números: '2020, 75%, 3 beneficios, 10 años'"
            english="Numbers: '2020, 75%, 3 benefits, 10 years'"
            translation="Números: '2020, 75%, 3 beneficios, 10 años'"
          />
        </div>

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No trates de escribir todo - enfócate en la información que necesitas para responder las preguntas.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> No leer todas las preguntas antes del audio ❌<br/>
            <strong>Correcto:</strong> Leer todas las preguntas primero ✅<br/>
            <em>Saber qué buscar es crucial para monólogos largos</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Intentar entender cada palabra ❌<br/>
            <strong>Correcto:</strong> Enfocarse en información específica ✅<br/>
            <em>Los monólogos contienen mucha información - selecciona lo relevante</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No tomar notas ❌<br/>
            <strong>Correcto:</strong> Tomar notas de información clave ✅<br/>
            <em>Las notas son esenciales para monólogos largos</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Perder la concentración ❌<br/>
            <strong>Correcto:</strong> Mantener el enfoque durante todo el monólogo ✅<br/>
            <em>La concentración sostenida es clave para monólogos</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Preparación exhaustiva"
            description="Prepara bien antes de escuchar el monólogo."
            examples={[
              "Lee todas las preguntas cuidadosamente",
              "Identifica qué información necesitas",
              "Predice el contenido del monólogo",
              "Prepara tu sistema de toma de notas"
            ]}
          />

          <Rule 
            title="2. Concentración sostenida"
            description="Mantén tu atención durante todo el monólogo."
            examples={[
              "No te distraigas con pensamientos internos",
              "Enfócate en la información que necesitas",
              "Usa la estructura para mantener orientación",
              "Toma descansos mentales en las pausas"
            ]}
          />

          <Rule 
            title="3. Toma de notas estratégica"
            description="Toma notas de manera eficiente y efectiva."
            examples={[
              "Usa abreviaciones y símbolos",
              "Enfócate en información específica",
              "Organiza tus notas por secciones",
              "No trates de escribir todo"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Cuánto duran típicamente los monólogos?"
      options={[
        "30 segundos-2 minutos",
        "2-5 minutos",
        "5-10 minutos",
        "Más de 10 minutos"
      ]}
      correctAnswer={1}
      explanation="Los monólogos duran entre 2-5 minutos, permitiendo el desarrollo completo de un tema con una sola voz."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la mejor estrategia para monólogos?"
      options={[
        "Escuchar sin preparación",
        "Leer todas las preguntas antes del audio",
        "Tomar notas de todo lo que se dice",
        "No preocuparse por la estructura"
      ]}
      correctAnswer={1}
      explanation="Leer todas las preguntas antes del audio es crucial para monólogos, ya que te ayuda a saber qué información buscar en un audio largo."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Los monólogos requieren concentración sostenida durante toda la duración.",
          isTrue: true,
          explanation: "Correcto. Los monólogos son largos y requieren mantener la concentración durante toda la duración para captar toda la información necesaria."
        },
        {
          text: "Es mejor tomar notas de todo lo que se dice en un monólogo.",
          isTrue: false,
          explanation: "Incorrecto. Es mejor tomar notas solo de la información relevante para las preguntas, no de todo lo que se dice."
        },
        {
          text: "Entender la estructura del monólogo ayuda a anticipar el contenido.",
          isTrue: true,
          explanation: "Correcto. La estructura típica (introducción, desarrollo, conclusión) te ayuda a saber qué tipo de información viene a continuación."
        },
        {
          text: "Los monólogos son más fáciles que los diálogos porque solo hay una voz.",
          isTrue: false,
          explanation: "Incorrecto. Los monólogos pueden ser más difíciles porque son más largos y contienen más información que procesar."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Qué parte del monólogo contiene la información más detallada?"
      options={[
        "Introducción",
        "Desarrollo",
        "Conclusión",
        "Transiciones"
      ]}
      correctAnswer={1}
      explanation="El desarrollo contiene la información más detallada (70-80% del monólogo), mientras que la introducción y conclusión son más cortas."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la técnica de toma de notas más efectiva para monólogos?"
      options={[
        "Escribir todo lo que se dice",
        "Usar abreviaciones y palabras clave",
        "No tomar notas",
        "Escribir solo al final"
      ]}
      correctAnswer={1}
      explanation="Usar abreviaciones y palabras clave es la técnica más efectiva, ya que te permite captar información importante sin perder tiempo escribiendo todo."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Monologues are easier than dialogues because there's only one speaker.",
          isTrue: false,
          explanation: "Incorrecto. Los monólogos pueden ser más difíciles porque requieren concentración sostenida sin la variedad de múltiples voces."
        },
        {
          text: "Predicting content before listening helps with monologue comprehension.",
          isTrue: true,
          explanation: "Correcto. Predecir el contenido basándose en el título o contexto ayuda a preparar la mente para el tema."
        },
        {
          text: "You should write down everything the speaker says in a monologue.",
          isTrue: false,
          explanation: "Incorrecto. Es mejor tomar notas estratégicas enfocándose en información clave y estructura."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Qué elemento es más importante para seguir un monólogo académico?"
      options={[
        "La personalidad del hablante",
        "La estructura y organización del contenido",
        "El acento del hablante",
        "La velocidad del habla"
      ]}
      correctAnswer={1}
      explanation="La estructura y organización del contenido es lo más importante para seguir un monólogo académico efectivamente."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Cuándo es más probable que pierdas la concentración en un monólogo?"
      options={[
        "Al principio",
        "En la mitad del monólogo",
        "Al final",
        "Nunca"
      ]}
      correctAnswer={1}
      explanation="Es más probable perder concentración en la mitad, cuando la novedad inicial se desvanece pero aún queda mucho contenido."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Signposting language is more important in monologues than in dialogues.",
          isTrue: true,
          explanation: "Correcto. El lenguaje de señalización es crucial en monólogos para guiar al oyente a través de la estructura."
        },
        {
          text: "Mental breaks during natural pauses can help maintain focus.",
          isTrue: true,
          explanation: "Correcto. Usar pausas naturales para descansos mentales breves ayuda a mantener la concentración."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Qué tipo de monólogo requiere más atención a detalles específicos?"
      options={[
        "Narrativa personal",
        "Presentación académica con datos",
        "Descripción general",
        "Opinión personal"
      ]}
      correctAnswer={1}
      explanation="Las presentaciones académicas con datos requieren más atención a detalles específicos como números, fechas y estadísticas."
    />
  ];

  return (
    <TheoryLayout
      title="Monologues"
      description="Domina la comprensión de monólogos en inglés. Aprende estrategias para entender discursos largos de una sola persona en presentaciones, conferencias y narraciones."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic listening skills", "Experience with short dialogues"]}
      estimatedTime="75 min"
    />
  );
};

export default MonologuesPage;






















