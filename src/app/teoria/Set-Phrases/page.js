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

const SetPhrasesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son las Set Phrases?" icon="💬">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las <strong>set phrases</strong> (frases hechas) son expresiones fijas que se usan comúnmente en inglés hablado. 
          Son combinaciones de palabras que tienen un significado específico y se usan como una unidad.
        </p>
        
        <QuickReference items={[
          "Frases fijas con significado específico",
          "Se usan como una unidad completa",
          "Comunes en conversación cotidiana",
          "Ayudan a sonar más natural",
          "Incluyen: saludos, despedidas, expresiones de cortesía"
        ]} />
      </TheorySection>

      <TheorySection title="Saludos y Despedidas" icon="👋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los saludos y despedidas son frases esenciales para la interacción social básica.
        </p>

        <GrammarTable
          caption="Saludos y Despedidas Comunes"
          headers={["Situación", "Frase", "Respuesta Típica", "Nivel de Formalidad"]}
          rows={[
            ["Saludo informal", "Hi there!", "Hi! How are you?", "Informal"],
            ["Saludo formal", "Good morning", "Good morning to you too", "Formal"],
            ["Saludo casual", "Hey, what's up?", "Not much, you?", "Muy informal"],
            ["Despedida informal", "See you later!", "See you!", "Informal"],
            ["Despedida formal", "Have a good day", "Thank you, you too", "Formal"],
            ["Despedida casual", "Catch you later!", "Sure thing!", "Muy informal"],
            ["Despedida con planes", "Talk to you soon", "Looking forward to it", "Neutral"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Saludo informal: '¡Hola! ¿Qué tal?'"
            english="Informal greeting: 'Hi there! How are you?'"
            translation="Saludo informal: '¡Hola! ¿Qué tal?'"
          />
          <Example 
            spanish="Saludo formal: 'Buenos días'"
            english="Formal greeting: 'Good morning'"
            translation="Saludo formal: 'Buenos días'"
          />
          <Example 
            spanish="Despedida informal: '¡Hasta luego!'"
            english="Informal goodbye: 'See you later!'"
            translation="Despedida informal: '¡Hasta luego!'"
          />
        </div>

        <Rule 
          title="Uso de Saludos y Despedidas"
          description="Para usar efectivamente:"
          examples={[
            "Elige el nivel apropiado de formalidad",
            "Responde de manera apropiada",
            "Considera la relación con la persona",
            "Usa expresiones naturales y auténticas"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Los saludos y despedidas establecen el tono de la conversación.
        </Tip>
      </TheorySection>

      <TheorySection title="Expresiones de Cortesía" icon="🙏">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las expresiones de cortesía son fundamentales para mantener relaciones sociales positivas.
        </p>

        <GrammarTable
          caption="Expresiones de Cortesía"
          headers={["Situación", "Frase", "Respuesta Típica", "Cuándo Usar"]}
          rows={[
            ["Agradecimiento", "Thanks a lot!", "You're welcome!", "Después de recibir ayuda"],
            ["Disculpa", "Excuse me", "That's okay", "Al interrumpir o pedir algo"],
            ["Perdón", "I'm sorry", "No problem", "Al cometer un error"],
            ["Permiso", "May I...?", "Of course", "Al pedir permiso"],
            ["Favor", "Could you...?", "Sure, no problem", "Al pedir un favor"],
            ["Felicitación", "Congratulations!", "Thank you!", "Al celebrar logros"],
            ["Condolencia", "I'm sorry for your loss", "Thank you", "En situaciones tristes"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Agradecimiento: '¡Muchas gracias!'"
            english="Gratitude: 'Thanks a lot!'"
            translation="Agradecimiento: '¡Muchas gracias!'"
          />
          <Example 
            spanish="Disculpa: 'Disculpe, ¿puedo pasar?'"
            english="Apology: 'Excuse me, may I pass?'"
            translation="Disculpa: 'Disculpe, ¿puedo pasar?'"
          />
          <Example 
            spanish="Permiso: '¿Puedo usar su teléfono?'"
            english="Permission: 'May I use your phone?'"
            translation="Permiso: '¿Puedo usar su teléfono?'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Las expresiones de cortesía muestran respeto y consideración por los demás.
        </Tip>
      </TheorySection>

      <TheorySection title="Expresiones para Dar Opinión" icon="💭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas frases te ayudan a expresar tu opinión de manera natural y apropiada.
        </p>

        <GrammarTable
          caption="Expresiones para Dar Opinión"
          headers={["Nivel de Certeza", "Frase", "Uso", "Ejemplo"]}
          rows={[
            ["Muy seguro", "I'm absolutely sure", "Cuando estás muy seguro", "I'm absolutely sure it's true"],
            ["Seguro", "I'm convinced that", "Cuando tienes una creencia fuerte", "I'm convinced that it works"],
            ["Moderado", "I think that", "Opinión personal", "I think that's a good idea"],
            ["Inseguro", "I'm not sure, but", "Cuando no estás seguro", "I'm not sure, but it might work"],
            ["Muy inseguro", "I have no idea", "Cuando no sabes", "I have no idea what to do"],
            ["Neutral", "It seems to me", "Opinión neutral", "It seems to me it's okay"],
            ["Personal", "In my view", "Perspectiva personal", "In my view, it's important"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Muy seguro: 'Estoy completamente seguro de que es verdad'"
            english="Very sure: 'I'm absolutely sure it's true'"
            translation="Muy seguro: 'Estoy completamente seguro de que es verdad'"
          />
          <Example 
            spanish="Moderado: 'Creo que es una buena idea'"
            english="Moderate: 'I think that's a good idea'"
            translation="Moderado: 'Creo que es una buena idea'"
          />
          <Example 
            spanish="Inseguro: 'No estoy seguro, pero podría funcionar'"
            english="Uncertain: 'I'm not sure, but it might work'"
            translation="Inseguro: 'No estoy seguro, pero podría funcionar'"
          />
        </div>

        <Rule 
          title="Uso de Expresiones de Opinión"
          description="Para expresar opinión efectivamente:"
          examples={[
            "Elige el nivel apropiado de certeza",
            "Considera el contexto y la audiencia",
            "Sé honesto sobre tu nivel de conocimiento",
            "Usa expresiones que reflejen tu verdadero sentimiento"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No uses expresiones de certeza absoluta cuando no estés seguro.
        </Tip>
      </TheorySection>

      <TheorySection title="Expresiones para Acordar y Discrepar" icon="🤝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas frases te ayudan a expresar acuerdo o desacuerdo de manera educada.
        </p>

        <GrammarTable
          caption="Expresiones de Acuerdo y Desacuerdo"
          headers={["Tipo", "Frase", "Nivel de Intensidad", "Ejemplo"]}
          rows={[
            ["Acuerdo total", "I completely agree", "Muy fuerte", "I completely agree with you"],
            ["Acuerdo fuerte", "I totally agree", "Fuerte", "I totally agree on that point"],
            ["Acuerdo moderado", "I agree with you", "Moderado", "I agree with you on this"],
            ["Acuerdo parcial", "I partly agree", "Débil", "I partly agree with your idea"],
            ["Desacuerdo suave", "I'm not sure I agree", "Suave", "I'm not sure I agree with that"],
            ["Desacuerdo moderado", "I disagree", "Moderado", "I disagree with your opinion"],
            ["Desacuerdo fuerte", "I completely disagree", "Fuerte", "I completely disagree with that"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Acuerdo total: 'Estoy completamente de acuerdo contigo'"
            english="Total agreement: 'I completely agree with you'"
            translation="Acuerdo total: 'Estoy completamente de acuerdo contigo'"
          />
          <Example 
            spanish="Acuerdo moderado: 'Estoy de acuerdo contigo en esto'"
            english="Moderate agreement: 'I agree with you on this'"
            translation="Acuerdo moderado: 'Estoy de acuerdo contigo en esto'"
          />
          <Example 
            spanish="Desacuerdo suave: 'No estoy seguro de estar de acuerdo'"
            english="Soft disagreement: 'I'm not sure I agree with that'"
            translation="Desacuerdo suave: 'No estoy seguro de estar de acuerdo'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Usa expresiones apropiadas para el nivel de desacuerdo y la relación con la persona.
        </Tip>
      </TheorySection>

      <TheorySection title="Expresiones para Cambiar de Tema" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas frases te ayudan a cambiar de tema de manera natural y educada.
        </p>

        <GrammarTable
          caption="Expresiones para Cambiar de Tema"
          headers={["Frase", "Nivel de Formalidad", "Uso", "Ejemplo"]}
          rows={[
            ["By the way", "Informal", "Cambio casual de tema", "By the way, did you hear about...?"],
            ["Speaking of which", "Neutral", "Cambio relacionado", "Speaking of which, how is your job?"],
            ["That reminds me", "Neutral", "Recordar algo relacionado", "That reminds me, I need to call..."],
            ["On a different note", "Formal", "Cambio formal de tema", "On a different note, let's discuss..."],
            ["Incidentally", "Formal", "Información adicional", "Incidentally, I heard that..."],
            ["Before I forget", "Neutral", "Recordar algo importante", "Before I forget, don't forget to..."],
            ["Oh, I almost forgot", "Informal", "Recordar algo olvidado", "Oh, I almost forgot to tell you..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Cambio casual: 'Por cierto, ¿escuchaste sobre...?'"
            english="Casual change: 'By the way, did you hear about...?'"
            translation="Cambio casual: 'Por cierto, ¿escuchaste sobre...?'"
          />
          <Example 
            spanish="Cambio relacionado: 'Hablando de eso, ¿cómo está tu trabajo?'"
            english="Related change: 'Speaking of which, how is your job?'"
            translation="Cambio relacionado: 'Hablando de eso, ¿cómo está tu trabajo?'"
          />
          <Example 
            spanish="Recordar: 'Eso me recuerda, necesito llamar...'"
            english="Reminder: 'That reminds me, I need to call...'"
            translation="Recordar: 'Eso me recuerda, necesito llamar...'"
          />
        </div>

        <Rule 
          title="Uso de Expresiones de Cambio de Tema"
          description="Para cambiar de tema efectivamente:"
          examples={[
            "Usa expresiones apropiadas para el nivel de formalidad",
            "Asegúrate de que el cambio sea natural",
            "Considera si el cambio es apropiado",
            "Usa expresiones que faciliten la transición"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Los cambios de tema naturales mantienen la conversación fluida.
        </Tip>
      </TheorySection>

      <TheorySection title="Expresiones para Mostrar Interés" icon="😊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas frases te ayudan a mostrar interés y mantener la conversación activa.
        </p>

        <GrammarTable
          caption="Expresiones para Mostrar Interés"
          headers={["Frase", "Uso", "Respuesta Esperada", "Nivel de Entusiasmo"]}
          rows={[
            ["That's interesting!", "Mostrar interés", "Continuar explicando", "Moderado"],
            ["Really?", "Mostrar sorpresa", "Confirmar o explicar", "Alto"],
            ["Wow!", "Mostrar asombro", "Continuar la historia", "Muy alto"],
            ["I see", "Mostrar comprensión", "Continuar explicando", "Bajo"],
            ["That's amazing!", "Mostrar admiración", "Continuar explicando", "Alto"],
            ["No way!", "Mostrar incredulidad", "Confirmar o explicar", "Muy alto"],
            ["That's cool!", "Mostrar aprobación", "Continuar explicando", "Moderado"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Interés: '¡Eso es interesante!'"
            english="Interest: 'That's interesting!'"
            translation="Interés: '¡Eso es interesante!'"
          />
          <Example 
            spanish="Sorpresa: '¿En serio?'"
            english="Surprise: 'Really?'"
            translation="Sorpresa: '¿En serio?'"
          />
          <Example 
            spanish="Asombro: '¡Wow!'"
            english="Amazement: 'Wow!'"
            translation="Asombro: '¡Wow!'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Mostrar interés genuino hace que la conversación sea más agradable para todos.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Usar expresiones demasiado formales en contexto informal ❌<br/>
            <strong>Correcto:</strong> Adaptar el nivel de formalidad al contexto ✅<br/>
            <em>El contexto determina el nivel apropiado</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No responder apropiadamente a las frases ❌<br/>
            <strong>Correcto:</strong> Responder de manera natural y apropiada ✅<br/>
            <em>Las respuestas apropiadas mantienen la conversación fluida</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar expresiones de certeza cuando no estás seguro ❌<br/>
            <strong>Correcto:</strong> Usar expresiones apropiadas para tu nivel de certeza ✅<br/>
            <em>La honestidad sobre tu nivel de conocimiento es importante</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No considerar la relación con la persona ❌<br/>
            <strong>Correcto:</strong> Elegir expresiones apropiadas para la relación ✅<br/>
            <em>La relación determina el nivel de formalidad apropiado</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Contexto determina uso"
            description="Elige expresiones apropiadas para el contexto."
            examples={[
              "Formal: reuniones, presentaciones, entrevistas",
              "Informal: amigos, familia, conversaciones casuales",
              "Neutral: colegas, conocidos, situaciones mixtas",
              "Considera la relación con la persona"
            ]}
          />

          <Rule 
            title="2. Respuestas apropiadas"
            description="Responde de manera natural y apropiada."
            examples={[
              "Saludos requieren respuestas de saludo",
              "Preguntas requieren respuestas informativas",
              "Expresiones de cortesía requieren respuestas de cortesía",
              "Mantén el nivel de formalidad consistente"
            ]}
          />

          <Rule 
            title="3. Autenticidad y naturalidad"
            description="Usa expresiones que suenen naturales para ti."
            examples={[
              "Practica hasta que suenen naturales",
              "No fuerces expresiones que no te sientan bien",
              "Adapta las expresiones a tu personalidad",
              "La autenticidad es más importante que la perfección"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Cuál es la frase más informal para saludar?"
      options={[
        "Good morning",
        "Hi there!",
        "How do you do?",
        "Good evening"
      ]}
      correctAnswer={1}
      explanation="'Hi there!' es un saludo muy informal y amigable, perfecto para situaciones casuales."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la respuesta más apropiada a 'Thanks a lot!'?"
      options={[
        "You're welcome!",
        "Thank you!",
        "I'm sorry",
        "Excuse me"
      ]}
      correctAnswer={0}
      explanation="'You're welcome!' es la respuesta más apropiada a 'Thanks a lot!' para expresar que no hay problema en ayudar."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Las set phrases son expresiones fijas que se usan como una unidad.",
          isTrue: true,
          explanation: "Correcto. Las set phrases son combinaciones fijas de palabras con significado específico que se usan como una unidad."
        },
        {
          text: "Es apropiado usar expresiones muy informales en contextos formales.",
          isTrue: false,
          explanation: "Incorrecto. Debes adaptar el nivel de formalidad al contexto. Las expresiones muy informales no son apropiadas en contextos formales."
        },
        {
          text: "Mostrar interés genuino hace que la conversación sea más agradable.",
          isTrue: true,
          explanation: "Correcto. Mostrar interés genuino con expresiones como 'That's interesting!' o 'Really?' hace que la conversación sea más agradable para todos."
        },
        {
          text: "No es importante responder apropiadamente a las frases de cortesía.",
          isTrue: false,
          explanation: "Incorrecto. Responder apropiadamente a las frases de cortesía es importante para mantener la conversación fluida y mostrar respeto."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la expresión más apropiada para mostrar desacuerdo suave?"
      options={[
        "I completely disagree",
        "I'm not sure I agree",
        "I totally agree",
        "That's amazing!"
      ]}
      correctAnswer={1}
      explanation="'I'm not sure I agree' es la expresión más apropiada para mostrar desacuerdo suave, mientras que las otras expresan acuerdo total, desacuerdo fuerte o asombro."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la expresión más apropiada para cambiar de tema de manera casual?"
      options={[
        "On a different note",
        "By the way",
        "Incidentally",
        "Speaking of which"
      ]}
      correctAnswer={1}
      explanation="'By the way' es la expresión más apropiada para cambiar de tema de manera casual, mientras que las otras son más formales o para cambios relacionados."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Set phrases can be translated literally from Spanish to English.",
          isTrue: false,
          explanation: "Incorrecto. Las set phrases son específicas de cada idioma y raramente se traducen literalmente."
        },
        {
          text: "'How are you?' is a set phrase used for greeting.",
          isTrue: true,
          explanation: "Correcto. 'How are you?' es una frase fija común para saludar en inglés."
        },
        {
          text: "Set phrases make speech sound more natural and fluent.",
          isTrue: true,
          explanation: "Correcto. Las set phrases ayudan a sonar más natural y fluido, como un hablante nativo."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'I'm sorry, I didn't _____ that.'"
      options={[
        "listen",
        "catch",
        "hear",
        "understand"
      ]}
      correctAnswer={1}
      explanation="'I didn't catch that' es una set phrase común para pedir repetición de manera educada."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Cuál es la respuesta más apropiada a 'How's it going?'"
      options={[
        "It's going to the store",
        "Not bad, thanks",
        "Yes, it is",
        "I don't know where"
      ]}
      correctAnswer={1}
      explanation="'Not bad, thanks' es una respuesta natural y común a 'How's it going?'"
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Break a leg' literally means to injure your leg.",
          isTrue: false,
          explanation: "Incorrecto. 'Break a leg' es una expresión idiomática que significa 'good luck' en el teatro."
        },
        {
          text: "Set phrases are more common in spoken English than written English.",
          isTrue: true,
          explanation: "Correcto. Las set phrases son especialmente comunes en conversaciones informales."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'I'm _____ forward to seeing you.'"
      options={[
        "going",
        "looking",
        "moving",
        "coming"
      ]}
      correctAnswer={1}
      explanation="'Looking forward to' es una set phrase que significa 'tener ganas de' o 'esperar con ansias'."
    />
  ];

  return (
    <TheoryLayout
      title="Set Phrases"
      description="Domina las frases hechas en inglés: saludos, despedidas, cortesía, opinión, acuerdo/desacuerdo y cambio de tema. Aprende a sonar más natural en conversaciones."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic speaking skills", "Understanding of formal vs informal language"]}
      estimatedTime="65 min"
    />
  );
};

export default SetPhrasesPage;





















