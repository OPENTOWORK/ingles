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

const ReportedSpeechPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es el Reported Speech?" icon="💬">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El <strong>reported speech</strong> (discurso indirecto) se usa para reportar o repetir lo que otra persona 
          dijo sin usar sus palabras exactas. Implica cambios en tiempos verbales, pronombres, adverbios de tiempo 
          y lugar, y la estructura de la oración.
        </p>
        
        <QuickReference items={[
          "Reporta lo que otros dijeron",
          "Cambia tiempos verbales",
          "Cambia pronombres y adverbios",
          "Usa reporting verbs",
          "No usa comillas"
        ]} />
      </TheorySection>

      <TheorySection title="Cambios de Tiempos Verbales" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los tiempos verbales cambian hacia el pasado cuando reportamos algo que se dijo en el pasado.
        </p>

        <GrammarTable
          caption="Cambios de Tiempos Verbales"
          headers={["Direct Speech", "Reported Speech", "Ejemplo"]}
          rows={[
            ["Present Simple", "Past Simple", "I work → He said he worked"],
            ["Present Continuous", "Past Continuous", "I am working → He said he was working"],
            ["Present Perfect", "Past Perfect", "I have worked → He said he had worked"],
            ["Past Simple", "Past Perfect", "I worked → He said he had worked"],
            ["Will", "Would", "I will work → He said he would work"],
            ["Can", "Could", "I can work → He said he could work"],
            ["May", "Might", "I may work → He said he might work"],
            ["Must", "Had to", "I must work → He said he had to work"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Dijo: 'Trabajo en una oficina' → Dijo que trabajaba en una oficina"
            english="'I work in an office' → He said he worked in an office"
            translation="Dijo: 'Trabajo en una oficina' → Dijo que trabajaba en una oficina"
          />
          <Example 
            spanish="Dijo: 'Estoy estudiando' → Dijo que estaba estudiando"
            english="'I am studying' → He said he was studying"
            translation="Dijo: 'Estoy estudiando' → Dijo que estaba estudiando"
          />
          <Example 
            spanish="Dijo: 'He terminado' → Dijo que había terminado"
            english="'I have finished' → He said he had finished"
            translation="Dijo: 'He terminado' → Dijo que había terminado"
          />
        </div>

        <Rule 
          title="Regla del 'Backshift'"
          description="Los tiempos verbales se mueven hacia el pasado:"
          examples={[
            "Presente → Pasado",
            "Pasado → Pasado Perfecto",
            "Futuro → Condicional",
            "Modales → Formas pasadas"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Si el reporting verb está en presente (says, tells), no cambies los tiempos verbales.
        </Tip>
      </TheorySection>

      <TheorySection title="Cambios de Pronombres" icon="👤">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los pronombres cambian para reflejar la perspectiva del que reporta.
        </p>

        <GrammarTable
          caption="Cambios de Pronombres"
          headers={["Direct Speech", "Reported Speech", "Explicación"]}
          rows={[
            ["I", "he/she", "Cambia según quien habló"],
            ["you", "I/he/she/they", "Cambia según el contexto"],
            ["my", "his/her", "Posesivo cambia con el pronombre"],
            ["your", "my/his/her", "Posesivo cambia con el contexto"],
            ["we", "they", "Grupo que habló"],
            ["our", "their", "Posesivo del grupo"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Dijo: 'Mi coche está roto' → Dijo que su coche estaba roto"
            english="'My car is broken' → He said his car was broken"
            translation="Dijo: 'Mi coche está roto' → Dijo que su coche estaba roto"
          />
          <Example 
            spanish="Dijo: '¿Puedes ayudarme?' → Preguntó si podía ayudarle"
            english="'Can you help me?' → He asked if I could help him"
            translation="Dijo: '¿Puedes ayudarme?' → Preguntó si podía ayudarle"
          />
          <Example 
            spanish="Dijo: 'Nuestro proyecto está listo' → Dijo que su proyecto estaba listo"
            english="'Our project is ready' → He said their project was ready"
            translation="Dijo: 'Nuestro proyecto está listo' → Dijo que su proyecto estaba listo"
          />
        </div>

        <Rule 
          title="Reglas para Pronombres"
          description="Considera estas reglas:"
          examples={[
            "Cambia según quien habló originalmente",
            "Considera el contexto de la conversación",
            "Mantén la coherencia en todo el reporte",
            "Si no está claro, mantén el pronombre original"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Los pronombres pueden ser confusos. Siempre considera quién dijo qué a quién.
        </Tip>
      </TheorySection>

      <TheorySection title="Cambios de Adverbios" icon="📍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los adverbios de tiempo y lugar cambian para reflejar la nueva perspectiva temporal.
        </p>

        <GrammarTable
          caption="Cambios de Adverbios de Tiempo"
          headers={["Direct Speech", "Reported Speech", "Explicación"]}
          rows={[
            ["now", "then", "Momento actual → Momento pasado"],
            ["today", "that day", "Día actual → Día específico"],
            ["yesterday", "the day before", "Ayer → El día anterior"],
            ["tomorrow", "the next day", "Mañana → El día siguiente"],
            ["last week", "the week before", "Semana pasada → La semana anterior"],
            ["next month", "the following month", "Próximo mes → El mes siguiente"],
            ["here", "there", "Aquí → Allí"],
            ["this", "that", "Este → Ese"],
            ["these", "those", "Estos → Esos"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Dijo: 'Voy ahora' → Dijo que iba entonces"
            english="'I'm going now' → He said he was going then"
            translation="Dijo: 'Voy ahora' → Dijo que iba entonces"
          />
          <Example 
            spanish="Dijo: 'Vine ayer' → Dijo que había venido el día anterior"
            english="'I came yesterday' → He said he had come the day before"
            translation="Dijo: 'Vine ayer' → Dijo que había venido el día anterior"
          />
          <Example 
            spanish="Dijo: 'Estoy aquí' → Dijo que estaba allí"
            english="'I'm here' → He said he was there"
            translation="Dijo: 'Estoy aquí' → Dijo que estaba allí"
          />
        </div>

        <Rule 
          title="Reglas para Adverbios"
          description="Considera estas reglas:"
          examples={[
            "Cambia adverbios de tiempo hacia el pasado",
            "Cambia adverbios de lugar según la perspectiva",
            "Algunos adverbios no cambian (always, never)",
            "El contexto determina si es necesario cambiar"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Si reportas inmediatamente después de que se dijo, algunos cambios pueden no ser necesarios.
        </Tip>
      </TheorySection>

      <TheorySection title="Reporting Verbs" icon="🗣️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Diferentes verbos para reportar según el tipo de declaración.
        </p>

        <GrammarTable
          caption="Reporting Verbs Comunes"
          headers={["Tipo", "Verbos", "Estructura", "Ejemplo"]}
          rows={[
            ["Declaraciones", "say, tell, mention", "say/tell + that", "He said that he was tired"],
            ["Preguntas", "ask, wonder, inquire", "ask + if/whether", "He asked if I was coming"],
            ["Órdenes", "tell, order, command", "tell + to + infinitivo", "He told me to come"],
            ["Consejos", "advise, recommend", "advise + to + infinitivo", "He advised me to study"],
            ["Promesas", "promise, agree", "promise + to + infinitivo", "He promised to help"],
            ["Negativas", "refuse, deny", "refuse + to + infinitivo", "He refused to go"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Dijo que estaba cansado"
            english="He said he was tired"
            translation="Dijo que estaba cansado"
          />
          <Example 
            spanish="Preguntó si venía"
            english="He asked if I was coming"
            translation="Preguntó si venía"
          />
          <Example 
            spanish="Me dijo que viniera"
            english="He told me to come"
            translation="Me dijo que viniera"
          />
          <Example 
            spanish="Me aconsejó estudiar"
            english="He advised me to study"
            translation="Me aconsejó estudiar"
          />
        </div>

        <Rule 
          title="Estructuras con Reporting Verbs"
          description="Diferentes estructuras según el verbo:"
          examples={[
            "say + that + oración",
            "tell + persona + that + oración",
            "ask + if/whether + oración",
            "tell/ask + persona + to + infinitivo"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> 'Tell' siempre necesita un objeto indirecto (tell me, tell him), pero 'say' no.
        </Tip>
      </TheorySection>

      <TheorySection title="Reported Questions" icon="❓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las preguntas reportadas cambian la estructura y usan 'if' o 'whether' para preguntas de sí/no.
        </p>

        <GrammarTable
          caption="Tipos de Preguntas Reportadas"
          headers={["Tipo", "Direct Speech", "Reported Speech"]}
          rows={[
            ["Yes/No", "'Are you coming?'", "He asked if I was coming"],
            ["Yes/No", "'Do you like coffee?'", "He asked whether I liked coffee"],
            ["Wh-", "'Where do you live?'", "He asked where I lived"],
            ["Wh-", "'What time is it?'", "He asked what time it was"],
            ["Wh-", "'How are you?'", "He asked how I was"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Preguntó: '¿Vienes?' → Preguntó si venía"
            english="'Are you coming?' → He asked if I was coming"
            translation="Preguntó: '¿Vienes?' → Preguntó si venía"
          />
          <Example 
            spanish="Preguntó: '¿Dónde vives?' → Preguntó dónde vivía"
            english="'Where do you live?' → He asked where I lived"
            translation="Preguntó: '¿Dónde vives?' → Preguntó dónde vivía"
          />
          <Example 
            spanish="Preguntó: '¿Cómo estás?' → Preguntó cómo estaba"
            english="'How are you?' → He asked how I was"
            translation="Preguntó: '¿Cómo estás?' → Preguntó cómo estaba"
          />
        </div>

        <Rule 
          title="Reglas para Preguntas Reportadas"
          description="Cambios importantes:"
          examples={[
            "No usa signos de interrogación",
            "Usa 'if' o 'whether' para preguntas de sí/no",
            "Mantiene palabras interrogativas (where, what, how)",
            "Cambia a orden de oración afirmativa"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Las preguntas reportadas no usan signos de interrogación ni auxiliares do/does/did.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> No cambiar tiempos verbales ❌<br/>
            <strong>Correcto:</strong> Aplicar backshift ✅<br/>
            <em>He said he is tired. → He said he was tired.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar comillas en reported speech ❌<br/>
            <strong>Correcto:</strong> No usar comillas ✅<br/>
            <em>He said "I am tired". → He said he was tired.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Confundir say y tell ❌<br/>
            <strong>Correcto:</strong> Tell necesita objeto indirecto ✅<br/>
            <em>He told he was tired. → He said he was tired. / He told me he was tired.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Mantener signos de interrogación ❌<br/>
            <strong>Correcto:</strong> Quitar signos de interrogación ✅<br/>
            <em>He asked if I was coming? → He asked if I was coming.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No cambiar pronombres ❌<br/>
            <strong>Correcto:</strong> Cambiar según la perspectiva ✅<br/>
            <em>He said I am tired. → He said he was tired.</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Backshift de tiempos"
            description="Los tiempos verbales se mueven hacia el pasado:"
            examples={[
              "Presente → Pasado",
              "Pasado → Pasado Perfecto",
              "Futuro → Condicional",
              "Excepción: si el reporting verb está en presente"
            ]}
          />

          <Rule 
            title="2. Cambios de perspectiva"
            description="Cambia pronombres y adverbios:"
            examples={[
              "Pronombres según quien habló",
              "Adverbios de tiempo hacia el pasado",
              "Adverbios de lugar según la perspectiva",
              "Considera el contexto"
            ]}
          />

          <Rule 
            title="3. Estructura de preguntas"
            description="Las preguntas reportadas cambian estructura:"
            examples={[
              "Usa 'if' o 'whether' para sí/no",
              "Mantiene palabras interrogativas",
              "Orden de oración afirmativa",
              "Sin signos de interrogación"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete the reported speech: He said: 'I am tired' → He said he _____ tired."
      options={[
        "is",
        "was",
        "will be",
        "has been"
      ]}
      correctAnswer={1}
      explanation="En reported speech, 'am' cambia a 'was' cuando reportamos en pasado."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What is the reported speech of 'I will come tomorrow'?"
      options={[
        "He said he will come tomorrow.",
        "He said he would come the next day.",
        "He said he would come tomorrow.",
        "He said he comes tomorrow."
      ]}
      correctAnswer={1}
      explanation="The correct reported speech changes 'will' to 'would' and 'tomorrow' to 'the next day': 'He said he would come the next day.'"
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "In reported speech, you should use quotation marks to show the exact words.",
          isTrue: false,
          explanation: "Incorrect. Reported speech does not use quotation marks because you are not quoting the exact words, but reporting what was said."
        },
        {
          text: "When reporting questions, you should keep the question mark.",
          isTrue: false,
          explanation: "Incorrect. Reported questions do not use question marks because they become statements in reported speech."
        },
        {
          text: "The verb 'tell' requires an indirect object, but 'say' does not.",
          isTrue: true,
          explanation: "Correct. 'Tell' always needs an indirect object (tell me, tell him), while 'say' can be used without one."
        },
        {
          text: "If the reporting verb is in present tense, you don't need to change the verb tenses in reported speech.",
          isTrue: true,
          explanation: "Correct. When the reporting verb is in present tense (says, tells), the verb tenses in reported speech usually remain the same."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the correct reported speech of 'Where do you live?'"
      options={[
        "He asked where do I live?",
        "He asked where I lived.",
        "He asked where did I live?",
        "He asked where I live."
      ]}
      correctAnswer={1}
      explanation="The correct reported speech is 'He asked where I lived' - it uses the word order of a statement and changes the tense to past."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which sentence correctly reports 'I can't come to the party'?"
      options={[
        "He said he can't come to the party.",
        "He said he couldn't come to the party.",
        "He said he won't come to the party.",
        "He said he doesn't come to the party."
      ]}
      correctAnswer={1}
      explanation="The correct reported speech changes 'can't' to 'couldn't': 'He said he couldn't come to the party.'"
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "'Today' changes to 'that day' in reported speech.",
          isTrue: true,
          explanation: "Correcto. Los adverbios de tiempo cambian: today → that day, yesterday → the day before."
        },
        {
          text: "We use 'if' or 'whether' for yes/no questions in reported speech.",
          isTrue: true,
          explanation: "Correcto. 'Are you coming?' → 'He asked if/whether I was coming.'"
        },
        {
          text: "Modal verbs never change in reported speech.",
          isTrue: false,
          explanation: "Incorrecto. Algunos modales cambian: will → would, can → could, may → might."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'I will help you' → He said he _____ help me."
      options={[
        "will",
        "would",
        "can",
        "could"
      ]}
      correctAnswer={1}
      explanation="'Will' cambia a 'would' en reported speech: 'He said he would help me.'"
    />,

    <MultipleChoiceExercise
      key="8"
      question="Transform: 'Don't be late!' → She told me ______."
      options={[
        "don't be late",
        "not to be late",
        "to not be late",
        "not be late"
      ]}
      correctAnswer={1}
      explanation="Los imperativos negativos se reportan con 'told + object + not to + infinitive'."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Here' changes to 'there' in reported speech.",
          isTrue: true,
          explanation: "Correcto. Los adverbios de lugar cambian según la perspectiva: here → there."
        },
        {
          text: "Present Perfect changes to Past Perfect in reported speech.",
          isTrue: true,
          explanation: "Correcto. 'I have finished' → 'He said he had finished.'"
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'Are you ready?' → She asked me ______."
      options={[
        "am I ready",
        "if I was ready",
        "if am I ready",
        "was I ready"
      ]}
      correctAnswer={1}
      explanation="Las preguntas sí/no se reportan con 'if/whether' + orden afirmativo: 'if I was ready'."
    />
  ];

  return (
    <TheoryLayout
      title="Reported Speech"
      description="Domina el discurso indirecto en inglés. Aprende a reportar lo que otros dijeron, cambiar tiempos verbales y usar reporting verbs correctamente."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["All verb tenses", "Question forms", "Modal verbs"]}
      estimatedTime="85 min"
    />
  );
};

export default ReportedSpeechPage;