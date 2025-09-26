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

const UsefulGrammarAndStructuresPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son Useful Grammar and Structures?" icon="🔧">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Las <strong>useful grammar and structures</strong> (estructuras gramaticales útiles) son patrones y construcciones 
          que te permiten expresarte de manera más natural, precisa y efectiva en inglés escrito.
        </p>
        
        <QuickReference items={[
          "Estructuras avanzadas para escritura formal",
          "Patrones para expresar opiniones y argumentos",
          "Conectores complejos y transiciones",
          "Formas de hacer comparaciones y contrastes",
          "Estructuras para introducir y concluir ideas"
        ]} />
      </TheorySection>

      <TheorySection title="Estructuras para Introducir Ideas" icon="🚪">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas estructuras te ayudan a presentar ideas de manera profesional y clara.
        </p>

        <GrammarTable
          caption="Estructuras para Introducir Ideas"
          headers={["Estructura", "Uso", "Ejemplo", "Traducción"]}
          rows={[
            ["It is widely believed that...", "Opinión general", "It is widely believed that technology improves life", "Se cree ampliamente que..."],
            ["There is growing evidence that...", "Evidencia creciente", "There is growing evidence that climate change is real", "Hay evidencia creciente de que..."],
            ["It cannot be denied that...", "Hecho indiscutible", "It cannot be denied that education is important", "No se puede negar que..."],
            ["One of the most significant...", "Importancia", "One of the most significant issues is poverty", "Uno de los más significativos..."],
            ["In recent years, there has been...", "Tendencia reciente", "In recent years, there has been an increase in...", "En años recientes, ha habido..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Se cree ampliamente que la tecnología mejora la vida"
            english="It is widely believed that technology improves life"
            translation="Se cree ampliamente que la tecnología mejora la vida"
          />
          <Example 
            spanish="Hay evidencia creciente de que el cambio climático es real"
            english="There is growing evidence that climate change is real"
            translation="Hay evidencia creciente de que el cambio climático es real"
          />
          <Example 
            spanish="No se puede negar que la educación es importante"
            english="It cannot be denied that education is important"
            translation="No se puede negar que la educación es importante"
          />
        </div>

        <Rule 
          title="Cuándo usar cada estructura"
          description="Elige según el contexto:"
          examples={[
            "It is widely believed: para opiniones generales",
            "There is growing evidence: para evidencia científica",
            "It cannot be denied: para hechos indiscutibles",
            "One of the most significant: para destacar importancia"
          ]}
        />

        <Tip type="info">
          <strong>Consejo:</strong> Estas estructuras dan autoridad y credibilidad a tus argumentos.
        </Tip>
      </TheorySection>

      <TheorySection title="Estructuras para Desarrollar Argumentos" icon="💭">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas estructuras te permiten desarrollar y explicar tus argumentos de manera convincente.
        </p>

        <GrammarTable
          caption="Estructuras para Desarrollar Argumentos"
          headers={["Estructura", "Función", "Ejemplo", "Traducción"]}
          rows={[
            ["This is due to the fact that...", "Explicar causa", "This is due to the fact that people work more", "Esto se debe al hecho de que..."],
            ["What is more important is...", "Enfatizar punto", "What is more important is the long-term effects", "Lo que es más importante es..."],
            ["It should be noted that...", "Llamar atención", "It should be noted that not everyone agrees", "Debe notarse que..."],
            ["This raises the question of...", "Introducir problema", "This raises the question of responsibility", "Esto plantea la pregunta de..."],
            ["Furthermore, it is essential to...", "Agregar punto importante", "Furthermore, it is essential to consider costs", "Además, es esencial..."],
            ["In contrast to this...", "Mostrar contraste", "In contrast to this, some believe...", "En contraste con esto..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Esto se debe al hecho de que la gente trabaja más"
            english="This is due to the fact that people work more"
            translation="Esto se debe al hecho de que la gente trabaja más"
          />
          <Example 
            spanish="Lo que es más importante son los efectos a largo plazo"
            english="What is more important is the long-term effects"
            translation="Lo que es más importante son los efectos a largo plazo"
          />
          <Example 
            spanish="Debe notarse que no todos están de acuerdo"
            english="It should be noted that not everyone agrees"
            translation="Debe notarse que no todos están de acuerdo"
          />
        </div>

        <Tip type="success">
          <strong>Consejo:</strong> Usa estas estructuras para hacer tus argumentos más persuasivos y profesionales.
        </Tip>
      </TheorySection>

      <TheorySection title="Estructuras para Comparaciones y Contrastes" icon="⚖️">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas estructuras te permiten hacer comparaciones sofisticadas y mostrar contrastes efectivamente.
        </p>

        <GrammarTable
          caption="Estructuras para Comparaciones y Contrastes"
          headers={["Estructura", "Uso", "Ejemplo", "Traducción"]}
          rows={[
            ["Similarly to...", "Similitud", "Similarly to the previous case, this shows...", "Similarmente a..."],
            ["Unlike the previous example...", "Contraste", "Unlike the previous example, this method is...", "A diferencia del ejemplo anterior..."],
            ["In comparison with...", "Comparación formal", "In comparison with traditional methods...", "En comparación con..."],
            ["Whereas the former...", "Contraste formal", "Whereas the former is expensive, the latter is...", "Mientras que el primero..."],
            ["Both... and... share the characteristic of...", "Similitud", "Both approaches share the characteristic of...", "Tanto... como... comparten..."],
            ["The fundamental difference lies in...", "Diferencias clave", "The fundamental difference lies in approach", "La diferencia fundamental radica en..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Similarmente al caso anterior, esto muestra..."
            english="Similarly to the previous case, this shows..."
            translation="Similarmente al caso anterior, esto muestra..."
          />
          <Example 
            spanish="En comparación con los métodos tradicionales..."
            english="In comparison with traditional methods..."
            translation="En comparación con los métodos tradicionales..."
          />
          <Example 
            spanish="Mientras que el primero es caro, el segundo es..."
            english="Whereas the former is expensive, the latter is..."
            translation="Mientras que el primero es caro, el segundo es..."
          />
        </div>

        <Rule 
          title="Estructuras de Comparación Avanzadas"
          description="Para comparaciones sofisticadas:"
          examples={[
            "Similarly to / Unlike: para similitudes y diferencias",
            "In comparison with: para comparaciones formales",
            "Whereas: para contrastes elegantes",
            "Both... and...: para similitudes"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Usa "former" para el primero de dos elementos mencionados y "latter" para el segundo.
        </Tip>
      </TheorySection>

      <TheorySection title="Estructuras para Expresar Opiniones" icon="💬">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas estructuras te permiten expresar opiniones de manera académica y persuasiva.
        </p>

        <GrammarTable
          caption="Estructuras para Expresar Opiniones"
          headers={["Estructura", "Nivel de Certeza", "Ejemplo", "Traducción"]}
          rows={[
            ["I firmly believe that...", "Muy seguro", "I firmly believe that education is key", "Creo firmemente que..."],
            ["It seems to me that...", "Moderado", "It seems to me that this approach works", "Me parece que..."],
            ["I would argue that...", "Argumentativo", "I would argue that technology helps", "Yo argumentaría que..."],
            ["There is reason to believe that...", "Cauteloso", "There is reason to believe that change is needed", "Hay razones para creer que..."],
            ["It is my contention that...", "Formal", "It is my contention that this is wrong", "Mi argumento es que..."],
            ["I am convinced that...", "Seguro", "I am convinced that this is the best solution", "Estoy convencido de que..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Creo firmemente que la educación es clave"
            english="I firmly believe that education is key"
            translation="Creo firmemente que la educación es clave"
          />
          <Example 
            spanish="Me parece que este enfoque funciona"
            english="It seems to me that this approach works"
            translation="Me parece que este enfoque funciona"
          />
          <Example 
            spanish="Yo argumentaría que la tecnología ayuda"
            english="I would argue that technology helps"
            translation="Yo argumentaría que la tecnología ayuda"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> Varía las estructuras según qué tan seguro estés de tu opinión.
        </Tip>
      </TheorySection>

      <TheorySection title="Estructuras para Concluir" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas estructuras te ayudan a concluir tus argumentos de manera efectiva.
        </p>

        <GrammarTable
          caption="Estructuras para Concluir"
          headers={["Estructura", "Uso", "Ejemplo", "Traducción"]}
          rows={[
            ["In conclusion, it can be said that...", "Conclusión general", "In conclusion, it can be said that technology is beneficial", "En conclusión, puede decirse que..."],
            ["To sum up, the evidence suggests...", "Resumen", "To sum up, the evidence suggests that change is needed", "Para resumir, la evidencia sugiere..."],
            ["All things considered...", "Consideración completa", "All things considered, this is the best option", "Considerando todo..."],
            ["It is therefore clear that...", "Conclusión lógica", "It is therefore clear that action is required", "Por lo tanto, es claro que..."],
            ["The implications of this are...", "Implicaciones", "The implications of this are far-reaching", "Las implicaciones de esto son..."],
            ["This leads to the conclusion that...", "Conclusión lógica", "This leads to the conclusion that we must act", "Esto lleva a la conclusión de que..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="En conclusión, puede decirse que la tecnología es beneficiosa"
            english="In conclusion, it can be said that technology is beneficial"
            translation="En conclusión, puede decirse que la tecnología es beneficiosa"
          />
          <Example 
            spanish="Para resumir, la evidencia sugiere que se necesita cambio"
            english="To sum up, the evidence suggests that change is needed"
            translation="Para resumir, la evidencia sugiere que se necesita cambio"
          />
          <Example 
            spanish="Considerando todo, esta es la mejor opción"
            english="All things considered, this is the best option"
            translation="Considerando todo, esta es la mejor opción"
          />
        </div>

        <Rule 
          title="Efectividad de las Conclusiones"
          description="Una buena conclusión debe:"
          examples={[
            "Resumir los puntos principales",
            "Reafirmar tu posición",
            "Dejar una impresión duradera",
            "Proporcionar cierre al argumento"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> Las conclusiones fuertes refuerzan tu argumento y convencen al lector.
        </Tip>
      </TheorySection>

      <TheorySection title="Estructuras Condicionales Avanzadas" icon="🔀">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Estas estructuras condicionales te permiten expresar hipótesis y condiciones de manera sofisticada.
        </p>

        <GrammarTable
          caption="Estructuras Condicionales Avanzadas"
          headers={["Estructura", "Uso", "Ejemplo", "Traducción"]}
          rows={[
            ["Were it not for...", "Sin algo específico", "Were it not for technology, we would be lost", "Si no fuera por..."],
            ["Had it not been for...", "Sin algo pasado", "Had it not been for the rain, we would have gone", "Si no hubiera sido por..."],
            ["Should this be the case...", "Si esto fuera cierto", "Should this be the case, we must act", "Si este fuera el caso..."],
            ["In the event that...", "En caso de que", "In the event that this happens, we are ready", "En caso de que esto pase..."],
            ["Provided that...", "Siempre que", "Provided that the conditions are met", "Siempre que se cumplan las condiciones"],
            ["Unless otherwise stated...", "A menos que se diga", "Unless otherwise stated, this applies to all", "A menos que se indique lo contrario..."]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Si no fuera por la tecnología, estaríamos perdidos"
            english="Were it not for technology, we would be lost"
            translation="Si no fuera por la tecnología, estaríamos perdidos"
          />
          <Example 
            spanish="Si no hubiera sido por la lluvia, habríamos ido"
            english="Had it not been for the rain, we would have gone"
            translation="Si no hubiera sido por la lluvia, habríamos ido"
          />
          <Example 
            spanish="Siempre que se cumplan las condiciones"
            english="Provided that the conditions are met"
            translation="Siempre que se cumplan las condiciones"
          />
        </div>

        <Tip type="warning">
          <strong>¡Cuidado!</strong> Estas estructuras son formales y se usan principalmente en escritura académica.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> "It's important to mention that..." (repetitivo) ❌<br/>
            <strong>Correcto:</strong> "It should be noted that..." ✅<br/>
            <em>Varía las estructuras para evitar repetición</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "In my opinion, I think that..." ❌<br/>
            <strong>Correcto:</strong> "I believe that..." o "It is my contention that..." ✅<br/>
            <em>Evita redundancia en expresiones de opinión</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> "The former and the latter" sin contexto ❌<br/>
            <strong>Correcto:</strong> "The former (mencionar) and the latter (mencionar)" ✅<br/>
            <em>Asegúrate de que el contexto sea claro</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar estructuras formales en contexto informal ❌<br/>
            <strong>Correcto:</strong> Adaptar el registro al contexto ✅<br/>
            <em>Usa estructuras apropiadas para el tipo de texto</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. Variedad en estructuras"
            description="Usa diferentes estructuras para evitar repetición."
            examples={[
              "Alterna entre estructuras formales e informales",
              "Varía las formas de introducir ideas",
              "Cambia las estructuras de conclusión",
              "Usa sinónimos y variaciones"
            ]}
          />

          <Rule 
            title="2. Coherencia en el registro"
            description="Mantén el mismo nivel de formalidad."
            examples={[
              "Formal: para ensayos académicos",
              "Neutral: para informes profesionales",
              "Informal: para emails personales",
              "Consistencia en todo el texto"
            ]}
          />

          <Rule 
            title="3. Claridad en la expresión"
            description="Las estructuras deben mejorar la claridad."
            examples={[
              "Elige estructuras que sean apropiadas",
              "Evita estructuras demasiado complejas",
              "Asegúrate de que el significado sea claro",
              "Prioriza la comunicación efectiva"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <FillBlanksExercise
      key="1"
      text="___ (It is widely believed/It seems to me) that technology improves life. ___ (This is due to the fact that/What is more important is) people work more efficiently. ___ (In conclusion/Similarly to), it can be said that progress is beneficial."
      blanks={[
        { answer: "It is widely believed" },
        { answer: "This is due to the fact that" },
        { answer: "In conclusion" }
      ]}
    />,

    <MultipleChoiceExercise
      key="2"
      question="¿Cuál es la estructura más apropiada para expresar una opinión firme?"
      options={[
        "It seems to me that...",
        "I firmly believe that...",
        "There is reason to believe that...",
        "It should be noted that..."
      ]}
      correctAnswer={1}
      explanation="'I firmly believe that...' expresa una opinión muy segura y firme, mientras que las otras expresan diferentes niveles de certeza."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'Former' se refiere al primer elemento mencionado y 'latter' al segundo.",
          isTrue: true,
          explanation: "Correcto. 'Former' = primero, 'latter' = segundo de dos elementos mencionados previamente."
        },
        {
          text: "Las estructuras formales pueden usarse en cualquier contexto.",
          isTrue: false,
          explanation: "Incorrecto. Las estructuras formales deben usarse en contextos apropiados como ensayos académicos."
        },
        {
          text: "'Were it not for...' es una estructura condicional avanzada.",
          isTrue: true,
          explanation: "Correcto. Es una forma formal de expresar condiciones hipotéticas."
        },
        {
          text: "Es mejor usar siempre las mismas estructuras para mantener consistencia.",
          isTrue: false,
          explanation: "Incorrecto. Es mejor variar las estructuras para evitar repetición y hacer el texto más interesante."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="¿Cuál es la estructura más apropiada para una conclusión?"
      options={[
        "To begin with...",
        "In conclusion, it can be said that...",
        "Furthermore, it is essential...",
        "This is due to the fact that..."
      ]}
      correctAnswer={1}
      explanation="'In conclusion, it can be said that...' es una estructura típica para introducir conclusiones."
    />,

    <MultipleChoiceExercise
      key="5"
      question="¿Qué estructura usarías para mostrar contraste de manera formal?"
      options={[
        "Unlike the previous example...",
        "And also...",
        "What is more important is...",
        "It is widely believed that..."
      ]}
      correctAnswer={0}
      explanation="'Unlike the previous example...' es una estructura formal para mostrar contraste entre ejemplos."
    />
  ];

  return (
    <TheoryLayout
      title="Useful Grammar and Structures"
      description="Domina las estructuras gramaticales avanzadas para escritura en inglés. Aprende patrones sofisticados para introducir ideas, desarrollar argumentos y concluir efectivamente."
      level="A2-B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic grammar", "Understanding of formal writing"]}
      estimatedTime="75 min"
    />
  );
};

export default UsefulGrammarAndStructuresPage;



