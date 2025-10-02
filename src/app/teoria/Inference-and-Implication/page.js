'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const InferenceAndImplicationPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son Inference e Implication?" icon="🔍">
        <p>
          <strong>Inference</strong> es la habilidad de entender información que no está explícitamente declarada en el texto. 
          <strong>Implication</strong> es lo que el autor sugiere o da a entender sin decirlo directamente. 
          Es "leer entre líneas" para captar significados ocultos.
        </p>
        
        <Example 
          title="Ejemplo de Inference e Implication"
          content="Texto: 'Sarah looked at her watch for the third time and tapped her foot impatiently.' 
          Inference: Sarah está esperando a alguien que llega tarde.
          Implication: El autor sugiere que Sarah está frustrada o ansiosa."
          explanation="Aunque no dice directamente que está esperando o frustrada, puedes inferirlo de las acciones descritas."
        />
      </TheorySection>

      <TheorySection title="Tipos de Inferencias" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Inferencias sobre emociones y actitudes"
            description="Deducir cómo se sienten los personajes o el autor."
            examples={[
              "Acciones que indican emociones: 'slammed the door' = enojo",
              "Elección de palabras: 'magnificent' vs 'adequate' = diferentes actitudes",
              "Lenguaje corporal descrito: 'crossed arms' = defensivo",
              "Tono implícito: sarcasmo, ironía, entusiasmo"
            ]}
          />

          <Tip 
            title="2. Inferencias sobre relaciones"
            description="Deducir conexiones entre personas, eventos o ideas."
            examples={[
              "Relaciones familiares no declaradas explícitamente",
              "Jerarquías profesionales o sociales",
              "Causa y efecto implícitos",
              "Secuencias temporales sugeridas"
            ]}
          />

          <Tip 
            title="3. Inferencias sobre contexto"
            description="Deducir información sobre tiempo, lugar o situación."
            examples={[
              "Época histórica por pistas contextuales",
              "Ubicación geográfica por descripciones",
              "Clase social por detalles del estilo de vida",
              "Profesión por vocabulario especializado usado"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Estrategias para Hacer Inferencias" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Analiza la elección de palabras"
            description="Las palabras específicas que elige el autor revelan actitudes."
            examples={[
              "Palabras positivas vs negativas: 'determined' vs 'stubborn'",
              "Nivel de formalidad: indica relación entre personajes",
              "Intensidad: 'whispered' vs 'shouted' indica emociones",
              "Connotaciones: 'home' vs 'house' sugiere diferentes sentimientos"
            ]}
          />

          <Rule 
            title="2. Observa lo que NO se dice"
            description="A veces lo importante es lo que el autor omite."
            examples={[
              "Información deliberadamente omitida",
              "Preguntas que quedan sin responder",
              "Detalles evitados o minimizados",
              "Silencios significativos en diálogos"
            ]}
          />

          <Rule 
            title="3. Conecta pistas dispersas"
            description="Combina información de diferentes partes del texto."
            examples={[
              "Detalles mencionados en párrafos separados",
              "Patrones de comportamiento repetidos",
              "Contrastes entre lo que se dice y se hace",
              "Cambios graduales en tono o actitud"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Basa tus inferencias en evidencia textual"
            description="Tus conclusiones deben estar apoyadas por el texto."
            examples={[
              "¿Qué evidencia específica apoya tu inferencia?",
              "¿Hay múltiples pistas que apuntan a la misma conclusión?",
              "¿Tu inferencia es consistente con el resto del texto?",
              "¿Estás proyectando tus propias ideas o siguiendo las del autor?"
            ]}
          />

          <Rule 
            title="2. Considera el contexto cultural y social"
            description="Las implicaciones pueden depender del contexto."
            examples={[
              "Normas sociales de la época descrita",
              "Convenciones culturales relevantes",
              "Expectativas de género, clase o edad",
              "Códigos de comportamiento implícitos"
            ]}
          />

          <Rule 
            title="3. Distingue entre inferencia y especulación"
            description="Las inferencias válidas están basadas en evidencia textual."
            examples={[
              "Inferencia válida: apoyada por pistas textuales claras",
              "Especulación: va más allá de lo que el texto sugiere",
              "¿Otro lector razonable llegaría a la misma conclusión?",
              "¿Tu interpretación es la más probable dada la evidencia?"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Qué es una inferencia en lectura?"
      options={[
        "Información explícitamente declarada en el texto",
        "Información que deduces aunque no esté explícitamente declarada",
        "El título del texto",
        "Las palabras que no entiendes"
      ]}
      correctAnswer={1}
      explanation="Una inferencia es información que deduces o concluyes basándote en pistas del texto, aunque no esté explícitamente declarada."
    />,

    <MultipleChoiceExercise
      key="2"
      question="Si un texto dice 'John slammed the door and stormed out', ¿qué puedes inferir?"
      options={[
        "John está contento",
        "John está enojado o frustrado",
        "John tiene prisa por llegar a algún lugar",
        "John no sabe cómo cerrar puertas suavemente"
      ]}
      correctAnswer={1}
      explanation="Las acciones 'slammed' y 'stormed out' indican enojo o frustración, aunque no se diga explícitamente."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Las inferencias deben estar basadas en evidencia del texto.",
          isTrue: true,
          explanation: "Correcto. Las inferencias válidas deben tener apoyo en pistas y evidencia específica del texto."
        },
        {
          text: "Puedes hacer cualquier inferencia que se te ocurra al leer.",
          isTrue: false,
          explanation: "Incorrecto. Las inferencias deben estar justificadas por evidencia textual, no ser especulaciones libres."
        },
        {
          text: "La elección de palabras del autor puede revelar actitudes implícitas.",
          isTrue: true,
          explanation: "Correcto. Las palabras específicas que elige el autor a menudo revelan actitudes y emociones no declaradas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la diferencia entre 'He's determined' y 'He's stubborn'?"
      options={[
        "No hay diferencia, significan lo mismo",
        "'Determined' es positivo, 'stubborn' es más negativo",
        "'Stubborn' es más formal que 'determined'",
        "Solo se diferencian en la pronunciación"
      ]}
      correctAnswer={1}
      explanation="'Determined' tiene connotación positiva (perseverante), mientras 'stubborn' es más negativo (terco, inflexible)."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Si un personaje 'whispers' en lugar de 'speaks', ¿qué puedes inferir?"
      options={[
        "Que tiene problemas de voz",
        "Que la situación requiere secreto o discreción",
        "Que no sabe hablar fuerte",
        "Que está leyendo"
      ]}
      correctAnswer={1}
      explanation="'Whisper' implica secreto, confidencialidad o la necesidad de no ser escuchado por otros."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "A veces lo que el autor NO dice es tan importante como lo que sí dice.",
          isTrue: true,
          explanation: "Correcto. Las omisiones deliberadas y los silencios pueden ser muy significativos para la interpretación."
        },
        {
          text: "Las inferencias sobre emociones solo se pueden hacer si el texto las menciona directamente.",
          isTrue: false,
          explanation: "Incorrecto. Puedes inferir emociones a través de acciones, diálogos, lenguaje corporal y elección de palabras."
        },
        {
          text: "El contexto cultural puede afectar las implicaciones de un texto.",
          isTrue: true,
          explanation: "Correcto. Las normas culturales y sociales influyen en cómo interpretamos comportamientos y situaciones."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Qué estrategia es más efectiva para hacer inferencias válidas?"
      options={[
        "Usar solo tu imaginación",
        "Combinar múltiples pistas del texto",
        "Basarte en tu experiencia personal únicamente",
        "Ignorar los detalles pequeños"
      ]}
      correctAnswer={1}
      explanation="Combinar múltiples pistas del texto te da una base más sólida para hacer inferencias válidas y bien fundamentadas."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Si un texto describe una casa con 'peeling paint, broken windows, and overgrown garden', ¿qué puedes inferir?"
      options={[
        "Que es una casa nueva",
        "Que está abandonada o mal cuidada",
        "Que es muy cara",
        "Que tiene buen mantenimiento"
      ]}
      correctAnswer={1}
      explanation="Los detalles 'peeling paint', 'broken windows', 'overgrown garden' sugieren abandono o falta de mantenimiento."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Una buena inferencia es aquella que cualquier lector razonable podría hacer basándose en la misma evidencia.",
          isTrue: true,
          explanation: "Correcto. Las inferencias válidas deben ser razonables y estar basadas en evidencia clara del texto."
        },
        {
          text: "Debes hacer inferencias sobre cada detalle del texto.",
          isTrue: false,
          explanation: "Incorrecto. Solo debes hacer inferencias cuando hay suficiente evidencia y cuando es relevante para la comprensión."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuál es la clave para distinguir entre inferencia válida y especulación?"
      options={[
        "La longitud de tu conclusión",
        "La cantidad de evidencia textual que la apoya",
        "Si te gusta o no la conclusión",
        "Si otros están de acuerdo contigo"
      ]}
      correctAnswer={1}
      explanation="Una inferencia válida debe estar apoyada por evidencia textual clara, mientras que la especulación va más allá de lo que el texto sugiere."
    />
  ];

  return (
    <TheoryLayout
      title="Inference and Implication"
      description="Domina la habilidad de leer entre líneas. Aprende a hacer inferencias válidas y entender implicaciones basándote en evidencia textual y pistas contextuales."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced reading comprehension", "Critical thinking skills", "Cultural awareness"]}
      estimatedTime="80 min"
    />
  );
};

export default InferenceAndImplicationPage;
