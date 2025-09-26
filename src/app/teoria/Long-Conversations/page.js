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

const LongConversationsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son las Long Conversations?" icon="💬">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las <strong>long conversations</strong> (conversaciones largas) son diálogos extensos entre dos o más personas 
          que aparecen en exámenes de listening. Requieren habilidades avanzadas de comprensión y seguimiento.
        </p>
        
        <QuickReference items={[
          "Duración: 3-8 minutos",
          "Participantes: 2-4 personas",
          "Contextos: debates, entrevistas, discusiones",
          "Objetivo: información detallada y relaciones",
          "Nivel: B1-B2 (intermedio a intermedio-alto)"
        ]} />
      </TheorySection>

      <TheorySection title="Características de las Long Conversations" icon="📋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las conversaciones largas tienen características específicas que las distinguen de diálogos cortos.
        </p>

        <GrammarTable
          caption="Características de Long Conversations"
          headers={["Característica", "Descripción", "Desafío", "Estrategia"]}
          rows={[
            ["Duración Extendida", "3-8 minutos de conversación", "Mantener concentración", "Toma de notas activa"],
            ["Múltiples Voces", "2-4 personas hablando", "Distinguir entre hablantes", "Identificar voces y roles"],
            ["Cambios de Tema", "Múltiples temas en una conversación", "Seguir transiciones", "Identificar conectores"],
            ["Interrupciones", "Habla superpuesta, interrupciones", "Entender contexto", "Usar contexto para inferir"],
            ["Información Compleja", "Detalles, opiniones, hechos", "Procesar mucha información", "Priorizar información relevante"],
            ["Relaciones", "Interacciones entre hablantes", "Entender dinámicas", "Observar tono y actitud"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Contexto: Entrevista de trabajo de 5 minutos"
            english="Context: 5-minute job interview"
            translation="Contexto: Entrevista de trabajo de 5 minutos"
          />
          <Example 
            spanish="Participantes: Entrevistador y candidato"
            english="Participants: Interviewer and candidate"
            translation="Participantes: Entrevistador y candidato"
          />
          <Example 
            spanish="Objetivo: Evaluar habilidades y experiencia"
            english="Objective: Assess skills and experience"
            translation="Objetivo: Evaluar habilidades y experiencia"
          />
        </div>

        <Rule 
          title="Desafíos de las Long Conversations"
          description="Los principales desafíos incluyen:"
          examples={[
            "Mantener la concentración durante toda la duración",
            "Distinguir entre diferentes hablantes",
            "Seguir cambios de tema y transiciones",
            "Procesar múltiples tipos de información simultáneamente"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Las conversaciones largas requieren habilidades de escucha activa y gestión de información.
        </Tip>
      </TheorySection>

      <TheorySection title="Tipos de Long Conversations" icon="🗂️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las conversaciones largas pueden ser de diferentes tipos según su contexto y propósito.
        </p>

        <GrammarTable
          caption="Tipos de Long Conversations"
          headers={["Tipo", "Contexto", "Participantes", "Información Clave"]}
          rows={[
            ["Entrevista", "Trabajo, investigación, medios", "Entrevistador y entrevistado", "Experiencia, opiniones, planes"],
            ["Debate", "Política, sociedad, educación", "Múltiples participantes", "Argumentos, contraargumentos, opiniones"],
            ["Discusión", "Trabajo, estudio, personal", "2-4 personas", "Problemas, soluciones, decisiones"],
            ["Consulta", "Médica, legal, profesional", "Profesional y cliente", "Síntomas, consejos, recomendaciones"],
            ["Reunión", "Trabajo, comité, proyecto", "Equipo de trabajo", "Agenda, decisiones, acciones"],
            ["Conversación Social", "Amigos, familia, conocidos", "2-4 personas", "Eventos, planes, experiencias"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Entrevista: 'Entrevista de trabajo sobre experiencia previa'"
            english="Interview: 'Job interview about previous experience'"
            translation="Entrevista: 'Entrevista de trabajo sobre experiencia previa'"
          />
          <Example 
            spanish="Debate: 'Discusión sobre el cambio climático'"
            english="Debate: 'Discussion about climate change'"
            translation="Debate: 'Discusión sobre el cambio climático'"
          />
          <Example 
            spanish="Consulta: 'Consulta médica sobre síntomas'"
            english="Consultation: 'Medical consultation about symptoms'"
            translation="Consulta: 'Consulta médica sobre síntomas'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Identifica el tipo de conversación para anticipar el tipo de información y dinámicas.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias para Long Conversations" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las conversaciones largas requieren estrategias específicas para manejar la complejidad y duración.
        </p>

        <GrammarTable
          caption="Estrategias Específicas para Long Conversations"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Beneficio"]}
          rows={[
            ["Identificación de Hablantes", "Distinguir entre diferentes voces", "Al inicio de la conversación", "Seguir quién dice qué"],
            ["Seguimiento de Temas", "Identificar cambios de tema", "Durante toda la conversación", "Mantener orientación"],
            ["Toma de Notas Estructurada", "Organizar notas por hablante/tema", "Durante toda la conversación", "Retener información"],
            ["Identificación de Relaciones", "Entender dinámicas entre hablantes", "A lo largo de la conversación", "Comprensión profunda"],
            ["Gestión de Información", "Priorizar información relevante", "Durante toda la conversación", "Enfoque en lo importante"],
            ["Verificación Continua", "Confirmar comprensión durante la conversación", "En pausas naturales", "Mantener precisión"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Identificación: 'Entrevistador (voz grave) vs Candidato (voz aguda)'"
            english="Identification: 'Interviewer (deep voice) vs Candidate (high voice)'"
            translation="Identificación: 'Entrevistador (voz grave) vs Candidato (voz aguda)'"
          />
          <Example 
            spanish="Seguimiento: 'Ahora cambian de experiencia a planes futuros'"
            english="Tracking: 'Now they change from experience to future plans'"
            translation="Seguimiento: 'Ahora cambian de experiencia a planes futuros'"
          />
          <Example 
            spanish="Toma de notas: 'Candidato: 5 años experiencia, Entrevistador: pregunta sobre liderazgo'"
            english="Note-taking: 'Candidate: 5 years experience, Interviewer: asks about leadership'"
            translation="Toma de notas: 'Candidato: 5 años experiencia, Entrevistador: pregunta sobre liderazgo'"
          />
        </div>

        <Rule 
          title="Proceso Paso a Paso"
          description="Sigue este proceso para conversaciones largas:"
          examples={[
            "1. Identifica a los hablantes y sus roles",
            "2. Lee todas las preguntas para saber qué buscar",
            "3. Toma notas organizadas por hablante/tema",
            "4. Sigue los cambios de tema y transiciones",
            "5. Identifica las relaciones entre hablantes",
            "6. Verifica tu comprensión continuamente"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No te pierdas en detalles menores - mantén el enfoque en la información que necesitas.
        </Tip>
      </TheorySection>

      <TheorySection title="Identificación de Hablantes" icon="👥">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Distinguir entre diferentes hablantes es crucial para entender las conversaciones largas.
        </p>

        <GrammarTable
          caption="Estrategias para Identificar Hablantes"
          headers={["Característica", "Descripción", "Ejemplo", "Cómo Usar"]}
          rows={[
            ["Voz", "Tono, altura, características", "Voz grave vs aguda", "Distinguir por características vocales"],
            ["Rol", "Función en la conversación", "Entrevistador vs entrevistado", "Identificar por función"],
            ["Lenguaje", "Estilo, vocabulario, formalidad", "Formal vs informal", "Diferenciar por estilo"],
            ["Contenido", "Tipo de información que proporciona", "Preguntas vs respuestas", "Identificar por función"],
            ["Turnos", "Cuándo y cómo habla", "Inicia vs responde", "Seguir patrones de conversación"],
            ["Actitud", "Tono emocional, postura", "Amigable vs formal", "Identificar por actitud"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Voz: 'Entrevistador tiene voz grave y lenta'"
            english="Voice: 'Interviewer has deep and slow voice'"
            translation="Voz: 'Entrevistador tiene voz grave y lenta'"
          />
          <Example 
            spanish="Rol: 'Entrevistador hace preguntas, candidato responde'"
            english="Role: 'Interviewer asks questions, candidate answers'"
            translation="Rol: 'Entrevistador hace preguntas, candidato responde'"
          />
          <Example 
            spanish="Lenguaje: 'Entrevistador usa lenguaje formal'"
            english="Language: 'Interviewer uses formal language'"
            translation="Lenguaje: 'Entrevistador usa lenguaje formal'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Combina múltiples características para identificar hablantes de manera confiable.
        </Tip>
      </TheorySection>

      <TheorySection title="Seguimiento de Temas y Transiciones" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Seguir los cambios de tema y transiciones es esencial para mantener la orientación en conversaciones largas.
        </p>

        <GrammarTable
          caption="Tipos de Transiciones"
          headers={["Tipo", "Indicadores", "Ejemplo", "Función"]}
          rows={[
            ["Cambio de Tema", "Now, let's talk about...", "Now, let's talk about your experience", "Introducir nuevo tema"],
            ["Retorno", "Going back to...", "Going back to your previous job", "Volver a tema anterior"],
            ["Desarrollo", "Can you tell me more about...?", "Can you tell me more about that?", "Profundizar en tema"],
            ["Resumen", "So, to summarize...", "So, to summarize your experience", "Resumir información"],
            ["Clarificación", "What do you mean by...?", "What do you mean by leadership?", "Aclarar información"],
            ["Confirmación", "So you're saying that...", "So you're saying that you led a team?", "Confirmar comprensión"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Cambio de tema: 'Ahora, hablemos de tu experiencia'"
            english="Topic change: 'Now, let's talk about your experience'"
            translation="Cambio de tema: 'Ahora, hablemos de tu experiencia'"
          />
          <Example 
            spanish="Desarrollo: '¿Puedes contarme más sobre eso?'"
            english="Development: 'Can you tell me more about that?'"
            translation="Desarrollo: '¿Puedes contarme más sobre eso?'"
          />
          <Example 
            spanish="Clarificación: '¿Qué quieres decir con liderazgo?'"
            english="Clarification: 'What do you mean by leadership?'"
            translation="Clarificación: '¿Qué quieres decir con liderazgo?'"
          />
        </div>

        <Rule 
          title="Consejos para Seguir Transiciones"
          description="Para seguir transiciones efectivamente:"
          examples={[
            "Escucha palabras y frases de transición",
            "Identifica cuando cambia el tema",
            "Observa cambios en el tono y ritmo",
            "Usa el contexto para entender el propósito del cambio"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Las transiciones te ayudan a mantener la orientación en conversaciones largas.
        </Tip>
      </TheorySection>

      <TheorySection title="Toma de Notas para Conversaciones Largas" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La toma de notas estructurada es esencial para manejar la complejidad de las conversaciones largas.
        </p>

        <GrammarTable
          caption="Sistema de Toma de Notas para Conversaciones Largas"
          headers={["Elemento", "Descripción", "Ejemplo", "Beneficio"]}
          rows={[
            ["Identificación de Hablantes", "Marcar quién habla", "I: (Entrevistador), C: (Candidato)", "Seguir quién dice qué"],
            ["Temas Principales", "Marcar cambios de tema", "T1: Experiencia, T2: Habilidades", "Seguir estructura"],
            ["Información Clave", "Detalles importantes", "5 años experiencia, lideró equipo", "Retener datos específicos"],
            ["Opiniones y Actitudes", "Sentimientos y evaluaciones", "Entusiasmado, preocupado, seguro", "Entender dinámicas"],
            ["Preguntas y Respuestas", "Intercambio de información", "P: ¿Experiencia? R: 5 años", "Seguir flujo de conversación"],
            ["Transiciones", "Cambios y conexiones", "→ ahora habla de habilidades", "Mantener orientación"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Identificación: 'I: ¿Cuál es tu experiencia? C: Tengo 5 años'"
            english="Identification: 'I: What's your experience? C: I have 5 years'"
            translation="Identificación: 'I: ¿Cuál es tu experiencia? C: Tengo 5 años'"
          />
          <Example 
            spanish="Temas: 'T1: Experiencia → T2: Habilidades → T3: Planes'"
            english="Topics: 'T1: Experience → T2: Skills → T3: Plans'"
            translation="Temas: 'T1: Experiencia → T2: Habilidades → T3: Planes'"
          />
          <Example 
            spanish="Información clave: '5 años, lideró equipo de 10, Python, JavaScript'"
            english="Key info: '5 years, led team of 10, Python, JavaScript'"
            translation="Información clave: '5 años, lideró equipo de 10, Python, JavaScript'"
          />
        </div>

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No trates de escribir todo - enfócate en la información relevante para las preguntas.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> No identificar a los hablantes ❌<br/>
            <strong>Correcto:</strong> Identificar voces y roles desde el inicio ✅<br/>
            <em>Distinguir hablantes es crucial para conversaciones largas</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Perderse en cambios de tema ❌<br/>
            <strong>Correcto:</strong> Seguir transiciones y cambios ✅<br/>
            <em>Las transiciones te ayudan a mantener orientación</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No tomar notas estructuradas ❌<br/>
            <strong>Correcto:</strong> Organizar notas por hablante/tema ✅<br/>
            <em>La organización es clave para conversaciones complejas</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Perder la concentración ❌<br/>
            <strong>Correcto:</strong> Mantener enfoque activo ✅<br/>
            <em>La concentración sostenida es esencial</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Identificación temprana"
            description="Identifica a los hablantes desde el inicio."
            examples={[
              "Escucha las primeras palabras de cada hablante",
              "Identifica características vocales distintivas",
              "Observa roles y funciones en la conversación",
              "Mantén la identificación durante toda la conversación"
            ]}
          />

          <Rule 
            title="2. Seguimiento activo"
            description="Mantén el seguimiento activo de temas y transiciones."
            examples={[
              "Escucha palabras y frases de transición",
              "Identifica cambios de tema",
              "Observa cambios en tono y ritmo",
              "Usa contexto para entender el propósito"
            ]}
          />

          <Rule 
            title="3. Toma de notas estructurada"
            description="Organiza tus notas de manera lógica y útil."
            examples={[
              "Usa un sistema consistente de identificación",
              "Organiza por hablante y tema",
              "Enfócate en información relevante",
              "Mantén las notas claras y legibles"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="Las long conversations duran entre ___ (3-8 minutos/1-3 minutos). Tienen ___ (múltiples voces/una sola voz). Requieren ___ (identificación de hablantes/seguimiento de temas)."
      blanks={[
        { answer: "3-8 minutos" },
        { answer: "múltiples voces" },
        { answer: "identificación de hablantes" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la estrategia más importante para long conversations?"
      options={[
        "No tomar notas",
        "Identificar a los hablantes desde el inicio",
        "Escuchar solo al final",
        "Ignorar las transiciones"
      ]}
      correctAnswer={1}
      explanation="Identificar a los hablantes desde el inicio es crucial para long conversations, ya que te permite seguir quién dice qué durante toda la conversación."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Las long conversations requieren identificación de hablantes.",
          isTrue: true,
          explanation: "Correcto. Distinguir entre diferentes hablantes es esencial para entender quién dice qué en conversaciones largas."
        },
        {
          text: "Es mejor no tomar notas en long conversations para evitar distracciones.",
          isTrue: false,
          explanation: "Incorrecto. La toma de notas estructurada es esencial para manejar la complejidad y cantidad de información en conversaciones largas."
        },
        {
          text: "Seguir las transiciones ayuda a mantener la orientación en la conversación.",
          isTrue: true,
          explanation: "Correcto. Las transiciones indican cambios de tema y te ayudan a mantener la orientación en conversaciones largas."
        },
        {
          text: "Las long conversations son más fáciles que los monólogos porque hay más voces.",
          isTrue: false,
          explanation: "Incorrecto. Las long conversations pueden ser más complejas porque requieren distinguir entre hablantes y seguir múltiples líneas de conversación."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Qué indica una transición en una conversación?"
      options={[
        "Un cambio de hablante",
        "Un cambio de tema",
        "Un silencio",
        "Un error de pronunciación"
      ]}
      correctAnswer={1}
      explanation="Una transición indica un cambio de tema, no necesariamente un cambio de hablante. Las transiciones ayudan a seguir la estructura de la conversación."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es el sistema de toma de notas más efectivo para long conversations?"
      options={[
        "Escribir todo lo que se dice",
        "Organizar notas por hablante y tema",
        "No tomar notas",
        "Escribir solo al final"
      ]}
      correctAnswer={1}
      explanation="Organizar notas por hablante y tema es el sistema más efectivo, ya que te permite manejar la complejidad de múltiples voces y temas."
    />
  ];

  return (
    <TheoryLayout
      title="Long Conversations"
      description="Domina la comprensión de conversaciones largas en inglés. Aprende estrategias para seguir múltiples hablantes, cambios de tema y dinámicas complejas en diálogos extensos."
      level="B1-B2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Experience with short dialogues and monologues", "Basic note-taking skills"]}
      estimatedTime="80 min"
    />
  );
};

export default LongConversationsPage;



