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

const MultiSpeakerDialoguesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Multi-speaker Dialogues?" icon="👥">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>multi-speaker dialogues</strong> (diálogos multi-hablante) son conversaciones entre tres o más personas 
          que aparecen en exámenes de listening avanzados. Requieren habilidades sofisticadas de comprensión y seguimiento.
        </p>
        
        <QuickReference items={[
          "Participantes: 3 o más personas",
          "Duración: 4-10 minutos",
          "Contextos: debates, reuniones, discusiones grupales",
          "Objetivo: información compleja y relaciones",
          "Nivel: B2-C1-C2 (intermedio-alto a avanzado)"
        ]} />
      </TheorySection>

      <TheorySection title="Características de los Multi-speaker Dialogues" icon="📋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los diálogos multi-hablante tienen características únicas que los hacen particularmente desafiantes.
        </p>

        <GrammarTable
          caption="Características de Multi-speaker Dialogues"
          headers={["Característica", "Descripción", "Desafío", "Estrategia"]}
          rows={[
            ["Múltiples Voces", "3+ personas hablando", "Distinguir entre todas las voces", "Identificación sistemática"],
            ["Interacciones Complejas", "Múltiples líneas de conversación", "Seguir todas las interacciones", "Mapeo de relaciones"],
            ["Interrupciones", "Habla superpuesta frecuente", "Entender contexto con interrupciones", "Usar contexto para inferir"],
            ["Cambios Rápidos", "Cambios frecuentes de hablante", "Seguir cambios rápidos", "Anticipación y preparación"],
            ["Información Fragmentada", "Información distribuida entre hablantes", "Integrar información de múltiples fuentes", "Síntesis de información"],
            ["Dinámicas Grupales", "Relaciones y jerarquías complejas", "Entender dinámicas sociales", "Observación de patrones"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Contexto: Reunión de equipo con 4 personas"
            english="Context: Team meeting with 4 people"
            translation="Contexto: Reunión de equipo con 4 personas"
          />
          <Example 
            spanish="Participantes: Manager, Designer, Developer, Analyst"
            english="Participants: Manager, Designer, Developer, Analyst"
            translation="Participantes: Manager, Designer, Developer, Analyst"
          />
          <Example 
            spanish="Desafío: Seguir múltiples líneas de conversación"
            english="Challenge: Follow multiple conversation lines"
            translation="Desafío: Seguir múltiples líneas de conversación"
          />
        </div>

        <Rule 
          title="Desafíos Únicos de Multi-speaker Dialogues"
          description="Los desafíos específicos incluyen:"
          examples={[
            "Distinguir entre múltiples voces simultáneamente",
            "Seguir múltiples líneas de conversación",
            "Manejar interrupciones y habla superpuesta",
            "Integrar información de múltiples fuentes",
            "Entender dinámicas grupales complejas"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Los diálogos multi-hablante requieren habilidades de procesamiento paralelo y síntesis.
        </Tip>
      </TheorySection>

      <TheorySection title="Tipos de Multi-speaker Dialogues" icon="🗂️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los diálogos multi-hablante pueden ser de diferentes tipos según su contexto y propósito.
        </p>

        <GrammarTable
          caption="Tipos de Multi-speaker Dialogues"
          headers={["Tipo", "Contexto", "Participantes", "Información Clave"]}
          rows={[
            ["Reunión de Trabajo", "Empresa, proyecto, equipo", "Manager, team members", "Decisiones, tareas, plazos"],
            ["Debate Académico", "Universidad, conferencia", "Profesores, estudiantes", "Argumentos, evidencia, conclusiones"],
            ["Panel de Discusión", "Medios, conferencia", "Expertos, moderador", "Opiniones, análisis, perspectivas"],
            ["Consulta Médica", "Hospital, clínica", "Doctor, paciente, familia", "Síntomas, diagnóstico, tratamiento"],
            ["Negociación", "Empresa, contrato", "Partes negociadoras", "Términos, condiciones, acuerdos"],
            ["Discusión Social", "Grupo de amigos", "Múltiples amigos", "Eventos, planes, experiencias"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Reunión: 'Reunión de proyecto con manager y 3 desarrolladores'"
            english="Meeting: 'Project meeting with manager and 3 developers'"
            translation="Reunión: 'Reunión de proyecto con manager y 3 desarrolladores'"
          />
          <Example 
            spanish="Debate: 'Debate académico sobre cambio climático'"
            english="Debate: 'Academic debate about climate change'"
            translation="Debate: 'Debate académico sobre cambio climático'"
          />
          <Example 
            spanish="Panel: 'Panel de expertos en tecnología'"
            english="Panel: 'Panel of technology experts'"
            translation="Panel: 'Panel de expertos en tecnología'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Identifica el tipo de diálogo para anticipar roles, dinámicas y tipo de información.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias para Multi-speaker Dialogues" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los diálogos multi-hablante requieren estrategias especializadas para manejar la complejidad.
        </p>

        <GrammarTable
          caption="Estrategias Especializadas para Multi-speaker Dialogues"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Beneficio"]}
          rows={[
            ["Mapeo de Voces", "Crear mapa mental de voces y roles", "Al inicio del diálogo", "Identificación sistemática"],
            ["Seguimiento de Turnos", "Seguir quién habla cuándo", "Durante toda la conversación", "Mantener orientación"],
            ["Identificación de Patrones", "Reconocer patrones de interacción", "A lo largo del diálogo", "Anticipar comportamiento"],
            ["Síntesis de Información", "Integrar información de múltiples fuentes", "Durante y después", "Comprensión completa"],
            ["Gestión de Interrupciones", "Manejar habla superpuesta", "Cuando ocurren interrupciones", "Mantener comprensión"],
            ["Análisis de Dinámicas", "Entender relaciones y jerarquías", "A lo largo del diálogo", "Comprensión profunda"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Mapeo: 'Manager (voz grave), Designer (voz femenina), Developer (voz joven)'"
            english="Mapping: 'Manager (deep voice), Designer (female voice), Developer (young voice)'"
            translation="Mapeo: 'Manager (voz grave), Designer (voz femenina), Developer (voz joven)'"
          />
          <Example 
            spanish="Seguimiento: 'Manager pregunta → Designer responde → Developer interrumpe'"
            english="Tracking: 'Manager asks → Designer responds → Developer interrupts'"
            translation="Seguimiento: 'Manager pregunta → Designer responde → Developer interrumpe'"
          />
          <Example 
            spanish="Síntesis: 'Manager quiere X, Designer prefiere Y, Developer sugiere Z'"
            english="Synthesis: 'Manager wants X, Designer prefers Y, Developer suggests Z'"
            translation="Síntesis: 'Manager quiere X, Designer prefiere Y, Developer sugiere Z'"
          />
        </div>

        <Rule 
          title="Proceso Paso a Paso"
          description="Sigue este proceso para diálogos multi-hablante:"
          examples={[
            "1. Identifica y mapea todas las voces",
            "2. Asigna roles y funciones a cada hablante",
            "3. Lee todas las preguntas para saber qué buscar",
            "4. Sigue los turnos y patrones de interacción",
            "5. Sintetiza información de múltiples fuentes",
            "6. Analiza dinámicas y relaciones entre hablantes"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No trates de seguir todo simultáneamente - prioriza la información relevante.
        </Tip>
      </TheorySection>

      <TheorySection title="Identificación y Mapeo de Voces" icon="🗺️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La identificación sistemática de voces es crucial para navegar diálogos multi-hablante.
        </p>

        <GrammarTable
          caption="Sistema de Identificación de Voces"
          headers={["Característica", "Descripción", "Ejemplo", "Cómo Usar"]}
          rows={[
            ["Características Vocales", "Tono, altura, timbre", "Voz grave vs aguda", "Distinguir por características físicas"],
            ["Estilo de Habla", "Velocidad, ritmo, pausas", "Habla rápida vs lenta", "Identificar por patrones de habla"],
            ["Vocabulario", "Nivel, jerga, formalidad", "Técnico vs coloquial", "Diferenciar por uso del lenguaje"],
            ["Rol Funcional", "Función en la conversación", "Moderador vs participante", "Identificar por función"],
            ["Patrones de Interacción", "Cuándo y cómo habla", "Inicia vs responde", "Seguir patrones de comportamiento"],
            ["Actitud y Tono", "Postura emocional", "Agresivo vs colaborativo", "Identificar por actitud"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Características: 'Manager: voz grave y lenta, Designer: voz femenina y rápida'"
            english="Characteristics: 'Manager: deep and slow voice, Designer: female and fast voice'"
            translation="Características: 'Manager: voz grave y lenta, Designer: voz femenina y rápida'"
          />
          <Example 
            spanish="Rol: 'Manager: dirige, Designer: propone, Developer: cuestiona'"
            english="Role: 'Manager: directs, Designer: proposes, Developer: questions'"
            translation="Rol: 'Manager: dirige, Designer: propone, Developer: cuestiona'"
          />
          <Example 
            spanish="Patrón: 'Manager inicia, Designer desarrolla, Developer interrumpe'"
            english="Pattern: 'Manager initiates, Designer develops, Developer interrupts'"
            translation="Patrón: 'Manager inicia, Designer desarrolla, Developer interrumpe'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Combina múltiples características para crear un perfil único de cada hablante.
        </Tip>
      </TheorySection>

      <TheorySection title="Manejo de Interrupciones y Habla Superpuesta" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las interrupciones y habla superpuesta son comunes en diálogos multi-hablante y requieren estrategias específicas.
        </p>

        <GrammarTable
          caption="Estrategias para Manejar Interrupciones"
          headers={["Situación", "Estrategia", "Ejemplo", "Resultado"]}
          rows={[
            ["Habla Superpuesta", "Usar contexto para inferir", "Dos personas hablan simultáneamente", "Entender mensaje general"],
            ["Interrupción Abrupta", "Identificar punto de interrupción", "Una persona interrumpe a otra", "Seguir cambio de hablante"],
            ["Interrupción Gradual", "Observar transición", "Una persona gradualmente toma el turno", "Seguir cambio natural"],
            ["Interrupción con Permiso", "Reconocer petición de turno", "¿Puedo decir algo?", "Anticipar cambio de hablante"],
            ["Retorno al Tema", "Identificar retorno", "Volviendo a lo que decía...", "Seguir desarrollo del tema"],
            ["Clarificación", "Usar contexto para entender", "¿Qué quieres decir?", "Entender intención"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Habla superpuesta: 'Dos personas hablan al mismo tiempo'"
            english="Overlapping speech: 'Two people speak at the same time'"
            translation="Habla superpuesta: 'Dos personas hablan al mismo tiempo'"
          />
          <Example 
            spanish="Interrupción: 'Manager interrumpe a Designer'"
            english="Interruption: 'Manager interrupts Designer'"
            translation="Interrupción: 'Manager interrumpe a Designer'"
          />
          <Example 
            spanish="Retorno: 'Volviendo a lo que decía el Designer...'"
            english="Return: 'Going back to what Designer was saying...'"
            translation="Retorno: 'Volviendo a lo que decía el Designer...'"
          />
        </div>

        <Rule 
          title="Consejos para Manejar Interrupciones"
          description="Para manejar interrupciones efectivamente:"
          examples={[
            "No te preocupes por entender cada palabra",
            "Usa el contexto para inferir el significado",
            "Identifica quién está hablando en cada momento",
            "Observa patrones de interrupción y retorno",
            "Mantén el enfoque en la información relevante"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Las interrupciones son normales en conversaciones grupales - no te desanimes.
        </Tip>
      </TheorySection>

      <TheorySection title="Síntesis de Información Multi-fuente" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La síntesis de información de múltiples fuentes es una habilidad clave para diálogos multi-hablante.
        </p>

        <GrammarTable
          caption="Técnicas de Síntesis Multi-fuente"
          headers={["Técnica", "Descripción", "Ejemplo", "Beneficio"]}
          rows={[
            ["Integración por Tema", "Combinar información por tema", "Tema: Presupuesto - Manager: $100k, Designer: $80k", "Visión completa del tema"],
            ["Comparación de Opiniones", "Comparar diferentes perspectivas", "Manager: positivo, Designer: cauteloso, Developer: negativo", "Entender diferentes puntos de vista"],
            ["Secuencia Temporal", "Seguir desarrollo temporal", "Primero Manager propone, luego Designer desarrolla", "Entender evolución del tema"],
            ["Jerarquía de Información", "Priorizar por importancia", "Manager: decisión final, Designer: propuesta, Developer: detalle", "Entender importancia relativa"],
            ["Consenso y Disenso", "Identificar acuerdos y desacuerdos", "Manager y Designer acuerdan, Developer disiente", "Entender dinámicas grupales"],
            ["Información Complementaria", "Combinar información que se complementa", "Manager: objetivo, Designer: método, Developer: recursos", "Visión integral"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Integración: 'Presupuesto: Manager $100k, Designer $80k, Developer $120k'"
            english="Integration: 'Budget: Manager $100k, Designer $80k, Developer $120k'"
            translation="Integración: 'Presupuesto: Manager $100k, Designer $80k, Developer $120k'"
          />
          <Example 
            spanish="Comparación: 'Manager: optimista, Designer: realista, Developer: pesimista'"
            english="Comparison: 'Manager: optimistic, Designer: realistic, Developer: pessimistic'"
            translation="Comparación: 'Manager: optimista, Designer: realista, Developer: pesimista'"
          />
          <Example 
            spanish="Consenso: 'Manager y Designer acuerdan, Developer tiene reservas'"
            english="Consensus: 'Manager and Designer agree, Developer has reservations'"
            translation="Consenso: 'Manager y Designer acuerdan, Developer tiene reservas'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> La síntesis te permite entender la imagen completa más allá de las contribuciones individuales.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> No identificar voces sistemáticamente ❌<br/>
            <strong>Correcto:</strong> Crear mapa mental de voces desde el inicio ✅<br/>
            <em>La identificación sistemática es crucial para múltiples hablantes</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Intentar seguir todo simultáneamente ❌<br/>
            <strong>Correcto:</strong> Priorizar información relevante ✅<br/>
            <em>Enfócate en lo que necesitas para responder las preguntas</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Perderse en interrupciones ❌<br/>
            <strong>Correcto:</strong> Usar contexto para mantener comprensión ✅<br/>
            <em>Las interrupciones son normales - usa contexto para seguir</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No sintetizar información ❌<br/>
            <strong>Correcto:</strong> Integrar información de múltiples fuentes ✅<br/>
            <em>La síntesis es clave para entender la imagen completa</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Identificación sistemática"
            description="Identifica y mapea todas las voces desde el inicio."
            examples={[
              "Escucha las primeras palabras de cada hablante",
              "Identifica características vocales distintivas",
              "Asigna roles y funciones",
              "Mantén el mapeo durante toda la conversación"
            ]}
          />

          <Rule 
            title="2. Seguimiento de patrones"
            description="Observa y sigue patrones de interacción."
            examples={[
              "Identifica quién habla cuándo",
              "Observa patrones de interrupción",
              "Sigue cambios de tema y retornos",
              "Reconoce dinámicas grupales"
            ]}
          />

          <Rule 
            title="3. Síntesis activa"
            description="Integra información de múltiples fuentes."
            examples={[
              "Combina información por tema",
              "Compara diferentes perspectivas",
              "Identifica consensos y disensos",
              "Crea una visión integral del tema"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="Los multi-speaker dialogues tienen ___ (3 o más/2) participantes. Requieren ___ (identificación sistemática/seguimiento simple) de voces. La ___ (síntesis/interrupción) de información es clave."
      blanks={[
        { answer: "3 o más" },
        { answer: "identificación sistemática" },
        { answer: "síntesis" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la estrategia más importante para multi-speaker dialogues?"
      options={[
        "No tomar notas",
        "Crear mapa mental de voces desde el inicio",
        "Escuchar solo al final",
        "Ignorar las interrupciones"
      ]}
      correctAnswer={1}
      explanation="Crear un mapa mental de voces desde el inicio es crucial para multi-speaker dialogues, ya que te permite distinguir entre múltiples hablantes sistemáticamente."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Los multi-speaker dialogues requieren identificación sistemática de voces.",
          isTrue: true,
          explanation: "Correcto. Distinguir entre múltiples hablantes requiere un sistema de identificación que combines múltiples características vocales y de comportamiento."
        },
        {
          text: "Es mejor intentar seguir todo simultáneamente en multi-speaker dialogues.",
          isTrue: false,
          explanation: "Incorrecto. Es mejor priorizar la información relevante y usar estrategias de síntesis para manejar la complejidad."
        },
        {
          text: "Las interrupciones son normales en multi-speaker dialogues.",
          isTrue: true,
          explanation: "Correcto. Las interrupciones y habla superpuesta son comunes en conversaciones grupales y requieren estrategias específicas para manejarlas."
        },
        {
          text: "La síntesis de información no es importante en multi-speaker dialogues.",
          isTrue: false,
          explanation: "Incorrecto. La síntesis de información de múltiples fuentes es crucial para entender la imagen completa en diálogos multi-hablante."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Qué característica es más importante para identificar hablantes en multi-speaker dialogues?"
      options={[
        "Solo el tono de voz",
        "Solo el vocabulario",
        "Combinación de múltiples características",
        "Solo el rol en la conversación"
      ]}
      correctAnswer={2}
      explanation="Combinar múltiples características (voz, vocabulario, rol, patrones de comportamiento) es la mejor manera de identificar hablantes de manera confiable."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la mejor estrategia para manejar interrupciones en multi-speaker dialogues?"
      options={[
        "Ignorar las interrupciones",
        "Usar contexto para mantener comprensión",
        "Solo escuchar al hablante principal",
        "Tomar notas de todo lo que se dice"
      ]}
      correctAnswer={1}
      explanation="Usar contexto para mantener comprensión es la mejor estrategia, ya que las interrupciones son normales y el contexto te ayuda a seguir el hilo de la conversación."
    />
  ];

  return (
    <TheoryLayout
      title="Multi-speaker Dialogues"
      description="Domina la comprensión de diálogos multi-hablante en inglés. Aprende estrategias para manejar múltiples voces, interrupciones y síntesis de información compleja."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Experience with long conversations", "Advanced listening skills"]}
      estimatedTime="85 min"
    />
  );
};

export default MultiSpeakerDialoguesPage;



