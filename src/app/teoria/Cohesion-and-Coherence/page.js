'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const CohesionAndCoherencePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son Cohesion y Coherence?" icon="🔗">
        <p>
          <strong>Cohesion</strong> se refiere a las conexiones gramaticales y léxicas entre oraciones y párrafos. 
          <strong>Coherence</strong> es la unidad lógica y semántica del texto: que todas las ideas trabajen juntas 
          para crear un mensaje claro y comprensible.
        </p>
        
        <Example 
          title="Ejemplo de Cohesion y Coherence"
          content="Cohesion: 'John bought a car. It was red. He drove it home.' (pronombres conectan las oraciones)
          Coherence: Todas las oraciones hablan del mismo tema (John y su carro) en secuencia lógica."
          explanation="Cohesion usa elementos gramaticales para conectar; coherence asegura que el mensaje tenga sentido global."
        />
      </TheorySection>

      <TheorySection title="Elementos de Cohesión" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Referencias pronominales"
            description="Pronombres que se refieren a elementos anteriores."
            examples={[
              "Personal: he, she, it, they → personas o cosas mencionadas",
              "Demonstrative: this, that, these, those → ideas o objetos específicos",
              "Relative: which, who, that → conectan cláusulas",
              "Possessive: his, her, its, their → muestran pertenencia"
            ]}
          />

          <Tip 
            title="2. Sustitución léxica"
            description="Reemplazar palabras para evitar repetición."
            examples={[
              "Sinónimos: car → vehicle, house → home",
              "Hiperónimos: roses → flowers, dogs → animals",
              "Palabras generales: thing, matter, issue, aspect",
              "Pro-formas: do so, such, one, ones"
            ]}
          />

          <Tip 
            title="3. Conectores explícitos"
            description="Palabras que muestran relaciones lógicas."
            examples={[
              "Adición: and, also, furthermore, moreover",
              "Contraste: but, however, nevertheless, on the other hand",
              "Causa-efecto: because, therefore, consequently, as a result",
              "Tiempo: then, next, meanwhile, subsequently"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Elementos de Coherencia" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Unidad temática"
            description="Todas las partes del texto contribuyen al tema principal."
            examples={[
              "Cada párrafo desarrolla un aspecto del tema",
              "No hay información irrelevante o fuera de lugar",
              "Las digresiones están claramente marcadas",
              "El título refleja el contenido real"
            ]}
          />

          <Rule 
            title="2. Progresión lógica"
            description="Las ideas se desarrollan en orden lógico."
            examples={[
              "De general a específico o viceversa",
              "Cronológicamente cuando es apropiado",
              "Por orden de importancia",
              "Problema → análisis → solución"
            ]}
          />

          <Rule 
            title="3. Consistencia de perspectiva"
            description="Mantener punto de vista, tiempo y registro consistentes."
            examples={[
              "Mismo punto de vista (1ª, 2ª, 3ª persona)",
              "Tiempo verbal apropiado y consistente",
              "Registro formal/informal mantenido",
              "Tono consistente a lo largo del texto"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Problemas Comunes y Soluciones" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Referencias ambiguas"
            description="Cuando no está claro a qué se refiere un pronombre."
            examples={[
              "Problema: 'John told Peter he was wrong' (¿quién estaba equivocado?)",
              "Solución: Repetir el nombre o restructurar",
              "Evitar pronombres cuando hay múltiples referentes posibles",
              "Usar demostrativos específicos (this idea, that problem)"
            ]}
          />

          <Rule 
            title="2. Saltos lógicos"
            description="Cuando faltan conexiones entre ideas."
            examples={[
              "Problema: Ideas no relacionadas aparecen juntas",
              "Solución: Añadir conectores apropiados",
              "Proporcionar información de transición",
              "Reorganizar para crear flujo lógico"
            ]}
          />

          <Rule 
            title="3. Repetición excesiva"
            description="Usar la misma palabra demasiadas veces."
            examples={[
              "Problema: 'The problem is that this problem causes problems'",
              "Solución: Usar sinónimos (issue, difficulty, challenge)",
              "Emplear pronombres apropiados",
              "Restructurar oraciones para evitar repetición"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Cuál es la diferencia principal entre cohesion y coherence?"
      options={[
        "No hay diferencia, son sinónimos",
        "Cohesion son conexiones gramaticales, coherence es unidad lógica",
        "Cohesion es para textos largos, coherence para cortos",
        "Cohesion es más importante que coherence"
      ]}
      correctAnswer={1}
      explanation="Cohesion se refiere a conexiones gramaticales y léxicas, mientras coherence es la unidad lógica y semántica del texto."
    />,

    <MultipleChoiceExercise
      key="2"
      question="En 'Mary bought a dress. It was beautiful.', ¿qué elemento de cohesión se usa?"
      options={[
        "Conector explícito",
        "Sustitución léxica",
        "Referencia pronominal",
        "Repetición"
      ]}
      correctAnswer={2}
      explanation="'It' es un pronombre que se refiere a 'dress', creando cohesión a través de referencia pronominal."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Un texto puede tener buena cohesión pero pobre coherencia.",
          isTrue: true,
          explanation: "Correcto. Puedes conectar oraciones gramaticalmente pero sin unidad lógica en el mensaje general."
        },
        {
          text: "Los conectores como 'however' y 'therefore' contribuyen a la cohesión.",
          isTrue: true,
          explanation: "Correcto. Los conectores explícitos son elementos importantes de cohesión textual."
        },
        {
          text: "La coherencia solo depende de usar pronombres correctamente.",
          isTrue: false,
          explanation: "Incorrecto. La coherencia depende de la unidad temática, progresión lógica y consistencia de perspectiva."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es un problema de cohesión en esta oración? 'John told Peter he was wrong.'"
      options={[
        "Falta de conectores",
        "Referencia ambigua del pronombre",
        "Tiempo verbal incorrecto",
        "Vocabulario inapropiado"
      ]}
      correctAnswer={1}
      explanation="'He' es ambiguo porque puede referirse tanto a John como a Peter, creando confusión."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué estrategia ayuda a evitar repetición excesiva?"
      options={[
        "Usar solo pronombres",
        "Eliminar todas las referencias",
        "Usar sinónimos y pro-formas apropiadas",
        "Repetir la misma palabra siempre"
      ]}
      correctAnswer={2}
      explanation="Usar sinónimos, hiperónimos y pro-formas (like 'such', 'one') ayuda a evitar repetición manteniendo cohesión."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Cada párrafo debe contribuir al tema principal para mantener coherencia.",
          isTrue: true,
          explanation: "Correcto. La unidad temática requiere que cada párrafo contribuya al propósito general del texto."
        },
        {
          text: "Es aceptable cambiar de primera a tercera persona sin razón en un texto.",
          isTrue: false,
          explanation: "Incorrecto. Los cambios de perspectiva sin justificación rompen la coherencia del texto."
        },
        {
          text: "Los demostrativos como 'this' y 'that' pueden crear cohesión.",
          isTrue: true,
          explanation: "Correcto. Los demostrativos conectan ideas refiriéndose a conceptos mencionados anteriormente."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Cuál es la mejor manera de conectar estas ideas? 'It was raining. We decided to stay home.'"
      options={[
        "It was raining. We decided to stay home.",
        "It was raining, so we decided to stay home.",
        "It was raining. However, we decided to stay home.",
        "It was raining. Furthermore, we decided to stay home."
      ]}
      correctAnswer={1}
      explanation="'So' muestra la relación causa-efecto lógica: la lluvia causó la decisión de quedarse en casa."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Qué elemento NO contribuye directamente a la coherencia?"
      options={[
        "Unidad temática",
        "Progresión lógica de ideas",
        "Uso correcto de artículos",
        "Consistencia de registro"
      ]}
      correctAnswer={2}
      explanation="Aunque importante para la gramática, el uso de artículos no afecta directamente la coherencia global del texto."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Un texto coherente siempre sigue orden cronológico.",
          isTrue: false,
          explanation: "Incorrecto. La coherencia puede lograrse con diferentes tipos de organización, no solo cronológica."
        },
        {
          text: "Las palabras de transición ayudan a crear tanto cohesión como coherencia.",
          isTrue: true,
          explanation: "Correcto. Los conectores crean cohesión gramatical y ayudan a la coherencia mostrando relaciones lógicas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuál es la clave para lograr tanto cohesión como coherencia efectivas?"
      options={[
        "Usar muchos pronombres",
        "Escribir oraciones muy largas",
        "Planificar la estructura lógica y usar elementos de conexión apropiados",
        "Repetir las mismas palabras frecuentemente"
      ]}
      correctAnswer={2}
      explanation="La clave es planificar una estructura lógica clara y usar elementos de conexión apropiados para guiar al lector."
    />
  ];

  return (
    <TheoryLayout
      title="Cohesion and Coherence"
      description="Domina la cohesión y coherencia textual. Aprende a crear conexiones efectivas entre ideas y mantener unidad lógica en textos complejos."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced writing skills", "Understanding of text structure", "Knowledge of connectors"]}
      estimatedTime="80 min"
    />
  );
};

export default CohesionAndCoherencePage;
