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

const ListeningTypesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Types of Understanding?" icon="👂">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>types of understanding</strong> (tipos de comprensión) en listening se refieren a las diferentes habilidades 
          que necesitas desarrollar para entender completamente lo que escuchas. Cada tipo requiere estrategias específicas.
        </p>
        
        <QuickReference items={[
          "Main Idea: entender el tema principal",
          "Details: captar información específica",
          "Contrast: identificar diferencias y oposiciones",
          "Tone: reconocer el tono y actitud del hablante",
          "Estrategias específicas para cada tipo"
        ]} />
      </TheorySection>

      <TheorySection title="Main Idea (Idea Principal)" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La idea principal es el tema central o mensaje más importante de lo que escuchas.
        </p>

        <GrammarTable
          caption="Estrategias para Identificar la Idea Principal"
          headers={["Estrategia", "Descripción", "Ejemplo", "Cuándo Usar"]}
          rows={[
            ["Escuchar palabras clave", "Identificar términos repetidos", "Tecnología, innovación, futuro", "Al inicio del audio"],
            ["Prestar atención al inicio", "La idea principal suele estar al comienzo", "Today I'll talk about...", "Primeros 30 segundos"],
            ["Identificar el tema general", "¿De qué se habla en general?", "Salud, educación, trabajo", "Durante todo el audio"],
            ["Ignorar detalles específicos", "No te enfoques en números o fechas", "Concentrarse en el mensaje general", "Mantener enfoque general"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Pregunta: '¿Cuál es el tema principal del audio?'"
            english="Question: 'What is the main topic of the audio?'"
            translation="Pregunta: '¿Cuál es el tema principal del audio?'"
          />
          <Example 
            spanish="Respuesta: 'El audio habla sobre los beneficios de la tecnología'"
            english="Answer: 'The audio discusses the benefits of technology'"
            translation="Respuesta: 'El audio habla sobre los beneficios de la tecnología'"
          />
          <Example 
            spanish="Claves: 'tecnología', 'beneficios', 'mejora', 'futuro'"
            english="Keywords: 'technology', 'benefits', 'improves', 'future'"
            translation="Claves: 'tecnología', 'beneficios', 'mejora', 'futuro'"
          />
        </div>

        <Rule 
          title="Preguntas Típicas de Idea Principal"
          description="Estas preguntas buscan el tema general:"
          examples={[
            "What is the main topic?",
            "What is the speaker talking about?",
            "What is the general theme?",
            "What is the main idea?"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> La idea principal es como el título de un artículo - resume todo el contenido.
        </Tip>
      </TheorySection>

      <TheorySection title="Details (Detalles)" icon="🔍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los detalles son información específica como nombres, fechas, números, lugares y hechos concretos.
        </p>

        <GrammarTable
          caption="Tipos de Detalles y Cómo Captarlos"
          headers={["Tipo de Detalle", "Qué Escuchar", "Estrategia", "Ejemplo"]}
          rows={[
            ["Nombres propios", "Personas, lugares, organizaciones", "Escuchar mayúsculas implícitas", "John Smith, London, UNESCO"],
            ["Números", "Fechas, cantidades, precios", "Escuchar cuidadosamente", "2023, 50 students, $100"],
            ["Adjetivos descriptivos", "Características específicas", "Prestar atención a descripciones", "Big, expensive, beautiful"],
            ["Verbos de acción", "Qué se hace específicamente", "Escuchar acciones concretas", "Buy, sell, travel, study"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Pregunta: '¿Cuántos estudiantes hay en la clase?'"
            english="Question: 'How many students are in the class?'"
            translation="Pregunta: '¿Cuántos estudiantes hay en la clase?'"
          />
          <Example 
            spanish="Respuesta: 'Hay 25 estudiantes'"
            english="Answer: 'There are 25 students'"
            translation="Respuesta: 'Hay 25 estudiantes'"
          />
          <Example 
            spanish="Pregunta: '¿Dónde se realizó la conferencia?'"
            english="Question: 'Where was the conference held?'"
            translation="Pregunta: '¿Dónde se realizó la conferencia?'"
          />
          <Example 
            spanish="Respuesta: 'En el centro de convenciones'"
            english="Answer: 'At the convention center'"
            translation="Respuesta: 'En el centro de convenciones'"
          />
        </div>

        <Rule 
          title="Estrategias para Captar Detalles"
          description="Para entender detalles específicos:"
          examples={[
            "Lee las preguntas antes de escuchar",
            "Identifica qué tipo de información necesitas",
            "Escucha palabras clave relacionadas con la pregunta",
            "No te distraigas con información irrelevante"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Los detalles pueden ser distractores - asegúrate de que coincidan con la pregunta.
        </Tip>
      </TheorySection>

      <TheorySection title="Contrast (Contraste)" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El contraste se refiere a identificar diferencias, oposiciones o comparaciones entre ideas, personas o situaciones.
        </p>

        <GrammarTable
          caption="Palabras Clave para Identificar Contrastes"
          headers={["Palabra/Expresión", "Significado", "Ejemplo", "Estrategia"]}
          rows={[
            ["However", "Sin embargo", "It's expensive, however it's worth it", "Escuchar después de 'however'"],
            ["But", "Pero", "I like it, but it's too expensive", "Identificar la oposición"],
            ["On the other hand", "Por otro lado", "On the other hand, it's difficult", "Buscar la alternativa"],
            ["Unlike", "A diferencia de", "Unlike cars, bikes are eco-friendly", "Comparar diferencias"],
            ["While", "Mientras que", "While some like it, others don't", "Contraste simultáneo"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Pregunta: '¿Cuál es la diferencia entre A y B?'"
            english="Question: 'What's the difference between A and B?'"
            translation="Pregunta: '¿Cuál es la diferencia entre A y B?'"
          />
          <Example 
            spanish="Audio: 'A es rápido, pero B es más lento'"
            english="Audio: 'A is fast, but B is slower'"
            translation="Audio: 'A es rápido, pero B es más lento'"
          />
          <Example 
            spanish="Respuesta: 'A es más rápido que B'"
            english="Answer: 'A is faster than B'"
            translation="Respuesta: 'A es más rápido que B'"
          />
        </div>

        <Rule 
          title="Estrategias para Identificar Contrastes"
          description="Para reconocer contrastes:"
          examples={[
            "Escucha palabras de contraste (but, however, unlike)",
            "Identifica dos ideas opuestas",
            "Compara las características mencionadas",
            "Presta atención a comparaciones"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Los contrastes suelen presentarse en pares - identifica ambas partes.
        </Tip>
      </TheorySection>

      <TheorySection title="Tone (Tono)" icon="🎭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El tono es la actitud o emoción que transmite el hablante a través de su voz y elección de palabras.
        </p>

        <GrammarTable
          caption="Tipos de Tono y Cómo Identificarlos"
          headers={["Tono", "Características", "Palabras Clave", "Ejemplo"]}
          rows={[
            ["Optimista", "Voz alegre, palabras positivas", "Great, wonderful, amazing", "This is amazing!"],
            ["Pesimista", "Voz triste, palabras negativas", "Terrible, awful, disappointing", "This is terrible"],
            ["Neutral", "Voz equilibrada, hechos", "According to, it seems", "According to statistics"],
            ["Crítico", "Voz firme, palabras de juicio", "Wrong, incorrect, mistake", "This is wrong"],
            ["Entusiasta", "Voz emocionada, énfasis", "Fantastic, incredible, love", "I love this!"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Pregunta: '¿Cuál es el tono del hablante?'"
            english="Question: 'What is the speaker's tone?'"
            translation="Pregunta: '¿Cuál es el tono del hablante?'"
          />
          <Example 
            spanish="Audio: '¡Esto es fantástico! Me encanta esta idea'"
            english="Audio: 'This is fantastic! I love this idea'"
            translation="Audio: '¡Esto es fantástico! Me encanta esta idea'"
          />
          <Example 
            spanish="Respuesta: 'Entusiasta y positivo'"
            english="Answer: 'Enthusiastic and positive'"
            translation="Respuesta: 'Entusiasta y positivo'"
          />
        </div>

        <Rule 
          title="Estrategias para Identificar el Tono"
          description="Para reconocer el tono:"
          examples={[
            "Escucha la entonación y ritmo de la voz",
            "Identifica palabras que expresan emociones",
            "Presta atención a exclamaciones o preguntas",
            "Observa el uso de adjetivos descriptivos"
          ]}
        />

        <Tip type="info">
          <strong>Nota:</strong> El tono puede cambiar durante el audio - presta atención a los cambios.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias Generales" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estrategias que funcionan para todos los tipos de comprensión.
        </p>

        <GrammarTable
          caption="Estrategias Universales de Listening"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Beneficio"]}
          rows={[
            ["Pre-lectura", "Leer preguntas antes de escuchar", "Siempre", "Saber qué buscar"],
            ["Predicción", "Predecir contenido basado en contexto", "Antes del audio", "Preparar la mente"],
            ["Toma de notas", "Anotar información clave", "Durante el audio", "Retener información"],
            ["Inferencia", "Deducir información implícita", "Cuando no se escucha claramente", "Completar información"],
            ["Verificación", "Confirmar respuestas después", "Después del audio", "Asegurar precisión"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Antes: Leer preguntas y predecir contenido"
            english="Before: Read questions and predict content"
            translation="Antes: Leer preguntas y predecir contenido"
          />
          <Example 
            spanish="Durante: Tomar notas de información clave"
            english="During: Take notes of key information"
            translation="Durante: Tomar notas de información clave"
          />
          <Example 
            spanish="Después: Verificar respuestas y inferir información"
            english="After: Verify answers and infer information"
            translation="Después: Verificar respuestas y inferir información"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Combina estas estrategias según el tipo de pregunta que necesites responder.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Enfocarse solo en palabras que conoces ❌<br/>
            <strong>Correcto:</strong> Escuchar el mensaje general ✅<br/>
            <em>No te pierdas en palabras desconocidas</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No leer las preguntas antes ❌<br/>
            <strong>Correcto:</strong> Leer preguntas primero ✅<br/>
            <em>Saber qué buscar te ayuda a enfocarte</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Intentar entender cada palabra ❌<br/>
            <strong>Correcto:</strong> Entender la idea general ✅<br/>
            <em>El objetivo es comprensión, no traducción palabra por palabra</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No tomar notas ❌<br/>
            <strong>Correcto:</strong> Anotar información clave ✅<br/>
            <em>Las notas te ayudan a recordar detalles importantes</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Preparación previa"
            description="Siempre prepárate antes de escuchar."
            examples={[
              "Lee las preguntas cuidadosamente",
              "Predice el contenido del audio",
              "Identifica qué tipo de información necesitas",
              "Prepara tu mente para escuchar"
            ]}
          />

          <Rule 
            title="2. Escucha activa"
            description="Mantén tu atención enfocada."
            examples={[
              "No te distraigas con pensamientos internos",
              "Escucha palabras clave y frases importantes",
              "Toma notas de información relevante",
              "Mantén la concentración durante todo el audio"
            ]}
          />

          <Rule 
            title="3. Estrategias específicas"
            description="Usa estrategias diferentes según el tipo de pregunta."
            examples={[
              "Idea principal: enfócate en el tema general",
              "Detalles: busca información específica",
              "Contraste: identifica diferencias y oposiciones",
              "Tono: presta atención a la actitud del hablante"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="Para identificar la ___ (idea principal/detalle), debo escuchar las palabras clave. Para captar ___ (detalles/tono), necesito prestar atención a números y nombres. Para reconocer ___ (contraste/tono), debo escuchar palabras como 'however' y 'but'."
      blanks={[
        { answer: "idea principal" },
        { answer: "detalles" },
        { answer: "contraste" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la mejor estrategia para identificar la idea principal?"
      options={[
        "Escuchar cada palabra cuidadosamente",
        "Enfocarse en palabras clave y el tema general",
        "Tomar notas de todos los detalles",
        "Buscar solo números y fechas"
      ]}
      correctAnswer={1}
      explanation="Para la idea principal, es mejor enfocarse en palabras clave y el tema general, no en detalles específicos."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Debo leer las preguntas antes de escuchar el audio.",
          isTrue: true,
          explanation: "Correcto. Leer las preguntas primero te ayuda a saber qué información buscar."
        },
        {
          text: "Para identificar detalles, debo escuchar solo palabras que conozco.",
          isTrue: false,
          explanation: "Incorrecto. Para detalles, debes escuchar información específica como números, nombres y fechas, aunque no conozcas todas las palabras."
        },
        {
          text: "El tono se identifica prestando atención a la entonación y palabras emocionales.",
          isTrue: true,
          explanation: "Correcto. El tono se reconoce por la entonación, ritmo y palabras que expresan emociones."
        },
        {
          text: "Para contraste, debo buscar palabras como 'however', 'but', 'unlike'.",
          isTrue: true,
          explanation: "Correcto. Estas palabras indican contrastes y diferencias entre ideas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Qué tipo de información busco si la pregunta es 'What is the speaker's attitude'?"
      options={[
        "Main idea",
        "Details",
        "Contrast",
        "Tone"
      ]}
      correctAnswer={3}
      explanation="La pregunta sobre la actitud del hablante se refiere al tono, no a la idea principal, detalles o contraste."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es el error más común en listening comprehension?"
      options={[
        "Leer las preguntas antes",
        "Intentar entender cada palabra",
        "Tomar notas durante el audio",
        "Predecir el contenido"
      ]}
      correctAnswer={1}
      explanation="Intentar entender cada palabra es un error común. Es mejor enfocarse en la comprensión general y la información específica que necesitas."
    />
  ];

  return (
    <TheoryLayout
      title="Types of Understanding: Main Idea, Details, Contrast, Tone"
      description="Domina los diferentes tipos de comprensión auditiva: idea principal, detalles, contraste y tono. Aprende estrategias específicas para cada tipo."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic listening skills", "Understanding of question types"]}
      estimatedTime="70 min"
    />
  );
};

export default ListeningTypesPage;



