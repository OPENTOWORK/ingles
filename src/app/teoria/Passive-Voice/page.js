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

const PassiveVoicePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es la Passive Voice?" icon="🔄">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La <strong>passive voice</strong> (voz pasiva) es una estructura gramatical donde el objeto de la acción 
          se convierte en el sujeto de la oración. Se usa cuando el agente (quien realiza la acción) es desconocido, 
          irrelevante o cuando queremos enfatizar la acción en lugar de quién la realiza.
        </p>
        
        <QuickReference items={[
          "Cambia el foco de la oración",
          "Objeto se convierte en sujeto",
          "Usa 'be' + participio pasado",
          "Agente opcional con 'by'",
          "Común en textos académicos"
        ]} />
      </TheorySection>

      <TheorySection title="Estructura Básica" icon="🔧">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La voz pasiva se forma con el verbo 'be' + participio pasado del verbo principal.
        </p>

        <GrammarTable
          caption="Estructura de la Voz Pasiva"
          headers={["Elemento", "Función", "Ejemplo"]}
          rows={[
            ["Sujeto", "Objeto de la acción activa", "The book"],
            ["Verbo 'be'", "Concuerda con el tiempo", "is/was/will be"],
            ["Participio pasado", "Verbo principal", "written"],
            ["Agente (opcional)", "Quien realiza la acción", "by the author"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="El libro fue escrito por el autor"
            english="The book was written by the author"
            translation="El libro fue escrito por el autor"
          />
          <Example 
            spanish="La casa es construida por los trabajadores"
            english="The house is being built by the workers"
            translation="La casa es construida por los trabajadores"
          />
          <Example 
            spanish="El proyecto será terminado mañana"
            english="The project will be finished tomorrow"
            translation="El proyecto será terminado mañana"
          />
        </div>

        <Rule 
          title="Formación Básica"
          description="Para formar la voz pasiva:"
          examples={[
            "Identifica el objeto de la oración activa",
            "Conviértelo en sujeto de la pasiva",
            "Usa 'be' en el tiempo apropiado",
            "Añade el participio pasado del verbo"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> El agente (quien realiza la acción) es opcional en la voz pasiva.
        </Tip>
      </TheorySection>

      <TheorySection title="Voz Pasiva en Diferentes Tiempos" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La voz pasiva se puede usar en todos los tiempos verbales.
        </p>

        <GrammarTable
          caption="Voz Pasiva en Diferentes Tiempos"
          headers={["Tiempo", "Estructura", "Ejemplo"]}
          rows={[
            ["Presente Simple", "am/is/are + participio", "The letter is written"],
            ["Pasado Simple", "was/were + participio", "The letter was written"],
            ["Futuro Simple", "will be + participio", "The letter will be written"],
            ["Presente Perfecto", "have/has been + participio", "The letter has been written"],
            ["Pasado Perfecto", "had been + participio", "The letter had been written"],
            ["Presente Continuo", "am/is/are being + participio", "The letter is being written"],
            ["Pasado Continuo", "was/were being + participio", "The letter was being written"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="La carta es escrita (presente)"
            english="The letter is written"
            translation="La carta es escrita"
          />
          <Example 
            spanish="La carta fue escrita ayer (pasado)"
            english="The letter was written yesterday"
            translation="La carta fue escrita ayer"
          />
          <Example 
            spanish="La carta será escrita mañana (futuro)"
            english="The letter will be written tomorrow"
            translation="La carta será escrita mañana"
          />
          <Example 
            spanish="La carta ha sido escrita (perfecto)"
            english="The letter has been written"
            translation="La carta ha sido escrita"
          />
        </div>

        <Rule 
          title="Concordancia del Verbo 'Be'"
          description="El verbo 'be' debe concordar con:"
          examples={[
            "El sujeto (singular/plural)",
            "El tiempo verbal",
            "La persona (1ª, 2ª, 3ª)",
            "El aspecto (simple, continuo, perfecto)"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Practica la voz pasiva en diferentes tiempos para dominarla completamente.
        </Tip>
      </TheorySection>

      <TheorySection title="Cuándo Usar la Voz Pasiva" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Hay situaciones específicas donde la voz pasiva es más apropiada que la activa.
        </p>

        <GrammarTable
          caption="Situaciones para Usar Voz Pasiva"
          headers={["Situación", "Razón", "Ejemplo"]}
          rows={[
            ["Agente desconocido", "No sabemos quién hizo la acción", "My car was stolen"],
            ["Agente irrelevante", "Quién lo hizo no importa", "English is spoken here"],
            ["Enfoque en la acción", "La acción es más importante", "The building was destroyed"],
            ["Evitar responsabilidad", "No queremos mencionar quién", "Mistakes were made"],
            ["Textos académicos", "Estilo formal e impersonal", "The data was analyzed"],
            ["Procesos generales", "Descripción de procesos", "Coffee is grown in Brazil"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Mi coche fue robado (no sabemos quién)"
            english="My car was stolen"
            translation="Mi coche fue robado"
          />
          <Example 
            spanish="Se habla inglés aquí (no importa quién)"
            english="English is spoken here"
            translation="Se habla inglés aquí"
          />
          <Example 
            spanish="El edificio fue destruido (enfoque en la acción)"
            english="The building was destroyed"
            translation="El edificio fue destruido"
          />
        </div>

        <Rule 
          title="Ventajas de la Voz Pasiva"
          description="La voz pasiva es útil para:"
          examples={[
            "Crear un tono más formal",
            "Enfocarse en el resultado",
            "Evitar mencionar el agente",
            "Escribir textos académicos"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> En textos académicos y científicos, la voz pasiva es muy común porque suena más objetiva.
        </Tip>
      </TheorySection>

      <TheorySection title="Voz Pasiva con Dos Objetos" icon="📦">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Algunos verbos pueden tener dos objetos (directo e indirecto). En la voz pasiva, cualquiera puede ser el sujeto.
        </p>

        <GrammarTable
          caption="Verbos con Dos Objetos"
          headers={["Verbo", "Oración Activa", "Voz Pasiva 1", "Voz Pasiva 2"]}
          rows={[
            ["give", "He gave me a book", "I was given a book", "A book was given to me"],
            ["send", "She sent him an email", "He was sent an email", "An email was sent to him"],
            ["show", "They showed us the photos", "We were shown the photos", "The photos were shown to us"],
            ["tell", "She told me the truth", "I was told the truth", "The truth was told to me"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me dieron un libro"
            english="I was given a book"
            translation="Me dieron un libro"
          />
          <Example 
            spanish="Un libro me fue dado"
            english="A book was given to me"
            translation="Un libro me fue dado"
          />
          <Example 
            spanish="Nos mostraron las fotos"
            english="We were shown the photos"
            translation="Nos mostraron las fotos"
          />
        </div>

        <Rule 
          title="Elección del Sujeto"
          description="Para elegir qué objeto usar como sujeto:"
          examples={[
            "Objeto indirecto: más natural en conversación",
            "Objeto directo: más formal",
            "Considera el contexto",
            "Mantén la coherencia del texto"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Cuando usas el objeto directo como sujeto, añade 'to' o 'for' antes del objeto indirecto.
        </Tip>
      </TheorySection>

      <TheorySection title="Voz Pasiva con Modales" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los verbos modales también pueden usarse en voz pasiva.
        </p>

        <GrammarTable
          caption="Voz Pasiva con Modales"
          headers={["Modal", "Estructura", "Ejemplo"]}
          rows={[
            ["can", "can be + participio", "This can be done"],
            ["could", "could be + participio", "This could be done"],
            ["must", "must be + participio", "This must be done"],
            ["should", "should be + participio", "This should be done"],
            ["may", "may be + participio", "This may be done"],
            ["might", "might be + participio", "This might be done"],
            ["have to", "have to be + participio", "This has to be done"],
            ["be going to", "be going to be + participio", "This is going to be done"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Esto puede ser hecho"
            english="This can be done"
            translation="Esto puede ser hecho"
          />
          <Example 
            spanish="Esto debe ser terminado"
            english="This must be finished"
            translation="Esto debe ser terminado"
          />
          <Example 
            spanish="Esto debería ser considerado"
            english="This should be considered"
            translation="Esto debería ser considerado"
          />
        </div>

        <Rule 
          title="Estructura con Modales"
          description="Para formar la voz pasiva con modales:"
          examples={[
            "Modal + be + participio pasado",
            "No cambia según la persona",
            "Mantiene el significado del modal",
            "Agente opcional con 'by'"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> La voz pasiva con modales es muy útil para expresar obligaciones, posibilidades y consejos.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Olvidar el verbo 'be' ❌<br/>
            <strong>Correcto:</strong> Incluir 'be' en el tiempo apropiado ✅<br/>
            <em>The house built yesterday. → The house was built yesterday.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar forma incorrecta del participio ❌<br/>
            <strong>Correcto:</strong> Usar participio pasado correcto ✅<br/>
            <em>The letter was write. → The letter was written.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Concordancia incorrecta de 'be' ❌<br/>
            <strong>Correcto:</strong> 'Be' debe concordar con el sujeto ✅<br/>
            <em>The letters was sent. → The letters were sent.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar voz pasiva innecesariamente ❌<br/>
            <strong>Correcto:</strong> Usar voz activa cuando es más clara ✅<br/>
            <em>The teacher was hit by the student. → The student hit the teacher.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Confundir 'by' y 'with' ❌<br/>
            <strong>Correcto:</strong> 'By' para agente, 'with' para instrumento ✅<br/>
            <em>The door was opened with a key by John. → The door was opened by John with a key.</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Estructura básica"
            description="La voz pasiva siempre incluye:"
            examples={[
              "Sujeto (objeto de la acción activa)",
              "Verbo 'be' en tiempo apropiado",
              "Participio pasado del verbo principal",
              "Agente opcional con 'by'"
            ]}
          />

          <Rule 
            title="2. Concordancia"
            description="El verbo 'be' debe concordar:"
            examples={[
              "Con el sujeto (singular/plural)",
              "Con el tiempo verbal",
              "Con la persona",
              "Con el aspecto (simple, continuo, perfecto)"
            ]}
          />

          <Rule 
            title="3. Cuándo usar"
            description="Usa voz pasiva cuando:"
            examples={[
              "El agente es desconocido",
              "El agente es irrelevante",
              "Quieres enfocarte en la acción",
              "Escribes textos académicos"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="The house ___ (build) last year. English ___ (speak) all over the world."
      blanks={[
        { answer: "was built" },
        { answer: "is spoken" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="What is the passive voice structure?"
      options={[
        "Subject + verb + object",
        "Subject + be + past participle",
        "Object + verb + subject",
        "Be + past participle + subject"
      ]}
      correctAnswer={1}
      explanation="The passive voice structure is: Subject + be (in appropriate tense) + past participle + (by + agent)."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "The passive voice is used when the agent (who does the action) is unknown or unimportant.",
          isTrue: true,
          explanation: "Correct. Passive voice is commonly used when we don't know who performed the action or when it's not important."
        },
        {
          text: "In passive voice, the verb 'be' must agree with the subject in number and tense.",
          isTrue: true,
          explanation: "Correct. The verb 'be' must agree with the subject (singular/plural) and be in the appropriate tense."
        },
        {
          text: "You can only use the direct object as the subject in passive voice.",
          isTrue: false,
          explanation: "Incorrect. With verbs that have two objects (direct and indirect), either can become the subject of the passive sentence."
        },
        {
          text: "The agent is always required in passive voice sentences.",
          isTrue: false,
          explanation: "Incorrect. The agent (with 'by') is optional in passive voice. It's only included when it's relevant or known."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which sentence is in passive voice?"
      options={[
        "The teacher gave the students homework.",
        "The students were given homework by the teacher.",
        "The students gave homework to the teacher.",
        "The teacher is giving homework to students."
      ]}
      correctAnswer={1}
      explanation="'The students were given homework by the teacher' is passive voice because the object (students) becomes the subject, and it uses 'were given' (be + past participle)."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What is the correct passive form of 'They will finish the project tomorrow'?"
      options={[
        "The project will be finish tomorrow.",
        "The project will be finished tomorrow.",
        "The project will finish tomorrow.",
        "The project will have been finished tomorrow."
      ]}
      correctAnswer={1}
      explanation="The correct passive form is 'The project will be finished tomorrow' using 'will be' + past participle 'finished'."
    />
  ];

  return (
    <TheoryLayout
      title="Passive Voice"
      description="Domina la voz pasiva en inglés. Aprende a cambiar el foco de la oración, expresar acciones sin agente y usar la voz pasiva en todos los tiempos."
      level="B1-B2-C1"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["All verb tenses", "Past participles", "Modal verbs"]}
      estimatedTime="80 min"
    />
  );
};

export default PassiveVoicePage;