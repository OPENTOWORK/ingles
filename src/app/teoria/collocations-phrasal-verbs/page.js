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

const CollocationsPhrasalVerbsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son las Collocations y Phrasal Verbs?" icon="🔗">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las <strong>collocations</strong> (colocaciones) son combinaciones naturales de palabras que suenan naturales a los hablantes nativos. 
          Los <strong>phrasal verbs</strong> (verbos frasales) son verbos combinados con preposiciones o adverbios que crean nuevos significados.
        </p>
        
        <QuickReference items={[
          "Collocations: combinaciones naturales de palabras",
          "Phrasal verbs: verbos con partículas",
          "Esenciales para sonar natural",
          "No se traducen literalmente",
          "Mejoran la fluidez del idioma"
        ]} />
      </TheorySection>

      <TheorySection title="Collocations (Colocaciones)" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las colocaciones son combinaciones de palabras que suenan naturales a los hablantes nativos.
        </p>

        <GrammarTable
          caption="Tipos de Collocations"
          headers={["Tipo", "Patrón", "Ejemplo", "Significado"]}
          rows={[
            ["Adjetivo + Sustantivo", "adj + noun", "heavy rain", "lluvia fuerte"],
            ["Verbo + Sustantivo", "verb + noun", "make a decision", "tomar una decisión"],
            ["Sustantivo + Verbo", "noun + verb", "rain falls", "llueve"],
            ["Verbo + Adverbio", "verb + adv", "work hard", "trabajar duro"],
            ["Adverbio + Adjetivo", "adv + adj", "completely wrong", "completamente equivocado"],
            ["Sustantivo + Sustantivo", "noun + noun", "coffee shop", "cafetería"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Tomar una decisión (no 'hacer una decisión')"
            english="make a decision (not 'do a decision')"
            translation="Tomar una decisión"
          />
          <Example 
            spanish="Lluvia fuerte (no 'lluvia fuerte')"
            english="heavy rain (not 'strong rain')"
            translation="Lluvia fuerte"
          />
          <Example 
            spanish="Trabajar duro"
            english="work hard"
            translation="Trabajar duro"
          />
        </div>

        <Rule 
          title="Collocations con 'Make' y 'Do'"
          description="Diferencias importantes:"
          examples={[
            "Make: make a decision, make money, make progress",
            "Do: do homework, do business, do exercise",
            "Make = crear/producir algo",
            "Do = actividades/tareas"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Las collocations no se pueden traducir literalmente. Es mejor aprenderlas como unidades completas.
        </Tip>
      </TheorySection>

      <TheorySection title="Phrasal Verbs (Verbos Frasales)" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los phrasal verbs son verbos combinados con preposiciones o adverbios que crean nuevos significados.
        </p>

        <GrammarTable
          caption="Tipos de Phrasal Verbs"
          headers={["Tipo", "Ejemplo", "Posición del Objeto"]}
          rows={[
            ["Intransitivo", "wake up, sit down", "Sin objeto"],
            ["Transitivo Separable", "turn on, pick up", "Objeto puede ir entre verbo y partícula"],
            ["Transitivo Inseparable", "look after, get over", "Objeto debe ir después de la partícula"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me despierto a las 7 AM"
            english="I wake up at 7 AM"
            translation="Me despierto a las 7 AM"
          />
          <Example 
            spanish="Enciende la luz / Enciende la luz"
            english="Turn on the light / Turn the light on"
            translation="Enciende la luz"
          />
          <Example 
            spanish="Cuido a mis hijos"
            english="I look after my children"
            translation="Cuido a mis hijos"
          />
        </div>

        <Rule 
          title="Phrasal Verbs Separables vs Inseparables"
          description="Diferencias importantes:"
          examples={[
            "Separables: el objeto puede ir entre verbo y partícula",
            "Inseparables: el objeto siempre va después de la partícula",
            "Pronombres: siempre van entre verbo y partícula en separables",
            "Ejemplos: Turn it on (no 'Turn on it')"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Con phrasal verbs separables, si el objeto es un pronombre, debe ir entre el verbo y la partícula.
        </Tip>
      </TheorySection>

      <TheorySection title="Phrasal Verbs Comunes" icon="📚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Algunos phrasal verbs muy comunes que debes conocer.
        </p>

        <GrammarTable
          caption="Phrasal Verbs con 'Get'"
          headers={["Phrasal Verb", "Significado", "Ejemplo"]}
          rows={[
            ["get up", "levantarse de la cama", "I get up at 7 AM every day"],
            ["get on", "subir (vehículo), continuar", "Get on the bus. Let's get on with work"],
            ["get off", "bajar (vehículo)", "Get off the train at the next station"],
            ["get over", "recuperarse de", "It took me weeks to get over the flu"],
            ["get along", "llevarse bien", "I get along well with my colleagues"],
            ["get away", "escapar, ir de vacaciones", "The thief got away. We need to get away"],
            ["get back", "regresar", "I'll get back to you tomorrow"],
            ["get through", "terminar, contactar", "I got through the exam. I can't get through to him"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me levanto a las 7 AM todos los días"
            english="I get up at 7 AM every day"
            translation="Me levanto a las 7 AM todos los días"
          />
          <Example 
            spanish="Me llevo bien con mis colegas"
            english="I get along well with my colleagues"
            translation="Me llevo bien con mis colegas"
          />
          <Example 
            spanish="Te contactaré mañana"
            english="I'll get back to you tomorrow"
            translation="Te contactaré mañana"
          />
        </div>

        <GrammarTable
          caption="Phrasal Verbs con 'Look'"
          headers={["Phrasal Verb", "Significado", "Ejemplo"]}
          rows={[
            ["look after", "cuidar de", "I look after my grandmother"],
            ["look for", "buscar", "I'm looking for my keys"],
            ["look forward to", "esperar con ganas", "I look forward to seeing you"],
            ["look up", "buscar información", "Look up the word in the dictionary"],
            ["look down on", "menospreciar", "Don't look down on others"],
            ["look into", "investigar", "The police will look into the matter"],
            ["look out", "¡cuidado!", "Look out! There's a car coming"],
            ["look up to", "admirar, respetar", "Children look up to their parents"]
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Aprende los phrasal verbs más comunes primero. Son los que más se usan en conversaciones diarias.
        </Tip>
      </TheorySection>

      <TheorySection title="Phrasal Verbs con 'Put'" icon="📦">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los phrasal verbs con 'put' son muy comunes y útiles.
        </p>

        <GrammarTable
          caption="Phrasal Verbs con 'Put'"
          headers={["Phrasal Verb", "Significado", "Ejemplo"]}
          rows={[
            ["put on", "ponerse, encender", "Put on your coat. Put on the music"],
            ["put off", "posponer", "Don't put off until tomorrow what you can do today"],
            ["put up with", "tolerar", "I can't put up with this noise anymore"],
            ["put away", "guardar, ordenar", "Put away your toys"],
            ["put down", "bajar, criticar", "Put down the book. Don't put him down"],
            ["put up", "construir, alojar", "Put up a tent. Can you put me up for the night?"],
            ["put out", "apagar, publicar", "Put out the fire. The company put out a statement"],
            ["put through", "conectar (teléfono), hacer pasar", "Put me through to the manager. The exam put students through a lot of stress"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Ponte tu abrigo. Enciende la música"
            english="Put on your coat. Put on the music"
            translation="Ponte tu abrigo. Enciende la música"
          />
          <Example 
            spanish="No pospongas para mañana lo que puedes hacer hoy"
            english="Don't put off until tomorrow what you can do today"
            translation="No pospongas para mañana lo que puedes hacer hoy"
          />
          <Example 
            spanish="No puedo tolerar este ruido más"
            english="I can't put up with this noise anymore"
            translation="No puedo tolerar este ruido más"
          />
        </div>

        <Rule 
          title="Significados Múltiples"
          description="Muchos phrasal verbs tienen múltiples significados:"
          examples={[
            "put on: ponerse ropa / encender dispositivo",
            "put out: apagar fuego / publicar noticia",
            "put through: conectar teléfono / hacer pasar experiencia",
            "El contexto determina el significado"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Los phrasal verbs con múltiples significados son comunes. El contexto te ayuda a entender cuál usar.
        </Tip>
      </TheorySection>

      <TheorySection title="Collocations Comunes" icon="💡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Algunas collocations muy comunes que debes conocer.
        </p>

        <GrammarTable
          caption="Collocations Adjetivo + Sustantivo"
          headers={["Adjetivo", "Collocación Correcta", "Incorrecta"]}
          rows={[
            ["heavy", "heavy rain, heavy traffic", "strong rain, strong traffic"],
            ["strong", "strong coffee, strong wind", "heavy coffee, heavy wind"],
            ["fast", "fast car, fast food", "quick car, quick food"],
            ["quick", "quick decision, quick meal", "fast decision, fast meal"],
            ["deep", "deep sleep, deep thought", "heavy sleep, heavy thought"],
            ["sharp", "sharp knife, sharp turn", "strong knife, strong turn"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Lluvia fuerte, tráfico pesado"
            english="heavy rain, heavy traffic"
            translation="Lluvia fuerte, tráfico pesado"
          />
          <Example 
            spanish="Café fuerte, viento fuerte"
            english="strong coffee, strong wind"
            translation="Café fuerte, viento fuerte"
          />
          <Example 
            spanish="Decisión rápida, comida rápida"
            english="quick decision, fast food"
            translation="Decisión rápida, comida rápida"
          />
        </div>

        <Rule 
          title="Collocations con 'Make' y 'Do'"
          description="Diferencias importantes:"
          examples={[
            "Make: make a decision, make a mistake, make money, make progress",
            "Do: do homework, do business, do exercise, do research",
            "Make = crear o producir algo",
            "Do = actividades o tareas"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Las collocations hacen que tu inglés suene más natural. Es mejor memorizarlas que traducirlas literalmente.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Collocations incorrectas ❌<br/>
            <strong>Correcto:</strong> Collocations correctas ✅<br/>
            <em>do a decision, strong rain → make a decision, heavy rain</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Posición incorrecta de pronombres con phrasal verbs separables ❌<br/>
            <strong>Correcto:</strong> Pronombres entre verbo y partícula ✅<br/>
            <em>Turn on it. → Turn it on.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Confundir phrasal verbs separables e inseparables ❌<br/>
            <strong>Correcto:</strong> Usar la posición correcta del objeto ✅<br/>
            <em>Look the children after. → Look after the children.</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Traducción literal desde el idioma nativo ❌<br/>
            <strong>Correcto:</strong> Aprender collocations como unidades ✅<br/>
            <em>strong coffee (si significa 'pesado') → heavy coffee</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No entender significados dependientes del contexto ❌<br/>
            <strong>Correcto:</strong> Considerar el contexto para el significado ✅<br/>
            <em>The car broke down emotionally. → The car broke down mechanically. / She broke down emotionally.</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Collocations"
            description="Aprende collocations como unidades completas."
            examples={[
              "No las traduzcas literalmente",
              "Memorízalas como frases completas",
              "Practica con ejemplos reales",
              "Usa diccionarios de collocations"
            ]}
          />

          <Rule 
            title="2. Phrasal Verbs Separables"
            description="Maneja correctamente la posición del objeto."
            examples={[
              "Objeto puede ir entre verbo y partícula O después",
              "Pronombres SIEMPRE van entre verbo y partícula",
              "Ejemplos: Turn on the light / Turn the light on / Turn it on",
              "Nunca: Turn on it"
            ]}
          />

          <Rule 
            title="3. Phrasal Verbs Inseparables"
            description="El objeto siempre va después de la partícula."
            examples={[
              "Objeto SIEMPRE después de la partícula",
              "Nunca entre verbo y partícula",
              "Ejemplos: Look after the children (nunca: Look the children after)",
              "Aprende cuáles son inseparables"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'Please ___ the lights.'"
      options={[
        "turn off",
        "turn on",
        "turn up",
        "turn down"
      ]}
      correctAnswer={1}
      explanation="'Turn on' significa encender algo, como luces, televisión, radio, etc."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Choose the correct collocation: I need to ___ a decision about my future."
      options={[
        "do",
        "make",
        "take",
        "give"
      ]}
      correctAnswer={1}
      explanation="The correct collocation is 'make a decision' - we use 'make' for creating or producing something."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "With separable phrasal verbs, the object can always go between the verb and the particle.",
          isTrue: false,
          explanation: "False. With separable phrasal verbs, the object can go between the verb and particle OR after the particle, but if the object is a pronoun, it MUST go between the verb and particle."
        },
        {
          text: "Collocations are natural word combinations that sound natural to native speakers.",
          isTrue: true,
          explanation: "Correct. Collocations are natural combinations of words that native speakers use instinctively."
        },
        {
          text: "Phrasal verbs always have the same meaning regardless of context.",
          isTrue: false,
          explanation: "False. Many phrasal verbs have multiple meanings depending on context, like 'break down' (stop working vs. lose emotional control)."
        },
        {
          text: "It's okay to translate collocations literally from your native language.",
          isTrue: false,
          explanation: "False. Collocations should be learned as complete units, not translated literally, as they often don't translate directly."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="What is the correct collocation for 'coffee' when describing its intensity?"
      options={[
        "strong coffee",
        "heavy coffee",
        "powerful coffee",
        "big coffee"
      ]}
      correctAnswer={0}
      explanation="The correct collocation is 'strong coffee' when describing the intensity or flavor of coffee."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which sentence correctly uses a separable phrasal verb?"
      options={[
        "Turn on it.",
        "Turn it on.",
        "Look after it.",
        "Get over it."
      ]}
      correctAnswer={1}
      explanation="'Turn it on' is correct because 'turn on' is separable, so the pronoun 'it' goes between the verb and particle."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "'Put off' means to postpone something.",
          isTrue: true,
          explanation: "Correcto. 'Put off' significa posponer o retrasar algo: 'I put off the meeting'."
        },
        {
          text: "'Look after' and 'look for' have the same meaning.",
          isTrue: false,
          explanation: "Incorrecto. 'Look after' significa cuidar, 'look for' significa buscar."
        },
        {
          text: "We say 'take a photo' not 'make a photo'.",
          isTrue: true,
          explanation: "Correcto. En inglés decimos 'take a photo/picture', no 'make'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'She ___ her job last month.'"
      options={[
        "gave up",
        "gave in",
        "gave out",
        "gave away"
      ]}
      correctAnswer={0}
      explanation="'Give up' significa abandonar o renunciar a algo: 'She gave up her job'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Choose the correct collocation: 'Can you ___ me a favor?'"
      options={[
        "make",
        "do",
        "take",
        "give"
      ]}
      correctAnswer={1}
      explanation="'Do someone a favor' es la colocación correcta para pedir un favor."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Break down' can mean both 'to stop working' and 'to become emotional'.",
          isTrue: true,
          explanation: "Correcto. 'Break down' tiene múltiples significados: una máquina se descompone o una persona se quiebra emocionalmente."
        },
        {
          text: "'Run into' means to exercise by running.",
          isTrue: false,
          explanation: "Incorrecto. 'Run into' significa encontrarse con alguien por casualidad o chocar con algo."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'I ___ my old friend at the supermarket yesterday.'"
      options={[
        "ran into",
        "ran out of",
        "ran away",
        "ran over"
      ]}
      correctAnswer={0}
      explanation="'Run into' significa encontrarse con alguien por casualidad: 'I ran into my old friend'."
    />
  ];

  return (
    <TheoryLayout
      title="Collocations and Phrasal Verbs"
      description="Domina las colocaciones y verbos frasales en inglés. Aprende combinaciones naturales de palabras y verbos con partículas para sonar más natural y mejorar tu fluidez."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Intermediate vocabulary", "Understanding of verb patterns"]}
      estimatedTime="90 min"
    />
  );
};

export default CollocationsPhrasalVerbsPage;