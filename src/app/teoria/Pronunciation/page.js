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

const PronunciationPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es la Pronunciation?" icon="🗣️">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La <strong>pronunciation</strong> (pronunciación) es la forma correcta de producir los sonidos del inglés. 
          Una buena pronunciación es esencial para la comunicación efectiva y la comprensión mutua.
        </p>
        
        <QuickReference items={[
          "Fonemas: sonidos individuales del inglés",
          "Acentos: énfasis en sílabas específicas",
          "Entonación: subida y bajada de la voz",
          "Ritmo: velocidad y pausas al hablar",
          "Práctica regular para mejorar"
        ]} />
      </TheorySection>

      <TheorySection title="Fonemas y Sonidos Básicos" icon="🔊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El inglés tiene sonidos que pueden no existir en tu idioma nativo. Es importante aprender a distinguirlos y producirlos correctamente.
        </p>

        <GrammarTable
          caption="Sonidos Problemáticos Comunes"
          headers={["Sonido", "Símbolo IPA", "Palabra Ejemplo", "Diferencia"]}
          rows={[
            ["/θ/ (th suave)", "θ", "think, thank", "Pon la lengua entre los dientes"],
            ["/ð/ (th fuerte)", "ð", "this, that", "Vibración en la garganta"],
            ["/r/", "r", "red, right", "Lengua hacia atrás, no toca el paladar"],
            ["/l/", "l", "light, like", "Lengua toca el paladar"],
            ["/v/", "v", "very, voice", "Labio inferior contra los dientes superiores"],
            ["/w/", "w", "water, work", "Labios redondeados, como una 'u'"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Think /θɪŋk/ - Piensa"
            english="Think /θɪŋk/ - Think"
            translation="Think /θɪŋk/ - Piensa"
          />
          <Example 
            spanish="This /ðɪs/ - Esto"
            english="This /ðɪs/ - This"
            translation="This /ðɪs/ - Esto"
          />
          <Example 
            spanish="Red /red/ - Rojo"
            english="Red /red/ - Red"
            translation="Red /red/ - Rojo"
          />
          <Example 
            spanish="Light /laɪt/ - Luz"
            english="Light /laɪt/ - Light"
            translation="Light /laɪt/ - Luz"
          />
        </div>

        <Rule 
          title="Consejos para Mejorar los Sonidos"
          description="Para pronunciar mejor:"
          examples={[
            "Practica frente al espejo para ver la posición de la boca",
            "Grabate y compara con hablantes nativos",
            "Practica con palabras mínimas (minimal pairs)",
            "Usa aplicaciones de pronunciación"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> No te preocupes por la perfección - la claridad es más importante que el acento perfecto.
        </Tip>
      </TheorySection>

      <TheorySection title="Word Stress (Acento en Palabras)" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El acento en palabras es fundamental en inglés. Una sílaba acentuada incorrectamente puede cambiar completamente el significado.
        </p>

        <GrammarTable
          caption="Reglas de Acento en Palabras"
          headers={["Tipo de Palabra", "Regla", "Ejemplo", "Acento"]}
          rows={[
            ["Sustantivos de 2 sílabas", "Primera sílaba", "PHOtograph, COMputer", "PHO-to-graph"],
            ["Verbos de 2 sílabas", "Segunda sílaba", "reCORD, preSENT", "re-CORD"],
            ["Palabras con prefijos", "Sílabas después del prefijo", "unHAPPY, rePEAT", "un-HAP-py"],
            ["Sufijos -tion, -sion", "Antes del sufijo", "inforMAtion, deciSION", "in-for-MA-tion"],
            ["Sufijos -ic, -ical", "Antes del sufijo", "eLECtric, hisTORical", "e-LEC-tric"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="PHOtograph (sustantivo) vs phoTOgraphy (verbo)"
            english="PHOtograph (noun) vs phoTOgraphy (verb)"
            translation="PHOtograph (sustantivo) vs phoTOgraphy (verbo)"
          />
          <Example 
            spanish="REcord (registro) vs reCORD (grabar)"
            english="REcord (noun) vs reCORD (verb)"
            translation="REcord (registro) vs reCORD (grabar)"
          />
          <Example 
            spanish="COMputer (computadora)"
            english="COMputer (computer)"
            translation="COMputer (computadora)"
          />
        </div>

        <Rule 
          title="Importancia del Acento"
          description="El acento correcto:"
          examples={[
            "Ayuda a la comprensión",
            "Evita malentendidos",
            "Hace que suenes más natural",
            "Es más importante que los sonidos individuales"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> El acento incorrecto puede hacer que no te entiendan, incluso si pronuncias bien los sonidos.
        </Tip>
      </TheorySection>

      <TheorySection title="Sentence Stress (Acento en Oraciones)" icon="📢">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          En las oraciones, algunas palabras se acentúan más que otras para transmitir el significado y la emoción.
        </p>

        <GrammarTable
          caption="Palabras que se Acentúan en Oraciones"
          headers={["Tipo de Palabra", "Se Acentúa", "Ejemplo", "Razón"]}
          rows={[
            ["Content Words", "Sí", "nouns, verbs, adjectives, adverbs", "Contienen el significado principal"],
            ["Function Words", "No", "articles, prepositions, pronouns", "Son gramaticales, no semánticas"],
            ["Palabras importantes", "Sí", "nueva información, énfasis", "Información clave del mensaje"],
            ["Palabras ya mencionadas", "No", "información conocida", "No aportan información nueva"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="I BOUGHT a NEW CAR yesterday"
            english="I BOUGHT a NEW CAR yesterday"
            translation="COMPRÉ un COCHE NUEVO ayer"
          />
          <Example 
            spanish="The BOOK is on the TABLE"
            english="The BOOK is on the TABLE"
            translation="El LIBRO está en la MESA"
          />
          <Example 
            spanish="I LOVE this MUSIC"
            english="I LOVE this MUSIC"
            translation="ME ENCANTA esta MÚSICA"
          />
        </div>

        <Rule 
          title="Reglas de Acento en Oraciones"
          description="Generalmente se acentúan:"
          examples={[
            "Sustantivos: book, car, house",
            "Verbos principales: go, come, see",
            "Adjetivos: big, small, beautiful",
            "Adverbios: quickly, slowly, well"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Las palabras de contenido (content words) llevan el ritmo de la oración.
        </Tip>
      </TheorySection>

      <TheorySection title="Intonation (Entonación)" icon="🎵">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La entonación es la subida y bajada de la voz que transmite emociones y significado.
        </p>

        <GrammarTable
          caption="Patrones de Entonación"
          headers={["Patrón", "Dirección", "Uso", "Ejemplo"]}
          rows={[
            ["Falling", "Bajada al final", "Declaraciones, órdenes", "I like it. ↘"],
            ["Rising", "Subida al final", "Preguntas sí/no", "Do you like it? ↗"],
            ["Rise-Fall", "Subida y bajada", "Preguntas con wh-", "What do you want? ↗↘"],
            ["Fall-Rise", "Bajada y subida", "Incertidumbre, cortesía", "Maybe. ↘↗"],
            ["Flat", "Sin cambio", "Enumeración, neutral", "One, two, three. →"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Declaración: 'I like it.' (bajada al final)"
            english="Statement: 'I like it.' (falling at the end)"
            translation="Declaración: 'Me gusta.' (bajada al final)"
          />
          <Example 
            spanish="Pregunta sí/no: 'Do you like it?' (subida al final)"
            english="Yes/No question: 'Do you like it?' (rising at the end)"
            translation="Pregunta sí/no: '¿Te gusta?' (subida al final)"
          />
          <Example 
            spanish="Pregunta wh-: 'What do you want?' (subida y bajada)"
            english="Wh- question: 'What do you want?' (rise-fall)"
            translation="Pregunta wh-: '¿Qué quieres?' (subida y bajada)"
          />
        </div>

        <Rule 
          title="Función de la Entonación"
          description="La entonación ayuda a:"
          examples={[
            "Distinguir entre declaraciones y preguntas",
            "Expresar emociones y actitudes",
            "Mostrar cortesía o firmeza",
            "Indicar si estás seguro o inseguro"
          ]}
        />

        <Tip type="info">
          <strong>Nota:</strong> La entonación puede cambiar completamente el significado de una frase.
        </Tip>
      </TheorySection>

      <TheorySection title="Connected Speech (Habla Conectada)" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          En el habla natural, los sonidos se conectan y modifican entre sí, creando un flujo continuo.
        </p>

        <GrammarTable
          caption="Fenómenos de Habla Conectada"
          headers={["Fenómeno", "Descripción", "Ejemplo", "Resultado"]}
          rows={[
            ["Linking", "Conectar sonidos finales e iniciales", "an apple → anapple", "Flujo continuo"],
            ["Elision", "Eliminar sonidos", "don't → don", "Habla más rápida"],
            ["Assimilation", "Sonidos se influyen mutuamente", "handbag → hambag", "Facilidad de pronunciación"],
            ["Intrusion", "Agregar sonidos", "go on → go won", "Transición suave"],
            ["Weak forms", "Formas débiles de palabras", "and → 'n'", "Ritmo natural"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="'an apple' se pronuncia 'anapple'"
            english="'an apple' is pronounced 'anapple'"
            translation="'an apple' se pronuncia 'anapple'"
          />
          <Example 
            spanish="'don't' se pronuncia 'don'"
            english="'don't' is pronounced 'don'"
            translation="'don't' se pronuncia 'don'"
          />
          <Example 
            spanish="'go on' se pronuncia 'go won'"
            english="'go on' is pronounced 'go won'"
            translation="'go on' se pronuncia 'go won'"
          />
        </div>

        <Rule 
          title="Consejos para Habla Conectada"
          description="Para sonar más natural:"
          examples={[
            "Practica frases completas, no palabras aisladas",
            "Escucha hablantes nativos en conversación",
            "Imita el ritmo y la fluidez",
            "No te preocupes por pronunciar cada sonido perfectamente"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> El habla conectada puede hacer que sea más difícil entender, pero es natural en el inglés hablado.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Pronunciar cada palabra por separado ❌<br/>
            <strong>Correcto:</strong> Conectar palabras naturalmente ✅<br/>
            <em>El inglés fluye, no se habla palabra por palabra</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Acentuar todas las palabras igual ❌<br/>
            <strong>Correcto:</strong> Acentuar palabras de contenido ✅<br/>
            <em>El acento da ritmo y significado</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar entonación plana ❌<br/>
            <strong>Correcto:</strong> Variar la entonación según el contexto ✅<br/>
            <em>La entonación transmite emociones y significado</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Ignorar los sonidos difíciles ❌<br/>
            <strong>Correcto:</strong> Practicar sonidos problemáticos ✅<br/>
            <em>Los sonidos correctos mejoran la comprensión</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Práctica regular"
            description="La pronunciación mejora con la práctica constante."
            examples={[
              "Practica diariamente, aunque sea 10 minutos",
              "Grabate y escucha tu pronunciación",
              "Imita hablantes nativos",
              "Usa aplicaciones de pronunciación"
            ]}
          />

          <Rule 
            title="2. Escucha activa"
            description="Escucha inglés auténtico para desarrollar tu oído."
            examples={[
              "Peliculas, series, podcasts en inglés",
              "Presta atención a la pronunciación",
              "Repite frases que escuches",
              "Imita el ritmo y entonación"
            ]}
          />

          <Rule 
            title="3. No busques perfección"
            description="La claridad es más importante que el acento perfecto."
            examples={[
              "Enfócate en ser entendido",
              "No te preocupes por sonar nativo",
              "Mejora gradualmente",
              "Celebra tus progresos"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="Para pronunciar /θ/ como en 'think', debo poner la ___ (lengua/labios) entre los dientes. El acento en 'COMputer' está en la ___ (primera/segunda) sílaba. En 'I BOUGHT a NEW CAR', las palabras acentuadas son ___ (content/function) words."
      blanks={[
        { answer: "lengua" },
        { answer: "primera" },
        { answer: "content" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la pronunciación correcta del acento en la palabra 'computer'?"
      options={[
        "comPUter",
        "COMputer",
        "compuTER",
        "com-put-er"
      ]}
      correctAnswer={1}
      explanation="'Computer' es un sustantivo de 3 sílabas, y el acento está en la segunda sílaba: COM-put-er."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "El acento en las palabras es menos importante que los sonidos individuales.",
          isTrue: false,
          explanation: "Incorrecto. El acento es muy importante y puede cambiar el significado de las palabras."
        },
        {
          text: "En las oraciones, las palabras de contenido (nouns, verbs) se acentúan más.",
          isTrue: true,
          explanation: "Correcto. Las content words (sustantivos, verbos, adjetivos, adverbios) se acentúan más que las function words."
        },
        {
          text: "La entonación ascendente se usa en preguntas de sí/no.",
          isTrue: true,
          explanation: "Correcto. Las preguntas de sí/no generalmente terminan con entonación ascendente."
        },
        {
          text: "En habla conectada, todas las palabras se pronuncian claramente por separado.",
          isTrue: false,
          explanation: "Incorrecto. En habla conectada, los sonidos se conectan y modifican para crear un flujo natural."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la diferencia entre /θ/ y /ð/?"
      options={[
        "No hay diferencia",
        "/θ/ es sonoro y /ð/ es sordo",
        "/θ/ es sordo y /ð/ es sonoro",
        "Son el mismo sonido"
      ]}
      correctAnswer={2}
      explanation="/θ/ (como en 'think') es sordo (sin vibración), mientras que /ð/ (como en 'this') es sonoro (con vibración)."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué tipo de entonación se usa generalmente en declaraciones?"
      options={[
        "Ascendente",
        "Descendente",
        "Plana",
        "Ascendente-descendente"
      ]}
      correctAnswer={1}
      explanation="Las declaraciones generalmente terminan con entonación descendente, indicando que la información está completa."
    />
  ];

  return (
    <TheoryLayout
      title="Pronunciation"
      description="Domina la pronunciación en inglés: fonemas, acentos, entonación y habla conectada. Esencial para comunicarte efectivamente en inglés."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic English sounds", "Understanding of IPA symbols"]}
      estimatedTime="80 min"
    />
  );
};

export default PronunciationPage;



