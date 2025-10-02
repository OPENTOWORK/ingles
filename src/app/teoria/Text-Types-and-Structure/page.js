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

const TextTypesAndStructurePage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los Text Types and Structure?" icon="📝">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>text types</strong> (tipos de texto) y <strong>structure</strong> (estructura) son fundamentales para escribir bien en inglés. 
          Cada tipo de texto tiene su propia estructura, propósito y convenciones que debes seguir para comunicarte efectivamente.
        </p>
        
        <QuickReference items={[
          "Formal vs Informal: tono y registro apropiado",
          "Estructura: introducción, desarrollo, conclusión",
          "Párrafos: una idea principal por párrafo",
          "Cohesión: conectores y transiciones",
          "Propósito: informar, persuadir, narrar, describir"
        ]} />
      </TheorySection>

      <TheorySection title="Tipos de Texto Principales" icon="📚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Existen diferentes tipos de texto, cada uno con características específicas y propósitos distintos.
        </p>

        <GrammarTable
          caption="Tipos de Texto y sus Características"
          headers={["Tipo", "Propósito", "Estructura", "Ejemplo"]}
          rows={[
            ["Descriptivo", "Describir personas, lugares, objetos", "Introducción + detalles + conclusión", "Descripción de una ciudad"],
            ["Narrativo", "Contar una historia o evento", "Inicio + desarrollo + final", "Relato de vacaciones"],
            ["Expositivo", "Explicar o informar", "Tesis + argumentos + conclusión", "Ensayo sobre medio ambiente"],
            ["Argumentativo", "Persuadir o convencer", "Tesis + contraargumentos + conclusión", "Opinión sobre tecnología"],
            ["Instructivo", "Dar instrucciones", "Objetivo + pasos + resultado", "Receta de cocina"],
            ["Correspondencia", "Comunicarse con alguien", "Saludo + cuerpo + despedida", "Email formal/informal"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Descripción: 'Mi ciudad natal es un lugar hermoso...'"
            english="Description: 'My hometown is a beautiful place...'"
            translation="Descripción: 'Mi ciudad natal es un lugar hermoso...'"
          />
          <Example 
            spanish="Narrativo: 'El verano pasado fui a...'"
            english="Narrative: 'Last summer I went to...'"
            translation="Narrativo: 'El verano pasado fui a...'"
          />
          <Example 
            spanish="Argumentativo: 'Creo que la tecnología es...'"
            english="Argumentative: 'I believe technology is...'"
            translation="Argumentativo: 'Creo que la tecnología es...'"
          />
        </div>

        <Rule 
          title="Selección del Tipo de Texto"
          description="Elige el tipo de texto según:"
          examples={[
            "El propósito de tu escritura",
            "Tu audiencia objetivo",
            "El contexto formal o informal",
            "Los requisitos específicos"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Siempre identifica el tipo de texto antes de empezar a escribir.
        </Tip>
      </TheorySection>

      <TheorySection title="Estructura General de Textos" icon="🏗️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La mayoría de textos en inglés siguen una estructura básica de tres partes.
        </p>

        <GrammarTable
          caption="Estructura de Tres Partes"
          headers={["Parte", "Función", "Contenido", "Longitud"]}
          rows={[
            ["Introducción", "Presentar el tema", "Tesis, contexto, objetivo", "10-15% del texto"],
            ["Desarrollo", "Desarrollar ideas", "Párrafos con argumentos/ejemplos", "70-80% del texto"],
            ["Conclusión", "Resumir y cerrar", "Resumen, opinión final, recomendación", "10-15% del texto"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Introducción: 'En este ensayo analizaré los beneficios de la tecnología...'"
            english="Introduction: 'In this essay, I will analyze the benefits of technology...'"
            translation="Introducción: 'En este ensayo analizaré los beneficios de la tecnología...'"
          />
          <Example 
            spanish="Desarrollo: 'En primer lugar, la tecnología mejora la comunicación...'"
            english="Development: 'First of all, technology improves communication...'"
            translation="Desarrollo: 'En primer lugar, la tecnología mejora la comunicación...'"
          />
          <Example 
            spanish="Conclusión: 'En conclusión, la tecnología es beneficiosa...'"
            english="Conclusion: 'In conclusion, technology is beneficial...'"
            translation="Conclusión: 'En conclusión, la tecnología es beneficiosa...'"
          />
        </div>

        <Rule 
          title="Características de cada Parte"
          description="Cada parte tiene funciones específicas:"
          examples={[
            "Introducción: captar atención, presentar tema",
            "Desarrollo: argumentar, ejemplificar, explicar",
            "Conclusión: resumir, dar opinión final"
          ]}
        />

        <Tip type="success">
          <strong>Recuerda:</strong> La estructura debe ser clara y lógica para el lector.
        </Tip>
      </TheorySection>

      <TheorySection title="Párrafos: Estructura y Desarrollo" icon="📄">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los párrafos son la unidad básica de organización en un texto. Cada párrafo debe desarrollar una idea principal.
        </p>

        <GrammarTable
          caption="Estructura de Párrafos"
          headers={["Parte", "Función", "Ejemplo"]}
          rows={[
            ["Oración temática", "Presentar la idea principal", "Technology has revolutionized communication."],
            ["Oraciones de apoyo", "Desarrollar la idea", "First, it allows instant messaging..."],
            ["Ejemplos/Evidencia", "Ilustrar el punto", "For example, social media platforms..."],
            ["Conclusión del párrafo", "Cerrar la idea", "Therefore, communication is now faster."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Oración temática: 'La tecnología ha revolucionado la comunicación.'"
            english="Topic sentence: 'Technology has revolutionized communication.'"
            translation="Oración temática: 'La tecnología ha revolucionado la comunicación.'"
          />
          <Example 
            spanish="Desarrollo: 'En primer lugar, permite mensajería instantánea...'"
            english="Development: 'First of all, it allows instant messaging...'"
            translation="Desarrollo: 'En primer lugar, permite mensajería instantánea...'"
          />
          <Example 
            spanish="Ejemplo: 'Por ejemplo, las plataformas de redes sociales...'"
            english="Example: 'For example, social media platforms...'"
            translation="Ejemplo: 'Por ejemplo, las plataformas de redes sociales...'"
          />
        </div>

        <Rule 
          title="Reglas para Párrafos"
          description="Cada párrafo debe:"
          examples={[
            "Tener una sola idea principal",
            "Ser coherente y cohesionado",
            "Tener una longitud apropiada (3-7 oraciones)",
            "Conectar con el párrafo anterior y siguiente"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No mezcles ideas diferentes en el mismo párrafo.
        </Tip>
      </TheorySection>

      <TheorySection title="Registro Formal vs Informal" icon="🎭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El registro determina el tono y estilo de tu escritura. Debe ser apropiado para la situación y audiencia.
        </p>

        <GrammarTable
          caption="Diferencias entre Registro Formal e Informal"
          headers={["Aspecto", "Formal", "Informal"]}
          rows={[
            ["Vocabulario", "Palabras complejas y precisas", "Palabras simples y coloquiales"],
            ["Contracciones", "No se usan (I will, do not)", "Se usan (I'll, don't)"],
            ["Estructura", "Oraciones complejas", "Oraciones simples"],
            ["Pronombres", "Evita 'I', 'you' directos", "Usa 'I', 'you' libremente"],
            ["Conectores", "Sin embargo, además", "Pero, también"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Formal: 'I would like to express my gratitude...'"
            english="Formal: 'I would like to express my gratitude...'"
            translation="Formal: 'Me gustaría expresar mi gratitud...'"
          />
          <Example 
            spanish="Informal: 'Thanks a lot for everything!'"
            english="Informal: 'Thanks a lot for everything!'"
            translation="Informal: '¡Muchas gracias por todo!'"
          />
          <Example 
            spanish="Formal: 'Furthermore, it is important to note...'"
            english="Formal: 'Furthermore, it is important to note...'"
            translation="Formal: 'Además, es importante notar...'"
          />
          <Example 
            spanish="Informal: 'Also, you should know...'"
            english="Informal: 'Also, you should know...'"
            translation="Informal: 'También, deberías saber...'"
          />
        </div>

        <Rule 
          title="Cuándo usar cada Registro"
          description="Elige el registro según:"
          examples={[
            "Formal: ensayos académicos, cartas de trabajo, informes",
            "Informal: emails personales, blogs, mensajes",
            "Contexto: profesional vs personal",
            "Audiencia: superior vs iguales"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Siempre adapta tu registro al contexto y audiencia.
        </Tip>
      </TheorySection>

      <TheorySection title="Conectores y Transiciones" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los conectores y transiciones ayudan a crear textos coherentes y fáciles de seguir.
        </p>

        <GrammarTable
          caption="Tipos de Conectores"
          headers={["Función", "Conectores", "Ejemplo"]}
          rows={[
            ["Adición", "Furthermore, Moreover, In addition", "Furthermore, technology improves education."],
            ["Contraste", "However, Nevertheless, On the other hand", "However, there are some disadvantages."],
            ["Causa", "Because, Due to, As a result of", "Due to technology, communication is faster."],
            ["Resultado", "Therefore, Consequently, Thus", "Therefore, we should embrace technology."],
            ["Tiempo", "First, Then, Finally, Meanwhile", "First, I will discuss the benefits."],
            ["Ejemplo", "For example, For instance, Such as", "For example, smartphones are very useful."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Adición: 'Además, la tecnología mejora la educación.'"
            english="Addition: 'Furthermore, technology improves education.'"
            translation="Adición: 'Además, la tecnología mejora la educación.'"
          />
          <Example 
            spanish="Contraste: 'Sin embargo, hay algunas desventajas.'"
            english="Contrast: 'However, there are some disadvantages.'"
            translation="Contraste: 'Sin embargo, hay algunas desventajas.'"
          />
          <Example 
            spanish="Resultado: 'Por lo tanto, deberíamos abrazar la tecnología.'"
            english="Result: 'Therefore, we should embrace technology.'"
            translation="Resultado: 'Por lo tanto, deberíamos abrazar la tecnología.'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Los conectores hacen que tu texto sea más profesional y fácil de seguir.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Mezclar ideas diferentes en un párrafo ❌<br/>
            <strong>Correcto:</strong> Una idea principal por párrafo ✅<br/>
            <em>Cada párrafo debe tener un foco claro</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No usar conectores entre párrafos ❌<br/>
            <strong>Correcto:</strong> Usar transiciones apropiadas ✅<br/>
            <em>Los conectores mejoran la fluidez</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Registro inapropiado para la situación ❌<br/>
            <strong>Correcto:</strong> Adaptar el tono al contexto ✅<br/>
            <em>Formal para ensayos, informal para emails personales</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Falta de estructura clara ❌<br/>
            <strong>Correcto:</strong> Introducción, desarrollo, conclusión ✅<br/>
            <em>La estructura ayuda al lector a seguir tu argumento</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Planificación antes de escribir"
            description="Siempre planifica tu texto antes de empezar a escribir."
            examples={[
              "Identifica el tipo de texto",
              "Define tu audiencia",
              "Organiza tus ideas",
              "Decide la estructura"
            ]}
          />

          <Rule 
            title="2. Una idea por párrafo"
            description="Cada párrafo debe desarrollar una sola idea principal."
            examples={[
              "Oración temática clara",
              "Oraciones de apoyo",
              "Ejemplos o evidencia",
              "Conclusión del párrafo"
            ]}
          />

          <Rule 
            title="3. Cohesión y coherencia"
            description="Tu texto debe ser fácil de seguir y entender."
            examples={[
              "Usa conectores apropiados",
              "Mantén la coherencia temática",
              "Estructura lógica",
              "Transiciones suaves"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: '_____, technology has many benefits.'"
      options={[
        "But",
        "Furthermore",
        "Finally",
        "However"
      ]}
      correctAnswer={1}
      explanation="'Furthermore' añade información adicional que apoya la idea anterior sobre los beneficios de la tecnología."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la estructura correcta de un párrafo?"
      options={[
        "Oración temática + ejemplos + conclusión",
        "Introducción + desarrollo + conclusión",
        "Oración temática + oraciones de apoyo + conclusión",
        "Ejemplos + argumentos + opinión"
      ]}
      correctAnswer={2}
      explanation="Un párrafo debe tener: oración temática (idea principal) + oraciones de apoyo (desarrollo) + conclusión del párrafo."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "En un texto formal, puedes usar contracciones como 'I'll' y 'don't'.",
          isTrue: false,
          explanation: "Incorrecto. En textos formales se evitan las contracciones. Se usa 'I will' y 'do not'."
        },
        {
          text: "Cada párrafo debe tener una sola idea principal.",
          isTrue: true,
          explanation: "Correcto. Cada párrafo debe desarrollar una sola idea principal para mantener la claridad."
        },
        {
          text: "Los conectores como 'however' y 'furthermore' mejoran la fluidez del texto.",
          isTrue: true,
          explanation: "Correcto. Los conectores ayudan a crear transiciones suaves entre ideas."
        },
        {
          text: "La introducción debe ser el 70% del texto.",
          isTrue: false,
          explanation: "Incorrecto. La introducción debe ser solo el 10-15% del texto. El desarrollo debe ser el 70-80%."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es el registro más apropiado para un ensayo académico?"
      options={[
        "Informal con contracciones",
        "Formal sin contracciones",
        "Mixto según la situación",
        "Coloquial y directo"
      ]}
      correctAnswer={1}
      explanation="Los ensayos académicos requieren registro formal, sin contracciones, con vocabulario preciso y estructura compleja."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es la función principal de la conclusión en un texto?"
      options={[
        "Introducir nuevas ideas",
        "Desarrollar argumentos",
        "Resumir y cerrar el tema",
        "Dar ejemplos específicos"
      ]}
      correctAnswer={2}
      explanation="La conclusión debe resumir las ideas principales, dar una opinión final y cerrar el tema de manera efectiva."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "Narrative texts should be written in chronological order.",
          isTrue: true,
          explanation: "Correcto. Los textos narrativos generalmente siguen un orden cronológico para mantener la coherencia temporal."
        },
        {
          text: "Descriptive texts focus on explaining how something works.",
          isTrue: false,
          explanation: "Incorrecto. Los textos descriptivos se enfocan en características y cualidades, no en procesos o funcionamiento."
        },
        {
          text: "Each paragraph should have only one main idea.",
          isTrue: true,
          explanation: "Correcto. Cada párrafo debe desarrollar una sola idea principal para mantener la claridad y organización."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Qué tipo de texto usarías para explicar las ventajas y desventajas de la tecnología?"
      options={[
        "Narrative",
        "Argumentative",
        "Descriptive",
        "Instructional"
      ]}
      correctAnswer={1}
      explanation="Un texto argumentativo es ideal para presentar y analizar ventajas y desventajas, desarrollando argumentos balanceados."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Cuál es la función principal de la conclusión en un ensayo?"
      options={[
        "Introducir nuevas ideas",
        "Resumir puntos principales y dar cierre",
        "Dar ejemplos detallados",
        "Hacer preguntas al lector"
      ]}
      correctAnswer={1}
      explanation="La conclusión debe resumir los puntos principales y dar un cierre efectivo, no introducir ideas nuevas."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Formal texts should avoid contractions like 'don't' and 'can't'.",
          isTrue: true,
          explanation: "Correcto. En textos formales se evitan las contracciones; se usa 'do not' y 'cannot'."
        },
        {
          text: "The introduction should be 50% of your essay.",
          isTrue: false,
          explanation: "Incorrecto. La introducción debe ser solo 10-15% del ensayo; el desarrollo debe ser 70-80%."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Qué estructura es más apropiada para un texto expositivo?"
      options={[
        "Problema → Solución",
        "Introducción → Desarrollo → Conclusión",
        "Causa → Efecto",
        "Comparación → Contraste"
      ]}
      correctAnswer={1}
      explanation="La estructura Introducción → Desarrollo → Conclusión es la más versátil y apropiada para textos expositivos."
    />
  ];

  return (
    <TheoryLayout
      title="Text Types and Structure"
      description="Domina los tipos de texto y estructura en inglés. Aprende a organizar ideas, usar registros apropiados y crear textos coherentes y efectivos."
      level="A1-A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic grammar", "Understanding of sentence structure"]}
      estimatedTime="60 min"
    />
  );
};

export default TextTypesAndStructurePage;






















