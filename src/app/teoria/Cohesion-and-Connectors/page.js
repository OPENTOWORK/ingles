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

const CohesionAndConnectorsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son Cohesion and Connectors?" icon="🔗">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          La <strong>cohesion</strong> (cohesión) y los <strong>connectors</strong> (conectores) son elementos fundamentales para crear textos coherentes y fáciles de seguir. 
          Ayudan a conectar ideas, crear transiciones suaves y mantener la fluidez en tu escritura.
        </p>
        
        <QuickReference items={[
          "Cohesión: unión lógica entre ideas",
          "Conectores: palabras que unen oraciones y párrafos",
          "Referencias: pronombres y artículos",
          "Transiciones: cambios suaves entre ideas",
          "Repetición: palabras clave para mantener el tema"
        ]} />
      </TheorySection>

      <TheorySection title="Tipos de Conectores" icon="🔧">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los conectores se clasifican según la relación que establecen entre las ideas.
        </p>

        <GrammarTable
          caption="Clasificación de Conectores por Función"
          headers={["Función", "Conectores", "Ejemplo", "Significado"]}
          rows={[
            ["Adición", "Furthermore, Moreover, In addition, Also", "Furthermore, technology improves education", "Además"],
            ["Contraste", "However, Nevertheless, On the other hand, Yet", "However, there are disadvantages", "Sin embargo"],
            ["Causa", "Because, Since, Due to, As a result of", "Due to technology, life is easier", "Debido a"],
            ["Resultado", "Therefore, Consequently, Thus, Hence", "Therefore, we should use technology", "Por lo tanto"],
            ["Secuencia", "First, Then, Next, Finally, Subsequently", "First, I will discuss benefits", "Primero"],
            ["Ejemplo", "For example, For instance, Such as, Namely", "For example, smartphones are useful", "Por ejemplo"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Además, la tecnología mejora la educación"
            english="Furthermore, technology improves education"
            translation="Además, la tecnología mejora la educación"
          />
          <Example 
            spanish="Sin embargo, hay desventajas"
            english="However, there are disadvantages"
            translation="Sin embargo, hay desventajas"
          />
          <Example 
            spanish="Por lo tanto, deberíamos usar la tecnología"
            english="Therefore, we should use technology"
            translation="Por lo tanto, deberíamos usar la tecnología"
          />
        </div>

        <Rule 
          title="Uso de Conectores"
          description="Los conectores ayudan a:"
          examples={[
            "Crear transiciones suaves entre ideas",
            "Mostrar relaciones lógicas",
            "Mejorar la fluidez del texto",
            "Hacer el texto más profesional"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Usa conectores variados para evitar repetición y hacer tu texto más interesante.
        </Tip>
      </TheorySection>

      <TheorySection title="Conectores de Adición" icon="➕">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usan para agregar información, ideas o argumentos adicionales.
        </p>

        <GrammarTable
          caption="Conectores de Adición por Nivel de Formalidad"
          headers={["Formal", "Neutral", "Informal", "Uso"]}
          rows={[
            ["Furthermore, Moreover", "In addition, Also", "And, Plus", "Agregar información importante"],
            ["Additionally, Besides", "What's more", "Another thing", "Añadir punto adicional"],
            ["Not only...but also", "As well as", "Along with", "Mostrar que hay más opciones"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Además, la tecnología es muy útil"
            english="Furthermore, technology is very useful"
            translation="Además, la tecnología es muy útil"
          />
          <Example 
            spanish="También, es importante estudiar"
            english="In addition, it's important to study"
            translation="También, es importante estudiar"
          />
          <Example 
            spanish="No solo es útil, sino también necesaria"
            english="Not only is it useful, but also necessary"
            translation="No solo es útil, sino también necesaria"
          />
        </div>

        <Tip type="success">
          <strong>Recuerda:</strong> "Furthermore" y "Moreover" son más formales que "also" y "and".
        </Tip>
      </TheorySection>

      <TheorySection title="Conectores de Contraste" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Se usan para mostrar diferencias, contrastes u oposiciones entre ideas.
        </p>

        <GrammarTable
          caption="Conectores de Contraste"
          headers={["Conector", "Uso", "Posición", "Ejemplo"]}
          rows={[
            ["However", "Contraste fuerte", "Inicio de oración", "However, there are problems"],
            ["Nevertheless", "Contraste formal", "Inicio de oración", "Nevertheless, we continue"],
            ["On the other hand", "Mostrar alternativa", "Inicio de oración", "On the other hand, it's expensive"],
            ["Yet", "Contraste en la misma oración", "Medio de oración", "It's difficult, yet possible"],
            ["Although/Though", "Contraste con subordinada", "Inicio", "Although it's hard, it's worth it"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Sin embargo, hay problemas"
            english="However, there are problems"
            translation="Sin embargo, hay problemas"
          />
          <Example 
            spanish="Por otro lado, es caro"
            english="On the other hand, it's expensive"
            translation="Por otro lado, es caro"
          />
          <Example 
            spanish="Es difícil, pero posible"
            english="It's difficult, yet possible"
            translation="Es difícil, pero posible"
          />
        </div>

        <Rule 
          title="Uso de Conectores de Contraste"
          description="Úsalos para:"
          examples={[
            "Mostrar dos puntos de vista diferentes",
            "Introducir contraargumentos",
            "Comparar ventajas y desventajas",
            "Expresar concesiones"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> "But" es informal, usa "However" en textos formales.
        </Tip>
      </TheorySection>

      <TheorySection title="Conectores de Causa y Resultado" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Establecen relaciones de causa-efecto entre ideas.
        </p>

        <GrammarTable
          caption="Conectores de Causa y Resultado"
          headers={["Tipo", "Conectores", "Ejemplo", "Significado"]}
          rows={[
            ["Causa", "Because, Since, Due to", "Due to rain, we stayed home", "Debido a"],
            ["Resultado", "Therefore, Consequently, Thus", "It rained, therefore we stayed home", "Por lo tanto"],
            ["Causa formal", "Owing to, As a result of", "Owing to bad weather", "Debido a"],
            ["Resultado formal", "Hence, Accordingly", "Hence, we must act", "Por consiguiente"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Debido a la lluvia, nos quedamos en casa"
            english="Due to rain, we stayed home"
            translation="Debido a la lluvia, nos quedamos en casa"
          />
          <Example 
            spanish="Llovió, por lo tanto nos quedamos en casa"
            english="It rained, therefore we stayed home"
            translation="Llovió, por lo tanto nos quedamos en casa"
          />
          <Example 
            spanish="Estudiaste mucho, así que aprobaste"
            english="You studied hard, so you passed"
            translation="Estudiaste mucho, así que aprobaste"
          />
        </div>

        <Tip type="info">
          <strong>Nota:</strong> "So" es informal, usa "Therefore" o "Consequently" en contextos formales.
        </Tip>
      </TheorySection>

      <TheorySection title="Conectores de Secuencia y Tiempo" icon="⏰">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Organizan ideas en orden temporal o secuencial.
        </p>

        <GrammarTable
          caption="Conectores de Secuencia"
          headers={["Posición", "Conectores", "Ejemplo", "Uso"]}
          rows={[
            ["Inicio", "First, Initially, To begin with", "First, I will discuss...", "Primer punto"],
            ["Continuación", "Then, Next, Subsequently", "Then, we will see...", "Siguiente punto"],
            ["Adición", "Furthermore, Moreover", "Furthermore, it's important...", "Punto adicional"],
            ["Final", "Finally, Lastly, In conclusion", "Finally, we can say...", "Último punto"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Primero, discutiré los beneficios"
            english="First, I will discuss the benefits"
            translation="Primero, discutiré los beneficios"
          />
          <Example 
            spanish="Luego, veremos las desventajas"
            english="Then, we will see the disadvantages"
            translation="Luego, veremos las desventajas"
          />
          <Example 
            spanish="Finalmente, llegaremos a una conclusión"
            english="Finally, we will reach a conclusion"
            translation="Finalmente, llegaremos a una conclusión"
          />
        </div>

        <Rule 
          title="Uso de Conectores de Secuencia"
          description="Úsalos para:"
          examples={[
            "Organizar argumentos en orden lógico",
            "Presentar pasos en un proceso",
            "Estructurar párrafos de desarrollo",
            "Crear un flujo lógico en el texto"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Los conectores de secuencia hacen que tu texto sea más fácil de seguir.
        </Tip>
      </TheorySection>

      <TheorySection title="Elementos de Cohesión" icon="🧩">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Además de los conectores, hay otros elementos que crean cohesión en un texto.
        </p>

        <GrammarTable
          caption="Elementos de Cohesión"
          headers={["Elemento", "Función", "Ejemplo", "Efecto"]}
          rows={[
            ["Referencias", "Evitar repetición", "The technology... It is useful", "Flujo natural"],
            ["Repetición", "Enfocar ideas clave", "Technology... technological...", "Énfasis"],
            ["Sinónimos", "Variar vocabulario", "Important... significant...", "Riqueza léxica"],
            ["Elipsis", "Evitar redundancia", "Some people like it, others don't", "Concisión"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="La tecnología es útil. Es importante para la sociedad"
            english="Technology is useful. It is important for society"
            translation="La tecnología es útil. Es importante para la sociedad"
          />
          <Example 
            spanish="Es importante. También es significativo"
            english="It is important. It is also significant"
            translation="Es importante. También es significativo"
          />
          <Example 
            spanish="Algunas personas lo usan, otras no"
            english="Some people use it, others don't"
            translation="Algunas personas lo usan, otras no"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Combina diferentes elementos de cohesión para crear textos fluidos y naturales.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "But however" ❌<br/>
            <strong>Correcto:</strong> "However" o "But" ✅<br/>
            <em>No uses dos conectores de contraste juntos</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "Because therefore" ❌<br/>
            <strong>Correcto:</strong> "Because" o "Therefore" ✅<br/>
            <em>No uses conectores de causa y resultado juntos</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar "and" repetidamente ❌<br/>
            <strong>Correcto:</strong> Variar conectores ✅<br/>
            <em>Usa "furthermore", "moreover", "in addition"</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> No usar conectores entre párrafos ❌<br/>
            <strong>Correcto:</strong> Crear transiciones suaves ✅<br/>
            <em>Los conectores mejoran la fluidez</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Variedad en conectores"
            description="Usa diferentes conectores para evitar repetición."
            examples={[
              "No uses 'and' repetidamente",
              "Alterna entre conectores formales e informales",
              "Elige conectores apropiados para el contexto"
            ]}
          />

          <Rule 
            title="2. Posición de conectores"
            description="La mayoría van al inicio de la oración."
            examples={[
              "However, Nevertheless, Therefore",
              "Furthermore, Moreover, Consequently",
              "Algunos van en medio: yet, so"
            ]}
          />

          <Rule 
            title="3. Cohesión sin conectores"
            description="Usa referencias, repetición y sinónimos."
            examples={[
              "Pronombres: it, they, this, that",
              "Repetición de palabras clave",
              "Sinónimos para variar vocabulario"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="Technology has many benefits. ___ (Furthermore/But), it improves communication. ___ (However/And), there are some disadvantages. ___ (Therefore/Because), we should use it wisely."
      blanks={[
        { answer: "Furthermore" },
        { answer: "However" },
        { answer: "Therefore" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es el conector más apropiado para agregar información importante?"
      options={[
        "However",
        "Furthermore",
        "Nevertheless",
        "Yet"
      ]}
      correctAnswer={1}
      explanation="'Furthermore' se usa para agregar información importante, mientras que los otros son para contraste."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'However' y 'but' pueden usarse juntos en la misma oración.",
          isTrue: false,
          explanation: "Incorrecto. No se deben usar dos conectores de contraste juntos. Usa solo uno."
        },
        {
          text: "'Furthermore' es más formal que 'and'.",
          isTrue: true,
          explanation: "Correcto. 'Furthermore' es formal, 'and' es más informal y simple."
        },
        {
          text: "Los conectores siempre van al inicio de la oración.",
          isTrue: false,
          explanation: "Incorrecto. La mayoría van al inicio, pero algunos como 'yet' y 'so' pueden ir en medio."
        },
        {
          text: "Usar variedad de conectores mejora la calidad del texto.",
          isTrue: true,
          explanation: "Correcto. La variedad evita repetición y hace el texto más interesante."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es el conector más apropiado para mostrar resultado?"
      options={[
        "Because",
        "However",
        "Therefore",
        "Furthermore"
      ]}
      correctAnswer={2}
      explanation="'Therefore' muestra resultado o consecuencia, mientras que 'because' muestra causa."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Cuál es el error en esta oración: 'But however, there are problems'?"
      options={[
        "Falta un conector",
        "Usa dos conectores de contraste juntos",
        "El conector está mal posicionado",
        "Falta puntuación"
      ]}
      correctAnswer={1}
      explanation="El error es usar 'But' y 'However' juntos, ambos son conectores de contraste. Debe ser solo uno."
    />
  ];

  return (
    <TheoryLayout
      title="Cohesion and Connectors"
      description="Domina la cohesión y conectores en inglés. Aprende a unir ideas, crear transiciones suaves y mejorar la fluidez de tus textos escritos."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic writing skills", "Understanding of sentence structure"]}
      estimatedTime="65 min"
    />
  );
};

export default CohesionAndConnectorsPage;



