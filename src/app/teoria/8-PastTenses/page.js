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

const PastTensesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Past Tenses?" icon="⏰">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>past tenses</strong> (tiempos pasados) son formas verbales que se usan para hablar de acciones, 
          estados y situaciones que ocurrieron en el pasado. Hay varios tiempos pasados en inglés, cada uno con usos específicos.
        </p>
        
        <QuickReference items={[
          "Past Simple: acciones completadas en el pasado",
          "Past Continuous: acciones en progreso en el pasado",
          "Past Perfect: acciones que ocurrieron antes que otra",
          "Past Perfect Continuous: duración antes de otra acción",
          "La elección del tiempo depende del contexto"
        ]} />
      </TheorySection>

      <TheorySection title="Past Simple (Pasado Simple)" icon="📅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para hablar de acciones completadas en un tiempo específico del pasado.
        </p>

        <GrammarTable
          caption="Estructura del Past Simple"
          headers={["Tipo", "Estructura", "Ejemplo"]}
          rows={[
            ["Afirmativa", "Sujeto + verbo en pasado", "I worked yesterday"],
            ["Negativa", "Sujeto + didn't + verbo infinitivo", "I didn't work yesterday"],
            ["Interrogativa", "Did + sujeto + verbo infinitivo", "Did you work yesterday?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Ayer trabajé hasta tarde"
            english="Yesterday I worked until late"
            translation="Ayer trabajé hasta tarde"
          />
          <Example 
            spanish="Ella no fue a la fiesta"
            english="She didn't go to the party"
            translation="Ella no fue a la fiesta"
          />
          <Example 
            spanish="¿Viste la película?"
            english="Did you see the movie?"
            translation="¿Viste la película?"
          />
        </div>

        <Rule 
          title="Usos del Past Simple"
          description="Cuándo usar el Past Simple:"
          examples={[
            "Acciones completadas: I finished my homework",
            "Eventos específicos: She was born in 1990",
            "Secuencia de eventos: I woke up, had breakfast, and left",
            "Con tiempo específico: I saw him last week"
          ]}
        />

        <Tip type="info">
          <strong>Verbos irregulares:</strong> Muchos verbos en inglés son irregulares en pasado (go → went, see → saw, be → was/were). 
          Es importante memorizarlos.
        </Tip>
      </TheorySection>

      <TheorySection title="Past Continuous (Pasado Continuo)" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para hablar de acciones que estaban en progreso en un momento específico del pasado.
        </p>

        <GrammarTable
          caption="Estructura del Past Continuous"
          headers={["Persona", "Afirmativa", "Negativa", "Interrogativa"]}
          rows={[
            ["I/He/She/It", "was working", "wasn't working", "Was I working?"],
            ["You/We/They", "were working", "weren't working", "Were you working?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="A las 8 PM estaba estudiando"
            english="At 8 PM I was studying"
            translation="A las 8 PM estaba estudiando"
          />
          <Example 
            spanish="Los niños estaban jugando cuando llegué"
            english="The children were playing when I arrived"
            translation="Los niños estaban jugando cuando llegué"
          />
          <Example 
            spanish="¿Qué estabas haciendo ayer?"
            english="What were you doing yesterday?"
            translation="¿Qué estabas haciendo ayer?"
          />
        </div>

        <Rule 
          title="Usos del Past Continuous"
          description="Cuándo usar el Past Continuous:"
          examples={[
            "Acciones en progreso: I was reading when you called",
            "Contexto para otra acción: While I was cooking, the phone rang",
            "Descripción de escenas: The sun was shining, birds were singing",
            "Acciones interrumpidas: I was sleeping when the alarm went off"
          ]}
        />

        <Tip type="success">
          <strong>Conectores comunes:</strong> "while", "when", "as", "at that time", "at that moment".
        </Tip>
      </TheorySection>

      <TheorySection title="Past Perfect (Pasado Perfecto)" icon="✅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para hablar de acciones que ocurrieron antes que otra acción en el pasado.
        </p>

        <GrammarTable
          caption="Estructura del Past Perfect"
          headers={["Tipo", "Estructura", "Ejemplo"]}
          rows={[
            ["Afirmativa", "Sujeto + had + participio pasado", "I had finished my work"],
            ["Negativa", "Sujeto + hadn't + participio pasado", "I hadn't finished my work"],
            ["Interrogativa", "Had + sujeto + participio pasado", "Had you finished your work?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Ya había terminado cuando llegaste"
            english="I had already finished when you arrived"
            translation="Ya había terminado cuando llegaste"
          />
          <Example 
            spanish="No había visto esa película antes"
            english="I hadn't seen that movie before"
            translation="No había visto esa película antes"
          />
          <Example 
            spanish="¿Habías estado en París antes?"
            english="Had you been to Paris before?"
            translation="¿Habías estado en París antes?"
          />
        </div>

        <Rule 
          title="Usos del Past Perfect"
          description="Cuándo usar el Past Perfect:"
          examples={[
            "Acción anterior: I had eaten before I went to the party",
            "Experiencias previas: She had never seen snow before",
            "Resultado en el pasado: I was tired because I had worked all day",
            "Con 'by the time': By the time we arrived, they had left"
          ]}
        />

        <Tip type="warning">
          <strong>Orden de eventos:</strong> Past Perfect = acción más antigua, Past Simple = acción más reciente.
        </Tip>
      </TheorySection>

      <TheorySection title="Comparación de Tiempos Pasados" icon="⚖️">
        <GrammarTable
          caption="Cuándo usar cada tiempo pasado"
          headers={["Tiempo", "Cuándo usarlo", "Ejemplo"]}
          rows={[
            ["Past Simple", "Acciones completadas", "I worked yesterday"],
            ["Past Continuous", "Acciones en progreso", "I was working at 3 PM"],
            ["Past Perfect", "Acción anterior a otra", "I had worked before I left"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Llegué a casa a las 6 PM (acción completada)"
            english="I arrived home at 6 PM"
            translation="Llegué a casa a las 6 PM"
          />
          <Example 
            spanish="Estaba cocinando cuando llegaste (acción en progreso)"
            english="I was cooking when you arrived"
            translation="Estaba cocinando cuando llegaste"
          />
          <Example 
            spanish="Ya había cocinado cuando llegaste (acción anterior)"
            english="I had already cooked when you arrived"
            translation="Ya había cocinado cuando llegaste"
          />
        </div>
      </TheorySection>

      <TheorySection title="Verbos Irregulares Importantes" icon="📚">
        <GrammarTable
          caption="Verbos Irregulares Comunes"
          headers={["Infinitivo", "Pasado Simple", "Participio Pasado", "Significado"]}
          rows={[
            ["be", "was/were", "been", "ser/estar"],
            ["have", "had", "had", "tener"],
            ["do", "did", "done", "hacer"],
            ["go", "went", "gone", "ir"],
            ["see", "saw", "seen", "ver"],
            ["take", "took", "taken", "tomar"],
            ["come", "came", "come", "venir"],
            ["get", "got", "gotten", "obtener"],
            ["make", "made", "made", "hacer"],
            ["know", "knew", "known", "saber"]
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Los verbos irregulares son fundamentales. Practica los más comunes hasta memorizarlos completamente.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I did went to school" ❌<br/>
            <strong>Correcto:</strong> "I went to school" ✅<br/>
            <em>Con 'did' usamos el infinitivo, no el pasado</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I was go to the store" ❌<br/>
            <strong>Correcto:</strong> "I was going to the store" ✅<br/>
            <em>Past Continuous usa 'was/were + ing'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I had went to Paris" ❌<br/>
            <strong>Correcto:</strong> "I had gone to Paris" ✅<br/>
            <em>Past Perfect usa 'had + participio pasado'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Yesterday I have seen him" ❌<br/>
            <strong>Correcto:</strong> "Yesterday I saw him" ✅<br/>
            <em>Con tiempo específico del pasado usamos Past Simple</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Palabras Clave" icon="🔑">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Past Simple:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              yesterday, last week, ago, in 2020, when I was young, once upon a time
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Past Continuous:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              while, when, at that time, at that moment, during, as
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Past Perfect:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              already, just, never, before, by the time, until
            </p>
          </div>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'Yesterday I ___ to the store.'"
      options={[
        "go",
        "went",
        "was going",
        "have gone"
      ]}
      correctAnswer={1}
      explanation="'Went' es la forma correcta del pasado simple de 'go' para acciones completadas en el pasado."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la forma correcta para completar: 'I ___ my homework when you called'?"
      options={[
        "did",
        "was doing",
        "had done",
        "have done"
      ]}
      correctAnswer={1}
      explanation="Para acciones en progreso en el pasado usamos Past Continuous: 'I was doing my homework when you called'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'I did went to school' is correct.",
          isTrue: false,
          explanation: "Incorrecto. Con 'did' usamos el infinitivo: 'I went to school' o 'I did go to school' (para énfasis)."
        },
        {
          text: "'I had already eaten when she arrived' shows the correct order of events.",
          isTrue: true,
          explanation: "Correcto. Past Perfect muestra la acción más antigua (had eaten), Past Simple la más reciente (arrived)."
        },
        {
          text: "'I was working yesterday' is correct for a completed action.",
          isTrue: false,
          explanation: "Incorrecto. Para acciones completadas usamos Past Simple: 'I worked yesterday'. Past Continuous es para acciones en progreso."
        },
        {
          text: "'While I was cooking, the phone rang' is correct.",
          isTrue: true,
          explanation: "Correcto. 'While' introduce una acción en progreso (Past Continuous), la otra acción es puntual (Past Simple)."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la forma correcta para completar: 'She ___ never ___ to Japan before last year'?"
      options={[
        "was, gone",
        "had, been",
        "did, go",
        "has, been"
      ]}
      correctAnswer={1}
      explanation="Para experiencias que ocurrieron antes de otra acción en el pasado usamos Past Perfect: 'She had never been to Japan before last year'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la forma correcta para completar: 'By the time we arrived, the movie ___'?"
      options={[
        "started",
        "was starting",
        "had started",
        "has started"
      ]}
      correctAnswer={2}
      explanation="'By the time' indica que una acción ocurrió antes que otra en el pasado, por lo que usamos Past Perfect: 'had started'."
    />,

    <MultipleChoiceExercise
      key="6"
      question="Complete: 'While I ___ TV, the phone ___'"
      options={[
        "watched, rang",
        "was watching, rang",
        "was watching, was ringing",
        "watched, was ringing"
      ]}
      correctAnswer={1}
      explanation="Una acción en progreso (was watching) fue interrumpida por otra acción (rang)."
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Cuál es correcto?"
      options={[
        "I have seen him yesterday",
        "I saw him yesterday",
        "I had seen him yesterday",
        "I was seeing him yesterday"
      ]}
      correctAnswer={1}
      explanation="Con 'yesterday' (tiempo específico pasado) usamos Past Simple, no Present Perfect."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Complete: 'She told me she ___ never ___ such a beautiful place.'"
      options={[
        "has, seen",
        "had, seen",
        "was, seeing",
        "did, see"
      ]}
      correctAnswer={1}
      explanation="En reported speech, Present Perfect se convierte en Past Perfect: 'had never seen'."
    />,

    <MultipleChoiceExercise
      key="9"
      question="¿Cuál expresa una acción habitual en el pasado?"
      options={[
        "I went to school every day",
        "I used to go to school every day",
        "I would go to school every day",
        "All of the above"
      ]}
      correctAnswer={3}
      explanation="Las tres formas pueden expresar hábitos pasados, con diferentes matices."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'I ___ for two hours when you called.'"
      options={[
        "studied",
        "was studying",
        "had been studying",
        "have been studying"
      ]}
      correctAnswer={2}
      explanation="'For two hours' + acción interrumpida requiere Past Perfect Continuous."
    />
  ];

  return (
    <TheoryLayout
      title="Past Tenses"
      description="Domina todos los tiempos pasados del inglés: Simple, Continuous y Perfect. Aprende cuándo usar cada uno y practica con verbos irregulares."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Present Tenses", "Verb to be", "Basic vocabulary"]}
      estimatedTime="70 min"
    />
  );
};

export default PastTensesPage;

