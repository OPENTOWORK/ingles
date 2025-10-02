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

const NoteTakingTechniquesPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son las Note-Taking Techniques?" icon="📝">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las <strong>note-taking techniques</strong> (técnicas de toma de notas) son métodos sistemáticos para capturar 
          información importante durante el listening. Son esenciales para retener y procesar información en exámenes largos.
        </p>
        
        <QuickReference items={[
          "Métodos para capturar información clave",
          "Sistemas de organización y estructura",
          "Abreviaciones y símbolos eficientes",
          "Estrategias para diferentes tipos de listening",
          "Técnicas de revisión y verificación"
        ]} />
      </TheorySection>

      <TheorySection title="Importancia de la Toma de Notas" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La toma de notas es crucial para el éxito en exámenes de listening, especialmente en audios largos.
        </p>

        <GrammarTable
          caption="Beneficios de la Toma de Notas"
          headers={["Beneficio", "Descripción", "Cuándo Ayuda", "Ejemplo"]}
          rows={[
            ["Retención", "Ayuda a recordar información", "Audios largos", "Recordar detalles después de 5 minutos"],
            ["Organización", "Estructura la información", "Información compleja", "Organizar por temas o hablantes"],
            ["Enfoque", "Mantiene la concentración", "Audios aburridos", "Enfocarse en información relevante"],
            ["Verificación", "Permite revisar respuestas", "Después del audio", "Confirmar información antes de responder"],
            ["Comprensión", "Mejora el procesamiento", "Información difícil", "Procesar información compleja"],
            ["Confianza", "Reduce la ansiedad", "Exámenes importantes", "Sentirse preparado para responder"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Retención: 'Recordar detalles después de audio de 5 minutos'"
            english="Retention: 'Remember details after 5-minute audio'"
            translation="Retención: 'Recordar detalles después de audio de 5 minutos'"
          />
          <Example 
            spanish="Organización: 'Organizar información por temas'"
            english="Organization: 'Organize information by topics'"
            translation="Organización: 'Organizar información por temas'"
          />
          <Example 
            spanish="Verificación: 'Confirmar información antes de responder'"
            english="Verification: 'Confirm information before answering'"
            translation="Verificación: 'Confirmar información antes de responder'"
          />
        </div>

        <Rule 
          title="Cuándo Tomar Notas"
          description="Toma notas cuando:"
          examples={[
            "El audio es largo (más de 2 minutos)",
            "Hay mucha información específica",
            "Hay múltiples hablantes",
            "Hay números, fechas, nombres importantes",
            "El audio es complejo o técnico"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> La toma de notas es especialmente importante en monólogos y conversaciones largas.
        </Tip>
      </TheorySection>

      <TheorySection title="Sistemas de Organización" icon="📋">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Existen diferentes sistemas para organizar las notas de manera efectiva.
        </p>

        <GrammarTable
          caption="Sistemas de Organización de Notas"
          headers={["Sistema", "Descripción", "Cuándo Usar", "Ventaja"]}
          rows={[
            ["Lineal", "Notas en líneas secuenciales", "Información cronológica", "Fácil seguimiento temporal"],
            ["Por Temas", "Organizar por temas principales", "Múltiples temas", "Fácil referencia por tema"],
            ["Por Hablantes", "Separar por persona que habla", "Múltiples hablantes", "Seguir quién dice qué"],
            ["Cornell", "Dividir página en secciones", "Información compleja", "Estructura clara"],
            ["Mapa Mental", "Organizar visualmente", "Conceptos interrelacionados", "Ver relaciones"],
            ["Tabla", "Organizar en columnas", "Información comparativa", "Fácil comparación"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Lineal: '1. Introducción, 2. Desarrollo, 3. Conclusión'"
            english="Linear: '1. Introduction, 2. Development, 3. Conclusion'"
            translation="Lineal: '1. Introducción, 2. Desarrollo, 3. Conclusión'"
          />
          <Example 
            spanish="Por temas: 'Tema A: Beneficios, Tema B: Desafíos, Tema C: Soluciones'"
            english="By topics: 'Topic A: Benefits, Topic B: Challenges, Topic C: Solutions'"
            translation="Por temas: 'Tema A: Beneficios, Tema B: Desafíos, Tema C: Soluciones'"
          />
          <Example 
            spanish="Por hablantes: 'Manager: decisiones, Designer: propuestas, Developer: preocupaciones'"
            english="By speakers: 'Manager: decisions, Designer: proposals, Developer: concerns'"
            translation="Por hablantes: 'Manager: decisiones, Designer: propuestas, Developer: preocupaciones'"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Elige el sistema que mejor se adapte al tipo de información y estructura del audio.
        </Tip>
      </TheorySection>

      <TheorySection title="Abreviaciones y Símbolos" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las abreviaciones y símbolos son herramientas esenciales para tomar notas rápidamente.
        </p>

        <GrammarTable
          caption="Abreviaciones y Símbolos Comunes"
          headers={["Categoría", "Ejemplo", "Significado", "Cuándo Usar"]}
          rows={[
            ["Palabras Comunes", "w/ (with), w/o (without)", "Con, sin", "Frecuentemente"],
            ["Tiempo", "AM, PM, Mon, Tue", "Tiempo, días", "Fechas y horarios"],
            ["Números", "1st, 2nd, 3rd", "Primero, segundo, tercero", "Listas y secuencias"],
            ["Símbolos", "→ (leads to), ↑ (increase)", "Conectores, cambios", "Relaciones y cambios"],
            ["Profesiones", "Dr. (doctor), Prof. (professor)", "Títulos profesionales", "Identificar personas"],
            ["Lugares", "US, UK, NY", "Países, ciudades", "Ubicaciones geográficas"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Palabras comunes: 'w/ (con), w/o (sin)'"
            english="Common words: 'w/ (with), w/o (without)'"
            translation="Palabras comunes: 'w/ (con), w/o (sin)'"
          />
          <Example 
            spanish="Símbolos: '→ (lleva a), ↑ (aumenta)'"
            english="Symbols: '→ (leads to), ↑ (increases)'"
            translation="Símbolos: '→ (lleva a), ↑ (aumenta)'"
          />
          <Example 
            spanish="Tiempo: 'AM, PM, Mon, Tue'"
            english="Time: 'AM, PM, Mon, Tue'"
            translation="Tiempo: 'AM, PM, Mon, Tue'"
          />
        </div>

        <Rule 
          title="Consejos para Abreviaciones"
          description="Para usar abreviaciones efectivamente:"
          examples={[
            "Desarrolla tu propio sistema consistente",
            "Usa abreviaciones que puedas entender después",
            "Practica hasta que sean automáticas",
            "No uses abreviaciones demasiado complejas"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Asegúrate de poder entender tus propias abreviaciones después.
        </Tip>
      </TheorySection>

      <TheorySection title="Técnicas por Tipo de Listening" icon="🎧">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Diferentes tipos de listening requieren diferentes técnicas de toma de notas.
        </p>

        <GrammarTable
          caption="Técnicas por Tipo de Listening"
          headers={["Tipo", "Técnica", "Enfoque", "Ejemplo"]}
          rows={[
            ["Short Dialogues", "Notas mínimas", "Información específica", "Precio: $25, Tiempo: 3 PM"],
            ["Monologues", "Notas estructuradas", "Estructura y detalles", "Intro: tema, Desarrollo: 3 puntos"],
            ["Long Conversations", "Notas por hablante", "Quién dice qué", "A: opción 1, B: opción 2"],
            ["Multi-speaker", "Mapa de voces", "Identificación sistemática", "Voz 1: manager, Voz 2: designer"],
            ["Lectures", "Notas académicas", "Conceptos y ejemplos", "Concepto: definición, Ejemplo: caso"],
            ["Interviews", "Q&A format", "Preguntas y respuestas", "P: experiencia, R: 5 años"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Short Dialogues: 'Precio: $25, Tiempo: 3 PM'"
            english="Short Dialogues: 'Price: $25, Time: 3 PM'"
            translation="Short Dialogues: 'Precio: $25, Tiempo: 3 PM'"
          />
          <Example 
            spanish="Monologues: 'Intro: tema, Desarrollo: 3 puntos'"
            english="Monologues: 'Intro: topic, Development: 3 points'"
            translation="Monologues: 'Intro: tema, Desarrollo: 3 puntos'"
          />
          <Example 
            spanish="Multi-speaker: 'Voz 1: manager, Voz 2: designer'"
            english="Multi-speaker: 'Voice 1: manager, Voice 2: designer'"
            translation="Multi-speaker: 'Voz 1: manager, Voz 2: designer'"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Adapta tu técnica de toma de notas al tipo de listening para maximizar la efectividad.
        </Tip>
      </TheorySection>

      <TheorySection title="Estrategias de Escritura Rápida" icon="⚡">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La escritura rápida es esencial para no perder información importante.
        </p>

        <GrammarTable
          caption="Estrategias de Escritura Rápida"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Beneficio"]}
          rows={[
            ["Palabras Clave", "Escribir solo palabras importantes", "Información específica", "Velocidad"],
            ["Omitir Artículos", "Eliminar a, an, the", "Oraciones completas", "Espacio y tiempo"],
            ["Usar Símbolos", "Símbolos en lugar de palabras", "Conceptos comunes", "Velocidad"],
            ["Escribir Fónicamente", "Como suena, no como se escribe", "Palabras desconocidas", "No perder tiempo"],
            ["Usar Flechas", "Conectar ideas con flechas", "Relaciones entre conceptos", "Claridad visual"],
            ["Espacios en Blanco", "Dejar espacios para completar", "Información incompleta", "Flexibilidad"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Palabras clave: 'beneficios tecnología comunicación'"
            english="Keywords: 'benefits technology communication'"
            translation="Palabras clave: 'beneficios tecnología comunicación'"
          />
          <Example 
            spanish="Símbolos: '↑ beneficios, ↓ costos'"
            english="Symbols: '↑ benefits, ↓ costs'"
            translation="Símbolos: '↑ beneficios, ↓ costos'"
          />
          <Example 
            spanish="Fonético: 'teknoloji' (technology)"
            english="Phonetic: 'teknoloji' (technology)"
            translation="Fonético: 'teknoloji' (technology)"
          />
        </div>

        <Rule 
          title="Consejos para Escritura Rápida"
          description="Para escribir rápidamente:"
          examples={[
            "Prioriza velocidad sobre perfección",
            "Usa abreviaciones consistentes",
            "Escribe solo información esencial",
            "No te preocupes por la ortografía perfecta",
            "Usa símbolos cuando sea posible"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> La velocidad es más importante que la perfección en la toma de notas.
        </Tip>
      </TheorySection>

      <TheorySection title="Revisión y Verificación" icon="🔍">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Revisar y verificar las notas es crucial para asegurar la precisión.
        </p>

        <GrammarTable
          caption="Estrategias de Revisión"
          headers={["Estrategia", "Descripción", "Cuándo Usar", "Beneficio"]}
          rows={[
            ["Revisión Inmediata", "Revisar notas justo después", "Después del audio", "Completar información faltante"],
            ["Verificación Cruzada", "Comparar con preguntas", "Antes de responder", "Asegurar precisión"],
            ["Completar Espacios", "Llenar información faltante", "Durante revisión", "Completar notas"],
            ["Clarificar Abreviaciones", "Asegurar comprensión", "Durante revisión", "Evitar malentendidos"],
            ["Organizar Información", "Reorganizar si es necesario", "Durante revisión", "Mejorar claridad"],
            ["Marcar Prioridades", "Identificar información clave", "Durante revisión", "Enfocar en lo importante"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Revisión inmediata: 'Completar información faltante'"
            english="Immediate review: 'Complete missing information'"
            translation="Revisión inmediata: 'Completar información faltante'"
          />
          <Example 
            spanish="Verificación cruzada: 'Comparar con preguntas'"
            english="Cross-verification: 'Compare with questions'"
            translation="Verificación cruzada: 'Comparar con preguntas'"
          />
          <Example 
            spanish="Completar espacios: 'Llenar información faltante'"
            english="Fill gaps: 'Complete missing information'"
            translation="Completar espacios: 'Llenar información faltante'"
          />
        </div>

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No dediques demasiado tiempo a revisar - asegúrate de tener tiempo para responder las preguntas.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Intentar escribir todo ❌<br/>
            <strong>Correcto:</strong> Escribir solo información clave ✅<br/>
            <em>Escribir todo te hace perder información importante</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar abreviaciones incomprensibles ❌<br/>
            <strong>Correcto:</strong> Usar abreviaciones claras ✅<br/>
            <em>Asegúrate de poder entender tus propias abreviaciones</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No revisar las notas ❌<br/>
            <strong>Correcto:</strong> Revisar y verificar notas ✅<br/>
            <em>La revisión asegura precisión y completitud</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar el mismo sistema para todo ❌<br/>
            <strong>Correcto:</strong> Adaptar sistema al tipo de listening ✅<br/>
            <em>Diferentes tipos requieren diferentes enfoques</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Velocidad sobre perfección"
            description="Prioriza la velocidad en la toma de notas."
            examples={[
              "Escribe solo información esencial",
              "Usa abreviaciones y símbolos",
              "No te preocupes por la ortografía perfecta",
              "Prioriza capturar información sobre formato"
            ]}
          />

          <Rule 
            title="2. Sistema consistente"
            description="Desarrolla y mantén un sistema consistente."
            examples={[
              "Usa las mismas abreviaciones siempre",
              "Mantén la misma estructura organizacional",
              "Practica hasta que sea automático",
              "No cambies el sistema durante el examen"
            ]}
          />

          <Rule 
            title="3. Adaptación al contexto"
            description="Adapta tu técnica al tipo de listening."
            examples={[
              "Short dialogues: notas mínimas",
              "Monologues: estructura clara",
              "Multi-speaker: identificación de voces",
              "Lectures: conceptos y ejemplos"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="¿Qué ayudan a hacer las técnicas de toma de notas?"
      options={[
        "Organizar información",
        "Retener información",
        "Escribir más rápido",
        "All of the above"
      ]}
      correctAnswer={3}
      explanation="Las técnicas de toma de notas ayudan con todos estos aspectos: organizar, retener información y escribir más eficientemente."
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es el beneficio principal de la toma de notas en listening?"
      options={[
        "Mejorar la pronunciación",
        "Retener información importante",
        "Aumentar la velocidad de escritura",
        "Mejorar la ortografía"
      ]}
      correctAnswer={1}
      explanation="El beneficio principal es retener información importante, especialmente en audios largos donde es fácil olvidar detalles específicos."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Es mejor intentar escribir todo lo que se dice en un audio.",
          isTrue: false,
          explanation: "Incorrecto. Es mejor escribir solo información clave, ya que intentar escribir todo te hace perder información importante."
        },
        {
          text: "Las abreviaciones deben ser comprensibles para el que las escribe.",
          isTrue: true,
          explanation: "Correcto. Las abreviaciones deben ser claras para quien las escribe, para poder entenderlas después."
        },
        {
          text: "Diferentes tipos de listening requieren diferentes técnicas de toma de notas.",
          isTrue: true,
          explanation: "Correcto. Short dialogues requieren notas mínimas, mientras que monólogos requieren estructura clara."
        },
        {
          text: "La velocidad es más importante que la perfección en la toma de notas.",
          isTrue: true,
          explanation: "Correcto. Priorizar la velocidad sobre la perfección permite capturar más información importante."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la mejor estrategia para escribir rápidamente?"
      options={[
        "Escribir palabras completas",
        "Usar abreviaciones y símbolos",
        "Escribir en letra cursiva",
        "Usar solo mayúsculas"
      ]}
      correctAnswer={1}
      explanation="Usar abreviaciones y símbolos es la mejor estrategia para escribir rápidamente sin perder información importante."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuándo es más importante tomar notas?"
      options={[
        "En audios cortos",
        "En audios largos con mucha información",
        "Solo en monólogos",
        "Nunca es importante"
      ]}
      correctAnswer={1}
      explanation="Es más importante tomar notas en audios largos con mucha información, ya que es fácil olvidar detalles específicos."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "You should write complete sentences when taking notes during listening.",
          isTrue: false,
          explanation: "Incorrecto. Es mejor usar palabras clave, frases cortas y abreviaciones para no perder información importante."
        },
        {
          text: "Symbols like arrows and abbreviations speed up note-taking.",
          isTrue: true,
          explanation: "Correcto. Los símbolos (→, ↑, &, etc.) y abreviaciones (w/ = with, b/c = because) aceleran significativamente la toma de notas."
        },
        {
          text: "Your notes should be perfectly organized during listening.",
          isTrue: false,
          explanation: "Incorrecto. Durante la escucha, prioriza capturar información; puedes organizar después."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="¿Cuál es la mejor abreviación para 'information'?"
      options={[
        "information",
        "info",
        "inform",
        "infm"
      ]}
      correctAnswer={1}
      explanation="'Info' es una abreviación estándar y reconocible para 'information'."
    />,

    <MultipleChoiceExercise
      key="8"
      question="¿Qué técnica es más útil para monólogos largos?"
      options={[
        "Escribir todo literalmente",
        "Usar estructura jerárquica con puntos principales y detalles",
        "Solo tomar notas al final",
        "No usar ninguna organización"
      ]}
      correctAnswer={1}
      explanation="La estructura jerárquica (puntos principales → detalles → ejemplos) es ideal para monólogos largos."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "Mind mapping is useful for brainstorming but not for listening.",
          isTrue: false,
          explanation: "Incorrecto. Los mapas mentales pueden ser muy útiles para tomar notas durante presentaciones con múltiples temas relacionados."
        },
        {
          text: "You should develop your own consistent system of abbreviations.",
          isTrue: true,
          explanation: "Correcto. Un sistema personal y consistente de abreviaciones mejora la velocidad y eficiencia."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="¿Cuándo debes revisar y organizar tus notas?"
      options={[
        "Durante la escucha",
        "Inmediatamente después del audio",
        "Una semana después",
        "Nunca"
      ]}
      correctAnswer={1}
      explanation="Revisar y organizar las notas inmediatamente después del audio ayuda a clarificar y completar la información mientras está fresca en la memoria."
    />
  ];

  return (
    <TheoryLayout
      title="Note-Taking Techniques"
      description="Domina las técnicas de toma de notas para listening en inglés. Aprende sistemas de organización, abreviaciones, estrategias de escritura rápida y verificación."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic listening skills", "Understanding of different listening types"]}
      estimatedTime="75 min"
    />
  );
};

export default NoteTakingTechniquesPage;






















