'use client';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { TheorySection, Example, Rule, Tip, QuickReference } from '@/components/theory/TheoryContent';
import { MultipleChoiceExercise, TrueFalseExercise } from '@/components/theory/ExerciseComponents';

const TextOrganizationStructurePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué es Text Organization and Structure?" icon="🏗️">
        <p>
          <strong>Text Organization and Structure</strong> se refiere a cómo está organizado un texto: 
          la secuencia lógica de ideas, la división en párrafos, el uso de conectores, y cómo las diferentes 
          partes se relacionan para crear un mensaje coherente y efectivo.
        </p>
        
        <Example 
          title="Ejemplo de Text Organization"
          content="Un ensayo argumentativo típico: 1) Introducción con tesis, 2) Párrafo con argumentos a favor, 3) Párrafo con contraargumentos, 4) Párrafo refutando contraargumentos, 5) Conclusión reforzando la tesis."
          explanation="Cada parte tiene una función específica y sigue una secuencia lógica que guía al lector."
        />
      </TheorySection>

      <TheorySection title="Patrones Organizacionales Comunes" icon="🎯">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip 
            title="1. Cronológico/Secuencial"
            description="Organización basada en tiempo o secuencia de eventos."
            examples={[
              "Biografías y relatos históricos",
              "Instrucciones paso a paso",
              "Procesos científicos o técnicos",
              "Narrativas y cuentos"
            ]}
          />

          <Tip 
            title="2. Problema-Solución"
            description="Presenta un problema y luego propone soluciones."
            examples={[
              "Artículos sobre temas sociales",
              "Propuestas de negocios",
              "Ensayos académicos",
              "Informes técnicos"
            ]}
          />

          <Tip 
            title="3. Causa-Efecto"
            description="Explora las causas de algo y sus consecuencias."
            examples={[
              "Análisis de fenómenos naturales",
              "Estudios sociológicos",
              "Análisis económicos",
              "Investigaciones científicas"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Elementos Estructurales" icon="🔍">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Introducción efectiva"
            description="Establece el tema, contexto y propósito del texto."
            examples={[
              "Hook: pregunta, estadística, cita llamativa",
              "Contexto: información de fondo necesaria",
              "Tesis: idea principal o propósito del texto",
              "Preview: adelanto de lo que se discutirá"
            ]}
          />

          <Rule 
            title="2. Desarrollo coherente"
            description="Párrafos que desarrollan ideas de manera lógica."
            examples={[
              "Cada párrafo tiene una idea principal clara",
              "Ideas secundarias apoyan la idea principal",
              "Transiciones suaves entre párrafos",
              "Evidencia y ejemplos apropiados"
            ]}
          />

          <Rule 
            title="3. Conclusión efectiva"
            description="Cierra el texto de manera satisfactoria."
            examples={[
              "Resumen de puntos principales",
              "Reafirmación de la tesis",
              "Implicaciones o consecuencias",
              "Call to action o reflexión final"
            ]}
          />
        </div>
      </TheorySection>

      <TheorySection title="Conectores y Transiciones" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Conectores de secuencia"
            description="Indican orden temporal o lógico."
            examples={[
              "Primero: First, Initially, To begin with",
              "Continuación: Then, Next, Subsequently, Furthermore",
              "Final: Finally, Lastly, In conclusion",
              "Simultaneidad: Meanwhile, At the same time, While"
            ]}
          />

          <Rule 
            title="2. Conectores de contraste"
            description="Muestran diferencias u oposiciones."
            examples={[
              "Contraste fuerte: However, Nevertheless, On the contrary",
              "Contraste suave: Although, While, Whereas",
              "Concesión: Despite, In spite of, Admittedly",
              "Alternativa: Instead, Rather, Alternatively"
            ]}
          />

          <Rule 
            title="3. Conectores de causa-efecto"
            description="Establecen relaciones causales."
            examples={[
              "Causa: Because, Since, Due to, As a result of",
              "Efecto: Therefore, Consequently, Thus, Hence",
              "Propósito: In order to, So that, With the aim of",
              "Condición: If, Unless, Provided that, In case"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Cuál es la función principal de la organización textual?"
      options={[
        "Hacer el texto más largo",
        "Crear un mensaje coherente y efectivo",
        "Usar vocabulario complejo",
        "Impresionar al lector"
      ]}
      correctAnswer={1}
      explanation="La organización textual busca crear un mensaje coherente y efectivo que guíe al lector lógicamente."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Qué patrón organizacional es más apropiado para explicar cómo hacer una receta?"
      options={[
        "Problema-solución",
        "Causa-efecto",
        "Cronológico/secuencial",
        "Comparación-contraste"
      ]}
      correctAnswer={2}
      explanation="Una receta requiere seguir pasos en orden específico, por lo que el patrón cronológico/secuencial es ideal."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Cada párrafo debe tener una idea principal clara.",
          isTrue: true,
          explanation: "Correcto. Cada párrafo debe enfocarse en una idea principal que contribuya al propósito general del texto."
        },
        {
          text: "Los conectores solo se usan al inicio de los párrafos.",
          isTrue: false,
          explanation: "Incorrecto. Los conectores se usan dentro y entre oraciones para crear fluidez y coherencia."
        },
        {
          text: "La introducción debe establecer el propósito del texto.",
          isTrue: true,
          explanation: "Correcto. La introducción debe orientar al lector sobre qué esperar del texto."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la mejor transición para introducir un contraargumento?"
      options={[
        "Furthermore",
        "However",
        "Therefore",
        "In addition"
      ]}
      correctAnswer={1}
      explanation="'However' indica contraste y es ideal para introducir un contraargumento o punto de vista opuesto."
    />,

    <MultipleChoiceExercise
      key="5"
      question="En un texto problema-solución, ¿qué viene típicamente después de presentar el problema?"
      options={[
        "La conclusión",
        "Más problemas",
        "Las causas del problema o posibles soluciones",
        "Una nueva introducción"
      ]}
      correctAnswer={2}
      explanation="Después del problema, típicamente se exploran las causas o se presentan posibles soluciones."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Un buen párrafo puede tener múltiples ideas principales no relacionadas.",
          isTrue: false,
          explanation: "Incorrecto. Un párrafo efectivo debe enfocarse en una idea principal con ideas secundarias que la apoyen."
        },
        {
          text: "La conclusión debe introducir ideas completamente nuevas.",
          isTrue: false,
          explanation: "Incorrecto. La conclusión debe cerrar el texto basándose en lo ya discutido, no introducir ideas nuevas."
        },
        {
          text: "Los conectores ayudan al lector a seguir el flujo lógico del texto.",
          isTrue: true,
          explanation: "Correcto. Los conectores guían al lector mostrando las relaciones entre ideas."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Qué elemento NO es típico de una introducción efectiva?"
      options={[
        "Hook para captar atención",
        "Contexto del tema",
        "Detalles específicos de la conclusión",
        "Presentación de la tesis"
      ]}
      correctAnswer={2}
      explanation="Los detalles de la conclusión no pertenecen a la introducción; esta debe orientar, no concluir."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Cuál es la función de 'Meanwhile' en un texto?"
      options={[
        "Indicar contraste",
        "Mostrar causa-efecto",
        "Indicar simultaneidad",
        "Introducir una conclusión"
      ]}
      correctAnswer={2}
      explanation="'Meanwhile' indica que algo sucede al mismo tiempo que otra acción o evento."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "El patrón causa-efecto es útil para analizar fenómenos complejos.",
          isTrue: true,
          explanation: "Correcto. Este patrón ayuda a entender por qué ocurren las cosas y cuáles son sus consecuencias."
        },
        {
          text: "Todos los textos deben seguir exactamente el mismo patrón organizacional.",
          isTrue: false,
          explanation: "Incorrecto. Diferentes propósitos y audiencias requieren diferentes patrones organizacionales."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuál es la clave para una buena organización textual?"
      options={[
        "Usar muchos conectores complejos",
        "Hacer párrafos muy largos",
        "Crear una secuencia lógica que guíe al lector",
        "Repetir la misma idea en cada párrafo"
      ]}
      correctAnswer={2}
      explanation="La clave es crear una secuencia lógica y coherente que guíe al lector naturalmente hacia el mensaje principal."
    />
  ];

  return (
    <TheoryLayout
      title="Text Organization and Structure"
      description="Domina la organización y estructura textual. Aprende patrones organizacionales, elementos estructurales y el uso efectivo de conectores para crear textos coherentes."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Advanced writing skills", "Understanding of text types", "Knowledge of connectors"]}
      estimatedTime="80 min"
    />
  );
};

export default TextOrganizationStructurePage;
