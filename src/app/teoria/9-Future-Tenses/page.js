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

const FutureTensesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Future Tenses?" icon="🔮">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>future tenses</strong> (tiempos futuros) son formas verbales que se usan para hablar de acciones, 
          eventos y situaciones que ocurrirán en el futuro. En inglés hay varias formas de expresar el futuro, cada una con usos específicos.
        </p>
        
        <QuickReference items={[
          "Will: decisiones espontáneas, predicciones",
          "Going to: planes, intenciones, evidencia",
          "Present Continuous: planes fijos, arreglos",
          "Present Simple: horarios, programas",
          "Future Continuous: acciones en progreso futuras"
        ]} />
      </TheorySection>

      <TheorySection title="Will (Futuro Simple)" icon="✨">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para decisiones espontáneas, predicciones, promesas y ofrecimientos.
        </p>

        <GrammarTable
          caption="Estructura de Will"
          headers={["Tipo", "Estructura", "Ejemplo"]}
          rows={[
            ["Afirmativa", "Sujeto + will + verbo infinitivo", "I will help you"],
            ["Negativa", "Sujeto + won't + verbo infinitivo", "I won't be late"],
            ["Interrogativa", "Will + sujeto + verbo infinitivo", "Will you come tomorrow?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Te ayudaré con tu tarea"
            english="I will help you with your homework"
            translation="Te ayudaré con tu tarea"
          />
          <Example 
            spanish="Creo que lloverá mañana"
            english="I think it will rain tomorrow"
            translation="Creo que lloverá mañana"
          />
          <Example 
            spanish="¿Vendrás a la fiesta?"
            english="Will you come to the party?"
            translation="¿Vendrás a la fiesta?"
          />
        </div>

        <Rule 
          title="Usos de Will"
          description="Cuándo usar Will:"
          examples={[
            "Decisiones espontáneas: I'll have a coffee, please",
            "Predicciones: It will be sunny tomorrow",
            "Promesas: I will call you later",
            "Ofrecimientos: I'll help you with that"
          ]}
        />

        <Tip type="info">
          <strong>Contracciones:</strong> "I will" = "I'll", "you will" = "you'll", "will not" = "won't".
        </Tip>
      </TheorySection>

      <TheorySection title="Going to (Futuro con Intención)" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para planes e intenciones, y para predicciones basadas en evidencia presente.
        </p>

        <GrammarTable
          caption="Estructura de Going to"
          headers={["Tipo", "Estructura", "Ejemplo"]}
          rows={[
            ["Afirmativa", "Sujeto + am/is/are + going to + verbo", "I am going to study"],
            ["Negativa", "Sujeto + am/is/are + not + going to + verbo", "I am not going to go"],
            ["Interrogativa", "Am/Is/Are + sujeto + going to + verbo", "Are you going to come?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Voy a estudiar medicina"
            english="I am going to study medicine"
            translation="Voy a estudiar medicina"
          />
          <Example 
            spanish="Mira esas nubes, va a llover"
            english="Look at those clouds, it's going to rain"
            translation="Mira esas nubes, va a llover"
          />
          <Example 
            spanish="¿Vas a venir a la reunión?"
            english="Are you going to come to the meeting?"
            translation="¿Vas a venir a la reunión?"
          />
        </div>

        <Rule 
          title="Usos de Going to"
          description="Cuándo usar Going to:"
          examples={[
            "Planes e intenciones: I'm going to buy a new car",
            "Predicciones con evidencia: Look! It's going to rain",
            "Decisiones previas: I'm going to visit my parents",
            "Preparativos: We're going to have a party"
          ]}
        />

        <Tip type="warning">
          <strong>Diferencia con Will:</strong> "Going to" para planes previos, "will" para decisiones espontáneas.
        </Tip>
      </TheorySection>

      <TheorySection title="Present Continuous (Futuro con Arreglos)" icon="📅">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para planes fijos y arreglos ya confirmados en el futuro.
        </p>

        <GrammarTable
          caption="Present Continuous para Futuro"
          headers={["Tipo", "Estructura", "Ejemplo"]}
          rows={[
            ["Afirmativa", "Sujeto + am/is/are + verbo + ing", "I am meeting my boss tomorrow"],
            ["Negativa", "Sujeto + am/is/are + not + verbo + ing", "I am not working next week"],
            ["Interrogativa", "Am/Is/Are + sujeto + verbo + ing", "Are you leaving tonight?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Mañana me reúno con el jefe"
            english="Tomorrow I am meeting with my boss"
            translation="Mañana me reúno con el jefe"
          />
          <Example 
            spanish="Nos vamos de vacaciones el viernes"
            english="We are going on vacation on Friday"
            translation="Nos vamos de vacaciones el viernes"
          />
          <Example 
            spanish="¿Cuándo te vas?"
            english="When are you leaving?"
            translation="¿Cuándo te vas?"
          />
        </div>

        <Rule 
          title="Usos del Present Continuous (Futuro)"
          description="Cuándo usar Present Continuous para futuro:"
          examples={[
            "Arreglos confirmados: I'm seeing the doctor at 3 PM",
            "Planes fijos: We're flying to Paris next month",
            "Eventos organizados: The concert is starting at 8 PM",
            "Compromisos: I'm having dinner with friends tonight"
          ]}
        />

        <Tip type="success">
          <strong>Indicadores de tiempo:</strong> "tomorrow", "next week", "tonight", "at 3 PM", "on Friday".
        </Tip>
      </TheorySection>

      <TheorySection title="Present Simple (Futuro con Horarios)" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para horarios fijos, programas y eventos que están en un calendario.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="El tren sale a las 6 PM"
            english="The train leaves at 6 PM"
            translation="El tren sale a las 6 PM"
          />
          <Example 
            spanish="Las clases empiezan en septiembre"
            english="Classes start in September"
            translation="Las clases empiezan en septiembre"
          />
          <Example 
            spanish="¿A qué hora llega el avión?"
            english="What time does the plane arrive?"
            translation="¿A qué hora llega el avión?"
          />
        </div>

        <Rule 
          title="Usos del Present Simple (Futuro)"
          description="Cuándo usar Present Simple para futuro:"
          examples={[
            "Transporte: The bus leaves at 8 AM",
            "Horarios: The store opens at 9 AM",
            "Programas: The movie starts at 7 PM",
            "Eventos oficiales: The conference begins on Monday"
          ]}
        />

        <Tip type="info">
          <strong>Verbos comunes:</strong> "start", "begin", "finish", "end", "open", "close", "leave", "arrive", "depart".
        </Tip>
      </TheorySection>

      <TheorySection title="Future Continuous (Futuro Continuo)" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usa para acciones que estarán en progreso en un momento específico del futuro.
        </p>

        <GrammarTable
          caption="Estructura del Future Continuous"
          headers={["Tipo", "Estructura", "Ejemplo"]}
          rows={[
            ["Afirmativa", "Sujeto + will be + verbo + ing", "I will be working"],
            ["Negativa", "Sujeto + won't be + verbo + ing", "I won't be sleeping"],
            ["Interrogativa", "Will + sujeto + be + verbo + ing", "Will you be studying?"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="A las 8 PM estaré trabajando"
            english="At 8 PM I will be working"
            translation="A las 8 PM estaré trabajando"
          />
          <Example 
            spanish="¿Estarás estudiando esta noche?"
            english="Will you be studying tonight?"
            translation="¿Estarás estudiando esta noche?"
          />
          <Example 
            spanish="No estaré durmiendo a esa hora"
            english="I won't be sleeping at that time"
            translation="No estaré durmiendo a esa hora"
          />
        </div>

        <Rule 
          title="Usos del Future Continuous"
          description="Cuándo usar Future Continuous:"
          examples={[
            "Acciones en progreso futuras: I'll be studying at 3 PM",
            "Preguntas sobre planes: Will you be working tomorrow?",
            "Acciones como cortesía: I'll be waiting for you",
            "Predicciones sobre el progreso: This time next year I'll be living in London"
          ]}
        />

        <Tip type="success">
          <strong>Indicadores:</strong> "at 3 PM", "this time tomorrow", "next year at this time".
        </Tip>
      </TheorySection>

      <TheorySection title="Comparación de Formas Futuras" icon="⚖️">
        <GrammarTable
          caption="Cuándo usar cada forma futura"
          headers={["Forma", "Uso", "Ejemplo"]}
          rows={[
            ["Will", "Decisiones espontáneas, predicciones", "I'll help you"],
            ["Going to", "Planes e intenciones", "I'm going to study"],
            ["Present Continuous", "Arreglos fijos", "I'm meeting her tomorrow"],
            ["Present Simple", "Horarios y programas", "The train leaves at 6 PM"],
            ["Future Continuous", "Acciones en progreso futuras", "I'll be working at 3 PM"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Te ayudo (decisión espontánea)"
            english="I'll help you"
            translation="Te ayudo"
          />
          <Example 
            spanish="Voy a ayudarte (plan previo)"
            english="I'm going to help you"
            translation="Voy a ayudarte"
          />
          <Example 
            spanish="Me reúno contigo mañana (arreglo fijo)"
            english="I'm meeting with you tomorrow"
            translation="Me reúno contigo mañana"
          />
        </div>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I will going to the store" ❌<br/>
            <strong>Correcto:</strong> "I will go to the store" o "I am going to the store" ✅<br/>
            <em>No mezcles 'will' con 'going to'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I will be go to school" ❌<br/>
            <strong>Correcto:</strong> "I will be going to school" ✅<br/>
            <em>Future Continuous usa 'will be + verbo + ing'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "The train will leave at 6 PM" ❌<br/>
            <strong>Correcto:</strong> "The train leaves at 6 PM" ✅<br/>
            <em>Para horarios fijos usamos Present Simple</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I am going to help you" (decisión espontánea) ❌<br/>
            <strong>Correcto:</strong> "I'll help you" ✅<br/>
            <em>Para decisiones espontáneas usamos 'will'</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Palabras Clave" icon="🔑">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Will:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              I think, probably, perhaps, maybe, in my opinion
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Going to:</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              I plan to, I intend to, look at, watch out, be careful
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Present Continuous (Futuro):</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              tomorrow, next week, tonight, this weekend, on Monday
            </p>
          </div>

          <div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Present Simple (Futuro):</h4>
            <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
              at 6 PM, on schedule, according to the timetable
            </p>
          </div>
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="Tomorrow I ___ (meet) my friend at 3 PM. I ___ (go) to buy her a birthday present. I think she ___ (like) the book I ___ (choose). The bookstore ___ (close) at 8 PM, so I ___ (be) shopping before then."
      blanks={[
        { answer: "am meeting" },
        { answer: "am going" },
        { answer: "will like" },
        { answer: "have chosen" },
        { answer: "closes" },
        { answer: "will be" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la forma correcta para completar: 'I ___ help you with that' (decisión espontánea)?"
      options={[
        "am going to",
        "will",
        "am helping",
        "help"
      ]}
      correctAnswer={1}
      explanation="Para decisiones espontáneas usamos 'will': 'I will help you with that'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'I'm going to study tomorrow' shows a plan or intention.",
          isTrue: true,
          explanation: "Correcto. 'Going to' se usa para planes e intenciones."
        },
        {
          text: "'The train will leave at 6 PM' is correct for a fixed schedule.",
          isTrue: false,
          explanation: "Incorrecto. Para horarios fijos usamos Present Simple: 'The train leaves at 6 PM'."
        },
        {
          text: "'I'll be working at 3 PM' means I will be in the middle of working at 3 PM.",
          isTrue: true,
          explanation: "Correcto. Future Continuous muestra acciones en progreso en un momento específico del futuro."
        },
        {
          text: "'I am meeting him tomorrow' is correct for a fixed arrangement.",
          isTrue: true,
          explanation: "Correcto. Present Continuous se usa para arreglos fijos en el futuro."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la forma correcta para completar: 'Look at those clouds! It ___ rain'?"
      options={[
        "will",
        "is going to",
        "is raining",
        "rains"
      ]}
      correctAnswer={1}
      explanation="Para predicciones basadas en evidencia presente usamos 'going to': 'It's going to rain'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la forma correcta para completar: 'At this time tomorrow, I ___ on the beach'?"
      options={[
        "will lie",
        "will be lying",
        "am going to lie",
        "lie"
      ]}
      correctAnswer={1}
      explanation="Para acciones en progreso en un momento específico del futuro usamos Future Continuous: 'I will be lying'."
    />
  ];

  return (
    <TheoryLayout
      title="Future Tenses"
      description="Domina todas las formas de expresar el futuro en inglés: will, going to, Present Continuous, Present Simple y Future Continuous. Aprende cuándo usar cada una."
      level="A2-B1-B2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Present Tenses", "Past Tenses", "Verb to be"]}
      estimatedTime="65 min"
    />
  );
};

export default FutureTensesPage;



