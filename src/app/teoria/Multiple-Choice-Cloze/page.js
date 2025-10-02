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

const MultipleChoiceClozePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Multiple Choice Cloze?" icon="🎯">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El <strong>Multiple Choice Cloze</strong> es una parte del examen de Use of English donde debes completar 
          un texto eligiendo la palabra correcta de entre cuatro opciones. Se enfoca en vocabulario, colocaciones, 
          expresiones idiomáticas y estructuras gramaticales.
        </p>
        
        <QuickReference items={[
          "8 preguntas con 4 opciones cada una",
          "Se evalúa vocabulario y colocaciones",
          "Enfoque en expresiones idiomáticas",
          "Contexto es clave para la respuesta",
          "Tiempo recomendado: 10-12 minutos"
        ]} />
      </TheorySection>

      <TheorySection title="Estrategias Clave" icon="🧠">
        <Rule 
          title="1. Lee todo el texto primero"
          description="Antes de intentar completar los espacios, lee todo el texto para entender el contexto general."
          examples={[
            "Identifica el tema principal",
            "Comprende el tono del texto",
            "Nota las conexiones entre párrafos"
          ]}
        />

        <Rule 
          title="2. Analiza las opciones cuidadosamente"
          description="Las cuatro opciones suelen ser palabras similares o relacionadas."
          examples={[
            "Busca diferencias sutiles en significado",
            "Considera el registro (formal/informal)",
            "Piensa en colocaciones comunes"
          ]}
        />

        <Rule 
          title="3. Considera el contexto inmediato"
          description="Mira las palabras antes y después del espacio en blanco."
          examples={[
            "Preposiciones que siguen al verbo",
            "Artículos y determinantes",
            "Conectores lógicos"
          ]}
        />

        <Example 
          spanish="The company decided to _____ its operations to Asia."
          english="Options: A) extend B) expand C) increase D) develop"
          translation="Respuesta: B) expand (expandir operaciones es una colocación común)"
        />
      </TheorySection>

      <TheorySection title="Tipos de Preguntas Comunes" icon="📋">
        <GrammarTable
          caption="Categorías de Multiple Choice Cloze"
          headers={["Tipo", "Descripción", "Ejemplo"]}
          rows={[
            ["Colocaciones", "Combinaciones naturales de palabras", "make a decision / take a break"],
            ["Phrasal Verbs", "Verbos con preposiciones/adverbios", "look after / put up with"],
            ["Expresiones Idiomáticas", "Frases con significado especial", "break the ice / hit the road"],
            ["Conectores", "Palabras que unen ideas", "however / therefore / moreover"],
            ["Vocabulario Preciso", "Sinónimos con matices diferentes", "big / large / huge / enormous"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="She couldn't _____ the temptation to buy the dress."
            english="A) refuse B) resist C) reject D) deny"
            translation="Respuesta: B) resist (resist temptation es la colocación correcta)"
          />
          
          <Example 
            spanish="The meeting was _____ until next week."
            english="A) delayed B) postponed C) suspended D) cancelled"
            translation="Respuesta: B) postponed (postpone a meeting es más preciso que delay)"
          />
        </div>
      </TheorySection>

      <TheorySection title="Colocaciones Importantes" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1.5rem' }}>
          Las colocaciones son combinaciones de palabras que suenan naturales para los hablantes nativos.
        </p>

        <GrammarTable
          caption="Colocaciones Comunes en Exámenes"
          headers={["Verbo", "Sustantivo", "Ejemplo"]}
          rows={[
            ["make", "decision, mistake, progress, effort", "make a decision"],
            ["take", "action, advantage, responsibility", "take action"],
            ["do", "research, homework, business", "do research"],
            ["have", "experience, opportunity, effect", "have experience"],
            ["give", "advice, permission, presentation", "give advice"],
            ["pay", "attention, compliment, fine", "pay attention"]
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Lee mucho en inglés para familiarizarte con las colocaciones naturales. 
          Los diccionarios de colocaciones también son muy útiles.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Elegir la primera opción que parece correcta<br/>
            <strong>Solución:</strong> Lee todas las opciones y considera el contexto completo
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Ignorar las palabras que siguen al espacio<br/>
            <strong>Solución:</strong> Mira qué preposiciones o estructuras vienen después
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No considerar el registro del texto<br/>
            <strong>Solución:</strong> Decide si el texto es formal, informal o neutro
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Traducir literalmente del español<br/>
            <strong>Solución:</strong> Piensa en expresiones naturales en inglés
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Técnica de Eliminación" icon="❌">
        <Rule 
          title="Proceso de eliminación sistemática"
          description="Cuando no estés seguro, usa este proceso:"
          examples={[
            "1. Elimina opciones obviamente incorrectas",
            "2. Considera el significado en contexto",
            "3. Piensa en colocaciones comunes",
            "4. Elige la opción más natural"
          ]}
        />

        <Example 
          spanish="The new policy will _____ effect next month."
          english="A) take B) make C) have D) get"
          translation="Proceso: 'make effect' ❌, 'have effect' ❌, 'get effect' ❌, 'take effect' ✅"
        />

        <Tip type="info">
          <strong>Recuerda:</strong> En este tipo de ejercicio, siempre hay una respuesta claramente correcta. 
          Si dudas entre dos opciones, busca pistas adicionales en el contexto.
        </Tip>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="The company decided to _____ its workforce due to financial difficulties."
      options={[
        "reduce",
        "decrease",
        "lower",
        "cut"
      ]}
      correctAnswer={0}
      explanation="'Reduce workforce' es la colocación más común y natural en contextos empresariales."
    />,

    <MultipleChoiceExercise
      key="2"
      question="She couldn't _____ her curiosity and opened the letter."
      options={[
        "control",
        "contain",
        "restrain",
        "suppress"
      ]}
      correctAnswer={1}
      explanation="'Contain curiosity' es la expresión correcta. Aunque 'control' también es posible, 'contain' es más preciso en este contexto."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "In Multiple Choice Cloze, you should always read the whole text before attempting to fill the gaps.",
          isTrue: true,
          explanation: "Correcto. Leer todo el texto primero te ayuda a entender el contexto general."
        },
        {
          text: "All four options in Multiple Choice Cloze are usually completely different in meaning.",
          isTrue: false,
          explanation: "Falso. Las opciones suelen ser palabras relacionadas o sinónimos con matices diferentes."
        },
        {
          text: "Collocations are not important in Multiple Choice Cloze exercises.",
          isTrue: false,
          explanation: "Falso. Las colocaciones son fundamentales en este tipo de ejercicio."
        },
        {
          text: "You should consider the words that come both before and after the gap.",
          isTrue: true,
          explanation: "Correcto. El contexto inmediato es crucial para elegir la respuesta correcta."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="The meeting has been _____ until further notice."
      options={[
        "delayed",
        "postponed", 
        "suspended",
        "cancelled"
      ]}
      correctAnswer={1}
      explanation="'Postponed until further notice' es la expresión correcta. 'Postpone' implica una nueva fecha específica."
    />,

    <MultipleChoiceExercise
      key="5"
      question="You should _____ advantage of this opportunity while you can."
      options={[
        "make",
        "take",
        "get",
        "have"
      ]}
      correctAnswer={1}
      explanation="'Take advantage' es la colocación correcta. Es una expresión fija en inglés."
    />,

    <MultipleChoiceExercise
      key="6"
      question="The new policy will _____ effect next month."
      options={[
        "take",
        "make",
        "have",
        "get"
      ]}
      correctAnswer={0}
      explanation="'Take effect' es la colocación correcta para cuando algo entra en vigor."
    />,

    <MultipleChoiceExercise
      key="7"
      question="She has a natural _____ for languages."
      options={[
        "skill",
        "talent",
        "gift",
        "ability"
      ]}
      correctAnswer={2}
      explanation="'Natural gift' es la expresión más común para habilidades innatas."
    />,

    <MultipleChoiceExercise
      key="8"
      question="The project was completed _____ schedule."
      options={[
        "ahead of",
        "before",
        "in front of",
        "prior to"
      ]}
      correctAnswer={0}
      explanation="'Ahead of schedule' es la expresión fija para algo terminado antes de tiempo."
    />,

    <MultipleChoiceExercise
      key="9"
      question="Please _____ attention to the safety instructions."
      options={[
        "give",
        "pay",
        "make",
        "take"
      ]}
      correctAnswer={1}
      explanation="'Pay attention' es la colocación correcta con 'attention'."
    />,

    <MultipleChoiceExercise
      key="10"
      question="The weather forecast _____ rain for tomorrow."
      options={[
        "predicts",
        "expects",
        "awaits",
        "anticipates"
      ]}
      correctAnswer={0}
      explanation="'Predicts' es el verbo más apropiado para pronósticos meteorológicos."
    />
  ];

  return (
    <TheoryLayout
      title="Multiple Choice Cloze"
      description="Domina las estrategias para completar textos con opciones múltiples. Aprende sobre colocaciones, vocabulario en contexto y técnicas de eliminación."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Vocabulario intermedio-avanzado", "Colocaciones básicas"]}
      estimatedTime="50 min"
    />
  );
};

export default MultipleChoiceClozePage;

