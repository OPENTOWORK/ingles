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

const InfinitiveVsGerundPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son Infinitive y Gerund?" icon="🔤">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El <strong>infinitive</strong> (infinitivo) y el <strong>gerund</strong> (gerundio) son formas verbales que funcionan como sustantivos. 
          Saber cuándo usar cada uno es crucial para hablar inglés correctamente, ya que algunos verbos requieren infinitivo, otros gerundio, y algunos ambos.
        </p>
        
        <QuickReference items={[
          "Infinitive: to + verbo base (to go, to eat, to study)",
          "Gerund: verbo + ing (going, eating, studying)",
          "Algunos verbos requieren solo infinitivo",
          "Algunos verbos requieren solo gerundio",
          "Algunos verbos aceptan ambos con diferente significado"
        ]} />
      </TheorySection>

      <TheorySection title="Infinitive (Infinitivo)" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El infinitivo es la forma base del verbo precedida por "to". Se usa en diversas estructuras gramaticales.
        </p>

        <GrammarTable
          caption="Usos del Infinitivo"
          headers={["Uso", "Estructura", "Ejemplo", "Significado"]}
          rows={[
            ["Después de verbos específicos", "verbo + to + infinitivo", "I want to go", "Quiero ir"],
            ["Después de adjetivos", "adjetivo + to + infinitivo", "It's easy to learn", "Es fácil aprender"],
            ["Para expresar propósito", "to + infinitivo", "I study to pass", "Estudio para aprobar"],
            ["Después de algunos sustantivos", "sustantivo + to + infinitivo", "time to go", "hora de ir"],
            ["Con 'too' y 'enough'", "too/enough + to + infinitivo", "too tired to work", "muy cansado para trabajar"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Quiero aprender inglés"
            english="I want to learn English"
            translation="Quiero aprender inglés"
          />
          <Example 
            spanish="Es importante estudiar"
            english="It's important to study"
            translation="Es importante estudiar"
          />
          <Example 
            spanish="Voy a la tienda para comprar leche"
            english="I go to the store to buy milk"
            translation="Voy a la tienda para comprar leche"
          />
        </div>

        <Rule 
          title="Verbos que requieren Infinitivo"
          description="Estos verbos van seguidos de infinitivo:"
          examples={[
            "Want, need, hope, decide, plan, promise",
            "Agree, refuse, offer, attempt, fail",
            "Learn, teach, help (opcional), choose"
          ]}
        />

        <Tip type="info">
          <strong>Recuerda:</strong> Después de estos verbos siempre usamos "to + infinitivo", nunca gerundio.
        </Tip>
      </TheorySection>

      <TheorySection title="Gerund (Gerundio)" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El gerundio es la forma "-ing" del verbo que funciona como sustantivo. Se usa en diversas estructuras.
        </p>

        <GrammarTable
          caption="Usos del Gerundio"
          headers={["Uso", "Estructura", "Ejemplo", "Significado"]}
          rows={[
            ["Como sujeto", "gerundio + verbo", "Swimming is fun", "Nadar es divertido"],
            ["Después de verbos específicos", "verbo + gerundio", "I enjoy reading", "Disfruto leyendo"],
            ["Después de preposiciones", "preposición + gerundio", "good at singing", "bueno cantando"],
            ["Después de algunas expresiones", "expresión + gerundio", "It's worth trying", "Vale la pena intentar"],
            ["Como objeto directo", "verbo + gerundio", "I finished working", "Terminé de trabajar"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Nadar es bueno para la salud"
            english="Swimming is good for health"
            translation="Nadar es bueno para la salud"
          />
          <Example 
            spanish="Disfruto cocinando"
            english="I enjoy cooking"
            translation="Disfruto cocinando"
          />
          <Example 
            spanish="Soy bueno cantando"
            english="I am good at singing"
            translation="Soy bueno cantando"
          />
        </div>

        <Rule 
          title="Verbos que requieren Gerundio"
          description="Estos verbos van seguidos de gerundio:"
          examples={[
            "Enjoy, like, love, hate, prefer",
            "Avoid, consider, suggest, recommend",
            "Finish, stop, quit, give up, keep on",
            "Mind, imagine, practice, admit, deny"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Después de estos verbos usamos gerundio, no infinitivo.
        </Tip>
      </TheorySection>

      <TheorySection title="Verbos que Aceptan Ambos" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Algunos verbos pueden ir seguidos tanto de infinitivo como de gerundio, pero con significados diferentes.
        </p>

        <GrammarTable
          caption="Verbos con Ambos Usos"
          headers={["Verbo", "Con Infinitivo", "Con Gerundio", "Diferencia"]}
          rows={[
            ["Remember", "remember to do (recordar hacer)", "remember doing (recordar haber hecho)", "Tiempo de la acción"],
            ["Forget", "forget to do (olvidar hacer)", "forget doing (olvidar haber hecho)", "Tiempo de la acción"],
            ["Try", "try to do (intentar hacer)", "try doing (probar hacer)", "Propósito vs experimento"],
            ["Stop", "stop to do (parar para hacer)", "stop doing (dejar de hacer)", "Propósito vs cesar"],
            ["Like", "like to do (preferir hacer)", "like doing (disfrutar haciendo)", "Preferencia vs disfrute"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Recuerda cerrar la puerta"
            english="Remember to close the door"
            translation="Recuerda cerrar la puerta"
          />
          <Example 
            spanish="Recuerdo haber cerrado la puerta"
            english="I remember closing the door"
            translation="Recuerdo haber cerrado la puerta"
          />
          <Example 
            spanish="Intento aprender inglés"
            english="I try to learn English"
            translation="Intento aprender inglés"
          />
          <Example 
            spanish="Pruebo aprender inglés"
            english="I try learning English"
            translation="Pruebo aprender inglés"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> La diferencia principal está en el tiempo: infinitivo = futuro, gerundio = pasado.
        </Tip>
      </TheorySection>

      <TheorySection title="Expresiones Comunes" icon="💬">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Hay muchas expresiones que requieren infinitivo o gerundio específicamente.
        </p>

        <GrammarTable
          caption="Expresiones con Infinitivo y Gerundio"
          headers={["Expresión", "Forma", "Ejemplo", "Significado"]}
          rows={[
            ["It's + adjetivo", "to + infinitivo", "It's important to study", "Es importante estudiar"],
            ["Too + adjetivo", "to + infinitivo", "too tired to work", "muy cansado para trabajar"],
            ["Adjetivo + enough", "to + infinitivo", "old enough to drive", "suficientemente mayor para manejar"],
            ["Be good/bad at", "gerundio", "good at swimming", "bueno nadando"],
            ["Be interested in", "gerundio", "interested in learning", "interesado en aprender"],
            ["Look forward to", "gerundio", "look forward to seeing", "tener ganas de ver"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Es fácil aprender inglés"
            english="It's easy to learn English"
            translation="Es fácil aprender inglés"
          />
          <Example 
            spanish="Soy bueno nadando"
            english="I am good at swimming"
            translation="Soy bueno nadando"
          />
          <Example 
            spanish="Tengo ganas de verte"
            english="I look forward to seeing you"
            translation="Tengo ganas de verte"
          />
        </div>

        <Tip type="info">
          <strong>Nota:</strong> "Look forward to" va seguido de gerundio, aunque "to" parezca infinitivo.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I enjoy to read" ❌<br/>
            <strong>Correcto:</strong> "I enjoy reading" ✅<br/>
            <em>'Enjoy' va seguido de gerundio, no infinitivo</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I want going home" ❌<br/>
            <strong>Correcto:</strong> "I want to go home" ✅<br/>
            <em>'Want' va seguido de infinitivo, no gerundio</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I'm looking forward to see you" ❌<br/>
            <strong>Correcto:</strong> "I'm looking forward to seeing you" ✅<br/>
            <em>'Look forward to' va seguido de gerundio</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I stopped to smoke" (para dejar de fumar) ❌<br/>
            <strong>Correcto:</strong> "I stopped smoking" ✅<br/>
            <em>Para 'dejar de hacer' usamos gerundio</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Verbos de preferencia"
            description="Like, love, hate, prefer pueden usar ambos, pero con matices diferentes."
            examples={[
              "I like to swim (preferencia general)",
              "I like swimming (disfruto la actividad)"
            ]}
          />

          <Rule 
            title="2. Después de preposiciones"
            description="Siempre usamos gerundio después de preposiciones."
            examples={[
              "Good at swimming",
              "Interested in learning",
              "Afraid of flying"
            ]}
          />

          <Rule 
            title="3. Como sujeto"
            description="Tanto infinitivo como gerundio pueden ser sujeto, pero gerundio es más común."
            examples={[
              "Swimming is fun (más común)",
              "To swim is fun (menos común)"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="I want ___ (learn) English. I enjoy ___ (read) books. It's important ___ (study) hard. I'm good at ___ (sing). I stopped ___ (smoke) last year."
      blanks={[
        { answer: "to learn" },
        { answer: "reading" },
        { answer: "to study" },
        { answer: "singing" },
        { answer: "smoking" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la forma correcta para completar: 'I enjoy ___ books'?"
      options={[
        "to read",
        "reading",
        "read",
        "reads"
      ]}
      correctAnswer={1}
      explanation="'Enjoy' va seguido de gerundio: 'I enjoy reading books'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'I want to go home' is correct.",
          isTrue: true,
          explanation: "Correcto. 'Want' va seguido de infinitivo."
        },
        {
          text: "'I enjoy to swim' is correct.",
          isTrue: false,
          explanation: "Incorrecto. 'Enjoy' va seguido de gerundio: 'I enjoy swimming'."
        },
        {
          text: "'I'm looking forward to seeing you' is correct.",
          isTrue: true,
          explanation: "Correcto. 'Look forward to' va seguido de gerundio."
        },
        {
          text: "'I stopped to smoke' means I quit smoking.",
          isTrue: false,
          explanation: "Incorrecto. 'I stopped to smoke' means I stopped in order to smoke. 'I stopped smoking' means I quit smoking."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la forma correcta para completar: 'I remember ___ the door' (I remember that I closed it)?"
      options={[
        "to close",
        "closing",
        "close",
        "closed"
      ]}
      correctAnswer={1}
      explanation="Para recordar haber hecho algo usamos gerundio: 'I remember closing the door'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la forma correcta para completar: 'It's easy ___ English'?"
      options={[
        "learn",
        "learning",
        "to learn",
        "learns"
      ]}
      correctAnswer={2}
      explanation="Después de 'It's + adjetivo' usamos infinitivo: 'It's easy to learn English'."
    />
  ];

  return (
    <TheoryLayout
      title="Infinitive vs Gerund"
      description="Domina el uso del infinitivo y gerundio en inglés. Aprende qué verbos requieren cada forma y cuándo usar cada una para expresarte correctamente."
      level="B1"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Present Tenses", "Basic vocabulary", "Understanding of verb forms"]}
      estimatedTime="65 min"
    />
  );
};

export default InfinitiveVsGerundPage;



