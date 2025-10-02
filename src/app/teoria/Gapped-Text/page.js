'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const GappedTextPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Gapped Text?" icon="🧩">
        <p>
          <strong>Gapped Text</strong> es un ejercicio donde se han eliminado párrafos o oraciones de un texto, 
          y debes elegir de una lista cuáles encajan en cada espacio. Debes entender la coherencia y cohesión del texto.
        </p>
        
        <Example 
          title="Ejemplo de Gapped Text"
          content="Tienes un artículo sobre cambio climático con 6 espacios vacíos y 8 párrafos opcionales (A-H). Debes decidir qué párrafo va en cada espacio basándote en el flujo lógico y las conexiones textuales."
          explanation="Debes analizar el contenido antes y después de cada espacio para encontrar la opción que mejor conecte las ideas."
        />
      </TheorySection>

      <TheorySection title="Estrategias Principales" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Lee el texto completo primero"
            description="Entiende el tema general y la estructura antes de llenar espacios."
            examples={[
              "Identifica el tema principal del texto",
              "Reconoce el tipo de texto (artículo, ensayo, historia)",
              "Nota el tono y estilo del autor",
              "Observa la progresión lógica de ideas"
            ]}
          />

          <Tip 
            title="2. Analiza el contexto de cada espacio"
            description="Examina cuidadosamente lo que viene antes y después."
            examples={[
              "¿Qué idea se desarrolla antes del espacio?",
              "¿Cómo continúa la idea después del espacio?",
              "¿Hay palabras que necesitan referencia?",
              "¿Qué tipo de información falta lógicamente?"
            ]}
          />

          <Tip 
            title="3. Busca pistas de cohesión"
            description="Identifica conectores, referencias y vínculos textuales."
            examples={[
              "Pronombres que necesitan antecedentes",
              "Conectores que indican relación (however, therefore)",
              "Repetición de palabras clave",
              "Referencias temporales (then, later, previously)"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Elementos de Cohesión" icon="🔗">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Referencias pronominales"
            description="Pronombres que se refieren a información anterior."
            examples={[
              "This, that, these, those → ¿A qué se refieren?",
              "It, they, he, she → ¿Quién o qué es el antecedente?",
              "Such, one, ones → ¿Qué sustituyen?",
              "The former, the latter → ¿Cuáles son las dos opciones?"
            ]}
          />

          <Rule 
            title="2. Conectores lógicos"
            description="Palabras que muestran relaciones entre ideas."
            examples={[
              "Contraste: However, Nevertheless, On the other hand",
              "Adición: Furthermore, Moreover, In addition",
              "Resultado: Therefore, Consequently, As a result",
              "Ejemplo: For instance, Such as, Namely"
            ]}
          />

          <Rule 
            title="3. Repetición lexical"
            description="Repetición de palabras clave o sinónimos."
            examples={[
              "Repetición exacta de términos importantes",
              "Sinónimos que mantienen el tema",
              "Palabras del mismo campo semántico",
              "Definiciones o explicaciones de términos"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Flujo lógico de ideas"
            description="El párrafo debe encajar lógicamente en la progresión del texto."
            examples={[
              "¿Sigue la secuencia cronológica?",
              "¿Desarrolla la idea anterior?",
              "¿Introduce información en el momento apropiado?",
              "¿Mantiene el nivel de detalle consistente?"
            ]}
          />

          <Rule 
            title="2. Consistencia de estilo"
            description="El párrafo debe mantener el mismo tono y registro."
            examples={[
              "Mismo nivel de formalidad",
              "Consistencia en el punto de vista (1ª, 2ª, 3ª persona)",
              "Mismo tiempo verbal predominante",
              "Vocabulario apropiado para el contexto"
            ]}
          />

          <Rule 
            title="3. Eliminación por descarte"
            description="Usa el proceso de eliminación para opciones difíciles."
            examples={[
              "¿Qué opciones claramente no encajan?",
              "¿Cuáles contradicen información del texto?",
              "¿Qué párrafos no tienen conexión lógica?",
              "¿Cuáles ya has usado en otros espacios?"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Cuál es el objetivo principal del ejercicio Gapped Text?"
      options={[
        "Completar palabras faltantes",
        "Elegir párrafos que encajen lógicamente en espacios vacíos",
        "Traducir el texto completo",
        "Identificar errores gramaticales"
      ]}
      correctAnswer={1}
      explanation="En Gapped Text debes elegir párrafos completos que encajen lógicamente en los espacios vacíos del texto."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Qué debes hacer antes de empezar a llenar los espacios?"
      options={[
        "Leer solo las opciones disponibles",
        "Contar cuántos espacios hay",
        "Leer todo el texto para entender el tema general",
        "Empezar inmediatamente con el primer espacio"
      ]}
      correctAnswer={2}
      explanation="Debes leer todo el texto primero para entender el tema general, estructura y flujo de ideas."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Los pronombres como 'this', 'that', 'it' son pistas importantes para la cohesión.",
          isTrue: true,
          explanation: "Correcto. Los pronombres deben referirse a algo mencionado anteriormente, lo que te ayuda a encontrar conexiones."
        },
        {
          text: "Puedes usar cada párrafo opcional más de una vez.",
          isTrue: false,
          explanation: "Incorrecto. Cada párrafo opcional se usa solo una vez, y algunos pueden no usarse."
        },
        {
          text: "El párrafo elegido debe mantener el mismo estilo y tono que el resto del texto.",
          isTrue: true,
          explanation: "Correcto. La consistencia de estilo, tono y registro es esencial para la cohesión textual."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Si encuentras 'However' al inicio de un párrafo opcional, ¿qué indica?"
      options={[
        "Que es el primer párrafo del texto",
        "Que contrasta con la idea anterior",
        "Que es una conclusión",
        "Que introduce un ejemplo"
      ]}
      correctAnswer={1}
      explanation="'However' indica contraste, por lo que el párrafo debe ir después de una idea que contraste o contradiga."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué tipo de palabras te ayudan a identificar secuencias temporales?"
      options={[
        "Adjetivos descriptivos",
        "Then, later, previously, afterwards",
        "Nombres propios",
        "Números ordinales únicamente"
      ]}
      correctAnswer={1}
      explanation="Conectores temporales como 'then', 'later', 'previously' indican secuencias y te ayudan a ordenar eventos."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Debes analizar tanto lo que viene antes como después de cada espacio.",
          isTrue: true,
          explanation: "Correcto. El contexto completo (antes y después) es crucial para elegir el párrafo correcto."
        },
        {
          text: "La repetición de palabras clave no es importante en Gapped Text.",
          isTrue: false,
          explanation: "Incorrecto. La repetición lexical y los sinónimos son pistas importantes para la cohesión textual."
        },
        {
          text: "Todos los párrafos opcionales deben ser utilizados en el ejercicio.",
          isTrue: false,
          explanation: "Incorrecto. Generalmente hay más opciones que espacios, por lo que algunos párrafos no se usan."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Qué significa 'the former' en un texto?"
      options={[
        "El primero de dos elementos mencionados anteriormente",
        "Una persona famosa",
        "El párrafo anterior",
        "El autor del texto"
      ]}
      correctAnswer={0}
      explanation="'The former' se refiere al primero de dos elementos mencionados anteriormente, mientras 'the latter' se refiere al segundo."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Cuál es una buena estrategia cuando no estás seguro entre dos opciones?"
      options={[
        "Elegir la más larga",
        "Usar eliminación por descarte y analizar las conexiones más cuidadosamente",
        "Elegir al azar",
        "Saltarse esa pregunta"
      ]}
      correctAnswer={1}
      explanation="Debes usar eliminación por descarte y analizar más cuidadosamente las conexiones lógicas y de cohesión."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "El párrafo correcto debe desarrollar lógicamente la idea que viene antes.",
          isTrue: true,
          explanation: "Correcto. Debe haber una progresión lógica y coherente de ideas en todo el texto."
        },
        {
          text: "Puedes ignorar los conectores como 'therefore' y 'furthermore' al elegir párrafos.",
          isTrue: false,
          explanation: "Incorrecto. Los conectores son pistas cruciales que indican las relaciones lógicas entre ideas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Qué aspecto es MÁS importante para el éxito en Gapped Text?"
      options={[
        "Velocidad de lectura",
        "Vocabulario extenso",
        "Comprensión de cohesión y coherencia textual",
        "Conocimiento de gramática avanzada"
      ]}
      correctAnswer={2}
      explanation="La comprensión de cómo las ideas se conectan y fluyen lógicamente (cohesión y coherencia) es lo más importante."
    />
  ];

  return (
    <TheoryLayout
      title="Gapped Text"
      description="Domina los ejercicios de texto con espacios. Aprende a identificar cohesión, coherencia y flujo lógico para elegir párrafos que encajen perfectamente."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced reading skills", "Understanding of text structure", "Knowledge of connectors"]}
      estimatedTime="85 min"
    />
  );
};

export default GappedTextPage;
