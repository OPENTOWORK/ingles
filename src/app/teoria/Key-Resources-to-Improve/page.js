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

const KeyResourcesToImprovePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son Key Resources to Improve?" icon="📚">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>key resources to improve</strong> (recursos clave para mejorar) son herramientas, materiales y estrategias 
          que te ayudan a desarrollar tus habilidades en inglés de manera efectiva y sostenida.
        </p>
        
        <QuickReference items={[
          "Recursos digitales: aplicaciones, sitios web, podcasts",
          "Materiales tradicionales: libros, diccionarios, gramáticas",
          "Práctica activa: conversación, escritura, lectura",
          "Estrategias de aprendizaje: técnicas de estudio, hábitos",
          "Evaluación y seguimiento: tests, autoevaluación"
        ]} />
      </TheorySection>

      <TheorySection title="Recursos Digitales" icon="💻">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los recursos digitales ofrecen acceso inmediato a contenido actualizado y herramientas interactivas.
        </p>

        <GrammarTable
          caption="Tipos de Recursos Digitales"
          headers={["Tipo", "Ejemplos", "Beneficios", "Nivel"]}
          rows={[
            ["Apps de Idiomas", "Duolingo, Babbel, Rosetta Stone", "Gamificación, práctica diaria", "A1-C2"],
            ["Podcasts", "BBC Learning English, ESL Pod", "Comprensión auditiva, vocabulario", "A2-C2"],
            ["Videos Online", "YouTube channels, TED Talks", "Comprensión visual, pronunciación", "A1-C2"],
            ["Cursos Online", "Coursera, edX, Khan Academy", "Estructura, certificación", "B1-C2"],
            ["Herramientas de Escritura", "Grammarly, Hemingway Editor", "Corrección, mejora de estilo", "B1-C2"],
            ["Diccionarios Online", "Cambridge, Oxford, Merriam-Webster", "Definiciones, pronunciación", "A1-C2"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="App de idiomas: 'Duolingo para práctica diaria'"
            english="Language app: 'Duolingo for daily practice'"
            translation="App de idiomas: 'Duolingo para práctica diaria'"
          />
          <Example 
            spanish="Podcast: 'BBC Learning English para noticias'"
            english="Podcast: 'BBC Learning English for news'"
            translation="Podcast: 'BBC Learning English para noticias'"
          />
          <Example 
            spanish="Herramienta de escritura: 'Grammarly para corrección'"
            english="Writing tool: 'Grammarly for correction'"
            translation="Herramienta de escritura: 'Grammarly para corrección'"
          />
        </div>

        <Rule 
          title="Uso Efectivo de Recursos Digitales"
          description="Para maximizar beneficios:"
          examples={[
            "Establece una rutina diaria",
            "Combina diferentes tipos de recursos",
            "Usa recursos apropiados para tu nivel",
            "Aprovecha las características interactivas"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Los recursos digitales son más efectivos cuando los usas consistentemente.
        </Tip>
      </TheorySection>

      <TheorySection title="Materiales Tradicionales" icon="📖">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los materiales tradicionales siguen siendo fundamentales para un aprendizaje sólido y profundo.
        </p>

        <GrammarTable
          caption="Materiales Tradicionales Esenciales"
          headers={["Material", "Función", "Cuándo Usar", "Beneficios"]}
          rows={[
            ["Diccionarios", "Definiciones, pronunciación", "Al leer o escribir", "Precisión, comprensión"],
            ["Gramáticas", "Reglas y estructuras", "Al estudiar gramática", "Fundamentos sólidos"],
            ["Libros de Texto", "Estructura de aprendizaje", "Estudio sistemático", "Progresión ordenada"],
            ["Novelas y Cuentos", "Lectura extensiva", "Tiempo libre", "Vocabulario, fluidez"],
            ["Periódicos y Revistas", "Lectura de actualidad", "Día a día", "Vocabulario actual"],
            ["Guías de Estilo", "Escritura formal", "Al escribir ensayos", "Registro apropiado"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Diccionario: 'Cambridge Advanced Learner's Dictionary'"
            english="Dictionary: 'Cambridge Advanced Learner's Dictionary'"
            translation="Diccionario: 'Cambridge Advanced Learner's Dictionary'"
          />
          <Example 
            spanish="Gramática: 'English Grammar in Use'"
            english="Grammar: 'English Grammar in Use'"
            translation="Gramática: 'English Grammar in Use'"
          />
          <Example 
            spanish="Lectura: 'The New York Times para noticias'"
            english="Reading: 'The New York Times for news'"
            translation="Lectura: 'The New York Times para noticias'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Combina materiales tradicionales con recursos digitales para un aprendizaje completo.
        </Tip>
      </TheorySection>

      <TheorySection title="Práctica Activa" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La práctica activa es esencial para desarrollar fluidez y confianza en el uso del inglés.
        </p>

        <GrammarTable
          caption="Tipos de Práctica Activa"
          headers={["Habilidad", "Actividades", "Frecuencia", "Beneficios"]}
          rows={[
            ["Speaking", "Conversación, presentaciones, debates", "Diaria", "Fluidez, pronunciación"],
            ["Writing", "Diarios, ensayos, emails", "Regular", "Estructura, vocabulario"],
            ["Reading", "Libros, artículos, noticias", "Diaria", "Vocabulario, comprensión"],
            ["Listening", "Podcasts, música, películas", "Diaria", "Comprensión, pronunciación"],
            ["Grammar", "Ejercicios, traducción", "Regular", "Precisión, estructura"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Speaking: 'Conversación con hablantes nativos'"
            english="Speaking: 'Conversation with native speakers'"
            translation="Speaking: 'Conversación con hablantes nativos'"
          />
          <Example 
            spanish="Writing: 'Mantener un diario en inglés'"
            english="Writing: 'Keep a diary in English'"
            translation="Writing: 'Mantener un diario en inglés'"
          />
          <Example 
            spanish="Reading: 'Leer noticias en inglés diariamente'"
            english="Reading: 'Read English news daily'"
            translation="Reading: 'Leer noticias en inglés diariamente'"
          />
        </div>

        <Rule 
          title="Estrategias de Práctica Efectiva"
          description="Para practicar efectivamente:"
          examples={[
            "Establece objetivos específicos",
            "Practica regularmente, no intensivamente",
            "Combina diferentes habilidades",
            "Busca feedback de otros",
            "Reflexiona sobre tu progreso"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> La práctica sin reflexión puede no ser efectiva - analiza tus errores y progreso.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias de Aprendizaje" icon="🧠">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las estrategias de aprendizaje te ayudan a estudiar de manera más eficiente y efectiva.
        </p>

        <GrammarTable
          caption="Estrategias de Aprendizaje Efectivas"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Beneficios"]}
          rows={[
            ["Spaced Repetition", "Repasar a intervalos crecientes", "Vocabulario, gramática", "Retención a largo plazo"],
            ["Active Recall", "Intentar recordar sin mirar", "Repaso, memorización", "Fortalecimiento de memoria"],
            ["Interleaving", "Mezclar diferentes temas", "Estudio general", "Transferencia de conocimiento"],
            ["Elaboration", "Explicar conceptos en tus palabras", "Comprensión profunda", "Mejor entendimiento"],
            ["Dual Coding", "Combinar palabras e imágenes", "Vocabulario, conceptos", "Múltiples vías de acceso"],
            ["Metacognition", "Reflexionar sobre tu aprendizaje", "Evaluación continua", "Autoconocimiento"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Spaced Repetition: 'Repasar vocabulario cada 1, 3, 7 días'"
            english="Spaced Repetition: 'Review vocabulary every 1, 3, 7 days'"
            translation="Spaced Repetition: 'Repasar vocabulario cada 1, 3, 7 días'"
          />
          <Example 
            spanish="Active Recall: 'Intentar recordar sin mirar las notas'"
            english="Active Recall: 'Try to remember without looking at notes'"
            translation="Active Recall: 'Intentar recordar sin mirar las notas'"
          />
          <Example 
            spanish="Metacognition: 'Reflexionar sobre qué estrategias funcionan'"
            english="Metacognition: 'Reflect on which strategies work'"
            translation="Metacognition: 'Reflexionar sobre qué estrategias funcionan'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Experimenta con diferentes estrategias para encontrar las que funcionan mejor para ti.
        </Tip>
      </TheorySection>

      <TheorySection title="Evaluación y Seguimiento" icon="📊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La evaluación regular te ayuda a identificar fortalezas, debilidades y áreas de mejora.
        </p>

        <GrammarTable
          caption="Métodos de Evaluación"
          headers={["Método", "Qué Evalúa", "Frecuencia", "Herramientas"]}
          rows={[
            ["Self-Assessment", "Progreso personal", "Semanal", "Diarios, listas de verificación"],
            ["Practice Tests", "Conocimiento específico", "Mensual", "Tests online, libros"],
            ["Peer Feedback", "Habilidades comunicativas", "Regular", "Grupos de estudio, intercambios"],
            ["Teacher Feedback", "Aspectos técnicos", "Periódico", "Clases, tutorías"],
            ["Performance Tasks", "Aplicación práctica", "Ocasional", "Presentaciones, proyectos"],
            ["Portfolio Assessment", "Progreso general", "Trimestral", "Colección de trabajos"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Self-Assessment: 'Evaluar mi progreso semanalmente'"
            english="Self-Assessment: 'Evaluate my progress weekly'"
            translation="Self-Assessment: 'Evaluar mi progreso semanalmente'"
          />
          <Example 
            spanish="Practice Tests: 'Hacer tests mensuales de nivel'"
            english="Practice Tests: 'Take monthly level tests'"
            translation="Practice Tests: 'Hacer tests mensuales de nivel'"
          />
          <Example 
            spanish="Peer Feedback: 'Intercambiar trabajos con compañeros'"
            english="Peer Feedback: 'Exchange work with classmates'"
            translation="Peer Feedback: 'Intercambiar trabajos con compañeros'"
          />
        </div>

        <Rule 
          title="Evaluación Efectiva"
          description="Para evaluar efectivamente:"
          examples={[
            "Establece criterios claros",
            "Usa múltiples métodos",
            "Evalúa regularmente",
            "Reflexiona sobre los resultados",
            "Ajusta tu plan de estudio"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> La evaluación debe ser constructiva y orientada a la mejora, no a la crítica.
        </Tip>
      </TheorySection>

      <TheorySection title="Creación de un Plan de Estudio" icon="📅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Un plan de estudio bien estructurado te ayuda a mantener la consistencia y el progreso.
        </p>

        <GrammarTable
          caption="Elementos de un Plan de Estudio"
          headers={["Elemento", "Descripción", "Ejemplo", "Importancia"]}
          rows={[
            ["Objetivos", "Metas específicas y medibles", "Pasar de B1 a B2 en 6 meses", "Dirección clara"],
            ["Horario", "Tiempo dedicado diariamente", "30 minutos diarios", "Consistencia"],
            ["Actividades", "Tareas específicas", "Leer 1 artículo, escribir 1 párrafo", "Variedad"],
            ["Recursos", "Materiales y herramientas", "App, libro, podcast", "Acceso a contenido"],
            ["Evaluación", "Métodos de seguimiento", "Test mensual, autoevaluación", "Progreso"],
            ["Ajustes", "Modificaciones según progreso", "Cambiar actividades si no funcionan", "Flexibilidad"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Objetivo: 'Mejorar mi writing de B1 a B2 en 6 meses'"
            english="Goal: 'Improve my writing from B1 to B2 in 6 months'"
            translation="Objetivo: 'Mejorar mi writing de B1 a B2 en 6 meses'"
          />
          <Example 
            spanish="Horario: '30 minutos diarios: 15 min reading, 15 min writing'"
            english="Schedule: '30 minutes daily: 15 min reading, 15 min writing'"
            translation="Horario: '30 minutos diarios: 15 min reading, 15 min writing'"
          />
          <Example 
            spanish="Evaluación: 'Test mensual y autoevaluación semanal'"
            english="Assessment: 'Monthly test and weekly self-assessment'"
            translation="Evaluación: 'Test mensual y autoevaluación semanal'"
          />
        </div>

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Un plan demasiado ambicioso puede ser contraproducente - sé realista con tus objetivos.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Usar solo un tipo de recurso ❌<br/>
            <strong>Correcto:</strong> Combinar diferentes tipos de recursos ✅<br/>
            <em>La variedad de recursos mejora el aprendizaje</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Estudiar intensivamente sin consistencia ❌<br/>
            <strong>Correcto:</strong> Estudiar regularmente, aunque sea poco tiempo ✅<br/>
            <em>La consistencia es más importante que la intensidad</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No evaluar el progreso ❌<br/>
            <strong>Correcto:</strong> Evaluar regularmente y ajustar estrategias ✅<br/>
            <em>La evaluación te ayuda a mejorar tu enfoque</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar recursos inapropiados para tu nivel ❌<br/>
            <strong>Correcto:</strong> Elegir recursos apropiados para tu nivel ✅<br/>
            <em>Los recursos deben coincidir con tu nivel actual</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Consistencia sobre intensidad"
            description="Es mejor estudiar poco tiempo regularmente que mucho tiempo ocasionalmente."
            examples={[
              "30 minutos diarios > 3 horas una vez por semana",
              "La consistencia construye hábitos",
              "El aprendizaje se consolida con la repetición",
              "La intensidad puede causar fatiga"
            ]}
          />

          <Rule 
            title="2. Variedad de recursos"
            description="Combina diferentes tipos de recursos para un aprendizaje completo."
            examples={[
              "Recursos digitales + materiales tradicionales",
              "Práctica activa + estudio pasivo",
              "Recursos formales + informales",
              "Individual + grupal"
            ]}
          />

          <Rule 
            title="3. Evaluación continua"
            description="Evalúa regularmente tu progreso y ajusta tu enfoque."
            examples={[
              "Autoevaluación semanal",
              "Tests mensuales de nivel",
              "Feedback de otros",
              "Reflexión sobre estrategias"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Qué tipo de recursos ofrecen acceso inmediato?"
      options={[
        "Tradicionales",
        "Digitales",
        "Impresos",
        "Manuscritos"
      ]}
      correctAnswer={1}
      explanation="Los recursos digitales ofrecen acceso inmediato y flexibilidad para el aprendizaje en cualquier momento y lugar."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es el beneficio principal de la práctica consistente?"
      options={[
        "Aprender más vocabulario",
        "Desarrollar fluidez y confianza",
        "Conocer más gramática",
        "Leer más rápido"
      ]}
      correctAnswer={1}
      explanation="La práctica consistente desarrolla fluidez y confianza, que son fundamentales para el uso efectivo del idioma."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Es mejor estudiar 3 horas una vez por semana que 30 minutos diarios.",
          isTrue: false,
          explanation: "Incorrecto. La consistencia (30 minutos diarios) es más efectiva que la intensidad ocasional (3 horas una vez por semana)."
        },
        {
          text: "La variedad de recursos mejora el aprendizaje.",
          isTrue: true,
          explanation: "Correcto. Combinar diferentes tipos de recursos (digitales, tradicionales, activos, pasivos) proporciona un aprendizaje más completo."
        },
        {
          text: "La evaluación regular ayuda a ajustar estrategias de aprendizaje.",
          isTrue: true,
          explanation: "Correcto. La evaluación regular identifica fortalezas y debilidades, permitiendo ajustar estrategias para mejorar el progreso."
        },
        {
          text: "Los recursos deben ser apropiados para el nivel del estudiante.",
          isTrue: true,
          explanation: "Correcto. Usar recursos demasiado fáciles o difíciles puede ser contraproducente. Los recursos deben coincidir con el nivel actual."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la estrategia de aprendizaje más efectiva para la retención a largo plazo?"
      options={[
        "Memorizar intensivamente",
        "Spaced Repetition (repetición espaciada)",
        "Leer solo una vez",
        "Estudiar solo en fin de semana"
      ]}
      correctAnswer={1}
      explanation="Spaced Repetition (repetición espaciada) es más efectiva para la retención a largo plazo que la memorización intensiva."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué elemento es más importante en un plan de estudio?"
      options={[
        "La intensidad del estudio",
        "La consistencia del estudio",
        "La cantidad de recursos",
        "La complejidad de los materiales"
      ]}
      correctAnswer={1}
      explanation="La consistencia del estudio es más importante que la intensidad. Es mejor estudiar regularmente poco tiempo que mucho tiempo ocasionalmente."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Free resources are always lower quality than paid resources.",
          isTrue: false,
          explanation: "Incorrecto. Muchos recursos gratuitos (BBC Learning English, YouTube channels, podcasts) son de excelente calidad."
        },
        {
          text: "Combining different types of resources improves learning outcomes.",
          isTrue: true,
          explanation: "Correcto. Combinar recursos digitales, tradicionales, formales e informales proporciona una experiencia de aprendizaje más completa."
        },
        {
          text: "You should only use resources designed for your exact level.",
          isTrue: false,
          explanation: "Incorrecto. Es beneficioso usar recursos ligeramente por encima de tu nivel para desafiarte y crecer."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Cuál es el beneficio principal de los recursos interactivos?"
      options={[
        "Son más baratos",
        "Proporcionan feedback inmediato",
        "Requieren menos tiempo",
        "Son más fáciles"
      ]}
      correctAnswer={1}
      explanation="Los recursos interactivos proporcionan feedback inmediato, lo que permite corrección y aprendizaje en tiempo real."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Qué tipo de recurso es mejor para mejorar la pronunciación?"
      options={[
        "Solo libros de texto",
        "Audio y video con hablantes nativos",
        "Solo gramática escrita",
        "Solo vocabulario"
      ]}
      correctAnswer={1}
      explanation="Audio y video con hablantes nativos son esenciales para mejorar la pronunciación, ya que proporcionan modelos auténticos."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Self-assessment is an important part of language learning.",
          isTrue: true,
          explanation: "Correcto. La autoevaluación ayuda a identificar fortalezas, debilidades y áreas que necesitan más práctica."
        },
        {
          text: "You should stick to one resource until you master it completely.",
          isTrue: false,
          explanation: "Incorrecto. Usar variedad de recursos expone a diferentes estilos de enseñanza y mantiene el interés."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuál es la mejor frecuencia para evaluar tu progreso?"
      options={[
        "Solo al final del año",
        "Regularmente (semanal o mensualmente)",
        "Solo cuando sientes que no progresas",
        "Nunca, es innecesario"
      ]}
      correctAnswer={1}
      explanation="La evaluación regular (semanal o mensualmente) permite ajustar estrategias y mantener la motivación al ver el progreso."
    />
  ];

  return (
    <TheoryLayout
      title="Key Resources to Improve"
      description="Descubre los recursos clave para mejorar tu inglés: digitales, tradicionales, práctica activa, estrategias de aprendizaje y evaluación. Crea un plan de estudio efectivo."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic English skills", "Motivation to improve"]}
      estimatedTime="75 min"
    />
  );
};

export default KeyResourcesToImprovePage;






















