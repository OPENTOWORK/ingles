'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const VocabularyInContextPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Vocabulary in Context?" icon="🧩">
        <p>
          <strong>Vocabulary in Context</strong> es la habilidad de entender el significado de palabras desconocidas 
          usando las pistas que proporciona el texto que las rodea. No necesitas un diccionario si puedes usar el contexto efectivamente.
        </p>
        
        <Example 
          title="Ejemplo de Vocabulary in Context"
          content="'The ancient artifact was so fragile that even a gentle touch could damage it permanently.' Aunque no sepas qué significa 'fragile', el contexto te dice que significa algo que se puede dañar fácilmente."
          explanation="Las pistas 'gentle touch could damage it' te ayudan a inferir que 'fragile' significa delicado o que se rompe fácilmente."
        />
      </TheorySection>

      <TheorySection title="Tipos de Pistas Contextuales" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Definiciones directas"
            description="El texto define la palabra directamente."
            examples={[
              "A pediatrician, a doctor who treats children, examined the patient.",
              "Photosynthesis - the process by which plants make food - is essential.",
              "The protagonist, or main character, faces many challenges.",
              "Claustrophobia, the fear of enclosed spaces, affects many people."
            ]}
          />

          <Rule 
            title="2. Ejemplos y listas"
            description="La palabra se explica a través de ejemplos."
            examples={[
              "Citrus fruits such as oranges, lemons, and limes are rich in vitamin C.",
              "Nocturnal animals like owls, bats, and raccoons are active at night.",
              "The menu included various appetizers: soup, salad, and bread.",
              "She collected memorabilia including old photos, letters, and souvenirs."
            ]}
          />

          <Rule 
            title="3. Contraste y oposición"
            description="La palabra se contrasta con algo conocido."
            examples={[
              "Unlike his gregarious brother, Tom was quite shy and reserved.",
              "While the first half was tedious, the second half was exciting.",
              "She was frugal with money but generous with her time.",
              "The weather was inclement, not sunny and pleasant as predicted."
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Estrategias Avanzadas" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Análisis de causa y efecto"
            description="Usa relaciones de causa-efecto para inferir significado."
            examples={[
              "The drought caused the crops to wither and die.",
              "Due to his procrastination, he missed the deadline.",
              "The medicine alleviated her pain immediately.",
              "His arrogance resulted in losing many friends."
            ]}
          />

          <Rule 
            title="2. Pistas gramaticales"
            description="La función gramatical te da pistas sobre el significado."
            examples={[
              "She walked cautiously (adverbio - manera de caminar)",
              "The enormous building (adjetivo - describe tamaño)",
              "He scrutinized the document (verbo - acción con documento)",
              "Her benevolence was appreciated (sustantivo - cualidad personal)"
            ]}
          />

          <Rule 
            title="3. Conocimiento del mundo"
            description="Usa tu conocimiento general para inferir significado."
            examples={[
              "The archaeologist excavated ancient ruins.",
              "The chef garnished the dish with herbs.",
              "The meteorologist predicted severe weather.",
              "The surgeon performed a delicate operation."
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Lee más allá de la oración"
            description="A veces las pistas están en oraciones anteriores o posteriores."
            examples={[
              "Mira el párrafo completo",
              "Busca información en oraciones cercanas",
              "Conecta ideas de diferentes partes",
              "Usa el tema general del texto"
            ]}
          />

          <Rule 
            title="2. No te obsesiones con una palabra"
            description="Si no puedes inferir el significado, continúa leyendo."
            examples={[
              "Una palabra no arruina la comprensión total",
              "El significado puede aclararse más adelante",
              "Enfócate en palabras clave importantes",
              "Usa el contexto general para compensar"
            ]}
          />

          <Rule 
            title="3. Verifica tu inferencia"
            description="Confirma que tu interpretación tiene sentido en el contexto."
            examples={[
              "¿Tu interpretación encaja lógicamente?",
              "¿Es consistente con el resto del texto?",
              "¿Tiene sentido gramaticalmente?",
              "¿Apoya el mensaje general del texto?"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Qué significa 'vocabulary in context'?"
      options={[
        "Memorizar listas de vocabulario",
        "Usar el contexto para entender palabras desconocidas",
        "Traducir todas las palabras",
        "Buscar palabras en el diccionario"
      ]}
      correctAnswer={1}
      explanation="Vocabulary in context significa usar las pistas del texto para entender el significado de palabras desconocidas."
    />,

    <MultipleChoiceExercise
      key="2"
      question="En la oración 'A pediatrician, a doctor who treats children, was called', ¿qué tipo de pista contextual se usa?"
      options={[
        "Contraste",
        "Ejemplo",
        "Definición directa",
        "Causa y efecto"
      ]}
      correctAnswer={2}
      explanation="Es una definición directa: 'a doctor who treats children' define exactamente qué es un pediatrician."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Siempre necesitas un diccionario para entender palabras nuevas.",
          isTrue: false,
          explanation: "Incorrecto. El contexto a menudo proporciona suficientes pistas para entender palabras desconocidas."
        },
        {
          text: "Las pistas contextuales pueden estar en oraciones diferentes a la que contiene la palabra desconocida.",
          isTrue: true,
          explanation: "Correcto. A veces necesitas leer oraciones anteriores o posteriores para encontrar las pistas."
        },
        {
          text: "La función gramatical de una palabra no ayuda a entender su significado.",
          isTrue: false,
          explanation: "Incorrecto. Saber si es sustantivo, verbo, adjetivo, etc. te da pistas importantes sobre su significado."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="En 'Unlike his gregarious brother, Tom was shy', ¿qué significa probablemente 'gregarious'?"
      options={[
        "Tímido",
        "Sociable",
        "Inteligente",
        "Alto"
      ]}
      correctAnswer={1}
      explanation="'Unlike' indica contraste. Si Tom es tímido y es lo opuesto a su hermano gregarious, entonces gregarious significa sociable."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la mejor estrategia cuando no puedes inferir el significado de una palabra?"
      options={[
        "Parar de leer inmediatamente",
        "Continuar leyendo, el significado puede aclararse",
        "Traducir toda la oración",
        "Saltarse todo el párrafo"
      ]}
      correctAnswer={1}
      explanation="Es mejor continuar leyendo porque el significado puede aclararse más adelante o puede no ser esencial para la comprensión."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Los ejemplos en el texto pueden ayudar a entender palabras desconocidas.",
          isTrue: true,
          explanation: "Correcto. Listas de ejemplos como 'citrus fruits such as oranges, lemons...' ayudan a entender el término general."
        },
        {
          text: "Debes entender cada palabra para comprender un texto.",
          isTrue: false,
          explanation: "Incorrecto. Puedes entender la idea general sin conocer cada palabra específica."
        },
        {
          text: "Tu conocimiento del mundo puede ayudar a inferir significados.",
          isTrue: true,
          explanation: "Correcto. Tu conocimiento sobre profesiones, situaciones, etc. te ayuda a inferir significados de palabras relacionadas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="En 'The drought caused the crops to wither', ¿qué significa probablemente 'wither'?"
      options={[
        "Crecer más",
        "Secarse y morir",
        "Cambiar de color",
        "Producir frutos"
      ]}
      correctAnswer={1}
      explanation="La sequía (drought) causaría que las plantas se sequen y mueran, no que crezcan o produzcan frutos."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Qué tipo de palabras suelen ser más fáciles de inferir por contexto?"
      options={[
        "Nombres propios",
        "Palabras técnicas muy específicas",
        "Palabras con significado concreto y visible",
        "Abreviaciones"
      ]}
      correctAnswer={2}
      explanation="Palabras con significado concreto (objetos, acciones visibles) son más fáciles de inferir que conceptos abstractos."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Las palabras de contraste como 'unlike', 'however', 'but' son útiles para vocabulary in context.",
          isTrue: true,
          explanation: "Correcto. Estas palabras indican que algo es opuesto, lo que te ayuda a inferir significado por contraste."
        },
        {
          text: "Solo debes usar el contexto inmediato de la oración donde aparece la palabra.",
          isTrue: false,
          explanation: "Incorrecto. A veces necesitas usar el contexto del párrafo completo o incluso de todo el texto."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cómo debes verificar si tu inferencia sobre una palabra es correcta?"
      options={[
        "Preguntarle a alguien más",
        "Verificar que tenga sentido en el contexto total",
        "Contar las letras de la palabra",
        "Buscar palabras similares"
      ]}
      correctAnswer={1}
      explanation="Debes verificar que tu interpretación sea lógica y consistente con todo el contexto del texto."
    />
  ];

  return (
    <TheoryLayout
      title="Vocabulary in Context"
      description="Domina la habilidad de entender palabras desconocidas usando el contexto. Aprende a usar pistas textuales, definiciones, ejemplos y contrastes para inferir significados."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic reading skills", "Understanding of sentence structure"]}
      estimatedTime="75 min"
    />
  );
};

export default VocabularyInContextPage;
