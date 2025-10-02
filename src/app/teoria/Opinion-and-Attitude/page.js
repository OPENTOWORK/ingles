'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const OpinionAndAttitudePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son Opinion y Attitude?" icon="💭">
        <p>
          <strong>Opinion</strong> es el punto de vista personal del autor sobre un tema. 
          <strong>Attitude</strong> es la postura emocional o mental del autor hacia el tema (positiva, negativa, neutral). 
          Identificar opiniones y actitudes te ayuda a entender la perspectiva del autor.
        </p>
        
        <Example 
          title="Ejemplo de Opinion y Attitude"
          content="Texto: 'While some argue that social media connects people, I believe it actually isolates us from genuine human interaction.'
          Opinion: El autor cree que las redes sociales aíslan a las personas.
          Attitude: Crítica/negativa hacia las redes sociales."
          explanation="El autor expresa claramente su opinión personal y muestra una actitud crítica hacia el tema."
        />
      </TheorySection>

      <TheorySection title="Identificando Opiniones" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Palabras de opinión explícitas"
            description="Frases que indican claramente que es una opinión personal."
            examples={[
              "I believe, I think, In my opinion, I feel",
              "It seems to me, From my perspective",
              "I would argue that, I maintain that",
              "Personally, I consider, I'm convinced that"
            ]}
          />

          <Tip 
            title="2. Verbos de opinión"
            description="Verbos que expresan creencias, juicios o evaluaciones."
            examples={[
              "Suggest, imply, indicate, demonstrate",
              "Prove, show, reveal, confirm",
              "Argue, claim, assert, contend",
              "Recommend, propose, advocate, support"
            ]}
          />

          <Tip 
            title="3. Adjetivos evaluativos"
            description="Adjetivos que expresan juicios de valor."
            examples={[
              "Excellent, terrible, wonderful, awful",
              "Effective, ineffective, successful, failed",
              "Important, trivial, significant, irrelevant",
              "Reasonable, absurd, logical, ridiculous"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Identificando Actitudes" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Actitud positiva"
            description="El autor muestra aprobación, entusiasmo o apoyo."
            examples={[
              "Palabras positivas: excellent, brilliant, outstanding",
              "Tono optimista: promising, encouraging, hopeful",
              "Apoyo explícito: I fully support, I strongly recommend",
              "Énfasis en beneficios: advantages, benefits, strengths"
            ]}
          />

          <Rule 
            title="2. Actitud negativa"
            description="El autor muestra desaprobación, crítica o rechazo."
            examples={[
              "Palabras negativas: terrible, disastrous, appalling",
              "Tono pesimista: concerning, alarming, worrying",
              "Crítica explícita: I strongly oppose, I disagree",
              "Énfasis en problemas: disadvantages, flaws, weaknesses"
            ]}
          />

          <Rule 
            title="3. Actitud neutral/objetiva"
            description="El autor presenta información sin mostrar preferencia personal."
            examples={[
              "Lenguaje factual: statistics show, research indicates",
              "Presentación equilibrada: on one hand... on the other hand",
              "Ausencia de adjetivos evaluativos",
              "Uso de voz pasiva para distanciarse"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Estrategias Avanzadas" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Ironía y sarcasmo"
            description="Cuando el autor dice lo contrario de lo que realmente piensa."
            examples={[
              "Contraste entre palabras y contexto",
              "Exageración obvia: 'What a brilliant idea!' (cuando es terrible)",
              "Comillas sarcásticas: 'expert' opinion",
              "Tono que no coincide con el contenido"
            ]}
          />

          <Rule 
            title="2. Sesgo implícito"
            description="Preferencias del autor mostradas indirectamente."
            examples={[
              "Selección de información presentada",
              "Orden de presentación (lo positivo primero/último)",
              "Cantidad de espacio dedicado a cada perspectiva",
              "Fuentes citadas y su credibilidad"
            ]}
          />

          <Rule 
            title="3. Cambios de actitud"
            description="La actitud del autor puede evolucionar durante el texto."
            examples={[
              "Inicialmente neutral, luego crítico",
              "Optimista al principio, pesimista al final",
              "Conectores que indican cambio: however, but, unfortunately",
              "Progresión gradual de la argumentación"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Cuál es la diferencia entre opinion y attitude?"
      options={[
        "No hay diferencia, son sinónimos",
        "Opinion es el punto de vista, attitude es la postura emocional",
        "Opinion es formal, attitude es informal",
        "Opinion es para hechos, attitude es para sentimientos"
      ]}
      correctAnswer={1}
      explanation="Opinion es el punto de vista o creencia del autor, mientras attitude es su postura emocional (positiva, negativa, neutral) hacia el tema."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál de estas frases indica claramente una opinión personal?"
      options={[
        "Statistics show that...",
        "Research indicates that...",
        "I firmly believe that...",
        "The data demonstrates that..."
      ]}
      correctAnswer={2}
      explanation="'I firmly believe that...' indica claramente una opinión personal del autor, mientras las otras presentan información más objetiva."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Los adjetivos evaluativos como 'excellent' o 'terrible' revelan la actitud del autor.",
          isTrue: true,
          explanation: "Correcto. Los adjetivos evaluativos muestran claramente si el autor tiene una actitud positiva o negativa."
        },
        {
          text: "Un texto objetivo nunca contiene opiniones del autor.",
          isTrue: false,
          explanation: "Incorrecto. Incluso textos aparentemente objetivos pueden contener sesgos sutiles o selección tendenciosa de información."
        },
        {
          text: "La ironía y el sarcasmo pueden hacer que el autor diga lo contrario de lo que piensa.",
          isTrue: true,
          explanation: "Correcto. En la ironía y sarcasmo, el significado real es opuesto a las palabras literales usadas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Si un autor escribe 'What a brilliant solution!' sobre algo claramente problemático, ¿qué actitud muestra?"
      options={[
        "Positiva y entusiasta",
        "Neutral y objetiva",
        "Negativa y sarcástica",
        "Confundida e incierta"
      ]}
      correctAnswer={2}
      explanation="Es sarcasmo: usar 'brilliant' para algo problemático muestra una actitud negativa expresada irónicamente."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué indica si un autor dedica mucho más espacio a los aspectos negativos que a los positivos de un tema?"
      options={[
        "Que es completamente objetivo",
        "Que tiene una actitud negativa o sesgo crítico",
        "Que no entiende el tema",
        "Que está siendo neutral"
      ]}
      correctAnswer={1}
      explanation="La desproporción en el espacio dedicado a aspectos negativos vs positivos indica sesgo y actitud negativa del autor."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Las palabras como 'claim' y 'assert' son más neutrales que 'prove' y 'demonstrate'.",
          isTrue: true,
          explanation: "Correcto. 'Claim' y 'assert' sugieren opinión, mientras 'prove' y 'demonstrate' implican evidencia objetiva."
        },
        {
          text: "La actitud del autor siempre permanece constante a lo largo de todo el texto.",
          isTrue: false,
          explanation: "Incorrecto. La actitud puede evolucionar o cambiar durante el texto, especialmente en argumentaciones complejas."
        },
        {
          text: "El uso de comillas puede indicar distanciamiento o sarcasmo del autor.",
          isTrue: true,
          explanation: "Correcto. Las comillas pueden mostrar que el autor no está de acuerdo con el término o lo usa irónicamente."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Cuál de estas estructuras sugiere una presentación más equilibrada?"
      options={[
        "Only supporters believe...",
        "On one hand... on the other hand...",
        "Everyone knows that...",
        "It's obvious that..."
      ]}
      correctAnswer={1}
      explanation="'On one hand... on the other hand...' presenta múltiples perspectivas, sugiriendo una aproximación más equilibrada."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Si un autor usa principalmente voz pasiva y evita pronombres personales, ¿qué actitud sugiere?"
      options={[
        "Muy emocional y personal",
        "Objetiva y distanciada",
        "Confundida y incierta",
        "Agresiva y confrontacional"
      ]}
      correctAnswer={1}
      explanation="La voz pasiva y evitar pronombres personales sugiere un intento de mantener objetividad y distanciamiento."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Los conectores como 'however' y 'unfortunately' pueden indicar cambios en la actitud del autor.",
          isTrue: true,
          explanation: "Correcto. Estos conectores a menudo señalan un cambio hacia una perspectiva más negativa o crítica."
        },
        {
          text: "Solo las opiniones explícitas (con 'I think', 'I believe') cuentan como opiniones del autor.",
          isTrue: false,
          explanation: "Incorrecto. Las opiniones pueden expresarse implícitamente a través de selección de información, adjetivos evaluativos, etc."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuál es la mejor estrategia para identificar la actitud general del autor en un texto largo?"
      options={[
        "Leer solo la introducción",
        "Contar palabras positivas vs negativas",
        "Analizar el patrón general de lenguaje evaluativo y selección de información",
        "Buscar solo las frases con 'I think'"
      ]}
      correctAnswer={2}
      explanation="Debes analizar el patrón general: lenguaje evaluativo, selección de información, énfasis, y cómo se desarrolla la argumentación."
    />
  ];

  return (
    <TheoryLayout
      title="Opinion and Attitude"
      description="Domina la identificación de opiniones y actitudes del autor. Aprende a reconocer puntos de vista, sesgos, ironía y posturas emocionales en textos complejos."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced reading comprehension", "Critical thinking", "Understanding of tone and style"]}
      estimatedTime="75 min"
    />
  );
};

export default OpinionAndAttitudePage;
