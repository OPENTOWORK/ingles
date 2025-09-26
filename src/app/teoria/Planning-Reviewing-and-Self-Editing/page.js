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

const PlanningReviewingAndSelfEditingPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son Planning, Reviewing, and Self-Editing?" icon="📋">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          <strong>Planning</strong> (planificación), <strong>Reviewing</strong> (revisión) y <strong>Self-Editing</strong> (autocorrección) 
          son procesos esenciales para producir textos de alta calidad. Cada etapa tiene objetivos específicos y estrategias particulares.
        </p>
        
        <QuickReference items={[
          "Planning: organizar ideas antes de escribir",
          "Reviewing: evaluar contenido y estructura",
          "Self-Editing: corregir errores y mejorar estilo",
          "Proceso cíclico de mejora continua",
          "Herramientas y estrategias específicas"
        ]} />
      </TheorySection>

      <TheorySection title="Planning (Planificación)" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La planificación es el proceso de organizar tus ideas antes de empezar a escribir. Una buena planificación facilita el proceso de escritura.
        </p>

        <GrammarTable
          caption="Estrategias de Planificación"
          headers={["Estrategia", "Descripción", "Herramientas", "Beneficios"]}
          rows={[
            ["Brainstorming", "Generar ideas libremente", "Listas, mapas mentales", "Creatividad, ideas diversas"],
            ["Outlining", "Organizar ideas jerárquicamente", "Esquemas, numeración", "Estructura clara, coherencia"],
            ["Mind Mapping", "Conectar ideas visualmente", "Diagramas, conexiones", "Relaciones entre ideas"],
            ["Freewriting", "Escribir sin restricciones", "Texto libre, cronómetro", "Fluidez, ideas espontáneas"],
            ["Clustering", "Agrupar ideas relacionadas", "Círculos, agrupaciones", "Organización temática"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Brainstorming: Lista todas las ideas sobre 'tecnología'"
            english="Brainstorming: List all ideas about 'technology'"
            translation="Brainstorming: Lista todas las ideas sobre 'tecnología'"
          />
          <Example 
            spanish="Outline: I. Introducción, II. Desarrollo, III. Conclusión"
            english="Outline: I. Introduction, II. Development, III. Conclusion"
            translation="Outline: I. Introducción, II. Desarrollo, III. Conclusión"
          />
          <Example 
            spanish="Mind Map: Tecnología → Comunicación → Redes sociales → Facebook"
            english="Mind Map: Technology → Communication → Social media → Facebook"
            translation="Mind Map: Tecnología → Comunicación → Redes sociales → Facebook"
          />
        </div>

        <Rule 
          title="Proceso de Planificación Efectiva"
          description="Sigue estos pasos:"
          examples={[
            "1. Identifica el propósito y audiencia",
            "2. Genera ideas (brainstorming)",
            "3. Organiza ideas (outlining)",
            "4. Define la estructura principal",
            "5. Establece objetivos por sección"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Dedica el 20% de tu tiempo a planificar - esto ahorra tiempo en la escritura y revisión.
        </Tip>
      </TheorySection>

      <TheorySection title="Reviewing (Revisión)" icon="🔍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La revisión implica evaluar el contenido, la estructura y la organización de tu texto para asegurar que cumple su propósito.
        </p>

        <GrammarTable
          caption="Aspectos a Revisar"
          headers={["Aspecto", "Preguntas Clave", "Qué Buscar", "Herramientas"]}
          rows={[
            ["Contenido", "¿Cumple el propósito?", "Ideas claras, argumentos sólidos", "Lista de verificación"],
            ["Estructura", "¿Está bien organizado?", "Introducción, desarrollo, conclusión", "Outline del texto"],
            ["Coherencia", "¿Las ideas se conectan?", "Transiciones, conectores", "Lectura fluida"],
            ["Audiencia", "¿Es apropiado para el lector?", "Registro, vocabulario", "Perspectiva del lector"],
            ["Completitud", "¿Está completo?", "Todas las partes necesarias", "Lista de requisitos"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Revisión de contenido: '¿Mi argumento es convincente?'"
            english="Content review: 'Is my argument convincing?'"
            translation="Revisión de contenido: '¿Mi argumento es convincente?'"
          />
          <Example 
            spanish="Revisión de estructura: '¿Mi introducción presenta claramente el tema?'"
            english="Structure review: 'Does my introduction clearly present the topic?'"
            translation="Revisión de estructura: '¿Mi introducción presenta claramente el tema?'"
          />
          <Example 
            spanish="Revisión de audiencia: '¿Mi vocabulario es apropiado para mi audiencia?'"
            english="Audience review: 'Is my vocabulary appropriate for my audience?'"
            translation="Revisión de audiencia: '¿Mi vocabulario es apropiado para mi audiencia?'"
          />
        </div>

        <Rule 
          title="Estrategias de Revisión Efectiva"
          description="Para revisar efectivamente:"
          examples={[
            "Lee el texto completo primero",
            "Revisa por aspectos específicos",
            "Usa una lista de verificación",
            "Tómate un descanso entre revisiones",
            "Lee en voz alta para detectar problemas"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Revisa en múltiples sesiones - cada vez enfócate en un aspecto diferente.
        </Tip>
      </TheorySection>

      <TheorySection title="Self-Editing (Autocorrección)" icon="✏️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La autocorrección se enfoca en corregir errores específicos y mejorar el estilo y la claridad del texto.
        </p>

        <GrammarTable
          caption="Niveles de Autocorrección"
          headers={["Nivel", "Enfoque", "Qué Corregir", "Ejemplos"]}
          rows={[
            ["Macro-editing", "Estructura general", "Organización, flujo, propósito", "Reorganizar párrafos"],
            ["Meso-editing", "Párrafos y oraciones", "Coherencia, transiciones", "Mejorar conectores"],
            ["Micro-editing", "Palabras y gramática", "Errores, estilo, precisión", "Corregir verbos, preposiciones"],
            ["Proofreading", "Errores finales", "Ortografía, puntuación", "Typos, comas, mayúsculas"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Macro-editing: Reorganizar párrafos para mejor flujo"
            english="Macro-editing: Reorganize paragraphs for better flow"
            translation="Macro-editing: Reorganizar párrafos para mejor flujo"
          />
          <Example 
            spanish="Meso-editing: Mejorar transiciones entre párrafos"
            english="Meso-editing: Improve transitions between paragraphs"
            translation="Meso-editing: Mejorar transiciones entre párrafos"
          />
          <Example 
            spanish="Micro-editing: Corregir errores gramaticales específicos"
            english="Micro-editing: Correct specific grammatical errors"
            translation="Micro-editing: Corregir errores gramaticales específicos"
          />
        </div>

        <Rule 
          title="Proceso de Autocorrección"
          description="Sigue este orden:"
          examples={[
            "1. Macro-editing: estructura y organización",
            "2. Meso-editing: párrafos y coherencia",
            "3. Micro-editing: oraciones y vocabulario",
            "4. Proofreading: errores finales"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No trates de corregir todo a la vez - enfócate en un nivel a la vez.
        </Tip>
      </TheorySection>

      <TheorySection title="Herramientas y Técnicas" icon="🛠️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Existen diversas herramientas y técnicas que pueden ayudarte en cada etapa del proceso.
        </p>

        <GrammarTable
          caption="Herramientas por Etapa"
          headers={["Etapa", "Herramientas", "Técnicas", "Beneficios"]}
          rows={[
            ["Planning", "Mapas mentales, esquemas", "Freewriting, clustering", "Organización, creatividad"],
            ["Reviewing", "Listas de verificación", "Lectura en voz alta", "Evaluación sistemática"],
            ["Self-Editing", "Diccionarios, gramática", "Lectura al revés", "Precisión, corrección"],
            ["Proofreading", "Correctores ortográficos", "Impresión en papel", "Errores finales"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Herramienta de planificación: 'MindMeister para mapas mentales'"
            english="Planning tool: 'MindMeister for mind maps'"
            translation="Herramienta de planificación: 'MindMeister para mapas mentales'"
          />
          <Example 
            spanish="Técnica de revisión: 'Leer el texto en voz alta'"
            english="Review technique: 'Read the text aloud'"
            translation="Técnica de revisión: 'Leer el texto en voz alta'"
          />
          <Example 
            spanish="Técnica de corrección: 'Leer el texto al revés'"
            english="Editing technique: 'Read the text backwards'"
            translation="Técnica de corrección: 'Leer el texto al revés'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Combina herramientas digitales con técnicas tradicionales para mejores resultados.
        </Tip>
      </TheorySection>

      <TheorySection title="Lista de Verificación" icon="✅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Una lista de verificación te ayuda a asegurar que no olvides ningún aspecto importante.
        </p>

        <GrammarTable
          caption="Lista de Verificación Completa"
          headers={["Categoría", "Preguntas", "Sí/No", "Notas"]}
          rows={[
            ["Contenido", "¿El texto cumple su propósito?", "☐", "Verificar objetivo"],
            ["Estructura", "¿Tiene introducción, desarrollo y conclusión?", "☐", "Revisar organización"],
            ["Coherencia", "¿Las ideas se conectan lógicamente?", "☐", "Verificar transiciones"],
            ["Registro", "¿El vocabulario es apropiado?", "☐", "Adaptar a audiencia"],
            ["Gramática", "¿Hay errores gramaticales?", "☐", "Revisar verbos, preposiciones"],
            ["Ortografía", "¿Hay errores ortográficos?", "☐", "Usar corrector"],
            ["Puntuación", "¿La puntuación es correcta?", "☐", "Revisar comas, puntos"],
            ["Longitud", "¿Cumple los requisitos de extensión?", "☐", "Contar palabras"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Verificación de contenido: '¿Mi argumento es convincente y completo?'"
            english="Content check: 'Is my argument convincing and complete?'"
            translation="Verificación de contenido: '¿Mi argumento es convincente y completo?'"
          />
          <Example 
            spanish="Verificación de gramática: '¿Todos los verbos están en el tiempo correcto?'"
            english="Grammar check: 'Are all verbs in the correct tense?'"
            translation="Verificación de gramática: '¿Todos los verbos están en el tiempo correcto?'"
          />
          <Example 
            spanish="Verificación final: '¿El texto está listo para entregar?'"
            english="Final check: 'Is the text ready to submit?'"
            translation="Verificación final: '¿El texto está listo para entregar?'"
          />
        </div>

        <Rule 
          title="Uso de la Lista de Verificación"
          description="Para usar efectivamente:"
          examples={[
            "Revisa cada elemento sistemáticamente",
            "Marca los elementos completados",
            "Toma notas sobre mejoras necesarias",
            "Revisa la lista al final del proceso"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Personaliza tu lista de verificación según tus necesidades específicas.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Saltarse la planificación ❌<br/>
            <strong>Correcto:</strong> Siempre planificar antes de escribir ✅<br/>
            <em>La planificación ahorra tiempo y mejora la calidad</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Revisar solo una vez ❌<br/>
            <strong>Correcto:</strong> Revisar en múltiples sesiones ✅<br/>
            <em>Múltiples revisiones detectan más problemas</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Corregir todo al mismo tiempo ❌<br/>
            <strong>Correcto:</strong> Enfocarse en un nivel a la vez ✅<br/>
            <em>Corrección sistemática es más efectiva</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Confiar solo en correctores automáticos ❌<br/>
            <strong>Correcto:</strong> Combinar herramientas automáticas y manuales ✅<br/>
            <em>Los correctores no detectan todos los errores</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Proceso cíclico"
            description="Planning, reviewing y self-editing son procesos que se repiten."
            examples={[
              "Planifica → Escribe → Revisa → Corrige",
              "Cada ciclo mejora el texto",
              "No esperes perfección en el primer intento",
              "Itera hasta lograr la calidad deseada"
            ]}
          />

          <Rule 
            title="2. Tiempo y descanso"
            description="Dedica tiempo suficiente y toma descansos."
            examples={[
              "Planifica: 20% del tiempo total",
              "Escribe: 50% del tiempo total",
              "Revisa y corrige: 30% del tiempo total",
              "Toma descansos entre sesiones"
            ]}
          />

          <Rule 
            title="3. Perspectiva externa"
            description="Intenta ver tu texto con ojos de lector."
            examples={[
              "Lee como si fueras el destinatario",
              "Identifica posibles confusiones",
              "Verifica que el propósito sea claro",
              "Asegúrate de que sea apropiado para la audiencia"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="La ___ (planificación/revisión) debe hacerse antes de escribir. La ___ (revisión/autocorrección) evalúa el contenido y estructura. La ___ (autocorrección/planificación) corrige errores específicos."
      blanks={[
        { answer: "planificación" },
        { answer: "revisión" },
        { answer: "autocorrección" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es el orden correcto del proceso de escritura?"
      options={[
        "Escribir → Planificar → Revisar → Corregir",
        "Planificar → Escribir → Revisar → Corregir",
        "Revisar → Planificar → Escribir → Corregir",
        "Corregir → Planificar → Escribir → Revisar"
      ]}
      correctAnswer={1}
      explanation="El orden correcto es: Planificar → Escribir → Revisar → Corregir. La planificación debe hacerse primero para organizar las ideas."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "La planificación debe tomar aproximadamente el 20% del tiempo total de escritura.",
          isTrue: true,
          explanation: "Correcto. Una buena distribución del tiempo es: 20% planificación, 50% escritura, 30% revisión y corrección."
        },
        {
          text: "Es mejor corregir todos los tipos de errores al mismo tiempo.",
          isTrue: false,
          explanation: "Incorrecto. Es mejor enfocarse en un nivel de corrección a la vez: macro-editing, meso-editing, micro-editing, y proofreading."
        },
        {
          text: "Leer el texto en voz alta es una técnica útil para detectar problemas de flujo.",
          isTrue: true,
          explanation: "Correcto. Leer en voz alta ayuda a detectar problemas de ritmo, fluidez y coherencia que no se notan al leer silenciosamente."
        },
        {
          text: "Los correctores automáticos detectan todos los errores de un texto.",
          isTrue: false,
          explanation: "Incorrecto. Los correctores automáticos no detectan todos los errores, especialmente problemas de estilo, coherencia y registro."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Qué aspecto se revisa en el nivel de macro-editing?"
      options={[
        "Errores ortográficos",
        "Estructura general y organización",
        "Errores gramaticales específicos",
        "Puntuación y mayúsculas"
      ]}
      correctAnswer={1}
      explanation="El macro-editing se enfoca en la estructura general, organización y flujo del texto, no en errores específicos de gramática u ortografía."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la mejor técnica para detectar errores ortográficos?"
      options={[
        "Leer el texto en voz alta",
        "Leer el texto al revés",
        "Usar solo correctores automáticos",
        "Revisar solo una vez"
      ]}
      correctAnswer={1}
      explanation="Leer el texto al revés (de atrás hacia adelante) es una técnica efectiva para detectar errores ortográficos porque te enfocas en palabras individuales."
    />
  ];

  return (
    <TheoryLayout
      title="Planning, Reviewing, and Self-Editing"
      description="Domina los procesos de planificación, revisión y autocorrección para producir textos de alta calidad. Aprende estrategias y herramientas para cada etapa."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic writing skills", "Understanding of text structure"]}
      estimatedTime="80 min"
    />
  );
};

export default PlanningReviewingAndSelfEditingPage;



