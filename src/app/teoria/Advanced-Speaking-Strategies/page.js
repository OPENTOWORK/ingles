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

const AdvancedSpeakingPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="Estrategias Avanzadas de Speaking" icon="🎤">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las <strong>estrategias avanzadas de speaking</strong> van más allá del vocabulario y la gramática. 
          Incluyen técnicas de fluidez, manejo de pausas, estructuración del discurso y adaptación al 
          contexto para comunicarse con naturalidad y sofisticación.
        </p>
        
        <QuickReference items={[
          "Fluidez: técnicas para hablar sin interrupciones",
          "Fillers y conectores naturales",
          "Estructuración clara del discurso",
          "Adaptación al registro y contexto",
          "Estrategias para ganar tiempo"
        ]} />
      </TheorySection>

      <TheorySection title="Técnicas de Fluidez" icon="🌊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La fluidez no significa hablar rápido, sino mantener el flujo natural del discurso sin pausas largas o vacilaciones.
        </p>

        <Rule 
          title="Estrategias para mantener fluidez"
          description="Técnicas para hablar de manera continua y natural:"
          examples={[
            "Usa fillers apropiados: 'Well', 'You know', 'Actually'",
            "Parafrasea cuando no encuentres la palabra exacta",
            "Usa aproximaciones: 'kind of', 'sort of', 'something like'",
            "Conecta ideas con linking words naturales",
            "Practica chunking (grupos de palabras como unidades)"
          ]}
        />

        <GrammarTable
          caption="Fillers por Registro"
          headers={["Contexto", "Fillers Apropiados", "Ejemplo de Uso"]}
          rows={[
            ["Informal", "Um, er, like, you know, I mean", "'Like, I was thinking, you know, maybe we could...'"],
            ["Neutral", "Well, actually, basically, obviously", "'Well, actually, that's a good point'"],
            ["Formal", "Let me think, I would say, In fact", "'Let me think about that for a moment'"],
            ["Académico", "Indeed, Furthermore, As I was saying", "'Indeed, this raises an interesting question'"],
            ["Presentaciones", "Now, Moving on, As you can see", "'Now, let's consider the implications'"]
          ]}
        />

        <Tip type="success">
          <strong>Práctica:</strong> Grábate hablando durante 2 minutos sobre cualquier tema. 
          Cuenta las pausas largas (>3 segundos) y trabaja en reducirlas.
        </Tip>
      </TheorySection>

      <TheorySection title="Estructuración del Discurso" icon="🏗️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Un discurso bien estructurado es más fácil de seguir y demuestra pensamiento organizado.
        </p>

        <GrammarTable
          caption="Frases para Estructurar el Discurso"
          headers={["Función", "Frases Útiles", "Contexto"]}
          rows={[
            ["Introducir tema", "I'd like to talk about..., Let me start by saying...", "Inicio de respuesta"],
            ["Añadir puntos", "Another point is..., What's more..., On top of that...", "Desarrollo"],
            ["Dar ejemplos", "For instance..., Take... for example, A case in point is...", "Apoyo con evidencia"],
            ["Contrastar", "On the other hand..., Having said that..., Then again...", "Mostrar diferentes perspectivas"],
            ["Concluir", "To sum up..., All in all..., At the end of the day...", "Cierre de respuesta"],
            ["Cambiar tema", "Moving on to..., That brings me to..., Speaking of...", "Transiciones"]
          ]}
        />

        <Example 
          spanish="Estructura para hablar sobre ventajas y desventajas:"
          english="'Well, there are definitely both pros and cons to consider. On the positive side, [advantage 1]. What's more, [advantage 2]. Having said that, we can't ignore the downsides. For instance, [disadvantage 1]. On top of that, [disadvantage 2]. All in all, I think the benefits outweigh the drawbacks.'"
          translation="Estructura clara: introducción → ventajas → desventajas → conclusión"
        />
      </TheorySection>

      <TheorySection title="Estrategias para Ganar Tiempo" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Cuando necesitas tiempo para pensar, usa estas estrategias en lugar de quedarte en silencio.
        </p>

        <GrammarTable
          caption="Técnicas para Ganar Tiempo"
          headers={["Estrategia", "Frases", "Cuándo Usar"]}
          rows={[
            ["Repetir pregunta", "'So you're asking about...', 'When you say...'", "Preguntas complejas"],
            ["Clarificar", "'Could you be more specific?', 'Do you mean...?'", "Preguntas ambiguas"],
            ["Reflexionar", "'That's an interesting question', 'Let me think about that'", "Preguntas difíciles"],
            ["Reformular", "'In other words...', 'What I'm trying to say is...'", "Cuando te trabas"],
            ["Generalizar", "'Generally speaking...', 'As a rule...'", "Cuando no tienes ejemplos específicos"],
            ["Personalizar", "'In my experience...', 'From my point of view...'", "Hacer la respuesta más personal"]
          ]}
        />

        <Tip type="info">
          <strong>Técnica del espejo:</strong> Repite parte de la pregunta para ganar tiempo: 
          "What do I think about social media? Well, social media is definitely..."
        </Tip>
      </TheorySection>

      <TheorySection title="Adaptación al Registro" icon="🎭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Adaptar tu forma de hablar al contexto y audiencia demuestra competencia comunicativa avanzada.
        </p>

        <GrammarTable
          caption="Adaptación por Contexto"
          headers={["Contexto", "Características", "Ejemplo"]}
          rows={[
            ["Conversación casual", "Contracciones, slang moderado, tono relajado", "'I'd say it's pretty cool, you know?'"],
            ["Entrevista de trabajo", "Formal pero personal, ejemplos concretos", "'I believe my experience demonstrates...'"],
            ["Presentación académica", "Vocabulario técnico, estructura clara", "'The data suggests that...'"],
            ["Debate/Discusión", "Argumentos sólidos, reconocer otros puntos", "'While I understand your point, I would argue...'"],
            ["Situación social", "Amigable, inclusivo, empático", "'That must have been really difficult for you'"]
          ]}
        />

        <Rule 
          title="Señales para ajustar registro"
          description="Observa estas pistas para adaptar tu forma de hablar:"
          examples={[
            "Edad y posición de tu interlocutor",
            "Formalidad del entorno (oficina vs café)",
            "Propósito de la conversación (social vs profesional)",
            "Cómo te hablan a ti (formal vs informal)",
            "Tema de conversación (personal vs técnico)"
          ]}
        />
      </TheorySection>

      <TheorySection title="Manejo de Interrupciones y Turnos" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          En conversaciones naturales, saber cuándo y cómo tomar turnos es crucial para la comunicación efectiva.
        </p>

        <GrammarTable
          caption="Gestión de Turnos en Conversación"
          headers={["Situación", "Frases Útiles", "Tono"]}
          rows={[
            ["Interrumpir educadamente", "'Sorry to interrupt, but...', 'Can I just say...'", "Disculpa + contribución"],
            ["Mantener tu turno", "'Let me just finish...', 'I was about to say...'", "Firme pero educado"],
            ["Ceder el turno", "'What do you think?', 'How do you see it?'", "Inclusivo"],
            ["Retomar el tema", "'Going back to what you said...', 'As I was saying...'", "Organizativo"],
            ["Cambiar de tema", "'That reminds me...', 'Speaking of which...'", "Natural y fluido"]
          ]}
        />

        <Tip type="warning">
          <strong>Cuidado cultural:</strong> Las normas de interrupción varían entre culturas. 
          En contextos formales angloparlantes, espera pausas naturales antes de hablar.
        </Tip>
      </TheorySection>

      <TheorySection title="Expresión de Opiniones Matizadas" icon="🎨">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las opiniones sofisticadas no son blanco o negro. Aprende a expresar matices y grados de certeza.
        </p>

        <GrammarTable
          caption="Grados de Certeza y Opinión"
          headers={["Nivel", "Expresiones", "Ejemplo"]}
          rows={[
            ["Certeza total", "I'm absolutely certain, Without a doubt", "'I'm absolutely certain this is the right approach'"],
            ["Muy probable", "I'm pretty sure, Most likely, I'd say", "'I'm pretty sure that's not going to work'"],
            ["Probable", "I think, I believe, It seems to me", "'It seems to me that we need more data'"],
            ["Posible", "I suppose, Maybe, It's possible that", "'I suppose we could try that approach'"],
            ["Dudoso", "I doubt, I'm not sure, It's unlikely", "'I doubt that's the real reason'"],
            ["Neutral", "It depends, That's debatable, I see both sides", "'It depends on how you look at it'"]
          ]}
        />

        <Example 
          spanish="Opinión matizada sobre trabajo remoto:"
          english="'While I can see the benefits of remote work, I'm not entirely convinced it works for everyone. It seems to me that it depends largely on the individual's personality and the nature of their job. Having said that, I do think most companies could be more flexible than they currently are.'"
          translation="Reconoce beneficios → expresa dudas → añade matices → concluye con posición equilibrada"
        />
      </TheorySection>

      <TheorySection title="Técnicas de Autocorrección" icon="🔧">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Saber corregirte de manera natural demuestra autoconciencia lingüística y mantiene la fluidez.
        </p>

        <Rule 
          title="Estrategias de autocorrección natural"
          description="Corrige errores sin interrumpir el flujo:"
          examples={[
            "Reformulación inmediata: 'I mean...' + versión corregida",
            "Aclaración: 'What I meant to say was...'",
            "Aproximación: 'Or rather...' + versión más precisa",
            "Continuación: Ignora errores menores y continúa",
            "Paráfrasis: 'In other words...' + explicación alternativa"
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Error de vocabulario:"
            english="'The weather was very... I mean, extremely hot yesterday.'"
            translation="Autocorrección natural con 'I mean'"
          />
          
          <Example 
            spanish="Error gramatical:"
            english="'I have been there yesterday... well, I went there yesterday.'"
            translation="Reformulación completa con 'well'"
          />
        </div>

        <Tip type="success">
          <strong>Práctica:</strong> No te detengas por errores menores. Los hablantes nativos también 
          cometen errores y se autocorrigen naturalmente.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes en Speaking Avanzado" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Usar demasiados fillers formales en conversación casual<br/>
            <strong>Solución:</strong> Adapta el registro: 'Well' en lugar de 'Furthermore' en contexto informal
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Pausas largas sin comunicar que estás pensando<br/>
            <strong>Solución:</strong> Usa 'Let me think about that' o 'That's a good question'
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Opiniones demasiado absolutas sin matices<br/>
            <strong>Solución:</strong> Usa 'I tend to think' o 'In my experience' para suavizar
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No estructurar respuestas largas<br/>
            <strong>Solución:</strong> Usa 'Firstly... Secondly... Finally...' para organizar ideas
          </Tip>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Which filler is most appropriate for a job interview?"
      options={[
        "Like, you know...",
        "Um, er...",
        "Let me think about that...",
        "I mean, like..."
      ]}
      correctAnswer={2}
      explanation="'Let me think about that' es profesional y muestra reflexión, apropiado para entrevistas."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What's the best way to express a moderate opinion about a controversial topic?"
      options={[
        "I'm absolutely certain that...",
        "It seems to me that...",
        "Without a doubt...",
        "Everyone knows that..."
      ]}
      correctAnswer={1}
      explanation="'It seems to me that...' expresa opinión personal sin ser demasiado absoluto, perfecto para temas controversiales."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Using fillers like 'um' and 'er' should always be avoided in formal speaking.",
          isTrue: false,
          explanation: "Falso. Algunos fillers son naturales incluso en contextos formales, pero deben usarse moderadamente."
        },
        {
          text: "Self-correction during speaking shows linguistic awareness and is generally positive.",
          isTrue: true,
          explanation: "Correcto. La autocorrección natural demuestra conciencia lingüística y es vista positivamente."
        },
        {
          text: "In formal presentations, you should avoid using personal examples.",
          isTrue: false,
          explanation: "Falso. Los ejemplos personales pueden ser efectivos incluso en contextos formales si son relevantes."
        },
        {
          text: "Adapting your register to match your audience shows advanced communication skills.",
          isTrue: true,
          explanation: "Correcto. La adaptación al registro demuestra competencia comunicativa avanzada."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="How should you handle a question you don't immediately know how to answer?"
      options={[
        "Stay silent until you think of something",
        "Say 'I don't know' and stop talking",
        "Say 'That's an interesting question, let me think about that'",
        "Change the topic immediately"
      ]}
      correctAnswer={2}
      explanation="Esta respuesta gana tiempo de manera profesional y muestra que estás considerando la pregunta seriamente."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which phrase best helps you maintain your speaking turn when someone tries to interrupt?"
      options={[
        "Stop interrupting me!",
        "Let me just finish this point...",
        "You're wrong!",
        "I'm not done yet!"
      ]}
      correctAnswer={1}
      explanation="'Let me just finish this point...' es educado pero firme, manteniendo tu turno sin ser agresivo."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Which is the best way to buy time when you need to think?"
      options={[
        "Stay silent for 30 seconds",
        "That's an interesting question, let me consider that",
        "I don't know",
        "Can you repeat the question?"
      ]}
      correctAnswer={1}
      explanation="Esta frase gana tiempo de manera profesional mientras muestras que estás considerando la pregunta."
    />,

    <MultipleChoiceExercise
      key="7"
      question="What's the most appropriate way to self-correct in formal speaking?"
      options={[
        "Sorry, I'm stupid",
        "What I meant to say was...",
        "Forget what I said",
        "I'm always wrong"
      ]}
      correctAnswer={1}
      explanation="'What I meant to say was...' es una forma natural y profesional de autocorregirse."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which filler is most appropriate for academic presentations?"
      options={[
        "Like, um...",
        "You know...",
        "Now, let's consider...",
        "I mean, like..."
      ]}
      correctAnswer={2}
      explanation="'Now, let's consider...' es formal y apropiado para contextos académicos."
    />,

    <MultipleChoiceExercise
      key="9"
      question="How should you express uncertainty in a professional context?"
      options={[
        "I have no idea",
        "I'm not sure, but I believe...",
        "I don't know anything",
        "That's impossible to know"
      ]}
      correctAnswer={1}
      explanation="'I'm not sure, but I believe...' muestra honestidad mientras ofreces tu mejor estimación."
    />,

    <MultipleChoiceExercise
      key="10"
      question="What's the best way to change topics smoothly in conversation?"
      options={[
        "Stop talking about that",
        "That reminds me of...",
        "I'm bored with this topic",
        "Let's talk about something else"
      ]}
      correctAnswer={1}
      explanation="'That reminds me of...' es una transición natural que conecta temas de manera fluida."
    />
  ];

  return (
    <TheoryLayout
      title="Advanced Speaking Strategies"
      description="Desarrolla estrategias sofisticadas de speaking: fluidez, estructuración del discurso, adaptación al registro y manejo natural de conversaciones."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Speaking básico", "Conectores", "Vocabulario por registro"]}
      estimatedTime="60 min"
    />
  );
};

export default AdvancedSpeakingPage;

