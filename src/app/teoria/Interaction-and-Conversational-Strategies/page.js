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

const InteractionAndConversationalStrategiesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son Interaction and Conversational Strategies?" icon="🤝">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las <strong>interaction and conversational strategies</strong> (estrategias de interacción y conversación) son 
          técnicas específicas que te permiten participar efectivamente en conversaciones, mantener el flujo comunicativo y crear interacciones exitosas.
        </p>
        
        <QuickReference items={[
          "Técnicas para iniciar y mantener conversaciones",
          "Estrategias para manejar turnos de habla",
          "Técnicas para mostrar interés y participación",
          "Estrategias para manejar interrupciones y cambios de tema",
          "Herramientas para crear interacciones exitosas"
        ]} />
      </TheorySection>

      <TheorySection title="Iniciar Conversaciones" icon="🚀">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Iniciar conversaciones de manera efectiva es crucial para crear interacciones exitosas.
        </p>

        <GrammarTable
          caption="Estrategias para Iniciar Conversaciones"
          headers={["Estrategia", "Descripción", "Contexto", "Ejemplo"]}
          rows={[
            ["Saludo Directo", "Saludar directamente", "Situaciones formales", "Good morning, how are you?"],
            ["Comentario sobre Situación", "Comentar la situación actual", "Contexto compartido", "It's a beautiful day, isn't it?"],
            ["Pregunta Abierta", "Hacer pregunta que invite respuesta", "Conversación general", "What brings you here today?"],
            ["Observación Personal", "Compartir observación personal", "Contexto informal", "I love this place, don't you?"],
            ["Pregunta sobre Interés", "Preguntar sobre intereses", "Contexto social", "What do you do for fun?"],
            ["Comentario sobre Evento", "Comentar evento actual", "Contexto de evento", "Great presentation, wasn't it?"],
            ["Pregunta de Ayuda", "Pedir ayuda o información", "Contexto de necesidad", "Excuse me, could you help me?"],
            ["Comentario Positivo", "Hacer comentario positivo", "Contexto general", "I really like your presentation"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Saludo directo: 'Buenos días, ¿cómo estás?'"
            english="Direct greeting: 'Good morning, how are you?'"
            translation="Saludo directo: 'Buenos días, ¿cómo estás?'"
          />
          <Example 
            spanish="Comentario sobre situación: 'Es un día hermoso, ¿no?'"
            english="Situation comment: 'It's a beautiful day, isn't it?'"
            translation="Comentario sobre situación: 'Es un día hermoso, ¿no?'"
          />
          <Example 
            spanish="Pregunta abierta: '¿Qué te trae aquí hoy?'"
            english="Open question: 'What brings you here today?'"
            translation="Pregunta abierta: '¿Qué te trae aquí hoy?'"
          />
        </div>

        <Rule 
          title="Consejos para Iniciar Conversaciones"
          description="Para iniciar efectivamente:"
          examples={[
            "Elige estrategias apropiadas para el contexto",
            "Considera la relación con la persona",
            "Usa lenguaje apropiado para el nivel de formalidad",
            "Sé genuino y auténtico en tu enfoque"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Iniciar conversaciones de manera efectiva establece el tono para toda la interacción.
        </Tip>
      </TheorySection>

      <TheorySection title="Manejo de Turnos de Habla" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Manejar turnos de habla efectivamente es esencial para mantener conversaciones fluidas.
        </p>

        <GrammarTable
          caption="Estrategias para Manejo de Turnos"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Ejemplo"]}
          rows={[
            ["Tomar Turno", "Iniciar tu turno de habla", "Cuando quieres hablar", "Can I add something here?"],
            ["Ceder Turno", "Permitir que otros hablen", "Cuando terminas tu punto", "What do you think about this?"],
            ["Mantener Turno", "Continuar tu turno", "Cuando no has terminado", "Let me finish this point first"],
            ["Interrumpir Educadamente", "Interrumpir de manera educada", "Cuando necesitas intervenir", "Sorry to interrupt, but..."],
            ["Pedir Clarificación", "Pedir aclaración antes de responder", "Cuando no entiendes", "Could you clarify what you mean?"],
            ["Confirmar Comprensión", "Confirmar que entiendes", "Antes de responder", "So you're saying that..."],
            ["Dar Tiempo para Pensar", "Permitir tiempo para procesar", "Cuando la persona necesita tiempo", "Take your time, no rush"],
            ["Cambiar de Tema", "Cambiar de tema suavemente", "Cuando el tema se agota", "That reminds me of something else"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Tomar turno: '¿Puedo agregar algo aquí?'"
            english="Taking turn: 'Can I add something here?'"
            translation="Tomar turno: '¿Puedo agregar algo aquí?'"
          />
          <Example 
            spanish="Ceder turno: '¿Qué piensas sobre esto?'"
            english="Yielding turn: 'What do you think about this?'"
            translation="Ceder turno: '¿Qué piensas sobre esto?'"
          />
          <Example 
            spanish="Interrumpir educadamente: 'Disculpa interrumpir, pero...'"
            english="Polite interruption: 'Sorry to interrupt, but...'"
            translation="Interrumpir educadamente: 'Disculpa interrumpir, pero...'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> El manejo efectivo de turnos mantiene la conversación equilibrada y participativa.
        </Tip>
      </TheorySection>

      <TheorySection title="Mostrar Interés y Participación" icon="😊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Mostrar interés genuino y participación activa es crucial para mantener conversaciones exitosas.
        </p>

        <GrammarTable
          caption="Estrategias para Mostrar Interés"
          headers={["Estrategia", "Descripción", "Función", "Ejemplo"]}
          rows={[
            ["Respuestas de Escucha", "Mostrar que estás escuchando", "Confirmar atención", "Really? That's interesting!"],
            ["Preguntas de Seguimiento", "Hacer preguntas relacionadas", "Profundizar en el tema", "How did that make you feel?"],
            ["Comentarios de Apoyo", "Comentar de manera positiva", "Mostrar apoyo", "That sounds amazing!"],
            ["Expresiones de Empatía", "Mostrar comprensión emocional", "Conectar emocionalmente", "I can understand how you feel"],
            ["Compartir Experiencias", "Compartir experiencias similares", "Crear conexión", "That happened to me too"],
            ["Validar Opiniones", "Validar puntos de vista", "Mostrar respeto", "That's a valid point"],
            ["Expresar Curiosidad", "Mostrar curiosidad genuina", "Mantener interés", "Tell me more about that"],
            ["Reflexionar", "Reflexionar sobre lo dicho", "Mostrar comprensión", "So what you're saying is..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Respuesta de escucha: '¿En serio? ¡Eso es interesante!'"
            english="Listening response: 'Really? That's interesting!'"
            translation="Respuesta de escucha: '¿En serio? ¡Eso es interesante!'"
          />
          <Example 
            spanish="Pregunta de seguimiento: '¿Cómo te hizo sentir eso?'"
            english="Follow-up question: 'How did that make you feel?'"
            translation="Pregunta de seguimiento: '¿Cómo te hizo sentir eso?'"
          />
          <Example 
            spanish="Comentario de apoyo: '¡Eso suena increíble!'"
            english="Supportive comment: 'That sounds amazing!'"
            translation="Comentario de apoyo: '¡Eso suena increíble!'"
          />
        </div>

        <Rule 
          title="Consejos para Mostrar Interés"
          description="Para mostrar interés genuino:"
          examples={[
            "Escucha activamente sin distracciones",
            "Haz preguntas relevantes y genuinas",
            "Comparte experiencias cuando sea apropiado",
            "Mantén contacto visual y lenguaje corporal positivo"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No exageres el interés - sé genuino y auténtico en tu participación.
        </Tip>
      </TheorySection>

      <TheorySection title="Manejo de Interrupciones" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Manejar interrupciones de manera efectiva es importante para mantener el flujo de la conversación.
        </p>

        <GrammarTable
          caption="Estrategias para Manejar Interrupciones"
          headers={["Situación", "Estrategia", "Respuesta", "Ejemplo"]}
          rows={[
            ["Interrupción Legítima", "Reconocer y permitir", "Aceptar la interrupción", "You're right, let me hear your point"],
            ["Interrupción Inapropiada", "Mantener tu turno", "Continuar educadamente", "Let me finish this point first"],
            ["Interrupción por Clarificación", "Clarificar y continuar", "Responder y continuar", "Good question, let me explain"],
            ["Interrupción por Urgencia", "Manejar la urgencia", "Abordar la urgencia", "That's important, let's address it"],
            ["Interrupción por Desacuerdo", "Manejar el desacuerdo", "Reconocer y continuar", "I understand your concern, but..."],
            ["Interrupción por Distracción", "Redirigir la atención", "Volver al tema", "That's interesting, but let's focus on..."],
            ["Interrupción por Cambio de Tema", "Manejar el cambio", "Decidir si cambiar", "That's a good point, but first..."],
            ["Interrupción por Tiempo", "Manejar limitaciones de tiempo", "Resumir y continuar", "We're running out of time, so..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Interrupción legítima: 'Tienes razón, déjame escuchar tu punto'"
            english="Legitimate interruption: 'You're right, let me hear your point'"
            translation="Interrupción legítima: 'Tienes razón, déjame escuchar tu punto'"
          />
          <Example 
            spanish="Interrupción inapropiada: 'Déjame terminar este punto primero'"
            english="Inappropriate interruption: 'Let me finish this point first'"
            translation="Interrupción inapropiada: 'Déjame terminar este punto primero'"
          />
          <Example 
            spanish="Interrupción por clarificación: 'Buena pregunta, déjame explicar'"
            english="Clarification interruption: 'Good question, let me explain'"
            translation="Interrupción por clarificación: 'Buena pregunta, déjame explicar'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Manejar interrupciones efectivamente mantiene el control y el respeto en la conversación.
        </Tip>
      </TheorySection>

      <TheorySection title="Cambio de Tema" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Cambiar de tema de manera natural y educada es una habilidad importante en conversaciones.
        </p>

        <GrammarTable
          caption="Estrategias para Cambio de Tema"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Ejemplo"]}
          rows={[
            ["Transición Suave", "Cambiar gradualmente", "Cuando el tema se agota", "That reminds me of something else"],
            ["Transición Directa", "Cambiar directamente", "Cuando necesitas cambiar", "Let's talk about something else"],
            ["Transición por Conexión", "Conectar temas", "Cuando hay relación", "Speaking of that, what about...?"],
            ["Transición por Pregunta", "Cambiar con pregunta", "Cuando quieres involucrar", "What do you think about...?"],
            ["Transición por Comentario", "Cambiar con comentario", "Cuando quieres compartir", "That's interesting, but I also want to mention"],
            ["Transición por Tiempo", "Cambiar por tiempo", "Cuando hay limitaciones", "We're running out of time, so let's discuss"],
            ["Transición por Prioridad", "Cambiar por importancia", "Cuando hay urgencia", "That's important, but first let's address"],
            ["Transición por Consenso", "Cambiar con acuerdo", "Cuando hay consenso", "We agree on that, so now let's talk about"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Transición suave: 'Eso me recuerda algo más'"
            english="Smooth transition: 'That reminds me of something else'"
            translation="Transición suave: 'Eso me recuerda algo más'"
          />
          <Example 
            spanish="Transición por conexión: 'Hablando de eso, ¿qué tal...?'"
            english="Connection transition: 'Speaking of that, what about...?'"
            translation="Transición por conexión: 'Hablando de eso, ¿qué tal...?'"
          />
          <Example 
            spanish="Transición por pregunta: '¿Qué piensas sobre...?'"
            english="Question transition: 'What do you think about...?'"
            translation="Transición por pregunta: '¿Qué piensas sobre...?'"
          />
        </div>

        <Rule 
          title="Consejos para Cambio de Tema"
          description="Para cambiar de tema efectivamente:"
          examples={[
            "Usa transiciones apropiadas para el contexto",
            "Asegúrate de que el cambio sea relevante",
            "Considera si es el momento apropiado",
            "Mantén el interés y la participación"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Los cambios de tema efectivos mantienen la conversación interesante y dinámica.
        </Tip>
      </TheorySection>

      <TheorySection title="Manejo de Conflictos" icon="⚔️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Manejar conflictos de manera constructiva es crucial para mantener conversaciones productivas.
        </p>

        <GrammarTable
          caption="Estrategias para Manejo de Conflictos"
          headers={["Situación", "Estrategia", "Enfoque", "Ejemplo"]}
          rows={[
            ["Desacuerdo Menor", "Reconocer y continuar", "Mantener respeto", "I see your point, but I think differently"],
            ["Desacuerdo Mayor", "Abordar directamente", "Buscar entendimiento", "I understand your concern, let's discuss this"],
            ["Malentendido", "Clarificar y explicar", "Resolver confusión", "I think there might be a misunderstanding"],
            ["Conflicto de Opiniones", "Validar y explorar", "Buscar consenso", "Both viewpoints have merit, let's explore"],
            ["Conflicto de Intereses", "Reconocer y negociar", "Buscar solución", "I understand your needs, let's find a solution"],
            ["Conflicto Emocional", "Manejar emociones", "Reducir tensión", "I can see this is important to you"],
            ["Conflicto por Tiempo", "Manejar limitaciones", "Priorizar y organizar", "We have limited time, let's focus on priorities"],
            ["Conflicto por Autoridad", "Reconocer jerarquía", "Mantener respeto", "I respect your position, but I'd like to suggest"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Desacuerdo menor: 'Veo tu punto, pero pienso diferente'"
            english="Minor disagreement: 'I see your point, but I think differently'"
            translation="Desacuerdo menor: 'Veo tu punto, pero pienso diferente'"
          />
          <Example 
            spanish="Malentendido: 'Creo que puede haber un malentendido'"
            english="Misunderstanding: 'I think there might be a misunderstanding'"
            translation="Malentendido: 'Creo que puede haber un malentendido'"
          />
          <Example 
            spanish="Conflicto emocional: 'Puedo ver que esto es importante para ti'"
            english="Emotional conflict: 'I can see this is important to you'"
            translation="Conflicto emocional: 'Puedo ver que esto es importante para ti'"
          />
        </div>

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Los conflictos mal manejados pueden dañar las relaciones - enfócate en soluciones constructivas.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> No mostrar interés en la conversación ❌<br/>
            <strong>Correcto:</strong> Participar activamente y mostrar interés genuino ✅<br/>
            <em>La participación activa mantiene la conversación viva</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Interrumpir constantemente ❌<br/>
            <strong>Correcto:</strong> Manejar turnos de manera equilibrada ✅<br/>
            <em>El equilibrio en turnos mantiene la conversación fluida</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Cambiar de tema abruptamente ❌<br/>
            <strong>Correcto:</strong> Usar transiciones apropiadas ✅<br/>
            <em>Las transiciones suaves mantienen la coherencia</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No manejar conflictos constructivamente ❌<br/>
            <strong>Correcto:</strong> Abordar conflictos con respeto ✅<br/>
            <em>El manejo constructivo de conflictos mantiene relaciones</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Participación equilibrada"
            description="Mantén un equilibrio en la participación."
            examples={[
              "Escucha tanto como hablas",
              "Maneja turnos de manera justa",
              "Muestra interés genuino en otros",
              "Permite que todos participen"
            ]}
          />

          <Rule 
            title="2. Respeto y consideración"
            description="Mantén respeto y consideración en todas las interacciones."
            examples={[
              "Escucha sin interrumpir inapropiadamente",
              "Maneja conflictos con respeto",
              "Considera los sentimientos de otros",
              "Mantén un tono positivo y constructivo"
            ]}
          />

          <Rule 
            title="3. Flexibilidad y adaptación"
            description="Sé flexible y adapta tu estilo según la situación."
            examples={[
              "Adapta tu estilo al contexto",
              "Ajusta según la personalidad de otros",
              "Maneja diferentes tipos de interacciones",
              "Sé flexible en tu enfoque"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Qué te permiten las estrategias de interacción?"
      options={[
        "Evitar conversaciones",
        "Participar efectivamente",
        "Hablar más rápido",
        "Interrumpir constantemente"
      ]}
      correctAnswer={1}
      explanation="Las estrategias de interacción te permiten participar efectivamente en conversaciones, manteniendo un flujo natural y productivo."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es el beneficio principal de las estrategias de interacción?"
      options={[
        "Mejorar la pronunciación",
        "Participar efectivamente en conversaciones",
        "Aumentar la velocidad de habla",
        "Reducir el vocabulario necesario"
      ]}
      correctAnswer={1}
      explanation="El beneficio principal es participar efectivamente en conversaciones, ya que estas estrategias te permiten manejar turnos, mostrar interés y mantener interacciones exitosas."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Mostrar interés genuino es importante para mantener conversaciones exitosas.",
          isTrue: true,
          explanation: "Correcto. Mostrar interés genuino a través de respuestas de escucha, preguntas de seguimiento y comentarios de apoyo mantiene la conversación viva y participativa."
        },
        {
          text: "Es mejor interrumpir constantemente para mantener el control de la conversación.",
          isTrue: false,
          explanation: "Incorrecto. Interrumpir constantemente es contraproducente. Es mejor manejar turnos de manera equilibrada y respetuosa."
        },
        {
          text: "Las transiciones suaves son mejores que los cambios abruptos de tema.",
          isTrue: true,
          explanation: "Correcto. Las transiciones suaves mantienen la coherencia y fluidez de la conversación, mientras que los cambios abruptos pueden ser desconcertantes."
        },
        {
          text: "Los conflictos siempre deben evitarse en las conversaciones.",
          isTrue: false,
          explanation: "Incorrecto. Los conflictos son normales y pueden manejarse constructivamente. Lo importante es abordarlos con respeto y buscar soluciones."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la mejor estrategia para manejar una interrupción inapropiada?"
      options={[
        "Interrumpir de vuelta",
        "Mantener tu turno educadamente",
        "Ignorar la interrupción",
        "Terminar la conversación"
      ]}
      correctAnswer={1}
      explanation="Mantener tu turno educadamente es la mejor estrategia, ya que te permite continuar tu punto mientras mantienes el respeto y la cortesía."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué estrategia es más efectiva para mostrar interés en una conversación?"
      options={[
        "Hablar más que la otra persona",
        "Hacer preguntas de seguimiento relevantes",
        "Cambiar de tema frecuentemente",
        "Interrumpir con tus propias historias"
      ]}
      correctAnswer={1}
      explanation="Hacer preguntas de seguimiento relevantes es la estrategia más efectiva, ya que demuestra que estás escuchando activamente y quieres profundizar en el tema."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Active listening involves only hearing the words someone says.",
          isTrue: false,
          explanation: "Incorrecto. La escucha activa incluye entender el mensaje, las emociones y responder apropiadamente."
        },
        {
          text: "Turn-taking is important for smooth conversations.",
          isTrue: true,
          explanation: "Correcto. El manejo de turnos permite que todos participen y mantiene el flujo natural de la conversación."
        },
        {
          text: "You should avoid asking clarifying questions during conversations.",
          isTrue: false,
          explanation: "Incorrecto. Las preguntas de clarificación muestran interés y ayudan a entender mejor."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'I see what you mean, _____ I think there's another perspective.'"
      options={[
        "and",
        "but",
        "so",
        "because"
      ]}
      correctAnswer={1}
      explanation="'But' introduce una perspectiva diferente de manera educada después de reconocer el punto de vista del otro."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Cuál es la mejor manera de manejar un desacuerdo en conversación?"
      options={[
        "Evitar el tema completamente",
        "Reconocer el punto de vista y expresar el tuyo respetuosamente",
        "Insistir hasta que la otra persona cambie de opinión",
        "Cambiar de tema inmediatamente"
      ]}
      correctAnswer={1}
      explanation="Reconocer el punto de vista del otro y expresar el tuyo respetuosamente mantiene la conversación constructiva."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Interrupting is always rude in conversations.",
          isTrue: false,
          explanation: "Incorrecto. Interrupciones cooperativas (para mostrar entendimiento o hacer preguntas relevantes) pueden ser apropiadas."
        },
        {
          text: "Body language is important in face-to-face interactions.",
          isTrue: true,
          explanation: "Correcto. El lenguaje corporal comunica interés, atención y actitudes, siendo crucial en interacciones cara a cara."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'Could you _____ on that point? I'd like to understand better.'"
      options={[
        "expand",
        "reduce",
        "avoid",
        "skip"
      ]}
      correctAnswer={0}
      explanation="'Expand' es apropiado para pedir más información o clarificación sobre un punto específico."
    />
  ];

  return (
    <TheoryLayout
      title="Interaction and Conversational Strategies"
      description="Domina las estrategias de interacción y conversación en inglés. Aprende técnicas para iniciar conversaciones, manejar turnos, mostrar interés, manejar interrupciones y conflictos."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic speaking skills", "Understanding of conversation dynamics"]}
      estimatedTime="85 min"
    />
  );
};

export default InteractionAndConversationalStrategiesPage;





















