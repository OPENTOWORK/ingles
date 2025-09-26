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

const FunctionalAndThematicVocabularyPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Functional and Thematic Vocabulary?" icon="🗣️">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El <strong>functional and thematic vocabulary</strong> (vocabulario funcional y temático) se refiere a palabras 
          y expresiones organizadas por función comunicativa y temas específicos. Es esencial para hablar de manera efectiva en diferentes situaciones.
        </p>
        
        <QuickReference items={[
          "Vocabulario organizado por función comunicativa",
          "Palabras agrupadas por temas específicos",
          "Expresiones para diferentes situaciones",
          "Vocabulario contextual y situacional",
          "Herramientas para comunicación efectiva"
        ]} />
      </TheorySection>

      <TheorySection title="Vocabulario Funcional" icon="⚙️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El vocabulario funcional se organiza según la función comunicativa que cumple en la conversación.
        </p>

        <GrammarTable
          caption="Categorías de Vocabulario Funcional"
          headers={["Función", "Propósito", "Ejemplos", "Cuándo Usar"]}
          rows={[
            ["Saludar", "Iniciar conversación", "Hello, Hi, Good morning", "Al encontrarse con alguien"],
            ["Despedirse", "Terminar conversación", "Goodbye, See you later, Take care", "Al finalizar encuentro"],
            ["Pedir Información", "Obtener datos", "Could you tell me...?, What time...?", "Cuando necesitas información"],
            ["Dar Información", "Proporcionar datos", "It's..., The time is..., According to...", "Cuando respondes preguntas"],
            ["Expresar Opinión", "Compartir puntos de vista", "I think..., In my opinion..., I believe...", "Al dar tu perspectiva"],
            ["Acordar/Discrepar", "Mostrar acuerdo o desacuerdo", "I agree..., I disagree..., That's true", "Al responder opiniones"],
            ["Sugerir", "Proponer ideas", "How about...?, Why don't we...?, I suggest...", "Al proponer acciones"],
            ["Agradecer", "Mostrar gratitud", "Thank you, Thanks, I appreciate...", "Cuando recibes ayuda"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Saludar: 'Hello, how are you?'"
            english="Greeting: 'Hello, how are you?'"
            translation="Saludar: 'Hola, ¿cómo estás?'"
          />
          <Example 
            spanish="Pedir información: 'Could you tell me the time?'"
            english="Asking for information: 'Could you tell me the time?'"
            translation="Pedir información: '¿Podrías decirme la hora?'"
          />
          <Example 
            spanish="Expresar opinión: 'I think it's a good idea'"
            english="Expressing opinion: 'I think it's a good idea'"
            translation="Expresar opinión: 'Creo que es una buena idea'"
          />
        </div>

        <Rule 
          title="Uso del Vocabulario Funcional"
          description="Para usar efectivamente:"
          examples={[
            "Elige expresiones apropiadas para la situación",
            "Considera el nivel de formalidad",
            "Adapta según la relación con la persona",
            "Usa variedad para evitar repetición"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> El vocabulario funcional te permite navegar diferentes situaciones comunicativas con confianza.
        </Tip>
      </TheorySection>

      <TheorySection title="Vocabulario Temático" icon="📚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El vocabulario temático se organiza por temas específicos que aparecen frecuentemente en conversaciones.
        </p>

        <GrammarTable
          caption="Temas Comunes de Vocabulario"
          headers={["Tema", "Vocabulario Clave", "Situaciones", "Ejemplo"]}
          rows={[
            ["Trabajo", "job, career, salary, meeting", "Entrevistas, reuniones", "I have a meeting at 3 PM"],
            ["Educación", "school, university, exam, study", "Conversaciones académicas", "The exam is next week"],
            ["Viajes", "trip, vacation, hotel, flight", "Planificación de viajes", "My flight leaves at 6 AM"],
            ["Salud", "doctor, hospital, medicine, symptoms", "Consultas médicas", "I have a headache"],
            ["Comida", "restaurant, menu, delicious, hungry", "Cenas, restaurantes", "This food is delicious"],
            ["Tecnología", "computer, internet, software, app", "Discusiones técnicas", "I use this app daily"],
            ["Deportes", "football, basketball, team, score", "Conversaciones deportivas", "The team won the game"],
            ["Música", "concert, band, song, instrument", "Discusiones musicales", "I love this song"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Trabajo: 'Tengo una reunión a las 3 PM'"
            english="Work: 'I have a meeting at 3 PM'"
            translation="Trabajo: 'Tengo una reunión a las 3 PM'"
          />
          <Example 
            spanish="Viajes: 'Mi vuelo sale a las 6 AM'"
            english="Travel: 'My flight leaves at 6 AM'"
            translation="Viajes: 'Mi vuelo sale a las 6 AM'"
          />
          <Example 
            spanish="Tecnología: 'Uso esta aplicación diariamente'"
            english="Technology: 'I use this app daily'"
            translation="Tecnología: 'Uso esta aplicación diariamente'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Familiarízate con el vocabulario de temas que te interesan o que aparecen frecuentemente en tu vida.
        </Tip>
      </TheorySection>

      <TheorySection title="Expresiones por Situación" icon="🏢">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Diferentes situaciones requieren vocabulario y expresiones específicas.
        </p>

        <GrammarTable
          caption="Vocabulario por Situación"
          headers={["Situación", "Vocabulario Específico", "Expresiones Clave", "Ejemplo"]}
          rows={[
            ["Entrevista de Trabajo", "experience, skills, qualifications", "Tell me about yourself", "I have 5 years of experience"],
            ["Consulta Médica", "symptoms, pain, medication", "How are you feeling?", "I have a headache"],
            ["Reservación en Restaurante", "table, reservation, menu", "Table for two, please", "We have a reservation"],
            ["Compras en Tienda", "price, size, color, discount", "How much does it cost?", "This shirt costs $25"],
            ["Información en Aeropuerto", "flight, gate, departure, arrival", "Where is gate 15?", "Gate 15 is on the left"],
            ["Conversación en Fiesta", "party, fun, music, dance", "Are you having fun?", "This party is great"],
            ["Reunión de Trabajo", "agenda, discussion, decision", "Let's discuss this", "I agree with your proposal"],
            ["Conversación con Amigos", "casual, relaxed, informal", "What's up?", "Nothing much, you?"]                                                  
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Entrevista: 'Tengo 5 años de experiencia'"
            english="Interview: 'I have 5 years of experience'"
            translation="Entrevista: 'Tengo 5 años de experiencia'"
          />
          <Example 
            spanish="Consulta médica: 'Tengo dolor de cabeza'"
            english="Medical consultation: 'I have a headache'"
            translation="Consulta médica: 'Tengo dolor de cabeza'"
          />
          <Example 
            spanish="Restaurante: 'Mesa para dos, por favor'"
            english="Restaurant: 'Table for two, please'"
            translation="Restaurante: 'Mesa para dos, por favor'"
          />
        </div>

        <Rule 
          title="Adaptación a Situaciones"
          description="Para adaptarte a diferentes situaciones:"
          examples={[
            "Identifica el contexto y nivel de formalidad",
            "Usa vocabulario apropiado para la situación",
            "Considera la relación con la persona",
            "Adapta tu tono y estilo de comunicación"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Usar vocabulario inapropiado para la situación puede crear malentendidos.
        </Tip>
      </TheorySection>

      <TheorySection title="Niveles de Formalidad" icon="🎭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El nivel de formalidad determina qué vocabulario y expresiones usar en diferentes contextos.
        </p>

        <GrammarTable
          caption="Niveles de Formalidad"
          headers={["Nivel", "Contexto", "Vocabulario", "Ejemplo"]}
          rows={[
            ["Muy Formal", "Presentaciones, discursos", "distinguished, esteemed", "Distinguished guests, thank you"],
            ["Formal", "Trabajo, negocios", "please, thank you, sir/madam", "Please send me the report"],
            ["Neutral", "Conocidos, colegas", "standard vocabulary", "Could you help me with this?"],
            ["Informal", "Amigos, familia", "casual expressions", "Can you help me with this?"],
            ["Muy Informal", "Amigos cercanos", "slang, contractions", "Hey, can ya help me with this?"],
            ["Coloquial", "Conversación casual", "everyday expressions", "What's up? How's it going?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Muy formal: 'Distinguidos invitados, gracias'"
            english="Very formal: 'Distinguished guests, thank you'"
            translation="Muy formal: 'Distinguidos invitados, gracias'"
          />
          <Example 
            spanish="Formal: 'Por favor, envíeme el informe'"
            english="Formal: 'Please send me the report'"
            translation="Formal: 'Por favor, envíeme el informe'"
          />
          <Example 
            spanish="Informal: '¿Puedes ayudarme con esto?'"
            english="Informal: 'Can you help me with this?'"
            translation="Informal: '¿Puedes ayudarme con esto?'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Observa cómo hablan otros en diferentes contextos para aprender los niveles apropiados.
        </Tip>
      </TheorySection>

      <TheorySection title="Expresiones Coloquiales" icon="💬">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las expresiones coloquiales son parte importante del vocabulario funcional para conversaciones naturales.
        </p>

        <GrammarTable
          caption="Expresiones Coloquiales Comunes"
          headers={["Expresión", "Significado", "Uso", "Ejemplo"]}
          rows={[
            ["What's up?", "¿Qué tal?", "Saludo informal", "Hey, what's up?"],
            ["How's it going?", "¿Cómo va todo?", "Pregunta sobre estado", "How's it going with your job?"],
            ["That's cool", "Eso está genial", "Aprobación casual", "That's cool, I like it"],
            ["No way!", "¡No puede ser!", "Sorpresa", "No way! Really?"],
            ["I'm in", "Estoy dentro", "Aceptar propuesta", "Count me in, I'm in"],
            ["That sucks", "Eso apesta", "Desaprobación", "That sucks, I'm sorry"],
            ["I'm down", "Estoy dispuesto", "Aceptar idea", "I'm down for pizza"],
            ["That rocks", "Eso está genial", "Aprobación entusiasta", "That rocks, let's do it"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Saludo: 'Oye, ¿qué tal?'"
            english="Greeting: 'Hey, what's up?'"
            translation="Saludo: 'Oye, ¿qué tal?'"
          />
          <Example 
            spanish="Aprobación: 'Eso está genial, me gusta'"
            english="Approval: 'That's cool, I like it'"
            translation="Aprobación: 'Eso está genial, me gusta'"
          />
          <Example 
            spanish="Aceptar: 'Cuenta conmigo, estoy dentro'"
            english="Accepting: 'Count me in, I'm in'"
            translation="Aceptar: 'Cuenta conmigo, estoy dentro'"
          />
        </div>

        <Rule 
          title="Uso de Expresiones Coloquiales"
          description="Para usar efectivamente:"
          examples={[
            "Úsalas solo en contextos apropiados",
            "Considera la relación con la persona",
            "No las uses en situaciones formales",
            "Aprende el contexto cultural apropiado"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Las expresiones coloquiales pueden no ser apropiadas en contextos formales o profesionales.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias de Aprendizaje" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Existen estrategias específicas para aprender y usar vocabulario funcional y temático efectivamente.
        </p>

        <GrammarTable
          caption="Estrategias de Aprendizaje"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Beneficio"]}
          rows={[
            ["Aprendizaje por Contexto", "Aprender vocabulario en contexto", "Estudio diario", "Mejor retención"],
            ["Práctica Situacional", "Practicar en situaciones específicas", "Preparación para situaciones", "Confianza en contexto real"],
            ["Agrupación Temática", "Agrupar vocabulario por temas", "Estudio organizado", "Mejor organización mental"],
            ["Uso Activo", "Usar vocabulario en conversaciones", "Práctica regular", "Fluidez natural"],
            ["Variación de Registro", "Practicar diferentes niveles", "Adaptación a contextos", "Versatilidad comunicativa"],
            ["Retroalimentación", "Recibir feedback sobre uso", "Mejora continua", "Corrección y mejora"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Aprendizaje por contexto: 'Aprender vocabulario en contexto'"
            english="Contextual learning: 'Learn vocabulary in context'"
            translation="Aprendizaje por contexto: 'Aprender vocabulario en contexto'"
          />
          <Example 
            spanish="Práctica situacional: 'Practicar en situaciones específicas'"
            english="Situational practice: 'Practice in specific situations'"
            translation="Práctica situacional: 'Practicar en situaciones específicas'"
          />
          <Example 
            spanish="Uso activo: 'Usar vocabulario en conversaciones'"
            english="Active use: 'Use vocabulary in conversations'"
            translation="Uso activo: 'Usar vocabulario en conversaciones'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> La práctica activa en contextos reales es la mejor manera de desarrollar vocabulario funcional.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Usar vocabulario formal en contextos informales ❌<br/>
            <strong>Correcto:</strong> Adaptar vocabulario al contexto ✅<br/>
            <em>El contexto determina el nivel apropiado de formalidad</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar expresiones coloquiales en contextos formales ❌<br/>
            <strong>Correcto:</strong> Usar expresiones apropiadas para la situación ✅<br/>
            <em>Las expresiones coloquiales no son apropiadas en contextos formales</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No considerar la relación con la persona ❌<br/>
            <strong>Correcto:</strong> Adaptar vocabulario según la relación ✅<br/>
            <em>La relación determina el nivel de formalidad apropiado</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No practicar en contextos reales ❌<br/>
            <strong>Correcto:</strong> Practicar en situaciones reales ✅<br/>
            <em>La práctica en contexto real desarrolla fluidez natural</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Contexto determina uso"
            description="El contexto determina qué vocabulario usar."
            examples={[
              "Identifica el contexto y nivel de formalidad",
              "Considera la relación con la persona",
              "Adapta tu vocabulario apropiadamente",
              "Observa cómo hablan otros en el contexto"
            ]}
          />

          <Rule 
            title="2. Variedad y flexibilidad"
            description="Desarrolla variedad en tu vocabulario."
            examples={[
              "Aprende diferentes formas de expresar la misma idea",
              "Practica diferentes niveles de formalidad",
              "Desarrolla vocabulario para diferentes temas",
              "Usa variedad para evitar repetición"
            ]}
          />

          <Rule 
            title="3. Práctica activa"
            description="Practica activamente en contextos reales."
            examples={[
              "Usa vocabulario en conversaciones reales",
              "Practica en diferentes situaciones",
              "Recibe feedback sobre tu uso",
              "Ajusta según el contexto y retroalimentación"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="El vocabulario ___ (funcional/temático) se organiza por función comunicativa. El vocabulario ___ (temático/funcional) se agrupa por temas. El ___ (contexto/nivel) determina qué vocabulario usar."
      blanks={[
        { answer: "funcional" },
        { answer: "temático" },
        { answer: "contexto" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Qué determina principalmente qué vocabulario funcional usar?"
      options={[
        "La longitud de la conversación",
        "El contexto y nivel de formalidad",
        "La velocidad de habla",
        "El acento de la persona"
      ]}
      correctAnswer={1}
      explanation="El contexto y nivel de formalidad determinan qué vocabulario funcional usar. Diferentes situaciones requieren diferentes niveles de formalidad."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Las expresiones coloquiales son apropiadas en contextos formales.",
          isTrue: false,
          explanation: "Incorrecto. Las expresiones coloquiales no son apropiadas en contextos formales. Deben usarse solo en situaciones informales."
        },
        {
          text: "El vocabulario temático se organiza por temas específicos.",
          isTrue: true,
          explanation: "Correcto. El vocabulario temático se agrupa por temas como trabajo, educación, viajes, salud, etc."
        },
        {
          text: "La práctica activa en contextos reales es importante para desarrollar vocabulario funcional.",
          isTrue: true,
          explanation: "Correcto. La práctica activa en contextos reales es la mejor manera de desarrollar fluidez en el uso de vocabulario funcional."
        },
        {
          text: "Es mejor usar siempre el mismo nivel de formalidad en todas las situaciones.",
          isTrue: false,
          explanation: "Incorrecto. Es importante adaptar el nivel de formalidad según el contexto y la relación con la persona."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la mejor estrategia para aprender vocabulario funcional?"
      options={[
        "Memorizar listas de palabras",
        "Practicar en contextos reales",
        "Solo leer sobre el vocabulario",
        "Usar siempre el mismo nivel de formalidad"
      ]}
      correctAnswer={1}
      explanation="Practicar en contextos reales es la mejor estrategia, ya que permite desarrollar fluidez natural y adaptación a diferentes situaciones."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué expresión es más apropiada para una conversación informal con amigos?"
      options={[
        "Distinguished guests, thank you",
        "Please send me the report",
        "What's up? How's it going?",
        "I respectfully disagree"
      ]}
      correctAnswer={2}
      explanation="'What's up? How's it going?' es apropiada para conversaciones informales con amigos, mientras que las otras son más formales."
    />
  ];

  return (
    <TheoryLayout
      title="Functional and Thematic Vocabulary"
      description="Domina el vocabulario funcional y temático en inglés. Aprende vocabulario organizado por función comunicativa y temas específicos para hablar efectivamente en diferentes situaciones."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic vocabulary", "Understanding of formal vs informal language"]}
      estimatedTime="75 min"
    />
  );
};

export default FunctionalAndThematicVocabularyPage;

