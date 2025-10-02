'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const AdvancedWordFormationPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Advanced Word Formation?" icon="🔧">
        <p>
          <strong>Advanced Word Formation</strong> es la habilidad de crear nuevas palabras usando prefijos, sufijos y 
          cambios en la raíz de palabras existentes. En exámenes avanzados, debes formar palabras apropiadas para 
          completar textos manteniendo el significado y la gramática correctos.
        </p>
        
        <Example 
          title="Ejemplo de Advanced Word Formation"
          content="Palabra base: 'manage' → management (sustantivo), manageable (adjetivo), mismanage (verbo con prefijo), unmanageable (adjetivo negativo)"
          explanation="Una palabra base puede generar múltiples formas según la función gramatical y el significado necesario."
        />
      </TheorySection>

      <TheorySection title="Sufijos Principales" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Sufijos para sustantivos"
            description="Convierten verbos y adjetivos en sustantivos."
            examples={[
              "-tion/-sion: create → creation, decide → decision",
              "-ment: develop → development, achieve → achievement",
              "-ness: happy → happiness, dark → darkness",
              "-ity/-ty: real → reality, safe → safety",
              "-ance/-ence: perform → performance, exist → existence"
            ]}
          />

          <Tip 
            title="2. Sufijos para adjetivos"
            description="Convierten sustantivos y verbos en adjetivos."
            examples={[
              "-able/-ible: read → readable, access → accessible",
              "-ful: care → careful, help → helpful",
              "-less: care → careless, help → helpless",
              "-ous/-ious: danger → dangerous, mystery → mysterious",
              "-ive: act → active, create → creative"
            ]}
          />

          <Tip 
            title="3. Sufijos para verbos"
            description="Convierten sustantivos y adjetivos en verbos."
            examples={[
              "-ize/-ise: modern → modernize, special → specialize",
              "-ify: simple → simplify, class → classify",
              "-en: wide → widen, strong → strengthen",
              "-ate: active → activate, different → differentiate"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Prefijos Importantes" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Prefijos negativos"
            description="Crean el significado opuesto de la palabra base."
            examples={[
              "un-: happy → unhappy, able → unable",
              "in-/im-/il-/ir-: possible → impossible, legal → illegal",
              "dis-: agree → disagree, appear → disappear",
              "mis-: understand → misunderstand, use → misuse",
              "non-: fiction → non-fiction, sense → nonsense"
            ]}
          />

          <Rule 
            title="2. Prefijos de cantidad/grado"
            description="Indican cantidad, tamaño o intensidad."
            examples={[
              "over-: work → overwork, confident → overconfident",
              "under-: estimate → underestimate, paid → underpaid",
              "super-: natural → supernatural, market → supermarket",
              "sub-: marine → submarine, conscious → subconscious",
              "multi-: cultural → multicultural, media → multimedia"
            ]}
          />

          <Rule 
            title="3. Prefijos de tiempo/posición"
            description="Indican relaciones temporales o espaciales."
            examples={[
              "pre-: war → pre-war, historic → prehistoric",
              "post-: war → post-war, graduate → postgraduate",
              "re-: write → rewrite, consider → reconsider",
              "ex-: president → ex-president, wife → ex-wife",
              "co-: operate → cooperate, exist → coexist"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Reglas y Cambios Ortográficos" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Cambios en la raíz"
            description="Algunas palabras cambian su forma base al añadir sufijos."
            examples={[
              "y → i: happy → happiness, easy → easily",
              "Duplicación de consonante: big → bigger, stop → stopping",
              "e final se elimina: create → creation, argue → argument",
              "Cambios irregulares: long → length, wide → width"
            ]}
          />

          <Rule 
            title="2. Compatibilidad de afijos"
            description="No todos los prefijos y sufijos se pueden combinar con todas las palabras."
            examples={[
              "Algunos sufijos solo van con ciertos tipos de palabras",
              "Verificar si la combinación existe realmente",
              "Considerar el registro (formal/informal)",
              "Algunos prefijos cambian según la primera letra"
            ]}
          />

          <Rule 
            title="3. Significado y contexto"
            description="La palabra formada debe tener sentido en el contexto."
            examples={[
              "¿La nueva palabra encaja gramaticalmente?",
              "¿El significado es lógico en el contexto?",
              "¿Es una palabra que realmente existe?",
              "¿Mantiene el registro apropiado del texto?"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Cuál es la forma correcta de convertir 'manage' en un sustantivo?"
      options={[
        "manageness",
        "management",
        "managation",
        "manageity"
      ]}
      correctAnswer={1}
      explanation="'Management' es la forma correcta de sustantivo derivada de 'manage' usando el sufijo '-ment'."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Qué prefijo hace que 'possible' signifique lo contrario?"
      options={[
        "un-",
        "dis-",
        "im-",
        "non-"
      ]}
      correctAnswer={2}
      explanation="'Impossible' usa el prefijo 'im-' (variante de 'in-') antes de palabras que empiezan con 'p'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "El sufijo '-ful' generalmente crea adjetivos con significado positivo.",
          isTrue: true,
          explanation: "Correcto. '-ful' significa 'lleno de' y generalmente crea adjetivos positivos como 'helpful', 'useful'."
        },
        {
          text: "Puedes añadir cualquier prefijo a cualquier palabra.",
          isTrue: false,
          explanation: "Incorrecto. Los prefijos tienen reglas específicas y no todos se pueden combinar con todas las palabras."
        },
        {
          text: "Algunas palabras cambian su ortografía cuando se añaden sufijos.",
          isTrue: true,
          explanation: "Correcto. Por ejemplo, 'happy' → 'happiness' (y cambia a i), 'create' → 'creation' (se elimina e)."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la forma adjetiva correcta de 'access'?"
      options={[
        "accessful",
        "accessible",
        "accessable",
        "accessitive"
      ]}
      correctAnswer={1}
      explanation="'Accessible' es la forma correcta usando el sufijo '-ible' (no '-able' en este caso)."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué significa el prefijo 'over-' en 'overconfident'?"
      options={[
        "Falta de confianza",
        "Confianza normal",
        "Exceso de confianza",
        "Confianza pasada"
      ]}
      correctAnswer={2}
      explanation="'Over-' indica exceso, por lo que 'overconfident' significa demasiado confiado, exceso de confianza."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "El sufijo '-less' siempre crea palabras con significado negativo.",
          isTrue: true,
          explanation: "Correcto. '-less' significa 'sin' o 'que carece de', creando significados negativos como 'careless', 'helpless'."
        },
        {
          text: "Las palabras formadas siempre mantienen exactamente la misma ortografía de la raíz.",
          isTrue: false,
          explanation: "Incorrecto. A menudo hay cambios ortográficos como duplicación de consonantes o cambios de 'y' a 'i'."
        },
        {
          text: "'-ize' y '-ise' son sufijos que convierten palabras en verbos.",
          isTrue: true,
          explanation: "Correcto. Ambos sufijos (variantes británica y americana) convierten sustantivos/adjetivos en verbos."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Cuál es la forma correcta de hacer negativo 'legal'?"
      options={[
        "unlegal",
        "dislegal",
        "illegal",
        "nonlegal"
      ]}
      correctAnswer={2}
      explanation="'Illegal' usa 'il-' (variante de 'in-') que se usa antes de palabras que empiezan con 'l'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Qué sufijo convierte 'real' en sustantivo?"
      options={[
        "-ness",
        "-ity",
        "-ment",
        "-tion"
      ]}
      correctAnswer={1}
      explanation="'Reality' usa el sufijo '-ity' para convertir el adjetivo 'real' en sustantivo."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "El prefijo 're-' siempre significa 'hacer de nuevo'.",
          isTrue: true,
          explanation: "Correcto. 're-' indica repetición: 'rewrite' (escribir de nuevo), 'reconsider' (considerar de nuevo)."
        },
        {
          text: "Todas las palabras que terminan en '-tion' son sustantivos.",
          isTrue: true,
          explanation: "Correcto. El sufijo '-tion' siempre forma sustantivos como 'creation', 'information', 'education'."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuál es la mejor estrategia para word formation en exámenes?"
      options={[
        "Memorizar todas las palabras posibles",
        "Entender los patrones de prefijos y sufijos",
        "Adivinar al azar",
        "Usar solo palabras simples"
      ]}
      correctAnswer={1}
      explanation="Entender los patrones y reglas de prefijos y sufijos te permite formar palabras correctas sistemáticamente."
    />
  ];

  return (
    <TheoryLayout
      title="Advanced Word Formation"
      description="Domina la formación avanzada de palabras. Aprende prefijos, sufijos y cambios ortográficos para crear palabras apropiadas en contextos complejos."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Strong vocabulary base", "Understanding of word classes", "Basic morphology knowledge"]}
      estimatedTime="85 min"
    />
  );
};

export default AdvancedWordFormationPage;
