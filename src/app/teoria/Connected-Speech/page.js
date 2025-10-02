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

const ConnectedSpeechPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Connected Speech?" icon="🔗">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El <strong>connected speech</strong> (habla conectada) se refiere a cómo los sonidos se modifican y conectan 
          cuando hablamos de forma natural y fluida. Es fundamental para entender el inglés hablado real.
        </p>
        
        <QuickReference items={[
          "Linking: conectar sonidos finales e iniciales",
          "Elision: eliminar sonidos",
          "Assimilation: sonidos se influyen mutuamente",
          "Intrusion: agregar sonidos de transición",
          "Weak forms: formas débiles de palabras"
        ]} />
      </TheorySection>

      <TheorySection title="Linking (Conexión de Sonidos)" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El linking ocurre cuando conectamos sonidos finales e iniciales para crear un flujo continuo en el habla.
        </p>

        <GrammarTable
          caption="Tipos de Linking"
          headers={["Tipo", "Descripción", "Ejemplo", "Resultado"]}
          rows={[
            ["Consonant + Vowel", "Consonante final + vocal inicial", "an apple", "anapple"],
            ["Vowel + Vowel", "Vocal final + vocal inicial", "go out", "gowout"],
            ["Consonant + Consonant", "Consonante final + consonante inicial", "red dress", "reddress"],
            ["Same Consonant", "Misma consonante se une", "big girl", "biggirl"],
            ["R Linking", "R se pronuncia entre vocales", "car is", "caris"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Consonant + Vowel: 'an apple' → 'anapple'"
            english="Consonant + Vowel: 'an apple' → 'anapple'"
            translation="Consonante + Vocal: 'una manzana' → 'anapple'"
          />
          <Example 
            spanish="Vowel + Vowel: 'go out' → 'gowout'"
            english="Vowel + Vowel: 'go out' → 'gowout'"
            translation="Vocal + Vocal: 'salir' → 'gowout'"
          />
          <Example 
            spanish="R Linking: 'car is' → 'caris'"
            english="R Linking: 'car is' → 'caris'"
            translation="R Linking: 'el coche es' → 'caris'"
          />
        </div>

        <Rule 
          title="Reglas de Linking"
          description="Para entender el linking:"
          examples={[
            "Consonante final se conecta con vocal inicial",
            "Vocales se unen con sonidos de transición",
            "Consonantes idénticas se fusionan",
            "R se pronuncia entre vocales en British English"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> El linking hace que el inglés suene más fluido y natural.
        </Tip>
      </TheorySection>

      <TheorySection title="Elision (Eliminación de Sonidos)" icon="✂️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La elision ocurre cuando eliminamos sonidos para facilitar la pronunciación y acelerar el habla.
        </p>

        <GrammarTable
          caption="Tipos de Elision"
          headers={["Tipo", "Sonido Eliminado", "Ejemplo", "Resultado"]}
          rows={[
            ["Consonant Clusters", "Consonante en grupos", "handbag", "hambag"],
            ["Weak Syllables", "Sílabas débiles", "chocolate", "choclate"],
            ["Final Consonants", "Consonantes finales", "and", "an'"],
            ["Schwa Sounds", "Sonidos schwa", "camera", "camra"],
            ["Contractions", "Contracciones", "don't", "don'"],
            ["Function Words", "Palabras función", "of the", "o' the"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Consonant Clusters: 'handbag' → 'hambag'"
            english="Consonant Clusters: 'handbag' → 'hambag'"
            translation="Grupos consonánticos: 'bolso de mano' → 'hambag'"
          />
          <Example 
            spanish="Weak Syllables: 'chocolate' → 'choclate'"
            english="Weak Syllables: 'chocolate' → 'choclate'"
            translation="Sílabas débiles: 'chocolate' → 'choclate'"
          />
          <Example 
            spanish="Final Consonants: 'and' → 'an''"
            english="Final Consonants: 'and' → 'an''"
            translation="Consonantes finales: 'y' → 'an''"
          />
        </div>

        <Rule 
          title="Cuándo ocurre la Elision"
          description="La elision es más común:"
          examples={[
            "En habla rápida e informal",
            "En grupos consonánticos difíciles",
            "En sílabas no acentuadas",
            "En palabras función comunes"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> La elision puede hacer que sea más difícil entender palabras individuales.
        </Tip>
      </TheorySection>

      <TheorySection title="Assimilation (Asimilación)" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La asimilación ocurre cuando un sonido cambia para parecerse al sonido que le sigue.
        </p>

        <GrammarTable
          caption="Tipos de Assimilation"
          headers={["Tipo", "Cambio", "Ejemplo", "Resultado"]}
          rows={[
            ["Alveolar Assimilation", "t/d → p/b antes de labiales", "that pen", "thap pen"],
            ["Place Assimilation", "n → ŋ antes de velares", "ten cups", "teŋ cups"],
            ["Voicing Assimilation", "s → z antes de sonoras", "this boy", "thiz boy"],
            ["Nasal Assimilation", "n → m antes de labiales", "ten men", "tem men"],
            ["Lateral Assimilation", "n → l antes de laterales", "ten lions", "tel lions"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Alveolar Assimilation: 'that pen' → 'thap pen'"
            english="Alveolar Assimilation: 'that pen' → 'thap pen'"
            translation="Asimilación alveolar: 'esa pluma' → 'thap pen'"
          />
          <Example 
            spanish="Place Assimilation: 'ten cups' → 'teŋ cups'"
            english="Place Assimilation: 'ten cups' → 'teŋ cups'"
            translation="Asimilación de lugar: 'diez tazas' → 'teŋ cups'"
          />
          <Example 
            spanish="Voicing Assimilation: 'this boy' → 'thiz boy'"
            english="Voicing Assimilation: 'this boy' → 'thiz boy'"
            translation="Asimilación de sonoridad: 'este chico' → 'thiz boy'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> La asimilación hace que el habla sea más fluida y natural.
        </Tip>
      </TheorySection>

      <TheorySection title="Intrusion (Intrusión)" icon="➕">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La intrusión ocurre cuando agregamos sonidos para facilitar la transición entre otros sonidos.
        </p>

        <GrammarTable
          caption="Tipos de Intrusion"
          headers={["Tipo", "Sonido Agregado", "Ejemplo", "Resultado"]}
          rows={[
            ["J Intrusion", "/j/ entre vocales", "go out", "go(j)out"],
            ["W Intrusion", "/w/ entre vocales", "do it", "do(w)it"],
            ["R Intrusion", "/r/ entre vocales", "idea of", "idea(r)of"],
            ["Glottal Stop", "/ʔ/ en pausas", "uh-oh", "uhʔoh"],
            ["Linking R", "/r/ en British English", "car is", "car(r)is"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="J Intrusion: 'go out' → 'go(j)out'"
            english="J Intrusion: 'go out' → 'go(j)out'"
            translation="Intrusión J: 'salir' → 'go(j)out'"
          />
          <Example 
            spanish="W Intrusion: 'do it' → 'do(w)it'"
            english="W Intrusion: 'do it' → 'do(w)it'"
            translation="Intrusión W: 'hazlo' → 'do(w)it'"
          />
          <Example 
            spanish="R Intrusion: 'idea of' → 'idea(r)of'"
            english="R Intrusion: 'idea of' → 'idea(r)of'"
            translation="Intrusión R: 'idea de' → 'idea(r)of'"
          />
        </div>

        <Rule 
          title="Cuándo ocurre la Intrusión"
          description="La intrusión es más común:"
          examples={[
            "Entre vocales diferentes",
            "En palabras que terminan en vocal",
            "En palabras que empiezan con vocal",
            "Para evitar hiatos vocálicos"
          ]}
        />

        <Tip type="info">
          <strong>Nota:</strong> La intrusión es más común en habla rápida e informal.
        </Tip>
      </TheorySection>

      <TheorySection title="Weak Forms (Formas Débiles)" icon="🔇">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las formas débiles son versiones reducidas de palabras función que se pronuncian de manera menos prominente.
        </p>

        <GrammarTable
          caption="Palabras con Weak Forms"
          headers={["Palabra", "Forma Fuerte", "Forma Débil", "Ejemplo"]}
          rows={[
            ["and", "/ænd/", "/ənd/, /ən/, /n/", "bread and butter"],
            ["of", "/ɒv/", "/əv/, /ə/", "cup of tea"],
            ["to", "/tu:/", "/tə/, /tu/", "go to school"],
            ["for", "/fɔ:/", "/fə/, /fər/", "wait for me"],
            ["you", "/ju:/", "/jə/, /ju/", "thank you"],
            ["are", "/ɑ:/", "/ə/, /ər/", "they are here"],
            ["was", "/wɒz/", "/wəz/", "he was there"],
            ["can", "/kæn/", "/kən/, /kn/", "I can go"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="and: 'bread and butter' → 'bread ən butter'"
            english="and: 'bread and butter' → 'bread ən butter'"
            translation="and: 'pan y mantequilla' → 'bread ən butter'"
          />
          <Example 
            spanish="of: 'cup of tea' → 'cup ə tea'"
            english="of: 'cup of tea' → 'cup ə tea'"
            translation="of: 'taza de té' → 'cup ə tea'"
          />
          <Example 
            spanish="to: 'go to school' → 'go tə school'"
            english="to: 'go to school' → 'go tə school'"
            translation="to: 'ir a la escuela' → 'go tə school'"
          />
        </div>

        <Rule 
          title="Cuándo usar Weak Forms"
          description="Las formas débiles se usan:"
          examples={[
            "En palabras función (artículos, preposiciones, conjunciones)",
            "Cuando la palabra no está acentuada",
            "En habla rápida e informal",
            "Para mantener el ritmo del habla"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Las formas débiles pueden hacer que sea más difícil reconocer palabras individuales.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias para Entender Connected Speech" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Existen estrategias específicas para mejorar tu comprensión del habla conectada.
        </p>

        <GrammarTable
          caption="Estrategias de Comprensión"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Beneficio"]}
          rows={[
            ["Contexto", "Usar contexto para entender", "Palabras conectadas", "Comprensión general"],
            ["Predicción", "Predecir palabras basado en contexto", "Antes de escuchar", "Preparar la mente"],
            ["Escucha Activa", "Enfocarse en palabras clave", "Durante el audio", "Captar información importante"],
            ["Repetición", "Escuchar múltiples veces", "Después de la primera escucha", "Mejorar comprensión"],
            ["Transcripción", "Leer mientras escuchas", "Práctica intensiva", "Conectar sonido y texto"],
            ["Práctica Regular", "Exponerse regularmente", "Estudio diario", "Familiaridad con patrones"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Contexto: 'Usar el contexto para entender palabras conectadas'"
            english="Context: 'Use context to understand connected words'"
            translation="Contexto: 'Usar el contexto para entender palabras conectadas'"
          />
          <Example 
            spanish="Predicción: 'Predecir palabras basado en el contexto'"
            english="Prediction: 'Predict words based on context'"
            translation="Predicción: 'Predecir palabras basado en el contexto'"
          />
          <Example 
            spanish="Escucha activa: 'Enfocarse en palabras clave'"
            english="Active listening: 'Focus on key words'"
            translation="Escucha activa: 'Enfocarse en palabras clave'"
          />
        </div>

        <Rule 
          title="Consejos Prácticos"
          description="Para mejorar tu comprensión:"
          examples={[
            "Escucha habla natural, no habla artificial",
            "Practica con diferentes acentos y velocidades",
            "No te preocupes por entender cada palabra",
            "Enfócate en el mensaje general",
            "Usa subtítulos para conectar sonido y texto"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> La comprensión del habla conectada mejora con la exposición regular.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Esperar que cada palabra se pronuncie claramente ❌<br/>
            <strong>Correcto:</strong> Esperar conexiones y modificaciones naturales ✅<br/>
            <em>El habla natural no es clara palabra por palabra</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No usar contexto para entender ❌<br/>
            <strong>Correcto:</strong> Usar contexto para inferir significado ✅<br/>
            <em>El contexto es clave para entender habla conectada</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Preocuparse por cada sonido modificado ❌<br/>
            <strong>Correcto:</strong> Enfocarse en el mensaje general ✅<br/>
            <em>La comprensión general es más importante</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Evitar habla natural por ser difícil ❌<br/>
            <strong>Correcto:</strong> Exponerse regularmente a habla natural ✅<br/>
            <em>La exposición mejora la comprensión</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. El habla natural no es clara"
            description="El habla conectada es normal en el inglés hablado."
            examples={[
              "Los sonidos se modifican y conectan",
              "Las palabras se unen para crear fluidez",
              "Algunos sonidos se eliminan o cambian",
              "Esto es natural, no un error"
            ]}
          />

          <Rule 
            title="2. Contexto es clave"
            description="Usa el contexto para entender el significado."
            examples={[
              "El contexto te ayuda a inferir palabras",
              "Las palabras clave dan pistas importantes",
              "El propósito de la conversación guía la comprensión",
              "No necesitas entender cada palabra"
            ]}
          />

          <Rule 
            title="3. Exposición mejora comprensión"
            description="Escucha habla natural regularmente."
            examples={[
              "Expón tu oído a diferentes acentos",
              "Practica con habla rápida e informal",
              "Usa recursos auténticos",
              "La familiaridad mejora la comprensión"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="En connected speech, ¿qué hacen los sonidos para crear fluidez?"
      options={[
        "Se separan claramente",
        "Se conectan",
        "Se eliminan completamente",
        "Se pronuncian más lento"
      ]}
      correctAnswer={1}
      explanation="En connected speech, los sonidos se conectan para crear fluidez natural en el habla, haciendo que las palabras fluyan juntas."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Qué es el linking en connected speech?"
      options={[
        "Eliminar sonidos",
        "Conectar sonidos finales e iniciales",
        "Agregar sonidos de transición",
        "Cambiar la pronunciación de palabras"
      ]}
      correctAnswer={1}
      explanation="El linking es la conexión de sonidos finales e iniciales para crear un flujo continuo en el habla, como 'an apple' → 'anapple'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "El habla conectada es natural en el inglés hablado.",
          isTrue: true,
          explanation: "Correcto. El habla conectada es normal y natural en el inglés hablado, no es un error de pronunciación."
        },
        {
          text: "Las formas débiles se usan solo en palabras función.",
          isTrue: true,
          explanation: "Correcto. Las formas débiles se usan principalmente en palabras función como artículos, preposiciones y conjunciones."
        },
        {
          text: "Es importante entender cada palabra individualmente en habla conectada.",
          isTrue: false,
          explanation: "Incorrecto. Es más importante entender el mensaje general que cada palabra individual."
        },
        {
          text: "La exposición regular mejora la comprensión del habla conectada.",
          isTrue: true,
          explanation: "Correcto. Escuchar habla natural regularmente mejora la comprensión del habla conectada."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es el resultado del linking en 'go out'?"
      options={[
        "go out",
        "gowout",
        "go-ut",
        "gout"
      ]}
      correctAnswer={1}
      explanation="El linking entre vocales resulta en 'gowout' donde las vocales se conectan con un sonido de transición."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué estrategia es más efectiva para entender habla conectada?"
      options={[
        "Escuchar solo habla artificial",
        "Usar contexto para inferir significado",
        "Evitar habla rápida",
        "Memorizar todas las modificaciones"
      ]}
      correctAnswer={1}
      explanation="Usar el contexto para inferir significado es la estrategia más efectiva, ya que te ayuda a entender el mensaje general incluso cuando no entiendes cada palabra."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Weak forms only occur with function words.",
          isTrue: true,
          explanation: "Correcto. Las formas débiles ocurren principalmente con palabras funcionales como artículos, preposiciones y auxiliares."
        },
        {
          text: "Assimilation makes sounds more similar to neighboring sounds.",
          isTrue: true,
          explanation: "Correcto. La asimilación hace que los sonidos se parezcan más a los sonidos vecinos para facilitar la pronunciación."
        },
        {
          text: "Connected speech only happens in informal situations.",
          isTrue: false,
          explanation: "Incorrecto. El habla conectada ocurre en todas las situaciones, tanto formales como informales."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Qué ocurre en 'good day' con connected speech?"
      options={[
        "No hay cambios",
        "Se convierte en 'goo day'",
        "Se convierte en 'good-day'",
        "Se pronuncia más lento"
      ]}
      correctAnswer={1}
      explanation="En 'good day', la 'd' final de 'good' se elide (se omite) resultando en 'goo day'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Cuál es un ejemplo de intrusion?"
      options={[
        "I am → I'm",
        "law and order → 'lawr and order'",
        "good boy → 'goo boy'",
        "ten boys → 'tem boys'"
      ]}
      correctAnswer={1}
      explanation="En 'law and order' se inserta un sonido /r/ entre 'law' y 'and' para facilitar la transición: 'lawr and order'."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Elision always makes speech faster.",
          isTrue: true,
          explanation: "Correcto. La elisión (omisión de sonidos) hace que el habla sea más rápida y fluida."
        },
        {
          text: "Understanding connected speech requires knowing every sound change.",
          isTrue: false,
          explanation: "Incorrecto. No necesitas conocer cada cambio; el contexto y la práctica te ayudan a entender el significado general."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuál es la mejor manera de mejorar la comprensión del habla conectada?"
      options={[
        "Estudiar solo gramática",
        "Escuchar habla natural regularmente",
        "Evitar hablantes nativos",
        "Leer solo textos escritos"
      ]}
      correctAnswer={1}
      explanation="Escuchar habla natural regularmente es la mejor manera de acostumbrarse a los patrones del habla conectada."
    />
  ];

  return (
    <TheoryLayout
      title="Pronunciation and Connected Speech"
      description="Comprende el habla conectada en inglés: linking, elision, assimilation, intrusion y weak forms. Aprende estrategias para entender el inglés hablado natural."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic pronunciation", "Understanding of English sounds"]}
      estimatedTime="75 min"
    />
  );
};

export default ConnectedSpeechPage;






















