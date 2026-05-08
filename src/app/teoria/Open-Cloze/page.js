'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const OpenClozePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Open Cloze?" icon="📝">
        <p>
          <strong>Open Cloze</strong> es la Parte 2 del examen Use of English en First Certificate (B2) y Advanced (C1). 
          Debes completar 8 espacios en blanco en un texto sin opciones múltiples, usando solo UNA palabra por espacio. 
          Este ejercicio evalúa gramática, vocabulario funcional y comprensión contextual.
        </p>
        
        <Example 
          title="Ejemplo de Open Cloze"
          content="The weather was terrible yesterday. It _____ raining all day and the wind was very strong. People had to _____ inside their houses because _____ was dangerous to go out."
          explanation="Respuestas: was, stay, it. Debes usar contexto y gramática para encontrar las palabras correctas."
        />
      </TheorySection>

      <TheorySection title="Estrategias Principales" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Lee todo el texto primero"
            description="Entiende el tema general antes de completar los espacios."
            examples={[
              "Identifica si es formal o informal",
              "Reconoce el tema principal",
              "Nota el tiempo verbal predominante",
              "Observa el estilo del texto"
            ]}
          />

          <Rule 
            title="2. Analiza el contexto inmediato"
            description="Mira las palabras antes y después del espacio."
            examples={[
              "Preposiciones que requieren palabras específicas",
              "Artículos que indican sustantivos",
              "Auxiliares que indican verbos principales",
              "Conectores que unen ideas"
            ]}
          />

          <Rule 
            title="3. Considera la gramática"
            description="Piensa en qué tipo de palabra necesitas."
            examples={[
              "¿Necesitas un sustantivo, verbo, adjetivo?",
              "¿Qué tiempo verbal es apropiado?",
              "¿Singular o plural?",
              "¿Forma positiva o negativa?"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Tipos comunes de palabras en certificación B2" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Palabras funcionales (70% del examen)"
            description="Las más frecuentes en ejercicios tipo Open Cloze."
            examples={[
              "Artículos: a, an, the (especialmente 'the' con superlativos)",
              "Preposiciones: in, on, at, for, with, by, of, from",
              "Pronombres: it, they, them, this, that, which, who",
              "Auxiliares: do, does, did, will, would, have, has, had"
            ]}
          />

          <Rule 
            title="2. Conectores y transiciones"
            description="Palabras que unen ideas y párrafos."
            examples={[
              "Contraste: but, however, although",
              "Adición: and, also, furthermore",
              "Resultado: so, therefore, consequently",
              "Tiempo: when, while, after, before"
            ]}
          />

          <Rule 
            title="3. Palabras de contenido"
            description="Sustantivos, verbos, adjetivos comunes."
            examples={[
              "Verbos frecuentes: make, take, get, go",
              "Sustantivos comunes: time, way, people, work",
              "Adjetivos básicos: good, bad, big, small",
              "Adverbios: very, really, quite, rather"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Una palabra por espacio"
            description="Generalmente solo necesitas una palabra por espacio."
            examples={[
              "No uses contracciones (don't → do not)",
              "Evita frases largas",
              "Piensa en la palabra más simple",
              "Considera palabras de alta frecuencia"
            ]}
          />

          <Rule 
            title="2. Consistencia textual"
            description="Mantén consistencia con el resto del texto."
            examples={[
              "Mismo registro (formal/informal)",
              "Mismo tiempo verbal cuando sea apropiado",
              "Mismo estilo de vocabulario",
              "Coherencia temática"
            ]}
          />

          <Rule 
            title="3. Verificación final"
            description="Siempre revisa tus respuestas en contexto."
            examples={[
              "Lee la oración completa con tu respuesta",
              "Verifica que tenga sentido gramaticalmente",
              "Confirma que el significado sea lógico",
              "Revisa la ortografía"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Estrategias específicas para el examen" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="Gestión del tiempo (10-12 minutos)"
            description="Distribución recomendada para Open Cloze en el examen."
            examples={[
              "2-3 minutos: Lectura inicial completa del texto",
              "5-6 minutos: Completar los 8 espacios",
              "2-3 minutos: Revisión y verificación final",
              "No gastes más de 1 minuto por respuesta"
            ]}
          />

          <Rule 
            title="Patrones frecuentes en el examen"
            description="Estructuras que aparecen regularmente en los exámenes."
            examples={[
              "Phrasal verbs: look forward TO, depend ON",
              "Expresiones fijas: in spite OF, as well AS",
              "Estructuras comparativas: as... as, more... than",
              "Condicionales: if, unless, provided THAT"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="En Open Cloze, ¿cuántas palabras debes usar generalmente por espacio?"
      options={[
        "Tantas como necesites",
        "Una palabra",
        "Dos o tres palabras",
        "Depende del contexto"
      ]}
      correctAnswer={1}
      explanation="En Open Cloze generalmente debes usar solo una palabra por espacio, evitando contracciones y frases largas."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la primera estrategia recomendada para Open Cloze?"
      options={[
        "Completar los espacios inmediatamente",
        "Leer todo el texto primero",
        "Contar los espacios en blanco",
        "Buscar palabras difíciles"
      ]}
      correctAnswer={1}
      explanation="Debes leer todo el texto primero para entender el contexto general antes de completar los espacios."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "En Open Cloze puedes usar contracciones como 'don't' o 'can't'.",
          isTrue: false,
          explanation: "Incorrecto. En Open Cloze generalmente debes evitar contracciones y usar formas completas."
        },
        {
          text: "El contexto inmediato es importante para elegir la palabra correcta.",
          isTrue: true,
          explanation: "Correcto. Las palabras antes y después del espacio te dan pistas importantes sobre qué palabra necesitas."
        },
        {
          text: "Solo necesitas considerar la gramática, no el significado.",
          isTrue: false,
          explanation: "Incorrecto. Debes considerar tanto la gramática como el significado y el contexto del texto."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Complete: 'She has been living in London _____ five years.'"
      options={[
        "since",
        "for",
        "during",
        "from"
      ]}
      correctAnswer={1}
      explanation="'For' se usa con períodos de tiempo (five years). 'Since' se usa con puntos específicos en el tiempo."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué tipo de palabras son más comunes en Open Cloze?"
      options={[
        "Palabras técnicas especializadas",
        "Palabras funcionales y conectores",
        "Nombres propios",
        "Palabras muy largas"
      ]}
      correctAnswer={1}
      explanation="Las palabras funcionales (artículos, preposiciones, auxiliares) y conectores son las más comunes en Open Cloze."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Debes mantener consistencia con el registro del texto.",
          isTrue: true,
          explanation: "Correcto. Si el texto es formal, tus respuestas deben ser formales; si es informal, deben ser informales."
        },
        {
          text: "No importa el tiempo verbal del resto del texto.",
          isTrue: false,
          explanation: "Incorrecto. Debes mantener consistencia con el tiempo verbal predominante cuando sea apropiado."
        },
        {
          text: "Siempre debes revisar tus respuestas en contexto.",
          isTrue: true,
          explanation: "Correcto. Es importante leer la oración completa con tu respuesta para verificar que tenga sentido."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'The meeting will take place _____ Monday morning.'"
      options={[
        "in",
        "on",
        "at",
        "by"
      ]}
      correctAnswer={1}
      explanation="'On' se usa con días específicos: 'on Monday morning'. 'In' se usa con meses/años, 'at' con horas específicas."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Cuál es la mejor estrategia cuando no estás seguro de una respuesta?"
      options={[
        "Dejar el espacio en blanco",
        "Escribir cualquier palabra",
        "Analizar el contexto y la gramática cuidadosamente",
        "Copiar una palabra del texto"
      ]}
      correctAnswer={2}
      explanation="Debes analizar cuidadosamente el contexto y la gramática para hacer la mejor estimación posible."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Los conectores como 'however' y 'therefore' son comunes en Open Cloze.",
          isTrue: true,
          explanation: "Correcto. Los conectores que unen ideas son muy frecuentes en este tipo de ejercicio."
        },
        {
          text: "Debes usar siempre la palabra más compleja que conozcas.",
          isTrue: false,
          explanation: "Incorrecto. Es mejor usar palabras simples y de alta frecuencia que encajen perfectamente en el contexto."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'I would have called you _____ I had known you were coming.'"
      options={[
        "if",
        "when",
        "because",
        "although"
      ]}
      correctAnswer={0}
      explanation="'If' es correcto para esta estructura condicional de tercer tipo: 'would have + past participle' + 'if' + 'had + past participle'."
    />
  ];

  return (
    <TheoryLayout
      title="Open Cloze"
      description="Domina los ejercicios de Open Cloze. Aprende estrategias para completar espacios en blanco usando contexto, gramática y vocabulario apropiado."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced grammar", "Strong vocabulary", "Reading comprehension"]}
      estimatedTime="80 min"
    />
  );
};

export default OpenClozePage;
