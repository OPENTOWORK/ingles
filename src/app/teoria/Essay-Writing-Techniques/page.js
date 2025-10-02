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

const EssayWritingPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="Técnicas de Escritura de Essays" icon="✍️">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          En los exámenes de Cambridge (B2 First, C1 Advanced, C2 Proficiency), el <strong>essay</strong> 
          es una tarea obligatoria en Writing Paper. Debes escribir 140-190 palabras (B2), 220-260 palabras (C1), 
          o 280-320 palabras (C2) en respuesta a una pregunta específica, demostrando capacidad argumentativa y estilo académico.
        </p>
        
        <QuickReference items={[
          "Estructura clara: introducción, desarrollo, conclusión",
          "Tesis statement fuerte y específica",
          "Párrafos con topic sentences claras",
          "Evidencia y ejemplos de apoyo",
          "Conectores para cohesión y fluidez"
        ]} />
      </TheorySection>

      <TheorySection title="Estructura del Essay" icon="🏗️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Un essay bien estructurado sigue un patrón lógico que guía al lector a través de tu argumento.
        </p>

        <GrammarTable
          caption="Estructura Básica del Essay"
          headers={["Sección", "Propósito", "Contenido Típico", "Extensión"]}
          rows={[
            ["Introducción", "Presentar tema y tesis", "Hook, contexto, thesis statement", "10-15% del essay"],
            ["Desarrollo", "Argumentar y evidenciar", "Topic sentences, evidencia, análisis", "70-80% del essay"],
            ["Conclusión", "Resumir y cerrar", "Resumen, implicaciones, reflexión final", "10-15% del essay"]
          ]}
        />

        <Rule 
          title="Elementos de una Introducción Efectiva"
          description="Cada introducción debe incluir estos componentes:"
          examples={[
            "Hook: Pregunta, estadística o cita que capture atención",
            "Contexto: Información de fondo necesaria",
            "Thesis Statement: Tu argumento principal específico",
            "Preview: Breve mención de puntos principales (opcional)"
          ]}
        />

        <Example 
          spanish="Introducción sobre tecnología en educación:"
          english="In an era where digital devices dominate daily life, the integration of technology in classrooms has become inevitable. While some educators argue that traditional methods remain superior, evidence suggests that when properly implemented, educational technology significantly enhances student engagement and learning outcomes."
          translation="Hook (era digital) → Contexto (debate) → Thesis (tecnología mejora aprendizaje)"
        />
      </TheorySection>

      <TheorySection title="Thesis Statement Efectiva" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El thesis statement es el corazón de tu essay. Debe ser específico, argumentable y claro.
        </p>

        <GrammarTable
          caption="Características de un Buen Thesis Statement"
          headers={["Característica", "Descripción", "Ejemplo Débil", "Ejemplo Fuerte"]}
          rows={[
            ["Específico", "Evita generalidades vagas", "Social media is bad", "Social media addiction among teenagers leads to decreased face-to-face communication skills"],
            ["Argumentable", "Permite debate y discusión", "London is in England", "London's congestion charge has effectively reduced traffic while improving air quality"],
            ["Claro", "Fácil de entender", "Education has many aspects", "Standardized testing undermines creativity and critical thinking in primary education"],
            ["Enfocado", "Un argumento principal", "Many things affect climate", "Deforestation in the Amazon is the primary driver of regional climate change"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Thesis débil: 'Los videojuegos son populares.'"
            english="Weak: 'Video games are popular.'"
            translation="No es argumentable, es solo un hecho"
          />
          
          <Example 
            spanish="Thesis fuerte: 'Los videojuegos educativos mejoran las habilidades de resolución de problemas en niños de 8-12 años.'"
            english="Strong: 'Educational video games improve problem-solving skills in children aged 8-12.'"
            translation="Específico, argumentable y medible"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Escribe tu thesis statement al final. Después de investigar y planificar, 
          tendrás una idea más clara de tu argumento principal.
        </Tip>
      </TheorySection>

      <TheorySection title="Párrafos de Desarrollo" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Cada párrafo de desarrollo debe seguir la estructura PEEL: Point, Evidence, Explanation, Link.
        </p>

        <Rule 
          title="Estructura PEEL para Párrafos"
          description="Organiza cada párrafo siguiendo este patrón:"
          examples={[
            "Point: Topic sentence que presenta la idea principal",
            "Evidence: Datos, ejemplos, citas que apoyan el punto",
            "Explanation: Análisis de cómo la evidencia apoya tu argumento",
            "Link: Conexión con el thesis o transición al siguiente párrafo"
          ]}
        />

        <Example 
          spanish="Párrafo PEEL sobre ejercicio y salud mental:"
          english="[Point] Regular physical exercise significantly improves mental health outcomes. [Evidence] A 2019 study by Harvard Medical School found that individuals who exercised for 30 minutes daily showed 25% lower rates of depression and anxiety. [Explanation] This improvement occurs because exercise releases endorphins and reduces cortisol levels, creating natural mood stabilization. [Link] This biochemical evidence supports the broader argument that lifestyle changes can be as effective as medication for mental health treatment."
          translation="Estructura clara: punto → evidencia → explicación → conexión"
        />

        <Tip type="info">
          <strong>Longitud:</strong> Cada párrafo de desarrollo debe tener 100-150 palabras aproximadamente. 
          Más corto parece superficial, más largo puede perder enfoque.
        </Tip>
      </TheorySection>

      <TheorySection title="Conectores y Cohesión" icon="🔗">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los conectores crean fluidez y muestran las relaciones lógicas entre ideas.
        </p>

        <GrammarTable
          caption="Conectores por Función"
          headers={["Función", "Conectores", "Ejemplo en Contexto"]}
          rows={[
            ["Añadir información", "Furthermore, Moreover, Additionally, In addition", "Furthermore, recent studies confirm this trend"],
            ["Contrastar", "However, Nevertheless, On the other hand, Conversely", "However, critics argue the opposite"],
            ["Causa-efecto", "Therefore, Consequently, As a result, Thus", "Therefore, immediate action is necessary"],
            ["Ejemplificar", "For instance, For example, Namely, Such as", "For instance, countries like Denmark have..."],
            ["Secuencia", "Firstly, Subsequently, Finally, Meanwhile", "Firstly, we must consider the economic impact"],
            ["Enfatizar", "Indeed, Certainly, Undoubtedly, Clearly", "Indeed, the evidence is overwhelming"]
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> No abuses de los conectores. Úsalos solo cuando realmente mejoren 
          la claridad y fluidez del texto.
        </Tip>
      </TheorySection>

      <TheorySection title="Tipos de Essays" icon="📚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Diferentes tipos de essays requieren enfoques y estructuras específicas.
        </p>

        <GrammarTable
          caption="Tipos Comunes de Essays"
          headers={["Tipo", "Propósito", "Estructura Típica", "Ejemplo de Thesis"]}
          rows={[
            ["Argumentativo", "Persuadir con evidencia", "Introducción, argumentos a favor, refutación, conclusión", "Renewable energy is more cost-effective than fossil fuels"],
            ["Comparativo", "Analizar similitudes/diferencias", "Introducción, punto por punto o bloque por bloque", "Online learning offers greater flexibility than traditional education"],
            ["Causa-Efecto", "Explicar relaciones causales", "Introducción, causas, efectos, conclusión", "Social media has fundamentally changed interpersonal relationships"],
            ["Problema-Solución", "Identificar y resolver problemas", "Problema, causas, soluciones, evaluación", "Urban pollution requires immediate government intervention"],
            ["Descriptivo", "Explicar o informar", "Introducción, aspectos principales, conclusión", "Artificial intelligence is transforming modern healthcare"]
          ]}
        />

        <Tip type="success">
          <strong>Adaptación:</strong> Ajusta tu enfoque según el tipo de essay. Un argumentativo necesita 
          más evidencia persuasiva, mientras que un descriptivo requiere más detalles explicativos.
        </Tip>
      </TheorySection>

      <TheorySection title="Estilo Académico" icon="🎓">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El estilo académico requiere formalidad, objetividad y precisión en el lenguaje.
        </p>

        <GrammarTable
          caption="Características del Estilo Académico"
          headers={["Aspecto", "Evitar", "Usar en su lugar"]}
          rows={[
            ["Contracciones", "don't, can't, won't", "do not, cannot, will not"],
            ["Lenguaje informal", "stuff, things, lots of", "matters, issues, numerous"],
            ["Primera persona", "I think, I believe", "It can be argued, Evidence suggests"],
            ["Emocional", "amazing, terrible, awful", "significant, problematic, concerning"],
            ["Absolutos", "always, never, all", "generally, rarely, most"],
            ["Preguntas retóricas", "Why should we care?", "This raises important questions"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Informal: 'I think social media is really bad for kids because it's super addictive.'"
            english="Formal: 'Research indicates that social media platforms may negatively impact adolescent development due to their potentially addictive design features.'"
            translation="Más objetivo, específico y académico"
          />
        </div>

        <Tip type="info">
          <strong>Voz pasiva:</strong> Úsala moderadamente para mantener objetividad: 
          "Studies have been conducted" en lugar de "Researchers conducted studies".
        </Tip>
      </TheorySection>

      <TheorySection title="Conclusiones Efectivas" icon="🏁">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Una buena conclusión resume sin repetir y deja al lector con una impresión duradera.
        </p>

        <Rule 
          title="Elementos de una Conclusión Fuerte"
          description="Incluye estos componentes en tu conclusión:"
          examples={[
            "Restatement: Reformula tu thesis con palabras diferentes",
            "Summary: Breve resumen de puntos principales",
            "Implication: Qué significa esto en un contexto más amplio",
            "Call to action o reflexión final (opcional)"
          ]}
        />

        <Example 
          spanish="Conclusión sobre educación online:"
          english="While online education presents certain challenges, the evidence clearly demonstrates its potential to democratize learning and provide flexible, personalized educational experiences. As technology continues to evolve, educational institutions must adapt their approaches to harness these benefits while addressing the limitations. The future of education lies not in choosing between traditional and digital methods, but in creating hybrid models that combine the best of both worlds."
          translation="Reafirma tesis → resume beneficios → implicaciones futuras"
        />

        <Tip type="warning">
          <strong>Evita:</strong> Introducir ideas completamente nuevas en la conclusión. 
          Debe cerrar, no abrir nuevos debates.
        </Tip>
      </TheorySection>
      <TheorySection title="Tipos de Essays en Cambridge" icon="📚">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Opinion Essay (Más común en B2/C1)"
            description="Expresar y justificar tu opinión sobre un tema."
            examples={[
              "Pregunta típica: 'Some people think... Do you agree?'",
              "Estructura: Introducción + 2 párrafos de desarrollo + Conclusión",
              "Usa: In my opinion, I believe, I think, From my perspective",
              "Incluye ejemplos personales o generales para apoyar tu opinión"
            ]}
          />

          <Rule 
            title="2. For and Against Essay (B2/C1/C2)"
            description="Presentar argumentos a favor y en contra de un tema."
            examples={[
              "Pregunta típica: 'Discuss the advantages and disadvantages of...'",
              "Estructura: Intro + Párrafo a favor + Párrafo en contra + Conclusión",
              "Usa: On one hand/On the other hand, However, Nevertheless",
              "Mantén equilibrio entre ambas perspectivas"
            ]}
          />

          <Rule 
            title="3. Discursive Essay (C1/C2)"
            description="Analizar diferentes aspectos de un tema complejo."
            examples={[
              "Pregunta típica: 'Evaluate the impact of... on modern society'",
              "Estructura más flexible, análisis profundo",
              "Usa: Furthermore, Moreover, In addition, Consequently",
              "Requiere análisis crítico y perspectiva madura"
            ]}
          />

          <Rule 
            title="Criterios de evaluación Cambridge"
            description="Cómo se evalúan los essays en los exámenes oficiales."
            examples={[
              "Content: Relevancia y desarrollo de ideas (25%)",
              "Communicative Achievement: Propósito y audiencia (25%)",
              "Organisation: Estructura y cohesión (25%)",
              "Language: Gramática, vocabulario y precisión (25%)"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Which of the following is the strongest thesis statement?"
      options={[
        "Social media is popular among young people.",
        "Social media has both positive and negative effects.",
        "Social media platforms exploit user data to maximize advertising revenue at the expense of user privacy.",
        "Many people use social media every day."
      ]}
      correctAnswer={2}
      explanation="Esta opción es específica, argumentable y presenta un punto de vista claro que puede ser defendido con evidencia."
    />,

    <MultipleChoiceExercise
      key="2"
      question="In the PEEL structure, what does the 'E' in 'Evidence' refer to?"
      options={[
        "Examples only",
        "Emotional appeals",
        "Facts, data, examples, or quotes that support your point",
        "Explanations of your personal opinion"
      ]}
      correctAnswer={2}
      explanation="Evidence incluye cualquier tipo de apoyo factual: datos, estadísticas, ejemplos, citas de expertos, etc."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "Academic writing should avoid contractions like 'don't' and 'can't'.",
          isTrue: true,
          explanation: "Correcto. El estilo académico requiere formas completas: 'do not', 'cannot'."
        },
        {
          text: "It's acceptable to introduce completely new ideas in the conclusion.",
          isTrue: false,
          explanation: "Falso. La conclusión debe cerrar el argumento, no introducir ideas nuevas."
        },
        {
          text: "Each body paragraph should focus on one main point.",
          isTrue: true,
          explanation: "Correcto. Cada párrafo debe tener una idea principal clara (topic sentence)."
        },
        {
          text: "Using first person (I, my, me) is always inappropriate in academic essays.",
          isTrue: false,
          explanation: "Falso. Aunque se evita generalmente, en algunos contextos (reflexiones personales) puede ser apropiado."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which connector introduces a contrasting idea: '_____, some educators argue that traditional methods remain superior.'"
      options={[
        "Furthermore",
        "However",
        "Therefore",
        "Moreover"
      ]}
      correctAnswer={1}
      explanation="'However' introduce una idea que contrasta con la anterior."
    />,

    <MultipleChoiceExercise
      key="5"
      question="Which connector would be most appropriate to introduce a contrasting viewpoint?"
      options={[
        "Furthermore",
        "Consequently", 
        "Nevertheless",
        "In addition"
      ]}
      correctAnswer={2}
      explanation="'Nevertheless' introduce una idea que contrasta con la anterior, mostrando una perspectiva diferente."
    />,

    <MultipleChoiceExercise
      key="6"
      question="What is the main purpose of a topic sentence?"
      options={[
        "To conclude the paragraph",
        "To introduce the main idea of the paragraph",
        "To provide evidence",
        "To connect to the next paragraph"
      ]}
      correctAnswer={1}
      explanation="La topic sentence introduce la idea principal que se desarrollará en el párrafo."
    />,

    <MultipleChoiceExercise
      key="7"
      question="Which is the most formal way to express opinion?"
      options={[
        "I think that...",
        "In my opinion...",
        "It can be argued that...",
        "I believe that..."
      ]}
      correctAnswer={2}
      explanation="'It can be argued that...' es la forma más objetiva y formal de presentar una opinión."
    />,

    <MultipleChoiceExercise
      key="8"
      question="Which sequencing word comes first: '_____, the introduction should capture the reader's attention.'"
      options={[
        "Finally",
        "Secondly",
        "Firstly",
        "Moreover"
      ]}
      correctAnswer={2}
      explanation="'Firstly' es el conector de secuencia que introduce el primer punto."
    />,

    <MultipleChoiceExercise
      key="9"
      question="What should you avoid in academic writing?"
      options={[
        "Complex sentences",
        "Contractions and informal language",
        "Evidence and examples",
        "Clear thesis statements"
      ]}
      correctAnswer={1}
      explanation="Las contracciones y el lenguaje informal deben evitarse en escritura académica."
    />,

    <MultipleChoiceExercise
      key="10"
      question="Which best describes the PEEL structure?"
      options={[
        "Point, Evidence, Explanation, Link",
        "Problem, Example, Evaluation, Logic",
        "Purpose, Evidence, Emphasis, Length",
        "Plan, Execute, Evaluate, Learn"
      ]}
      correctAnswer={0}
      explanation="PEEL significa Point, Evidence, Explanation, Link - la estructura ideal para párrafos de desarrollo."
    />
  ];

  return (
    <TheoryLayout
      title="Essay Writing Techniques"
      description="Domina las técnicas esenciales para escribir essays académicos efectivos: estructura, argumentación, estilo formal y cohesión textual."
      level="B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Gramática intermedia-avanzada", "Vocabulario académico", "Conectores básicos"]}
      estimatedTime="70 min"
    />
  );
};

export default EssayWritingPage;

