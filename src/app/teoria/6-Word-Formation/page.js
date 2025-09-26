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

const WordFormationPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Word Formation?" icon="🔤">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La <strong>word formation</strong> (formación de palabras) es el proceso de crear nuevas palabras a partir de palabras existentes 
          usando prefijos, sufijos y otros métodos. Es fundamental para expandir tu vocabulario y entender el significado de palabras desconocidas.
        </p>
        
        <QuickReference items={[
          "Prefijos: cambian el significado (un-, re-, pre-)",
          "Sufijos: cambian la categoría gramatical (-ly, -tion, -ful)",
          "Compuestos: unir dos palabras (toothbrush, bedroom)",
          "Conversión: cambiar categoría sin modificar (walk → walk)",
          "Abreviaciones: acortar palabras (ad → advertisement)"
        ]} />
      </TheorySection>

      <TheorySection title="Prefixes (Prefijos)" icon="🔝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los prefijos se agregan al inicio de una palabra para cambiar su significado.
        </p>

        <GrammarTable
          caption="Prefijos Comunes y sus Significados"
          headers={["Prefijo", "Significado", "Ejemplo", "Palabra Original"]}
          rows={[
            ["un-", "Negativo", "unhappy", "happy"],
            ["re-", "De nuevo", "rewrite", "write"],
            ["pre-", "Antes", "preview", "view"],
            ["dis-", "Negativo", "disagree", "agree"],
            ["mis-", "Mal", "misunderstand", "understand"],
            ["over-", "Exceso", "overcook", "cook"],
            ["under-", "Debajo", "underestimate", "estimate"],
            ["non-", "No", "non-smoker", "smoker"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Estoy infeliz con el resultado"
            english="I am unhappy with the result"
            translation="Estoy infeliz con el resultado"
          />
          <Example 
            spanish="Necesito reescribir este ensayo"
            english="I need to rewrite this essay"
            translation="Necesito reescribir este ensayo"
          />
          <Example 
            spanish="Malentendí tus instrucciones"
            english="I misunderstood your instructions"
            translation="Malentendí tus instrucciones"
          />
        </div>

        <Rule 
          title="Uso de Prefijos"
          description="Los prefijos no cambian la categoría gramatical de la palabra:"
          examples={[
            "Happy (adj) → Unhappy (adj)",
            "Write (verb) → Rewrite (verb)",
            "Agree (verb) → Disagree (verb)"
          ]}
        />

        <Tip type="info">
          <strong>Recuerda:</strong> Los prefijos se escriben unidos a la palabra base, sin guión.
        </Tip>
      </TheorySection>

      <TheorySection title="Suffixes (Sufijos)" icon="🔚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los sufijos se agregan al final de una palabra para cambiar su categoría gramatical o significado.
        </p>

        <GrammarTable
          caption="Sufijos Comunes para Diferentes Categorías"
          headers={["Sufijo", "Categoría", "Ejemplo", "Palabra Original"]}
          rows={[
            ["-ly", "Adverbio", "quickly", "quick"],
            ["-tion/-sion", "Sustantivo", "education", "educate"],
            ["-ful", "Adjetivo", "beautiful", "beauty"],
            ["-less", "Adjetivo", "hopeless", "hope"],
            ["-er/-or", "Sustantivo", "teacher", "teach"],
            ["-ness", "Sustantivo", "happiness", "happy"],
            ["-able/-ible", "Adjetivo", "comfortable", "comfort"],
            ["-ment", "Sustantivo", "development", "develop"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Corre rápidamente"
            english="He runs quickly"
            translation="Corre rápidamente"
          />
          <Example 
            spanish="La educación es importante"
            english="Education is important"
            translation="La educación es importante"
          />
          <Example 
            spanish="Es una situación sin esperanza"
            english="It's a hopeless situation"
            translation="Es una situación sin esperanza"
          />
        </div>

        <Rule 
          title="Cambios de Categoría con Sufijos"
          description="Los sufijos pueden cambiar la categoría gramatical:"
          examples={[
            "Quick (adj) → Quickly (adv)",
            "Educate (verb) → Education (noun)",
            "Hope (noun) → Hopeless (adj)"
          ]}
        />

        <Tip type="warning">
          <strong>Ortografía:</strong> Algunos sufijos requieren cambios ortográficos en la palabra base.
        </Tip>
      </TheorySection>

      <TheorySection title="Compound Words (Palabras Compuestas)" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las palabras compuestas se forman uniendo dos o más palabras para crear una nueva palabra con un significado específico.
        </p>

        <GrammarTable
          caption="Tipos de Palabras Compuestas"
          headers={["Tipo", "Forma", "Ejemplo", "Significado"]}
          rows={[
            ["Sustantivo + Sustantivo", "toothbrush", "tooth + brush", "cepillo de dientes"],
            ["Adjetivo + Sustantivo", "blackboard", "black + board", "pizarra"],
            ["Verbo + Sustantivo", "swimming pool", "swimming + pool", "piscina"],
            ["Sustantivo + Verbo", "sunrise", "sun + rise", "amanecer"],
            ["Adjetivo + Adjetivo", "red-hot", "red + hot", "al rojo vivo"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Uso un cepillo de dientes todas las mañanas"
            english="I use a toothbrush every morning"
            translation="Uso un cepillo de dientes todas las mañanas"
          />
          <Example 
            spanish="El profesor escribe en la pizarra"
            english="The teacher writes on the blackboard"
            translation="El profesor escribe en la pizarra"
          />
          <Example 
            spanish="Vamos a nadar a la piscina"
            english="We go swimming at the swimming pool"
            translation="Vamos a nadar a la piscina"
          />
        </div>

        <Rule 
          title="Formación de Compuestos"
          description="Las palabras compuestas pueden escribirse:"
          examples={[
            "Juntas: toothbrush, bedroom, notebook",
            "Con guión: mother-in-law, state-of-the-art",
            "Separadas: swimming pool, ice cream"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> El significado de una palabra compuesta no siempre es la suma de sus partes.
        </Tip>
      </TheorySection>

      <TheorySection title="Conversion (Conversión)" icon="🔄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La conversión es cambiar la categoría gramatical de una palabra sin modificar su forma.
        </p>

        <GrammarTable
          caption="Ejemplos de Conversión"
          headers={["Palabra Original", "Nueva Categoría", "Ejemplo", "Significado"]}
          rows={[
            ["walk (verb)", "noun", "go for a walk", "dar un paseo"],
            ["email (noun)", "verb", "email me", "enviarme un email"],
            ["green (adj)", "noun", "the greens", "los verdes (vegetales)"],
            ["water (noun)", "verb", "water the plants", "regar las plantas"],
            ["clean (adj)", "verb", "clean the room", "limpiar la habitación"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Voy a dar un paseo"
            english="I'm going for a walk"
            translation="Voy a dar un paseo"
          />
          <Example 
            spanish="Envíame un email"
            english="Email me"
            translation="Envíame un email"
          />
          <Example 
            spanish="Riega las plantas"
            english="Water the plants"
            translation="Riega las plantas"
          />
        </div>

        <Tip type="info">
          <strong>Nota:</strong> La conversión es muy común en inglés, especialmente para crear verbos a partir de sustantivos.
        </Tip>
      </TheorySection>

      <TheorySection title="Abbreviations and Acronyms" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las abreviaciones y acrónimos son formas cortas de palabras o frases largas.
        </p>

        <GrammarTable
          caption="Tipos de Abreviaciones"
          headers={["Tipo", "Ejemplo", "Forma Completa", "Significado"]}
          rows={[
            ["Abreviación", "ad", "advertisement", "anuncio"],
            ["Abreviación", "info", "information", "información"],
            ["Acrónimo", "NASA", "National Aeronautics and Space Administration", "Administración Nacional de Aeronáutica y Espacio"],
            ["Acrónimo", "UNESCO", "United Nations Educational, Scientific and Cultural Organization", "Organización de las Naciones Unidas para la Educación"],
            ["Acrónimo", "ATM", "Automated Teller Machine", "cajero automático"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Vi un anuncio en el periódico"
            english="I saw an ad in the newspaper"
            translation="Vi un anuncio en el periódico"
          />
          <Example 
            spanish="Necesito más información"
            english="I need more info"
            translation="Necesito más información"
          />
          <Example 
            spanish="NASA envió una nave espacial"
            english="NASA sent a spacecraft"
            translation="NASA envió una nave espacial"
          />
        </div>

        <Tip type="warning">
          <strong>Uso:</strong> Las abreviaciones son más comunes en contextos informales, los acrónimos se usan tanto formal como informalmente.        
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "un-happy" ❌<br/>
            <strong>Correcto:</strong> "unhappy" ✅<br/>
            <em>Los prefijos se escriben unidos a la palabra base</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "quicklyly" ❌<br/>
            <strong>Correcto:</strong> "quickly" ✅<br/>
            <em>No agregues sufijos a palabras que ya los tienen</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "tooth brush" ❌<br/>
            <strong>Correcto:</strong> "toothbrush" ✅<br/>
            <em>Las palabras compuestas se escriben juntas</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "I will email to you" ❌<br/>
            <strong>Correcto:</strong> "I will email you" ✅<br/>
            <em>Cuando 'email' es verbo, no necesita 'to'</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Prefijos y ortografía"
            description="Los prefijos no cambian la ortografía de la palabra base."
            examples={[
              "Happy → Unhappy (no 'un-happy')",
              "Write → Rewrite (no 're-write')"
            ]}
          />

          <Rule 
            title="2. Sufijos y cambios ortográficos"
            description="Algunos sufijos requieren cambios en la palabra base."
            examples={[
              "Happy → Happiness (y → i)",
              "Run → Running (doble n)",
              "Love → Lovable (e se elimina)"
            ]}
          />

          <Rule 
            title="3. Palabras compuestas"
            description="El significado puede ser diferente a la suma de las partes."
            examples={[
              "Blackboard (pizarra, no 'tabla negra')",
              "Hot dog (perrito caliente, no 'perro caliente')"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="I need to ___ (write) this essay. The ___ (educate) system needs improvement. She is a very ___ (beauty) person. The ___ (hope) situation made everyone sad. I ___ (email) you tomorrow."
      blanks={[
        { answer: "rewrite" },
        { answer: "education" },
        { answer: "beautiful" },
        { answer: "hopeless" },
        { answer: "will email" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la forma correcta para completar: 'I need to ___ this letter'?"
      options={[
        "rewrite",
        "re-write",
        "write again",
        "rewrite again"
      ]}
      correctAnswer={0}
      explanation="Los prefijos se escriben unidos a la palabra base: 'rewrite'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'Un-happy' is the correct spelling.",
          isTrue: false,
          explanation: "Incorrecto. Los prefijos se escriben unidos: 'unhappy'."
        },
        {
          text: "'Toothbrush' is a compound word.",
          isTrue: true,
          explanation: "Correcto. 'Toothbrush' está formado por 'tooth' + 'brush'."
        },
        {
          text: "'Email' can be both a noun and a verb.",
          isTrue: true,
          explanation: "Correcto. 'Email' es conversión: puede ser sustantivo o verbo."
        },
        {
          text: "'Beautifully' is formed by adding a suffix to 'beautiful'.",
          isTrue: false,
          explanation: "Incorrecto. 'Beautifully' se forma de 'beautiful' + '-ly', pero 'beautiful' ya tiene el sufijo '-ful'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la forma correcta para completar: 'The ___ of this project is important'?"
      options={[
        "develop",
        "development",
        "developing",
        "developed"
      ]}
      correctAnswer={1}
      explanation="Necesitamos un sustantivo. 'Development' se forma agregando '-ment' al verbo 'develop'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la forma correcta para completar: 'I will ___ you the information'?"
      options={[
        "email to",
        "email",
        "email for",
        "email with"
      ]}
      correctAnswer={1}
      explanation="Cuando 'email' es verbo, no necesita preposición: 'I will email you'."
    />
  ];

  return (
    <TheoryLayout
      title="Word Formation"
      description="Domina la formación de palabras en inglés: prefijos, sufijos, palabras compuestas, conversión y abreviaciones. Esencial para expandir tu vocabulario."
      level="B2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced vocabulary", "Understanding of word categories"]}
      estimatedTime="70 min"
    />
  );
};

export default WordFormationPage;

