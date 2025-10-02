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

const PrepositionsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son las Prepositions?" icon="📍">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las <strong>prepositions</strong> (preposiciones) son palabras que muestran la relación entre un sustantivo o pronombre 
          y otras palabras en la oración. Indican ubicación, tiempo, dirección, causa y otras relaciones.
        </p>
        
        <QuickReference items={[
          "Lugar: in, on, at, under, over, between",
          "Tiempo: in, on, at, for, since, during",
          "Dirección: to, from, into, out of, through",
          "Causa: because of, due to, thanks to",
          "Siempre van seguidas de sustantivos/pronombres"
        ]} />
      </TheorySection>

      <TheorySection title="Prepositions of Place (Preposiciones de Lugar)" icon="🏠">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Indican dónde está algo o alguien en relación con otro objeto o lugar.
        </p>

        <GrammarTable
          caption="Preposiciones de Lugar Principales"
          headers={["Preposición", "Uso", "Ejemplo", "Significado"]}
          rows={[
            ["in", "Dentro de espacios cerrados", "in the room", "en la habitación"],
            ["on", "Sobre superficies", "on the table", "sobre la mesa"],
            ["at", "Punto específico", "at the station", "en la estación"],
            ["under", "Debajo de", "under the bed", "debajo de la cama"],
            ["over", "Sobre (sin tocar)", "over the bridge", "sobre el puente"],
            ["between", "Entre dos cosas", "between the cars", "entre los coches"],
            ["next to", "Al lado de", "next to the park", "al lado del parque"],
            ["behind", "Detrás de", "behind the house", "detrás de la casa"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="El libro está en la mesa"
            english="The book is on the table"
            translation="El libro está en la mesa"
          />
          <Example 
            spanish="Estoy en la cocina"
            english="I am in the kitchen"
            translation="Estoy en la cocina"
          />
          <Example 
            spanish="El gato está debajo de la silla"
            english="The cat is under the chair"
            translation="El gato está debajo de la silla"
          />
        </div>

        <Rule 
          title="Uso de In, On, At para Lugar"
          description="Cuándo usar cada una:"
          examples={[
            "In: espacios cerrados (in the car, in the room)",
            "On: superficies (on the table, on the wall)",
            "At: puntos específicos (at home, at school, at work)"
          ]}
        />

        <Tip type="info">
          <strong>Recuerda:</strong> "At home" es una excepción - usamos "at" aunque sea un espacio cerrado.
        </Tip>
      </TheorySection>

      <TheorySection title="Prepositions of Time (Preposiciones de Tiempo)" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Indican cuándo ocurre algo en relación con el tiempo.
        </p>

        <GrammarTable
          caption="Preposiciones de Tiempo Principales"
          headers={["Preposición", "Uso", "Ejemplo", "Significado"]}
          rows={[
            ["in", "Meses, años, estaciones", "in January, in 2023", "en enero, en 2023"],
            ["on", "Días específicos, fechas", "on Monday, on July 4th", "el lunes, el 4 de julio"],
            ["at", "Horas específicas", "at 3 PM, at night", "a las 3 PM, por la noche"],
            ["for", "Duración", "for 2 hours, for a week", "durante 2 horas, durante una semana"],
            ["since", "Desde un punto específico", "since Monday, since 2020", "desde el lunes, desde 2020"],
            ["during", "Durante un período", "during the summer", "durante el verano"],
            ["until", "Hasta un momento", "until 5 PM", "hasta las 5 PM"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Voy al trabajo los lunes"
            english="I go to work on Mondays"
            translation="Voy al trabajo los lunes"
          />
          <Example 
            spanish="Nací en 1990"
            english="I was born in 1990"
            translation="Nací en 1990"
          />
          <Example 
            spanish="La reunión es a las 3 PM"
            english="The meeting is at 3 PM"
            translation="La reunión es a las 3 PM"
          />
        </div>

        <Rule 
          title="Uso de In, On, At para Tiempo"
          description="Cuándo usar cada una:"
          examples={[
            "In: períodos largos (in January, in the morning)",
            "On: días específicos (on Monday, on Christmas Day)",
            "At: momentos específicos (at 3 PM, at midnight)"
          ]}
        />

        <Tip type="warning">
          <strong>Excepciones:</strong> "At night", "at the weekend", "in the morning/afternoon/evening".
        </Tip>
      </TheorySection>

      <TheorySection title="Prepositions of Direction (Preposiciones de Dirección)" icon="➡️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Indican hacia dónde se mueve algo o alguien.
        </p>

        <GrammarTable
          caption="Preposiciones de Dirección"
          headers={["Preposición", "Uso", "Ejemplo", "Significado"]}
          rows={[
            ["to", "Hacia un lugar", "go to school", "ir a la escuela"],
            ["from", "Desde un lugar", "come from Spain", "venir de España"],
            ["into", "Entrar a un lugar", "walk into the room", "entrar a la habitación"],
            ["out of", "Salir de un lugar", "get out of the car", "salir del coche"],
            ["through", "A través de", "walk through the park", "caminar por el parque"],
            ["across", "Cruzando", "walk across the street", "cruzar la calle"],
            ["up", "Hacia arriba", "go up the stairs", "subir las escaleras"],
            ["down", "Hacia abajo", "go down the hill", "bajar la colina"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Voy a la tienda"
            english="I go to the store"
            translation="Voy a la tienda"
          />
          <Example 
            spanish="Vengo de la oficina"
            english="I come from the office"
            translation="Vengo de la oficina"
          />
          <Example 
            spanish="Camino por el parque"
            english="I walk through the park"
            translation="Camino por el parque"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> "To" indica movimiento hacia un lugar, "from" indica movimiento desde un lugar.
        </Tip>
      </TheorySection>

      <TheorySection title="Prepositions with Verbs (Preposiciones con Verbos)" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Algunos verbos siempre van seguidos de preposiciones específicas.
        </p>

        <GrammarTable
          caption="Verbos con Preposiciones Comunes"
          headers={["Verbo", "Preposición", "Ejemplo", "Significado"]}
          rows={[
            ["listen", "to", "listen to music", "escuchar música"],
            ["look", "at", "look at the picture", "mirar la imagen"],
            ["wait", "for", "wait for the bus", "esperar el autobús"],
            ["depend", "on", "depend on you", "depender de ti"],
            ["believe", "in", "believe in God", "creer en Dios"],
            ["think", "about", "think about it", "pensar en ello"],
            ["talk", "to/with", "talk to my friend", "hablar con mi amigo"],
            ["arrive", "at/in", "arrive at the station", "llegar a la estación"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Escucho música todos los días"
            english="I listen to music every day"
            translation="Escucho música todos los días"
          />
          <Example 
            spanish="Espero el autobús"
            english="I wait for the bus"
            translation="Espero el autobús"
          />
          <Example 
            spanish="Pienso en mi familia"
            english="I think about my family"
            translation="Pienso en mi familia"
          />
        </div>

        <Tip type="warning">
          <strong>¡Importante!</strong> Estas combinaciones son fijas. No puedes cambiar la preposición.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "I am in Monday" ❌<br/>
            <strong>Correcto:</strong> "I am on Monday" ✅<br/>
            <em>Para días específicos usamos 'on'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I listen music" ❌<br/>
            <strong>Correcto:</strong> "I listen to music" ✅<br/>
            <em>El verbo 'listen' siempre va con 'to'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I go to home" ❌<br/>
            <strong>Correcto:</strong> "I go home" ✅<br/>
            <em>Con 'home' no usamos 'to'</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I am at the bed" ❌<br/>
            <strong>Correcto:</strong> "I am in bed" ✅<br/>
            <em>Para estar en la cama usamos 'in'</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Preposiciones fijas"
            description="Algunas combinaciones verbo-preposición son fijas."
            examples={[
              "Listen to (escuchar)",
              "Wait for (esperar)",
              "Believe in (creer en)"
            ]}
          />

          <Rule 
            title="2. Sin preposición"
            description="Algunos verbos no necesitan preposición."
            examples={[
              "Go home (ir a casa)",
              "Arrive here (llegar aquí)",
              "Enter the room (entrar a la habitación)"
            ]}
          />

          <Rule 
            title="3. Diferencia entre 'in' y 'at'"
            description="'In' para espacios cerrados, 'at' para puntos específicos."
            examples={[
              "In the car (en el coche)",
              "At the car (junto al coche)",
              "In the hospital (en el hospital como paciente)",
              "At the hospital (en el hospital como visitante)"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'I live _____ Spain _____ 2020.'"
      options={[
        "in, from",
        "in, since",
        "at, from",
        "on, since"
      ]}
      correctAnswer={1}
      explanation="Usamos 'in' para países y 'since' para un punto específico en el tiempo."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la forma correcta para completar: 'I listen ___ music every day'?"
      options={[
        "at",
        "to",
        "in",
        "on"
      ]}
      correctAnswer={1}
      explanation="El verbo 'listen' siempre va seguido de 'to': 'I listen to music every day'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'I am at the bed' is correct.",
          isTrue: false,
          explanation: "Incorrecto. Para estar en la cama usamos 'in': 'I am in bed'."
        },
        {
          text: "'I go to home' is correct.",
          isTrue: false,
          explanation: "Incorrecto. Con 'home' no usamos 'to': 'I go home'."
        },
        {
          text: "'The meeting is on Monday' is correct.",
          isTrue: true,
          explanation: "Correcto. Para días específicos usamos 'on'."
        },
        {
          text: "'I wait for the bus' is correct.",
          isTrue: true,
          explanation: "Correcto. El verbo 'wait' va con 'for'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la forma correcta para completar: 'I was born ___ 1990'?"
      options={[
        "on",
        "at",
        "in",
        "for"
      ]}
      correctAnswer={2}
      explanation="Para años usamos 'in': 'I was born in 1990'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la forma correcta para completar: 'The book is ___ the table'?"
      options={[
        "in",
        "on",
        "at",
        "under"
      ]}
      correctAnswer={1}
      explanation="Para superficies usamos 'on': 'The book is on the table'."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "We use 'in' for months and years.",
          isTrue: true,
          explanation: "Correcto. Usamos 'in' para meses (in January) y años (in 2023)."
        },
        {
          text: "We say 'at night' but 'in the morning'.",
          isTrue: true,
          explanation: "Correcto. Decimos 'at night' pero 'in the morning/afternoon/evening'."
        },
        {
          text: "'I'm interested about music' is correct.",
          isTrue: false,
          explanation: "Incorrecto. Decimos 'interested IN music', no 'about'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'I'll see you ___ Friday ___ 3 PM.'"
      options={[
        "in / at",
        "on / at",
        "at / in",
        "on / in"
      ]}
      correctAnswer={1}
      explanation="Usamos 'on' para días (on Friday) y 'at' para horas específicas (at 3 PM)."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Cuál es la preposición correcta: 'She is good ___ mathematics'?"
      options={[
        "in",
        "at",
        "on",
        "with"
      ]}
      correctAnswer={1}
      explanation="Decimos 'good AT' algo: 'She is good at mathematics'."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'I go to work by car' means I drive to work.",
          isTrue: true,
          explanation: "Correcto. 'By car' indica el medio de transporte utilizado."
        },
        {
          text: "We can say 'I live in London' and 'I live at London'.",
          isTrue: false,
          explanation: "Incorrecto. Para ciudades usamos 'in': 'I live IN London'. 'At' se usa para direcciones específicas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'The cat is hiding ___ the bed.'"
      options={[
        "on",
        "in",
        "under",
        "at"
      ]}
      correctAnswer={2}
      explanation="'Under' significa debajo de: 'The cat is hiding under the bed' (El gato se esconde debajo de la cama)."
    />
  ];

  return (
    <TheoryLayout
      title="Prepositions"
      description="Domina las preposiciones en inglés: lugar, tiempo, dirección y verbos con preposiciones. Esencial para expresar relaciones espaciales y temporales."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic vocabulary", "Understanding of nouns and verbs"]}
      estimatedTime="60 min"
    />
  );
};

export default PrepositionsPage;






















